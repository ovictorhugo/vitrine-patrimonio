import { ArrowRight, Barcode, Camera, Check, Image, ImageDown, PanelRightOpen, Plus, RefreshCcw, ScanEye, Trash } from "lucide-react";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// contrato mínimo p/ encaixar no wizard existente
type OnValidity = (v: boolean) => void;
type OnState    = (st: Record<string, unknown>) => void;

type Props = {
  step: number;
  catalogId: string;
  urlGeral: string;
  token?: string | null;
  existingImageIds?: string[]; // IDs atuais vindos do GET
  onValidityChange: OnValidity;
  onStateChange?: OnState;
};

const buildUrl = (base: string, id: string) => `${base}uploads/${id}.jpg`;

/** deep equal simples p/ arrays */
const sameArr = (a?: string[], b?: string[]) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

export function ImagemStepEdit({
  step,
  catalogId,
  urlGeral,
  token,
  existingImageIds,
  onValidityChange,
  onStateChange,
}: Props) {
  /** FONTE DE VERDADE: IDs no backend */
  const [imageIds, setImageIds] = useState<string[]>(() => existingImageIds ?? []);

  // sincroniza quando o pai muda (evita ping-pong)
  const lastPropRef = useRef<string>("");
  useEffect(() => {
    if (!Array.isArray(existingImageIds)) return;
    const incoming = JSON.stringify(existingImageIds);
    if (incoming === lastPropRef.current) return;
    if (!sameArr(imageIds, existingImageIds)) setImageIds(existingImageIds);
    lastPropRef.current = incoming;
  }, [existingImageIds]); // eslint-disable-line

  // validade + sinalização pro wizard (mantém chaves compatíveis com o seu NovoItem)
  const lastSentRef = useRef<string>("");
  useEffect(() => {
    onValidityChange(imageIds.length >= 4);
    const payload = JSON.stringify(imageIds);
    if (payload !== lastSentRef.current) {
      onStateChange?.({ images_wizard: imageIds }); // mantém o contrato
      lastSentRef.current = payload;
    }
  }, [imageIds, onStateChange, onValidityChange]);

  /** ===== Upload / Camera (UI igual ao seu) ===== */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // câmera
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(cams);
      if (cams.length && !selectedCamera) setSelectedCamera(cams[0].deviceId);
    } catch (e) {
      console.error(e);
    }
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (e) {
      console.error(e);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(photoDataUrl);
    setShowPhotoPreview(true);
    stopCamera();
  };

  const openUploadDialog = () => setShowUploadDialog(true);
  const openFileDialog = () => { setShowUploadDialog(false); fileInputRef.current?.click(); };
  const openCameraDialog = async () => {
    setShowUploadDialog(false);
    await getCameras();
    setShowCameraDialog(true);
    setTimeout(() => startCamera(), 200);
  };
  const closeCameraDialog = (open: boolean) => {
    if (!open) {
      stopCamera();
      setShowCameraDialog(false);
      setCapturedPhoto(null);
      setShowPhotoPreview(false);
    } else {
      setShowCameraDialog(true);
    }
  };

  /** ===== Backend: POST/DELETE/REFRESH ===== */
  const [busy, setBusy] = useState(false);

  const refreshImages = async () => {
    const r = await fetch(`${urlGeral}catalog/${catalogId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Falha ao atualizar imagens (${r.status})`);
    const data = await r.json();
    const ids = (data?.images || []).map((i: any) => i.id);
    setImageIds(ids);
  };

  const uploadBlob = async (blob: Blob, filename = "image.jpg") => {
    const fd = new FormData();
    fd.append("file", blob, filename);
    const resp = await fetch(`${urlGeral}catalog/${catalogId}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Falha ao enviar (${resp.status}): ${txt}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) throw new Error("Nenhum arquivo selecionado.");
      setBusy(true);
      // envia todos (sem limitar a 4 — o backend manda a real)
      for (const f of Array.from(files)) await uploadBlob(f, f.name);
      await refreshImages();
      setShowUploadDialog(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast("Imagens enviadas!");
    } catch (e: any) {
      toast("Erro ao carregar arquivo", { description: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  };

  const confirmPhoto = async () => {
    if (!capturedPhoto) return;
    try {
      setBusy(true);
      const b = await (await fetch(capturedPhoto)).blob(); // converte dataURL em blob
      await uploadBlob(b, "camera.jpg");
      await refreshImages();
      setCapturedPhoto(null);
      setShowPhotoPreview(false);
      setShowCameraDialog(false);
      toast("Foto adicionada!");
    } catch (e: any) {
      toast("Erro ao enviar foto", { description: e?.message || "" });
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveByIndex = async (index: number) => {
    const id = imageIds[index];
    if (!id) return;
    try {
      setBusy(true);
      const resp = await fetch(`${urlGeral}catalog/${catalogId}/images/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error(`Falha ao remover (${resp.status})`);
      await refreshImages();
      toast("Imagem removida.");
    } catch (e: any) {
      toast("Não foi possível remover a imagem", { description: e?.message || "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[700px]">
          Insira as fotos do patrimônio — capriche no clique!
        </h1>
      </div>

      <div className="ml-8">
        {/* Passos sugeridos (mesmo do seu componente) */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-8 flex-col mb-8">
          <div className="flex gap-2">
            <ImageDown size={24} />
            <div>
              <p className="font-medium">Passo 1</p>
              <p className="text-gray-500 text-sm">Imagem frontal do item</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Barcode size={24} />
            <div>
              <p className="font-medium">Passo 2</p>
              <p className="text-gray-500 text-sm">Imagem com a identificação do item (se houver)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <PanelRightOpen size={24} />
            <div>
              <p className="font-medium">Passo 3</p>
              <p className="text-gray-500 text-sm">Imagem lateral ou traseira</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ScanEye size={24} />
            <div>
              <p className="font-medium">Passo 4</p>
              <p className="text-gray-500 text-sm">Detalhe da condição</p>
            </div>
          </div>
        </div>

        {/* Grade 4 slots (exibe até 4 primeiras do backend; botões para adicionar/remover) */}
        <div className="flex gap-2 w-full mb-8">
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-2">
              {Array.from({ length: 4 }).map((_, index) => {
                const id = imageIds[index];
                const src = id ? buildUrl(urlGeral, id) : undefined;
                return (
                  <div key={index} className="relative group">
                    {src ? (
                      <div className="flex items-center justify-center object-cover border aspect-square w-full rounded-md dark:border-neutral-800">
                        <img className="aspect-square w-full rounded-md object-cover" src={src} alt={`Imagem ${index + 1}`} />
                        <Button
                          onClick={() => handleRemoveByIndex(index)}
                          variant="destructive"
                          className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          size="icon"
                          aria-label="Remover imagem"
                          disabled={busy}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={openUploadDialog}
                        className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-800 hover:border-gray-400 transition-colors"
                        aria-label="Adicionar imagem"
                        disabled={busy}
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* input hidden para upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />

            {/* Dialog de opções (mesmo do seu componente) */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Adicionar imagem</DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    Você pode capturar uma nova imagem com a câmera ou escolher um arquivo do computador.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-3">
                  <Button onClick={openCameraDialog} className="flex items-center justify-center space-x-2" disabled={busy}>
                    <Camera size={20} />
                    <span>Tirar Foto</span>
                  </Button>
                  <Button onClick={openFileDialog} variant="outline" className="flex items-center justify-center space-x-2" disabled={busy}>
                    <Image size={20} />
                    <span>Escolher do Computador</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog da câmera */}
            <Dialog open={showCameraDialog} onOpenChange={closeCameraDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Capturar foto</DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    Fotografe o item com boa iluminação. Esta foto será usada no Vitrine Patrimônio.
                  </DialogDescription>
                </DialogHeader>

                {!showPhotoPreview ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium mb-2 block">
                          Câmeras Disponíveis <Badge variant="outline">{availableCameras.length}</Badge>
                        </label>
                        <div className="flex justify-center space-x-2">
                          <Button onClick={getCameras} variant="outline" size="sm" className="text-xs" disabled={busy}>
                            <RefreshCcw size={16} /> Atualizar Câmeras
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* seletor de câmera simples */}
                        <select
                          className="w-full border rounded-md p-2 text-sm"
                          value={selectedCamera}
                          onChange={(e) => {
                            setSelectedCamera(e.target.value);
                            setTimeout(() => startCamera(), 120);
                          }}
                        >
                          {availableCameras.map((camera, index) => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                              {camera.label || `Câmera ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" style={{ maxHeight: "300px" }} />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <div className="flex justify-center space-x-3">
                      <Button onClick={() => closeCameraDialog(false)} className="w-full" variant="outline" disabled={busy}>
                        Cancelar
                      </Button>
                      <Button onClick={capturePhoto} disabled={!stream || busy} className="w-full">
                        <Camera size={16} />
                        <span>Capturar Foto</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img src={capturedPhoto ?? ""} alt="Foto capturada" className="w-full rounded-lg" style={{ maxHeight: "300px", objectFit: "cover" }} />
                    </div>

                    <div className="flex justify-center space-x-3">
                      <Button onClick={() => { setCapturedPhoto(null); setShowPhotoPreview(false); startCamera(); }} variant="outline" className="w-full" disabled={busy}>
                        Tirar Outra
                      </Button>
                      <Button onClick={confirmPhoto} className="w-full" disabled={busy}>
                        <Check size={16} />
                        <span>Usar Esta Foto</span>
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
