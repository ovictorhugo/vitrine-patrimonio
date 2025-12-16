import {
  ArrowRight,
  Barcode,
  Camera,
  Check,
  Image as ImageIcon,
  PanelRightOpen,
  Plus,
  RefreshCcw,
  ScanEye,
  Trash,
  Loader,
} from "lucide-react";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Separator } from "../../../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";
import { useDropzone } from "react-dropzone";
import { useIsMobile } from "../../../../hooks/use-mobile";

// contrato mínimo p/ encaixar no wizard existente
type OnValidity = (v: boolean) => void;
type OnState = (st: Record<string, unknown>) => void;

type ImageItem = {
  id: string;
  file_path: string;
};

type Props = {
  step: number;
  catalogId: string;
  urlGeral: string;
  token?: string | null;
  existingImages?: ImageItem[]; // id + file_path vindos do pai
  onValidityChange: OnValidity;
  onStateChange?: OnState;
};

const buildImgUrl = (urlGeral: string, p: string) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const clean = p.startsWith("/") ? p.slice(1) : p;
  return `${urlGeral}${clean}`;
};

type CamStatus = "idle" | "requesting" | "granted" | "denied";

/** Snapshot real (DataURL), não depende do arquivo local depois */
const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** =========================================================
 * Slot individual com Dropzone (sem hooks dentro do map)
 * ======================================================= */
type ImageSlotEditProps = {
  index: number;
  src?: string; // imagem do backend
  tempSrc?: string; // preview temporário
  busy?: boolean;
  onClickEmpty: () => void;
  onRemove: (i: number) => void;
  onDropFiles: (files: File[], index: number) => void;
};

function ImageSlotEdit({
  index,
  src,
  tempSrc,
  busy,
  onClickEmpty,
  onRemove,
  onDropFiles,
}: ImageSlotEditProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onDropFiles(accepted, index),
    accept: { "image/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    disabled: !!busy,
  });

  const finalSrc = tempSrc || src;

  return (
    <div
      {...getRootProps()}
      className={`relative group rounded-md ${
        isDragActive ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <input {...getInputProps()} />

      {finalSrc ? (
        <div className="flex items-center justify-center object-cover border aspect-square w-full rounded-md dark:border-neutral-800">
          <img
            className="aspect-square w-full rounded-md object-cover"
            src={finalSrc}
            alt={`Imagem ${index + 1}`}
          />

          {/* Se for preview temporário, não mostra delete */}
          {!tempSrc && (
            <Button
              onClick={() => onRemove(index)}
              variant="destructive"
              className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              size="icon"
              aria-label="Remover imagem"
              disabled={busy}
              type="button"
            >
              <Trash size={16} />
            </Button>
          )}

          {tempSrc && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
              <Loader className="animate-spin text-white" size={20} />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onClickEmpty}
          className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-800 hover:border-gray-400 transition-colors"
          aria-label="Adicionar imagem"
          disabled={busy}
          type="button"
        >
          <Plus className="h-6 w-6 text-gray-400" />
        </button>
      )}

      {isDragActive && (
        <div className="absolute inset-0 bg-black/10 rounded-md pointer-events-none" />
      )}
    </div>
  );
}

export function ImagemStepEdit({
  step,
  catalogId,
  urlGeral,
  token,
  existingImages,
  onValidityChange,
  onStateChange,
}: Props) {
  /** FONTE DE VERDADE: imagens no backend (id + file_path) */
  const [images, setImages] = useState<ImageItem[]>(() => existingImages ?? []);

  /** previews temporários por slot enquanto sobe */
  const [tempSlots, setTempSlots] = useState<Record<number, string>>({});

  // sincroniza quando o pai muda (evita ping-pong)
  const lastPropRef = useRef<string>("");
  useEffect(() => {
    if (!Array.isArray(existingImages)) return;
    const incoming = JSON.stringify(existingImages);
    if (incoming === lastPropRef.current) return;
    setImages(existingImages);
    lastPropRef.current = incoming;
  }, [existingImages]);

  // validade + sinalização pro wizard
  const lastSentRef = useRef<string>("");
  useEffect(() => {
    const ids = images.map((img) => img.id);
    const paths = images.map((img) => img.file_path);

    onValidityChange(ids.length >= 4);

    const payload = JSON.stringify({ ids, paths });
    if (payload !== lastSentRef.current) {
      onStateChange?.({
        image_ids: ids,
        image_paths: paths,
      });
      lastSentRef.current = payload;
    }
  }, [images, onStateChange, onValidityChange]);

  /** ===== Upload / Camera ===== */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // câmera
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCamera, setSelectedCamera] = useState("");
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // estados para primeira-vez/permissões
  const [camStatus, setCamStatus] = useState<CamStatus>("idle");
  const [permError, setPermError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasMediaDevices =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  /** Pede permissão sem lançar exceção; retorna boolean e atualiza estado */
  const ensureCameraPermission = async (): Promise<boolean> => {
    if (!hasMediaDevices) {
      setPermError("Este navegador/dispositivo não suporta uso de câmera.");
      setCamStatus("denied");
      return false;
    }
    if (!window.isSecureContext) {
      setPermError("Acesse via HTTPS para permitir o uso da câmera.");
      setCamStatus("denied");
      return false;
    }
    try {
      setCamStatus("requesting");
      const tmp = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      tmp.getTracks().forEach((t) => t.stop());
      setCamStatus("granted");
      setPermError("");
      return true;
    } catch (e: any) {
      console.error("Permissão de câmera negada ou indisponível:", e);
      let msg = "Não foi possível acessar a câmera.";
      if (e?.name === "NotAllowedError")
        msg = "Permissão negada. Conceda acesso à câmera no navegador.";
      if (e?.name === "NotFoundError")
        msg = "Nenhuma câmera foi encontrada neste dispositivo.";
      if (e?.name === "OverconstrainedError")
        msg = "As restrições de vídeo não puderam ser satisfeitas.";
      setPermError(msg);
      setCamStatus("denied");
      return false;
    }
  };

  /** Lista dispositivos; ok mesmo sem labels (1ª vez) */
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(cams);
      if (cams.length) {
        setSelectedCamera((prev) => {
          const stillExists = cams.some((c) => c.deviceId === prev);
          return stillExists ? prev : cams[0].deviceId;
        });
      } else {
        setSelectedCamera("");
      }
    } catch (e) {
      console.error("Erro ao enumerar dispositivos:", e);
    }
  };

  const startCamera = async () => {
    try {
      if (!selectedCamera) return;
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
      console.error("Erro ao iniciar câmera:", e);
      toast("Erro ao iniciar câmera", {
        description:
          "Tente selecionar outra câmera ou verifique as permissões.",
        action: { label: "Fechar", onClick: () => {} },
      });
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

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const openUploadDialog = () => setShowUploadDialog(true);
  const openFileDialog = () => {
    setShowUploadDialog(false);
    fileInputRef.current?.click();
  };

  /** Inicialização segura ao abrir o diálogo */
  const safeInitCamera = async () => {
    const ok = await ensureCameraPermission();
    if (!ok) return;
    await getCameras();
    await startCamera();
  };

  const openCameraDialog = async () => {
    setShowUploadDialog(false);
    setShowCameraDialog(true);
    setShowPhotoPreview(false);
    setCapturedPhoto(null);
    if (camStatus === "granted") {
      await getCameras();
      await startCamera();
    }
  };

  const teardownCamera = () => {
    stopCamera();
    setShowCameraDialog(false);
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
  };

  useEffect(() => {
    return () => {
      teardownCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeCameraDialog = (open: boolean) => {
    if (!open) teardownCamera();
    else setShowCameraDialog(true);
  };

  /** ===== Backend: POST/DELETE/REFRESH ===== */
  const [busy, setBusy] = useState(false);

  const refreshImages = async () => {
    const r = await fetch(`${urlGeral}catalog/${catalogId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Falha ao atualizar imagens (${r.status})`);
    const data = await r.json();
    const nextImages: ImageItem[] = (data?.images || []).map((img: any) => ({
      id: img.id,
      file_path: img.file_path,
    }));
    setImages(nextImages);
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

  const deleteById = async (id: string) => {
    const resp = await fetch(`${urlGeral}catalog/${catalogId}/images/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(`Falha ao remover (${resp.status})`);
  };

  /** ### PIPELINE ÚNICO: vale p/ upload tradicional e drag’n’drop */
  const handlePickedFiles = useCallback(
    async (files: File[], targetIndex?: number) => {
      try {
        if (!files?.length) return;

        // valida tamanho (2MB)
        for (const f of files) {
          if (f.size > 2 * 1024 * 1024) {
            toast("Arquivo muito grande!", {
              description: `${f.name} excede o limite de 2 MB.`,
            });
            return;
          }
        }

        const willReplace =
          typeof targetIndex === "number" && !!images[targetIndex];

        const remaining = Math.max(4 - images.length, 0);

        const chosenFiles = willReplace
          ? files.slice(0, 1)
          : files.slice(0, remaining);

        // snapshots temporários (previews imediatos)
        const snapshots = await Promise.all(
          chosenFiles.map((f) => fileToDataUrl(f))
        );

        // aplica previews nos slots afetados
        setTempSlots((prev) => {
          const next = { ...prev };

          if (typeof targetIndex === "number") {
            // substitui/coloca a partir do slot alvo
            let insertAt = targetIndex;
            for (let i = 0; i < snapshots.length; i++) {
              while (insertAt < 4 && images[insertAt]) {
                // se substituindo, fica no próprio alvo
                if (willReplace) break;
                insertAt++;
              }
              if (insertAt >= 4) break;
              next[insertAt] = snapshots[i];
              insertAt++;
            }
          } else {
            // caso geral: começa no próximo vazio
            let insertAt = images.length;
            for (let i = 0; i < snapshots.length; i++) {
              if (insertAt >= 4) break;
              next[insertAt] = snapshots[i];
              insertAt++;
            }
          }
          return next;
        });

        setBusy(true);

        // se for substituir: primeiro deleta a imagem do slot
        if (willReplace && typeof targetIndex === "number") {
          const old = images[targetIndex];
          if (old?.id) await deleteById(old.id);
        }

        // envia os blobs escolhidos
        for (const f of chosenFiles) {
          await uploadBlob(f, f.name);
        }

        await refreshImages();
        setShowUploadDialog(false);
        toast("Imagens enviadas!");
      } catch (e: any) {
        toast("Erro ao enviar imagem", {
          description: e?.message || String(e),
        });
      } finally {
        setBusy(false);
        setTempSlots({});
      }
    },
    [images, catalogId, token, urlGeral]
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;
    await handlePickedFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmPhoto = async () => {
    if (!capturedPhoto) return;
    teardownCamera();
    try {
      setBusy(true);
      const b = await (await fetch(capturedPhoto)).blob();
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
    const img = images[index];
    if (!img) return;
    try {
      setBusy(true);
      await deleteById(img.id);
      await refreshImages();
      toast("Imagem removida.");
    } catch (e: any) {
      toast("Não foi possível remover a imagem", {
        description: e?.message || "",
      });
    } finally {
      setBusy(false);
    }
  };

  /** Reinicia a câmera ao trocar seleção e quando o diálogo estiver aberto */
  useEffect(() => {
    if (!showCameraDialog) return;
    if (camStatus !== "granted") return;
    if (!selectedCamera) return;
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, showCameraDialog, camStatus]);

  /** Atualiza lista ao plugar/desplugar dispositivos */
  useEffect(() => {
    if (!hasMediaDevices) return;
    const handler = () => getCameras();
    navigator.mediaDevices.addEventListener?.("devicechange", handler);
    return () =>
      navigator.mediaDevices.removeEventListener?.("devicechange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMediaDevices]);
  const isMobile = useIsMobile();

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1
          className={
            isMobile
              ? "mb-16 text-xl font-semibold max-w-[700px]"
              : "mb-16 text-4xl font-semibold max-w-[700px]"
          }
        >
          Insira as fotos do patrimônio — capriche no clique!
        </h1>
      </div>

      <div className="ml-8">
        {/* Passos sugeridos */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-8 flex-col mb-8">
          <div className="flex gap-2">
            <ImageIcon size={24} />
            <div>
              <p className="font-medium">Passo 1</p>
              <p className="text-gray-500 text-sm">Imagem frontal do item</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Barcode size={24} />
            <div>
              <p className="font-medium">Passo 2</p>
              <p className="text-gray-500 text-sm">
                Imagem com a identificação do item (se houver)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PanelRightOpen size={24} />
            <div>
              <p className="font-medium">Passo 3</p>
              <p className="text-gray-500 text-sm">
                Imagem lateral ou traseira
              </p>
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

        {/* Grade 4 slots com onDrop */}
        <div className="flex gap-2 w-full mb-8">
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-2">
              {Array.from({ length: 4 }).map((_, index) => {
                const img = images[index];
                const src = img
                  ? buildImgUrl(urlGeral, img.file_path)
                  : undefined;

                return (
                  <ImageSlotEdit
                    key={index}
                    index={index}
                    src={src}
                    tempSrc={tempSlots[index]}
                    busy={busy}
                    onClickEmpty={openUploadDialog}
                    onRemove={handleRemoveByIndex}
                    onDropFiles={(files, i) => handlePickedFiles(files, i)}
                  />
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

            {/* Dialog de opções */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                    Adicionar imagem
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    Você pode capturar uma nova imagem com a câmera ou escolher
                    um arquivo do computador.
                  </DialogDescription>
                </DialogHeader>

                <Separator className="my-4" />

                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={openCameraDialog}
                    className="flex items-center justify-center space-x-2"
                    disabled={busy || !hasMediaDevices}
                    type="button"
                  >
                    <Camera size={20} />
                    <span>Tirar Foto</span>
                  </Button>
                  <Button
                    onClick={openFileDialog}
                    variant="outline"
                    className="flex items-center justify-center space-x-2"
                    disabled={busy}
                    type="button"
                  >
                    <ImageIcon size={20} />
                    <span>Escolher do Computador</span>
                  </Button>
                </div>
                {!hasMediaDevices && (
                  <p className="text-xs text-red-500 mt-3">
                    O acesso à câmera não é suportado neste
                    navegador/dispositivo.
                  </p>
                )}
              </DialogContent>
            </Dialog>

            {/* Dialog da câmera */}
            <Dialog open={showCameraDialog} onOpenChange={closeCameraDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                    Capturar foto
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    Fotografe o item com boa iluminação. Esta foto será usada no
                    Sistema Patrimônio.
                  </DialogDescription>
                </DialogHeader>

                <Separator className="my-4" />

                {camStatus !== "granted" ? (
                  <div className="space-y-4">
                    <div className="rounded-md border p-3 text-sm">
                      {camStatus === "idle" && (
                        <p>
                          Clique em <strong>Ativar câmera</strong> para listar
                          os dispositivos disponíveis.
                        </p>
                      )}
                      {camStatus === "requesting" && (
                        <p>
                          Solicitando acesso à câmera… confirme no navegador.
                        </p>
                      )}
                      {camStatus === "denied" && (
                        <p className="text-red-600">
                          {permError ||
                            "Acesso à câmera negado. Ajuste as permissões do navegador e tente novamente."}
                        </p>
                      )}
                      {!window.isSecureContext && (
                        <p className="text-amber-600 mt-2">
                          Dica: acesse via <strong>HTTPS</strong> para liberar o
                          uso da câmera.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => closeCameraDialog(false)}
                        type="button"
                      >
                        <ArrowUUpLeft size={16} /> Cancelar
                      </Button>
                      <Button
                        className="w-full"
                        onClick={safeInitCamera}
                        disabled={
                          camStatus === "requesting" || !hasMediaDevices
                        }
                        type="button"
                      >
                        {camStatus === "requesting" ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <Camera size={16} />
                        )}
                        {camStatus === "requesting"
                          ? "Ativando…"
                          : "Ativar câmera"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* seleção de câmera */}
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium mb-2 block">
                          Câmeras Disponíveis{" "}
                          <Badge variant="outline">
                            {availableCameras.length}
                          </Badge>
                        </label>
                        <div className="flex justify-center space-x-2">
                          <Button
                            onClick={getCameras}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            type="button"
                          >
                            <RefreshCcw size={16} /> Atualizar Câmeras
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Select
                          value={selectedCamera}
                          onValueChange={(v) => setSelectedCamera(v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a câmera" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="z-[99999]"
                            align="start"
                            side="bottom"
                            sideOffset={6}
                          >
                            {availableCameras.map((camera, index) => (
                              <SelectItem
                                key={camera.deviceId}
                                value={camera.deviceId}
                              >
                                {camera.label || `Câmera ${index + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedCamera && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Câmera ativa:</strong>{" "}
                            {availableCameras.find(
                              (c) => c.deviceId === selectedCamera
                            )?.label ||
                              `Câmera ${
                                availableCameras.findIndex(
                                  (c) => c.deviceId === selectedCamera
                                ) + 1
                              }`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* preview da câmera */}
                    {!showPhotoPreview ? (
                      <>
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full rounded-lg bg-black"
                            style={{ maxHeight: "300px" }}
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute top-2 left-2 flex gap-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            <Camera size={16} />{" "}
                            {stream ? "Ao vivo" : "Iniciando..."}
                          </div>
                        </div>

                        <div className="flex justify-center space-x-3">
                          <Button
                            onClick={() => closeCameraDialog(false)}
                            className="w-full"
                            variant="outline"
                            disabled={busy}
                            type="button"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={capturePhoto}
                            disabled={!stream || busy}
                            className="w-full"
                            type="button"
                          >
                            <Camera size={16} />
                            <span>Capturar Foto</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={capturedPhoto ?? ""}
                            alt="Foto capturada"
                            className="w-full rounded-lg"
                            style={{
                              maxHeight: "300px",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        <div className="flex justify-center space-x-3">
                          <Button
                            onClick={() => {
                              setCapturedPhoto(null);
                              setShowPhotoPreview(false);
                              startCamera();
                            }}
                            variant="outline"
                            className="w-full"
                            disabled={busy}
                            type="button"
                          >
                            Tirar Outra
                          </Button>
                          <Button
                            onClick={confirmPhoto}
                            className="w-full"
                            disabled={busy}
                            type="button"
                          >
                            <Check size={16} />
                            <span>Usar Esta Foto</span>
                          </Button>
                        </div>
                      </div>
                    )}
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
