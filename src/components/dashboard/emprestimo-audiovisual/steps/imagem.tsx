import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Barcode,
  Camera,
  Check,
  Image as ImageIcon,
  ImageDown,
  PanelRightOpen,
  Plus,
  RefreshCcw,
  ScanEye,
  Trash,
  Loader,
} from "lucide-react";
import { ArrowUUpLeft } from "phosphor-react";
import { useDropzone } from "react-dropzone";

import { StepBaseProps } from "../emprestimo-audiovisual"; // mantém seu tipo original
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Separator } from "../../../ui/separator";
import { useIsMobile } from "../../../../hooks/use-mobile";

/** deep equal simples p/ arrays de strings */
const sameArr = (a?: string[], b?: string[]) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

type CamStatus = "idle" | "requesting" | "granted" | "denied";

/** Lê arquivo e devolve um DataURL (snapshot real, não depende do arquivo local depois) */
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
type ImageSlotProps = {
  index: number;
  image?: string;
  onClickEmpty: () => void;
  onRemove: (i: number) => void;
  onDropFiles: (files: File[], index: number) => void;
};

function ImageSlot({
  index,
  image,
  onClickEmpty,
  onRemove,
  onDropFiles,
}: ImageSlotProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onDropFiles(accepted, index),
    accept: { "image/*": [] },
    multiple: true, // pode soltar várias; pipeline limita a 4
    noClick: true, // clique continua com o seu botão
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative group rounded-md ${
        isDragActive ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <input {...getInputProps()} />

      {image ? (
        <div className="flex items-center justify-center object-cover border aspect-square w-full rounded-md dark:border-neutral-800">
          <img
            className="aspect-square w-full rounded-md object-cover"
            src={image}
            alt={`Upload ${index + 1}`}
          />
          <Button
            onClick={() => onRemove(index)}
            variant="destructive"
            className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            size="icon"
            aria-label="Remover imagem"
            type="button"
          >
            <Trash size={16} />
          </Button>
        </div>
      ) : (
        <button
          onClick={onClickEmpty}
          className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-800 hover:border-gray-400 transition-colors"
          aria-label="Adicionar imagem"
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

export function ImagemStep({
  onValidityChange,
  onStateChange,
  step,
  imagens, // vem do pai (pode ser undefined no primeiro paint)
}: StepBaseProps<"imagens">) {
  /** ===== estado local é a FONTE DE VERDADE ===== */
  const [images, setImages] = useState<string[]>(() =>
    Array.isArray(imagens) ? imagens : []
  );

  /** Snapshot real para upload (cópia temporária congelada) */
  const imageBlobsRef = useRef<(Blob | null)[]>(
    Array.isArray(imagens) ? imagens.map(() => null) : []
  );

  /** evita “ping-pong” pai⇄filho */
  const lastSentRef = useRef<string>(""); // JSON do último array enviado ao pai
  const lastPropRef = useRef<string>(""); // JSON do último prop aplicado no filho

  /** aplica prop DO PAI apenas quando existir e realmente mudar */
  useEffect(() => {
    if (!Array.isArray(imagens)) return; // ignore undefined vindo do pai
    const incoming = JSON.stringify(imagens);
    if (incoming === lastPropRef.current) return; // já aplicado
    if (sameArr(images, imagens)) {
      lastPropRef.current = incoming;
      return;
    }
    setImages(imagens);
    imageBlobsRef.current = imagens.map(() => null); // reseta snapshots quando pai sobrescreve
    lastPropRef.current = incoming;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagens]);

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

  /** Pipeline único para upload OU drop (com snapshot real) */
  const handlePickedFiles = useCallback(
    async (files: File[], targetIndex?: number) => {
      if (!files || files.length === 0) return;

      // valida tamanho (2MB)
      for (const f of files) {
        if (f.size > 2 * 1024 * 1024) {
          toast("Arquivo muito grande!", {
            description: `${f.name} excede o limite de 2 MB.`,
            action: { label: "Fechar", onClick: () => {} },
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

      const snapshots = await Promise.all(
        chosenFiles.map((f) => fileToDataUrl(f))
      );

      setImages((prev) => {
        const next = [...prev];

        if (typeof targetIndex === "number") {
          if (next[targetIndex]) {
            // substitui o slot alvo
            next[targetIndex] = snapshots[0];
            imageBlobsRef.current[targetIndex] = chosenFiles[0];
            return next;
          } else {
            // coloca no alvo e continua nos próximos vazios
            let insertAt = targetIndex;
            for (let i = 0; i < snapshots.length; i++) {
              while (next[insertAt]) insertAt++;
              if (insertAt >= 4) break;
              next[insertAt] = snapshots[i];
              imageBlobsRef.current[insertAt] = chosenFiles[i];
              insertAt++;
            }
            return next;
          }
        }

        // caso geral: adiciona nos vazios
        snapshots.forEach((snap, i) => {
          const idx = next.length;
          if (idx < 4) {
            next.push(snap);
            imageBlobsRef.current[idx] = chosenFiles[i];
          }
        });

        return next;
      });

      setShowUploadDialog(false);
    },
    [images]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    handlePickedFiles(Array.from(files));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    imageBlobsRef.current = imageBlobsRef.current.filter((_, i) => i !== index);
  };

  /** ===== Câmera ===== */
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCamera, setSelectedCamera] = useState("");
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [camStatus, setCamStatus] = useState<CamStatus>("idle");
  const [permError, setPermError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasMediaDevices =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  /** pede permissão (sem lançar) para conseguir labels das câmeras */
  const ensureCameraPermission = async (): Promise<boolean> => {
    if (!hasMediaDevices) {
      setPermError("Navegador/dispositivo sem suporte a câmera.");
      setCamStatus("denied");
      return false;
    }
    if (!window.isSecureContext) {
      setPermError("Acesse via HTTPS para liberar a câmera.");
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
      console.error("Permissão/uso da câmera falhou:", e);
      let msg = "Não foi possível acessar a câmera.";
      if (e?.name === "NotAllowedError") msg = "Permissão negada no navegador.";
      if (e?.name === "NotFoundError") msg = "Nenhuma câmera encontrada.";
      if (e?.name === "OverconstrainedError")
        msg = "As restrições de vídeo não puderam ser atendidas.";
      setPermError(msg);
      setCamStatus("denied");
      return false;
    }
  };

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
      console.error("Erro ao obter câmeras:", e);
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
    // para o stream, mas ainda não fecha o diálogo
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;

    // snapshot da câmera já é DataURL “congelada”
    setImages((prev) => {
      if (prev.length >= 4) return prev;
      const next = [...prev, capturedPhoto];
      imageBlobsRef.current[next.length - 1] = null; // não há File, mas ok
      return next;
    });

    setCapturedPhoto(null);
    setShowPhotoPreview(false);
    setShowCameraDialog(false);
    teardownCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
    startCamera();
  };

  /** abrir/fechar diálogos */
  const openUploadDialog = () => setShowUploadDialog(true);

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
    // não liga automaticamente; espera gesto do usuário (Ativar câmera)
    if (camStatus === "granted") {
      await getCameras();
      await startCamera();
    }
  };

  // helper único para encerrar câmera + fechar diálogo
  const teardownCamera = () => {
    stopCamera();
    setShowCameraDialog(false);
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
  };

  // garante stop ao desmontar o componente (rota/tela)
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

  const openFileDialog = () => {
    setShowUploadDialog(false);
    fileInputRef.current?.click();
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
    const handler = () => getCameras();
    navigator.mediaDevices?.addEventListener?.("devicechange", handler);
    return () =>
      navigator.mediaDevices?.removeEventListener?.("devicechange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = useIsMobile();

  return (
    <div
      className={
        isMobile
          ? "max-w-[936px] mx-auto flex flex-col justify-center"
          : "max-w-[936px] h-full mx-auto flex flex-col justify-center"
      }
    >
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1
          className={
            isMobile
              ? "mb-8 text-2xl font-semibold max-w-[1000px]"
              : "mb-16 text-4xl font-semibold max-w-[1000px]"
          }
        >
          Insira as fotos do patrimônio — capriche no clique!
        </h1>
      </div>

      <div className={isMobile ? "" : "ml-8"}>
        {/* Passos sugeridos */}
        <div
          className={
            isMobile
              ? "grid md:grid-cols-2 grid-cols-1 gap-2 flex-col"
              : "grid md:grid-cols-2 grid-cols-1 gap-8 flex-col mb-8"
          }
        >
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
              <p className="text-gray-500 text-sm">
                Imagem com plaqueta de patrimônio legível
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PanelRightOpen size={24} />
            <div>
              <p className="font-medium">Passo 3</p>
              <p className="text-gray-500 text-sm">
                Imagem lateral ou traseira (com indicação de marca e modelo
                quando houver)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ScanEye size={24} />
            <div>
              <p className="font-medium">Passo 4</p>
              <p className="text-gray-500 text-sm">
                Detalhe da condição (destacando alguma avaria)
              </p>
            </div>
          </div>
        </div>

        {/* Grade 4 slots com drop */}
        <div className="flex gap-2 w-full mb-8">
          <div className="w-full">
            <div
              className={
                isMobile
                  ? "grid grid-cols-2 md:grid-cols-4 w-full gap-4 p-8"
                  : "grid grid-cols-2 md:grid-cols-4 w-full gap-2"
              }
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <ImageSlot
                  key={index}
                  index={index}
                  image={images[index]}
                  onClickEmpty={openUploadDialog}
                  onRemove={handleRemoveImage}
                  onDropFiles={(files, i) => handlePickedFiles(files, i)}
                />
              ))}
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
                    disabled={!hasMediaDevices}
                    type="button"
                  >
                    <Camera size={20} />
                    <span>Tirar Foto</span>
                  </Button>

                  <Button
                    onClick={openFileDialog}
                    variant="outline"
                    className="flex items-center justify-center space-x-2"
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

                {/* estados de permissão */}
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
                  <>
                    {!showPhotoPreview ? (
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
                              onValueChange={(value) =>
                                setSelectedCamera(value)
                              }
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
                                {availableCameras.map((camera, index) => {
                                  const cameraName =
                                    camera.label || `Câmera ${index + 1}`;
                                  return (
                                    <SelectItem
                                      key={camera.deviceId}
                                      value={camera.deviceId}
                                    >
                                      {cameraName}
                                    </SelectItem>
                                  );
                                })}
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
                            type="button"
                          >
                            <ArrowUUpLeft size={16} /> Cancelar
                          </Button>
                          <Button
                            onClick={capturePhoto}
                            disabled={!stream}
                            className="w-full"
                            type="button"
                          >
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
                            style={{
                              maxHeight: "300px",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        <div className="flex justify-center space-x-3">
                          <Button
                            onClick={retakePhoto}
                            variant="outline"
                            className="w-full"
                            type="button"
                          >
                            <ArrowUUpLeft size={16} />
                            <span>Tirar Outra</span>
                          </Button>
                          <Button
                            onClick={confirmPhoto}
                            className="w-full"
                            type="button"
                          >
                            <Check size={16} />
                            <span>Usar Esta Foto</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
