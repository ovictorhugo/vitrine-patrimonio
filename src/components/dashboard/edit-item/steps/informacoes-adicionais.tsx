import {
  AlertCircle,
  AlertCircleIcon,
  ArrowRight,
  BadgePercent,
  CheckCircle,
  File,
  File as FileIcon,
  FileText,
  ScanEye,
  Trash,
  Wrench,
  WrenchIcon,
} from "lucide-react";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useContext,
  useRef,
} from "react";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { CheckSquareOffset } from "phosphor-react";
import { Switch } from "../../../ui/switch";
import { Alert } from "../../../ui/alert";
import { Separator } from "../../../ui/separator";
import { Button } from "../../../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { StepBaseProps } from "../../novo-item/novo-item";
import { UserContext } from "../../../../context/context";

/* ===================== Tipos ===================== */
type ExistingFileDTO = {
  id: string;
  file_path: string;
  file_name: string;
  content_type: string;
};

type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

type InfoAdicionaisLocal = {
  observacao?: string;
  situacao?: string;
  tuMaiorIgual10?: boolean;
  obsolescenciaAlta?: boolean;
  docs?: File[];
  serverFilesDraft?: ExistingFileDTO[];
  orientacao?: string;
};

/* --- API para o pai disparar validação com toast só ao avançar --- */
export type InformacoesAdicionaisRef = {
  validateBeforeNext: () => boolean;
};

export const InformacoesAdicionaisStep = forwardRef<
  InformacoesAdicionaisRef,
  StepBaseProps<"informacoes-adicionais"> & {
    estadoAtual?: EstadoKind;
    existingFiles?: ExistingFileDTO[];
    catalogId: string;
  }
>(function InformacoesAdicionaisStep(
  {
    onValidityChange,
    step,
    onStateChange,
    initialData,
    estadoAtual,
    existingFiles,
    catalogId,
  },
  ref
) {
  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  /** ========= 1) ESTADOS REIDRATADOS DO WIZARD =========
   *  Regra:
   *  - texto inicial vem DO wizard (initialData)
   *  - só depois de TU/OT/estado mudarem é que sobrescreve com modelo
   */
  const [observacao, setObservacao] = useState(initialData?.observacao ?? "");
  const [situacao, setSituacao] = useState(initialData?.situacao ?? "");

  const [tuLocal, setTuLocal] = useState<boolean>(
    initialData?.tuMaiorIgual10 ?? false
  );
  const [otLocal, setOtLocal] = useState<boolean>(
    initialData?.obsolescenciaAlta ?? false
  );

  const [docsLocal, setDocsLocal] = useState<File[]>(initialData?.docs ?? []);

  const [serverFiles, setServerFiles] = useState<ExistingFileDTO[]>(
    initialData?.serverFilesDraft ?? existingFiles ?? []
  );
  const [orientacao, setOrientacao] = useState(
    initialData?.orientacao ?? estadoAtual
  );

  /** ✅ sincroniza estados vindos do pai, mas só se mudou de verdade */
  useEffect(() => {
    if (!initialData) return;

    if (initialData.observacao !== undefined) {
      const next = initialData.observacao ?? "";
      setObservacao((prev) => (prev === next ? prev : next));
    }

    if (initialData.situacao !== undefined) {
      const next = initialData.situacao ?? "";
      setSituacao((prev) => (prev === next ? prev : next));
    }

    if (initialData.docs) {
      setDocsLocal((prev) =>
        prev === initialData.docs ? prev : initialData.docs ?? []
      );
    }

    if (initialData.serverFilesDraft) {
      setServerFiles((prev) =>
        prev === initialData.serverFilesDraft
          ? prev
          : initialData.serverFilesDraft ?? []
      );
    }
  }, [initialData]);

  /** Se a prop existingFiles mudar (por GET), só usa se NÃO houver draft */
  useEffect(() => {
    if (initialData?.serverFilesDraft?.length) return;
    if (!didHydrateRef.current) return;
    setServerFiles(existingFiles ?? []);
  }, [existingFiles, initialData?.serverFilesDraft]);

  /** ========= 2) LÓGICA CO/TU/OT ========= */
  const CO: 0 | 1 = useMemo(() => {
    if (estadoAtual === "ocioso" || estadoAtual === "recuperavel") return 1;
    return 0;
  }, [estadoAtual]);

  const MAX_MB = 5;

  const shouldShowSituacao =
    estadoAtual === "ocioso" || estadoAtual === "recuperavel";

  useEffect(() => {
    if (!shouldShowSituacao && situacao) setSituacao("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowSituacao]);
const getIdx = useCallback(
  (tuOverride?: boolean, otOverride?: boolean) => {
    const tuFlag = tuOverride ?? tuLocal; // se não passar override, usa o state atual
    const otFlag = otOverride ?? otLocal;

    const tu = tuFlag ? 1 : 0; // TU >= 10 => 1
    const ot = otFlag ? 1 : 0; // OT alta => 1

    if (estadoAtual === "anti-economico") {
      if (tu === 1 && ot === 1) return 7;
      if (tu === 1 && ot === 0) return 3;
      if (tu === 0 && ot === 1) return 5;
      return 4;
    }

    const CO = estadoAtual === "quebrado" ? 0 : 1;
    return ((CO << 2) | (tu << 1) | ot) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  },
  [estadoAtual, tuLocal, otLocal]
);


  const gerarTexto = useCallback(
    (tuOverride?: boolean, otOverride?: boolean) => {
      const idx = getIdx(tuOverride, otOverride);

      const base: Record<number, string> = {
        0: [
          "Bem inoperante (quebrado), com vida útil inferior a 10 anos e sem indicativos relevantes de obsolescência tecnológica.",
          "Referências: Decreto nº 9.373/2018, art. 4º (conceitos de irrecuperável/antieconômico) e IN RFB nº 1.700/2017 (vida útil/depreciação).",
        ].join(" "),
        1: [
          "Bem inoperante (quebrado), com vida útil inferior a 10 anos e com obsolescência tecnológica elevada (defasagem/ausência de suporte).",
          "Referências: Decreto nº 9.373/2018, art. 4º; Lei nº 12.305/2010 (PNRS), especialmente quanto ao manejo adequado de resíduos eletroeletrônicos.",
        ].join(" "),
        2: [
          "Bem inoperante (quebrado), com vida útil esgotada (igual ou superior a 10 anos) e grau máximo de depreciação, conforme critérios da IN RFB nº 1.700/2017, utilizada como referência de avaliação pela PRA/UFMG (Nota nº 1/2025/PRA-GAB).",
          "Não há necessidade de inclusão de orçamento de reparo, uma vez que qualquer valor será superior a 100% do valor atual do bem.",
          "Referências: Enquadra-se no art. 4º, inciso II, do Decreto nº 9.373/2018, como bem antieconômico. Recomenda-se a baixa patrimonial e posterior destinação ambiental adequada (art. 5º).",
        ].join(" "),
        3: [
          "Bem inoperante (quebrado), com vida útil esgotada (igual ou superior a 10 anos) e grau máximo de depreciação (IN RFB nº 1.700/2017, PRA/UFMG Nota nº 1/2025/PRA-GAB) e obsolescência tecnológica acentuada.",
          "Há perda de funcionalidade e defasagem técnica. Não há necessidade de orçamento de reparo, pois qualquer valor excederá 100% do valor atual do bem.",
          "Referências: Art. 4º, inciso II, do Decreto nº 9.373/2018 (antieconômico) e art. 5º (destinação).",
        ].join(" "),
        4: [
          "Bem funcional, sem uso ativo na unidade (ocioso), com vida útil inferior a 10 anos e tecnologia atual.",
          "Encontra-se disponível, com condições de funcionamento preservadas.",
          "Referências: Decreto nº 9.373/2018, arts. 4º e 5º (conceitos e possibilidades de destinação).",
        ].join(" "),
        5: [
          "Bem funcional e sem uso ativo (ocioso), com vida útil inferior a 10 anos e obsolescência tecnológica.",
          "Apesar da defasagem tecnológica, mantém operação básica.",
          "Referências: Decreto nº 9.373/2018 (arts. 4º e 5º) e Lei nº 12.305/2010 (PNRS).",
        ].join(" "),
        6: [
          "Bem funcional (ocioso/recuperável), com vida útil igual ou superior a 10 anos e baixa obsolescência tecnológica.",
          "Permanece apto ao uso, embora sem utilização corrente no setor.",
          "Referências: IN RFB nº 1.700/2017 (vida útil) e Decreto nº 9.373/2018 (conceitos e destinações).",
        ].join(" "),
        7: [
          "Este BEM deve ser classificado como ANTIECONÔMICO, pois apresenta vida útil esgotada, obsolescência tecnológica e grau máximo de depreciação, conforme critérios da Instrução Normativa RFB nº 1.700/2017, utilizada como referência de avaliação pela PRA/UFMG (Nota nº 1/2025/PRA-GAB).",
          "Fundamentação legal: Enquadra-se no art. 4º, inciso II, do Decreto nº 9.373/2018, como bem antieconômico, uma vez que a continuidade do uso ou manutenção é desvantajosa à Administração.",
          "CASO O ITEM NÃO LHE SEJA MAIS ÚTIL, recomenda-se a baixa patrimonial e posterior desfazimento ambiental adequado, em conformidade com o art. 5º do mesmo Decreto.",
        ].join(" "),
      };

      return base[idx];
    },
    [getIdx]
  );

  function changeButtonTU() {
    const nextTU = !tuLocal;
    setTuLocal(nextTU);

    const modeloAtual = gerarTexto(nextTU, otLocal);
    setObservacao(modeloAtual);
  }

  function changeButtonOT() {
    const nextOT = !otLocal;
    setOtLocal(nextOT);

    const modeloAtual = gerarTexto(tuLocal, nextOT);
    setObservacao(modeloAtual);
  }

  /** ✅ NÃO SOBRESCREVE NO PRIMEIRO MOUNT */
  const firstRunRef = useRef(true);
  useEffect(() => {
    const modeloAtual = gerarTexto();
    const textoSalvo = (initialData?.observacao ?? "").trim();
    const orientacaoInicial = initialData?.orientacao ?? estadoAtual;

    if (firstRunRef.current) {
      firstRunRef.current = false;

      // Caso A: não havia observação salva
      if (textoSalvo === "") {
        setObservacao(modeloAtual);
        setOrientacao(estadoAtual);
        return;
      }

      // Caso B: havia observação salva, mas marcada como "modelo" de outra condição
      if (orientacaoInicial !== estadoAtual) {
        setObservacao(modeloAtual);
        setOrientacao(estadoAtual);
        return;
      }
    }
    // Se a condição (idx) não mudou → não mexe na justificativa
    if (orientacao === estadoAtual) {
      return;
    }

    // ★ 3) A condição mudou (idxAtual diferente de orientacao "modelo"):
    // agora sim, podemos regenerar a justificativa e atualizar orientacao
    setObservacao(modeloAtual);
    setOrientacao(estadoAtual);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.observacao, orientacao]);

  /** idx7 mantém alerta e zera justificativa automaticamente */
  const idx = getIdx();
  const isIdx7 = idx === 7;
  useEffect(() => {
    if (isIdx7 && observacao) setObservacao("");
  }, [isIdx7, observacao]);

  /** ========= 3) BACKEND: POST/DELETE/REFRESH ========= */
  const [busy, setBusy] = useState(false);

  const refreshFiles = useCallback(async () => {
    const r = await fetch(`${urlGeral}catalog/${catalogId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Falha ao atualizar arquivos (${r.status})`);
    const data = await r.json();
    const nextFiles: ExistingFileDTO[] = (data?.files || []).map((f: any) => ({
      id: f.id,
      file_path: f.file_path,
      file_name: f.file_name,
      content_type: f.content_type,
    }));
    setServerFiles(nextFiles);

    // salva draft no wizard
    onStateChange?.({ serverFilesDraft: nextFiles });

    return nextFiles;
  }, [urlGeral, catalogId, token, onStateChange]);

  const uploadFileToServer = useCallback(
    async (file: File) => {
      const fd = new FormData();
      fd.append("file", file, file.name);

      const resp = await fetch(`${urlGeral}catalog/${catalogId}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`Falha ao enviar (${resp.status}): ${txt}`);
      }
    },
    [urlGeral, catalogId, token]
  );

  const handleDeleteFile = useCallback(
    async (file: ExistingFileDTO) => {
      try {
        setBusy(true);
        const resp = await fetch(
          `${urlGeral}catalog/${catalogId}/files/${file.id}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`Falha ao remover arquivo (${resp.status}): ${txt}`);
        }

        const nextFiles = await refreshFiles();
        toast("Documento removido com sucesso!", {
          description: file.file_name,
        });

        onStateChange?.({ serverFilesDraft: nextFiles });
      } catch (e: any) {
        console.error(e);
        toast("Erro ao remover documento", {
          description: e?.message || "Tente novamente.",
        });
      } finally {
        setBusy(false);
      }
    },
    [urlGeral, token, catalogId, refreshFiles, onStateChange]
  );

  /** ========= 4) DROPZONE ========= */
  const onDropDocs = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;

      const validExt = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".doc",
        ".docx",
        ".odt",
        ".xls",
        ".xlsx",
      ];

      const toUpload: File[] = [];

      for (const f of acceptedFiles) {
        const okExt = validExt.some((e) => f.name.toLowerCase().endsWith(e));
        const okSize = f.size <= MAX_MB * 1024 * 1024;

        if (!okExt) {
          toast("Arquivo inválido", {
            description:
              "Formatos aceitos: PDF, imagens, DOC/DOCX/ODT, XLS/XLSX.",
          });
          continue;
        }
        if (!okSize) {
          toast("Arquivo muito grande", {
            description: `Cada arquivo deve ter até ${MAX_MB} MB.`,
          });
          continue;
        }

        toUpload.push(f);
      }

      if (!toUpload.length) return;

      // 1) guarda localmente
      setDocsLocal((prev) => [...prev, ...toUpload]);

      // 2) envia pro backend
      try {
        setBusy(true);
        for (const f of toUpload) {
          await uploadFileToServer(f);
        }
        const nextFiles = await refreshFiles();

        toast("Comprovantes enviados!", {
          description: `${toUpload.length} arquivo(s) anexado(s).`,
        });

        setDocsLocal((prev) => prev.filter((f) => !toUpload.includes(f)));

        onStateChange?.({ serverFilesDraft: nextFiles });
      } catch (e: any) {
        toast("Erro ao enviar comprovantes", {
          description: e?.message || "Tente novamente.",
        });
      } finally {
        setBusy(false);
      }
    },
    [MAX_MB, uploadFileToServer, refreshFiles, onStateChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropDocs,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    disabled: busy,
  });

  const removeDoc = (i: number) =>
    setDocsLocal((prev) => prev.filter((_, idx2) => idx2 !== i));

  const showUploadDocs = idx === 0 || idx === 1;
  const docsOk =
    !showUploadDocs || serverFiles.length > 0 || docsLocal.length > 0;

  /** ========= 5) OPEN PREVIEW LOCAL ========= */
  const openDoc = useCallback(
    (i: number) => {
      const f = docsLocal[i];
      if (!f) return;

      const url = URL.createObjectURL(f);

      const isPreviewable =
        f.type === "application/pdf" ||
        f.type.startsWith("image/") ||
        f.name.toLowerCase().endsWith(".pdf") ||
        /\.(png|jpe?g)$/i.test(f.name);

      if (isPreviewable) {
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    },
    [docsLocal]
  );

  /** ========= 6) VALIDAÇÃO ========= */
  const modeloAtual = gerarTexto();
  const justificativaEhModelo = observacao.trim() === modeloAtual.trim();

  const obsOk = isIdx7 ? true : !justificativaEhModelo;
  const sitOk = shouldShowSituacao ? situacao !== "" : true;

  useEffect(() => {
    onValidityChange(obsOk && sitOk && docsOk && !isIdx7);
  }, [obsOk, sitOk, docsOk, onValidityChange, isIdx7]);

  /** ========= 7) SUBIR ESTADO PRO PAI (sem spam) ========= */
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (!onStateChange) return;

    const payload: InfoAdicionaisLocal = {
      observacao,
      situacao,
      tuMaiorIgual10: tuLocal,
      obsolescenciaAlta: otLocal,
      docs: docsLocal,
      serverFilesDraft: serverFiles,
      orientacao: orientacao,
    };

    const serialized = JSON.stringify({
      observacao,
      situacao,
      tuLocal,
      otLocal,
      docsLen: docsLocal.length,
      serverLen: serverFiles.length,
      serverIds: serverFiles.map((f) => f.id),
    });

    if (serialized === lastSentRef.current) return;

    lastSentRef.current = serialized;
    onStateChange(payload);
  }, [
    observacao,
    situacao,
    tuLocal,
    otLocal,
    docsLocal,
    serverFiles,
    onStateChange,
    orientacao,
  ]);

  /** ========= 8) TOASTS SÓ AO AVANÇAR ========= */
  useImperativeHandle(ref, () => ({
    validateBeforeNext: () => {
      if (!isIdx7 && justificativaEhModelo) {
        toast("Personalize a justificativa", {
          description: "O texto não pode ser idêntico ao modelo sugerido.",
          action: { label: "Ok", onClick: () => {} },
        });
        return false;
      }
      if (
        showUploadDocs &&
        serverFiles.length === 0 &&
        docsLocal.length === 0
      ) {
        toast("Comprovantes obrigatórios", {
          description: "Anexe pelo menos 1 arquivo (PDF/imagem/DOC/planilha).",
        });
        return false;
      }
      if (shouldShowSituacao && !situacao) {
        toast("Informe o estado de conservação", {
          description: "Selecione uma opção na lista.",
        });
        return false;
      }
      return true;
    },
  }));

  /** ========= 9) ESCALA 7 NÍVEIS ========= */
  const nivelPorIdx: Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, number> = {
    4: 0, 5: 1, 6: 2, 7: 3,
    0: 4, 1: 5, 2: 6, 3: 6,
  };

  const escala7 = [
    { rotulo: "Excelente", bg: "bg-green-500" },
    { rotulo: "Muito bom", bg: "bg-lime-500" },
    { rotulo: "Bom", bg: "bg-yellow-400" },
    { rotulo: "Uso moderado", bg: "bg-amber-500" },
    { rotulo: "Necessita reparos", bg: "bg-orange-500" },
    { rotulo: "Inoperante", bg: "bg-red-500" },
    { rotulo: "Antieconômico", bg: "bg-red-700" },
  ] as const;

  const nivelAtivo = nivelPorIdx[getIdx()];

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[700px]">
          Forneça algumas informações adicionais...
        </h1>
      </div>

      <div className="ml-8">
        <div className="flex gap-2 mb-8">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">Dados de patrimônio</p>
            <p className="text-gray-500 text-sm">
              Descreva o estado real do bem (ex.: uso, funcionamento, defeitos,
              histórico de manutenção, ano/critério de tombamento).
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
          {/* Switches TU/OT */}
          <Alert className="mb-2">
            <div className="flex w-full gap-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="font-medium">
                    Tempo de Uso maior ou igual a 10 anos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vida útil igual ou superior a 10 anos (IN RFB nº
                    1.700/2017).
                  </p>
                </div>
                <Switch checked={tuLocal} onCheckedChange={changeButtonTU} />
              </div>

              <Separator orientation="vertical" className="h-10" />

              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="font-medium">Obsolescência Tecnológica</p>
                  <p className="text-xs text-muted-foreground">
                    Defasagem tecnológica/ausência de suporte (Lei nº
                    12.305/2010; Decreto nº 9.373/2018).
                  </p>
                </div>
                <Switch checked={otLocal} onCheckedChange={changeButtonOT} />
              </div>
            </div>
          </Alert>

          {/* Orientação + Upload (apenas idx 0 ou 1) */}
          {showUploadDocs && (
            <>
              <Alert>
                <Accordion type="single" defaultValue="item-1" collapsible>
                  <AccordionItem value="item-1">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-2 items-center">
                        <AlertCircleIcon size={16} />
                        <p className="font-medium">
                          Bens com menos de 10 anos de uso, mas que demandam
                          manutenção
                        </p>
                      </div>
                      <AccordionTrigger className="p-0" />
                    </div>
                    <AccordionContent className="p-0">
                      <div>
                        <p className="text-gray-500 text-sm text-justify mb-4">
                          Quando um bem permanente com menos de 10 anos de uso
                          encontra-se inoperante ou danificado, é necessário
                          apresentar elementos probatórios que justifiquem sua
                          classificação como irrecuperável ou antieconômico...
                        </p>

                        <Alert className="mb-4">
                          <div className="flex mb-2 gap-2 items-center">
                            <Wrench size={16} />
                            <p className="font-medium">
                              1. Orçamento de reparo emitido por empresa ou
                              técnico
                            </p>
                          </div>
                          <p className="text-gray-500 text-sm text-justify">
                            Sempre que possível, o guardião deve obter um
                            orçamento detalhado...
                          </p>
                        </Alert>

                        <Alert>
                          <div className="flex mb-2 gap-2 items-center">
                            <FileText size={16} />
                            <p className="font-medium">
                              2. Laudo Técnico Simplificado (autodeclaração
                              fundamentada)
                            </p>
                          </div>
                          <p className="text-gray-500 text-sm text-justify">
                            Caso não seja possível obter orçamento...
                          </p>
                        </Alert>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Alert>

              <div className="grid gap-2 w-full">
                <Label htmlFor="observacoes">Comprovantes*</Label>
                <div
                  {...getRootProps()}
                  className="border-dashed h-full mb-2 flex-col border bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <input {...getInputProps()} />
                  <div className="p-4 border rounded-md dark:border-neutral-800">
                    <FileIcon size={24} />
                  </div>
                  {isDragActive ? (
                    <p>Solte o arquivo aqui…</p>
                  ) : (
                    <p>
                      Arraste e solte o arquivo aqui ou clique para selecionar
                      (até {MAX_MB} MB)
                    </p>
                  )}
                </div>

                {/* Arquivos locais */}
                {docsLocal.length > 0 && (
                  <ul className="text-xs space-y-2">
                    {docsLocal.map((f, i) => (
                      <Alert
                        key={i}
                        className="flex group items-center justify-between"
                      >
                        <div className="flex items-center min-h-8 gap-2 w-full">
                          <File size={16} />
                          <span className="truncate max-w-[75%]">
                            {f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hidden group-hover:flex"
                            onClick={() => openDoc(i)}
                          >
                            <ScanEye size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 hidden group-hover:flex"
                            onClick={() => removeDoc(i)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </Alert>
                    ))}
                  </ul>
                )}

                {/* Arquivos do servidor */}
                {serverFiles.length > 0 && (
                  <div className="mb-4">
                    <Label>Documentos já anexados a este bem</Label>
                    <ul className="text-xs space-y-2 mt-2">
                      {serverFiles.map((f) => (
                        <Alert
                          key={f.id}
                          className="flex group items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-h-8 w-full">
                            <FileText size={16} />
                            <span className="truncate max-w-[75%]">
                              {f.file_name} ({f.content_type || "arquivo"})
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hidden group-hover:flex"
                              onClick={() =>
                                window.open(
                                  f.file_path,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              disabled={busy}
                            >
                              <ScanEye size={16} />
                            </Button>

                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 hidden group-hover:flex"
                              onClick={() => handleDeleteFile(f)}
                              disabled={busy}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </Alert>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Estado de conservação */}
          {!isIdx7 && shouldShowSituacao && (
            <div className="grid gap-3 w-full">
              <Label>Estado de conservação</Label>
              <div className="flex items-center gap-3">
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger
                    id="condicao"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excelente estado">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle className="size-5 text-green-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">
                            Excelente estado
                          </p>
                          <p
                            className="text-xs text-muted-foreground"
                            data-description
                          >
                            Completo, funcional e com sinais mínimos de uso.
                          </p>
                        </div>
                      </div>
                    </SelectItem>

                    <SelectItem value="Semi-novo">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <CheckSquareOffset className="size-5 text-emerald-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">
                            Semi-novo
                          </p>
                          <p
                            className="text-xs text-muted-foreground"
                            data-description
                          >
                            Ótimo funcionamento, leves marcas de uso.
                          </p>
                        </div>
                      </div>
                    </SelectItem>

                    <SelectItem value="Necessita de pequenos reparos">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <WrenchIcon className="size-5 text-orange-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">
                            Pequenos reparos
                          </p>
                          <p
                            className="text-xs text-muted-foreground"
                            data-description
                          >
                            Funcional, com necessidade de manutenção leve.
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Justificativa */}
          {isIdx7 ? (
            <Alert>
              <div className="flex gap-2">
                <BadgePercent size={24} />
                <div>
                  <p className="font-medium">Mude a situação atual</p>
                  <p className="text-gray-500 text-sm">
                    Por favor,{" "}
                    <b>
                      recadastre o bem como “Antieconômico” no passo anterior
                    </b>{" "}
                    para prosseguir corretamente com o fluxo.
                  </p>
                </div>
              </div>
            </Alert>
          ) : (
            <div className="grid gap-2 w-full">
              <Label htmlFor="observacoes">
                Justificativa (descrição do estado do item)*
              </Label>

              {justificativaEhModelo && (
                <p className="text-xs text-red-500">
                  Obrigatório: personalize a justificativa com uso,
                  funcionamento, defeitos, histórico de manutenção e
                  ano/critério de tombamento para prosseguir.
                </p>
              )}

              <Textarea
                id="observacoes"
                className="w-full"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />

              <p className="text-xs text-muted-foreground">
                CO: {CO} • TU≥10: {tuLocal ? "1" : "0"} • OT alta:{" "}
                {otLocal ? "1" : "0"}
              </p>
            </div>
          )}

          {/* Escala de 7 níveis */}
          <div className="mt-4">
            <div className="flex gap-2">
              {escala7.map((it, i) => {
                const ativo = i === nivelAtivo;
                return (
                  <div
                    key={it.rotulo}
                    className={`rounded-md p-0 h-4 w-4 ${it.bg} ${
                      ativo ? "opacity-100" : "opacity-20"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
