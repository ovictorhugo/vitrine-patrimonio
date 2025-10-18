import { ArrowRight, Barcode, Camera, Check, Image, ImageDown, PanelRightOpen, Plus, RefreshCcw, ScanEye, Trash } from "lucide-react";
import { StepBaseProps } from "../novo-item";
import { Button } from "../../../ui/button";
import { ArrowUUpLeft } from "phosphor-react";
import { Select, SelectContent, SelectItem } from "../../../ui/select";
import { Badge } from "../../../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/** deep equal simples p/ arrays de strings */
const sameArr = (a?: string[], b?: string[]) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

export function ImagemStep({
  onValidityChange,
  onStateChange,
  step,
  imagens, // vem do pai (pode ser undefined no primeiro paint)
}: StepBaseProps<"imagens">) {

  /** ===== estado local é a FONTE DE VERDADE ===== */
  const [images, setImages] = useState<string[]>(() => Array.isArray(imagens) ? imagens : []);

  /** evita “ping-pong” pai⇄filho */
  const lastSentRef = useRef<string>("");     // JSON do último array enviado ao pai
  const lastPropRef = useRef<string>("");     // JSON do último prop aplicado no filho

  /** aplica prop DO PAI apenas quando existir e realmente mudar */
  useEffect(() => {
    if (!Array.isArray(imagens)) return;          // ignore undefined vindo do pai
    const incoming = JSON.stringify(imagens);
    if (incoming === lastPropRef.current) return; // já aplicado
    if (sameArr(images, imagens)) {               // local já igual
      lastPropRef.current = incoming;
      return;
    }
    setImages(imagens);
    lastPropRef.current = incoming;
  }, [imagens]); // eslint-disable-line react-hooks/exhaustive-deps

  /** propaga p/ pai apenas quando LOCAL muda de verdade */
  useEffect(() => {
    const payload = JSON.stringify(images);
    if (payload !== lastSentRef.current) {
      onStateChange?.({ images_wizard: images });
      lastSentRef.current = payload;
    }
    onValidityChange(images.length >= 4);
  }, [images, onStateChange, onValidityChange]);

  /** ===== upload de arquivo ===== */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  try {
    const files = event.target.files;
    if (!files || files.length === 0) throw new Error("Nenhum arquivo selecionado.");

    // verifica tamanho antes de gerar preview
    for (const f of Array.from(files)) {
      if (f.size > 2 * 1024 * 1024) {
        toast("Arquivo muito grande!", {
          description: `${f.name} excede o limite de 2 MB.`,
          action: { label: "Fechar", onClick: () => {} },
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return; // bloqueia todo o lote se tiver um arquivo inválido
      }
    }

    // cria objectURLs e limita a 4 slots
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    const availableSlots = Math.max(4 - images.length, 0);
    const toAdd = newUrls.slice(0, availableSlots);

    setImages((prev) => [...prev, ...toAdd]);
    setShowUploadDialog(false);

    // limpa o input para poder re-selecionar o mesmo arquivo depois
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (e: any) {
    toast("Erro ao carregar arquivo", {
      description: e?.message || String(e),
      action: { label: "Fechar", onClick: () => {} },
    });
  }
};


  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /** ===== Câmera ===== */
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
      console.error("Erro ao obter câmeras:", e);
    }
  };

  const startCamera = async () => {
    try {
      // para stream anterior
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
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
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
    // para a câmera após a captura
    stopCamera();
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;
    setImages((prev) => [...prev, capturedPhoto]);
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
    setShowCameraDialog(false);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
    startCamera();
  };

  /** abrir/fechar diálogos */
  const openUploadDialog = () => setShowUploadDialog(true);

  const openCameraDialog = async () => {
    setShowUploadDialog(false);
    await getCameras();
    setShowCameraDialog(true);
    // dá tempo do dialog montar
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

  const openFileDialog = () => {
    setShowUploadDialog(false);
    fileInputRef.current?.click();
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
          {/* Passos sugeridos */}
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
                <p className="text-gray-500 text-sm">Imagem com plaqueta de patrimônio legível</p>
              </div>
            </div>
            <div className="flex gap-2">
              <PanelRightOpen size={24} />
              <div>
                <p className="font-medium">Passo 3</p>
                <p className="text-gray-500 text-sm">Imagem lateral ou traseira (com indicação de marca e modelo quando houver)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <ScanEye size={24} />
              <div>
                <p className="font-medium">Passo 4</p>
                <p className="text-gray-500 text-sm">Detalhe da condição (destacando alguma avaria)</p>
              </div>
            </div>
          </div>
  
          {/* Grade 4 slots */}
          <div className="flex gap-2 w-full mb-8">
            <div className="w-full">
              <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-2">
                {Array.from({ length: 4 }).map((_, index) => {
                  const image = images[index];
                  return (
                    <div key={index} className="relative group">
                      {image ? (
                        <div className="flex items-center justify-center object-cover border aspect-square w-full rounded-md dark:border-neutral-800">
                          <img
                            className="aspect-square w-full rounded-md object-cover"
                            src={image}
                            alt={`Upload ${index + 1}`}
                          />
                          <Button
                            onClick={() => handleRemoveImage(index)}
                            variant="destructive"
                            className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            size="icon"
                            aria-label="Remover imagem"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={openUploadDialog}
                          className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-800 hover:border-gray-400 transition-colors"
                          aria-label="Adicionar imagem"
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
  
              {/* Dialog de opções */}
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                      Adicionar imagem
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                      Você pode capturar uma nova imagem com a câmera ou escolher um arquivo do computador.
                    </DialogDescription>
                  </DialogHeader>
  
                  <div className="flex flex-col space-y-3">
                    <Button onClick={openCameraDialog} className="flex items-center justify-center space-x-2">
                      <Camera size={20} />
                      <span>Tirar Foto</span>
                    </Button>
                    <Button onClick={openFileDialog} variant="outline" className="flex items-center justify-center space-x-2">
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
                    <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                      Capturar foto
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                      Fotografe o item com boa iluminação. Esta foto será usada no Sistema Patrimônio.
                    </DialogDescription>
                  </DialogHeader>
  
                  {!showPhotoPreview ? (
                    <div className="space-y-4">
                      {/* seleção de câmera */}
                      <div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium mb-2 block">
                            Câmeras Disponíveis <Badge variant="outline">{availableCameras.length}</Badge>
                          </label>
                          <div className="flex justify-center space-x-2">
                            <Button onClick={getCameras} variant="outline" size="sm" className="text-xs">
                              <RefreshCcw size={16} /> Atualizar Câmeras
                            </Button>
                          </div>
                        </div>
  
                        <div className="space-y-2">
                          <Select
                            value={selectedCamera}
                            onValueChange={(value) => {
                              setSelectedCamera(value);
                              setTimeout(() => startCamera(), 120);
                            }}
                          >
                            <SelectContent>
                              {availableCameras.map((camera, index) => {
                                const cameraName = camera.label || `Câmera ${index + 1}`;
                                const isDefault = camera.deviceId === selectedCamera;
                                return (
                                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                                    {cameraName} {isDefault && "(Ativa)"}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
  
                          {selectedCamera && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Câmera Ativa:</strong>{" "}
                              {availableCameras.find(c => c.deviceId === selectedCamera)?.label ||
                                `Câmera ${availableCameras.findIndex(c => c.deviceId === selectedCamera) + 1}`}
                            </div>
                          )}
                        </div>
                      </div>
  
                      {/* preview da câmera */}
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
                          <Camera size={16} /> {stream ? "Ao vivo" : "Iniciando..."}
                        </div>
                      </div>
  
                      <div className="flex justify-center space-x-3">
                        <Button onClick={() => closeCameraDialog(false)} className="w-full" variant="outline">
                          <ArrowUUpLeft size={16} /> Cancelar
                        </Button>
                        <Button onClick={capturePhoto} disabled={!stream} className="w-full">
                          <Camera size={16} />
                          <span>Capturar Foto</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={capturedPhoto ?? ""}
                          alt="Foto capturada"
                          className="w-full rounded-lg"
                          style={{ maxHeight: "300px", objectFit: "cover" }}
                        />
                      </div>
  
                      <div className="flex justify-center space-x-3">
                        <Button onClick={retakePhoto} variant="outline" className="w-full">
                          <ArrowUUpLeft size={16} />
                          <span>Tirar Outra</span>
                        </Button>
                        <Button onClick={confirmPhoto} className="w-full">
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
  