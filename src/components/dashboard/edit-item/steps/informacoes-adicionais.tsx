import {
  AlertCircle,
  AlertCircleIcon,
  ArrowRight,
  BadgePercent,
  CheckCircle,
  Eye,
  File,
  File as FileIcon,
  FileText,
  ScanEye,
  Trash,
  Wrench,
  WrenchIcon,
} from "lucide-react";

type ExistingFileDTO = {
  id: string;
  file_path: string;
  file_name: string;
  content_type: string;
};


import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { ArrowSquareUpRight, CheckSquareOffset } from "phosphor-react";
import { Switch } from "../../../ui/switch";
import { Alert } from "../../../ui/alert";
import { Separator } from "../../../ui/separator";
import { Button } from "../../../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { StepBaseProps } from "../../novo-item/novo-item";
import { UserContext } from "../../../../context/context";

type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

type InfoAdicionaisLocal = {
  observacao?: string;
  situacao?: string;
  tuMaiorIgual10?: boolean;
  obsolescenciaAlta?: boolean;
  // NOVO: documentos probatórios (uplados no passo)
  docs?: File[];
};

// --- API para o pai disparar validação com toast só ao avançar ---
export type InformacoesAdicionaisRef = {
  validateBeforeNext: () => boolean;
};


export const InformacoesAdicionaisStep = forwardRef<
  InformacoesAdicionaisRef,
  StepBaseProps<"informacoes-adicionais"> & {
    estadoAtual?: EstadoKind;
    existingFiles?: ExistingFileDTO[];
    catalogId: string;        // 👈 novo: id do próprio catalog
  }
>(function InformacoesAdicionaisStep(
  {
    onValidityChange,
    step,
    onStateChange,
    initialData,
    estadoAtual,
    existingFiles,

    catalogId,              // 👈 pega daqui
  },
  ref
) {
  const [observacao, setObservacao] = useState(initialData?.observacao ?? "");
  const [situacao, setSituacao] = useState(initialData?.situacao ?? "");

// CO derivado (congelado): 0 = não funcional (quebrado/irrecuperável/antieconômico), 1 = funcional (ocioso/recuperável)
const CO: 0 | 1 = useMemo(() => {
  if (estadoAtual === "ocioso" || estadoAtual === "recuperavel") return 1;
  // quebrado, irrecuperável (análoga) e antieconômico tratamos como não funcional para efeitos de CO
  return 0;
}, [estadoAtual]);


  // Antieconômico comprovado (apenas para exibir o banner informativo; não influencia o gerador)

  // Switches (reidratados)
  const [tuLocal, setTuLocal] = useState<boolean>(initialData?.tuMaiorIgual10 ?? false);
  const [otLocal, setOtLocal] = useState<boolean>(initialData?.obsolescenciaAlta ?? false);

  // Upload de documentos (para idx 0 e 1)
  const [docsLocal, setDocsLocal] = useState<File[]>([]);
  const MAX_MB = 5;

  // Exibir Select "Estado de conservação" para ocioso/recuperável
  const shouldShowSituacao = estadoAtual === "ocioso" || estadoAtual === "recuperavel";
  useEffect(() => {
    if (!shouldShowSituacao && situacao) setSituacao("");
  }, [shouldShowSituacao]); // eslint-disable-line

  // Índice 0..7 conforme CO/TU/OT
const getIdx = useCallback(() => {
  const tu = tuLocal ? 1 : 0; // TU≥10 => 1
  const ot = otLocal ? 1 : 0; // OT alta => 1

  // Estado "anti-economico" deve navegar por 3, 4, 5 ou 7 conforme TU/OT:
  // TU=1 & OT=1 -> 7
  // TU=1 & OT=0 -> 3
  // TU=0 & OT=0 -> 4
  // TU=0 & OT=1 -> 5  (⬅ adicionamos este caso)


  // Demais estados seguem a matriz CO/TU/OT
  return ((CO << 2) | (tu << 1) | ot) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}, [estadoAtual, CO, tuLocal, otLocal]);




  const addSituacao = useCallback(
    (txt: string) => {
      if (shouldShowSituacao && situacao) return `${txt} Estado de conservação informado: ${situacao}.`;
      return txt;
    },
    [shouldShowSituacao, situacao]
  );

  // ====== GERADOR (modelo) ======
  // Sem branch especial de antieconômico: SEMPRE por matriz 0..7
  const gerarTexto = useCallback(() => {
    const idx = getIdx();
    if (idx === null) {
      return "Descrição do bem indisponível: selecione o estado operacional (quebrado/ocioso/recuperável) para compor a justificativa.";
    }

    const base: Record<number, string> = {
      // CO=0 (quebrado) e TU<10 (idx 0/1) → haverá upload de documentos no UI
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
      // CO=1 (funcional: ocioso/recuperável)
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
  }, [getIdx]);

  // Auto-substitui (nunca concatena)
  useEffect(() => {
    const novo = gerarTexto();
    if (novo && novo !== observacao) setObservacao(novo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tuLocal, otLocal, estadoAtual]);

  // ===== Dropzone (substitui input; obrigatório em idx 0/1) =====
  const onDropDocs = useCallback((acceptedFiles: File[]) => {
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
    const next: File[] = [];
    for (const f of acceptedFiles) {
      const okExt = validExt.some((e) => f.name.toLowerCase().endsWith(e));
      const okSize = f.size <= MAX_MB * 1024 * 1024;
      if (!okExt) {
        toast("Arquivo inválido", {
          description: "Formatos aceitos: PDF, imagens, DOC/DOCX/ODT, XLS/XLSX.",
        });
        continue;
      }
      if (!okSize) {
        toast("Arquivo muito grande", {
          description: `Cada arquivo deve ter até ${MAX_MB} MB.`,
        });
        continue;
      }
      next.push(f);
    }
    if (next.length) setDocsLocal((prev) => [...prev, ...next]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropDocs,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  const removeDoc = (i: number) => setDocsLocal((prev) => prev.filter((_, idx) => idx !== i));

  // ÍNDICE e obrigatoriedade dos comprovantes
  const idx = getIdx();
  const showUploadDocs = idx === 0 || idx === 1; // obrigatório
  const docsOk = !showUploadDocs || docsLocal.length > 0;

  // Sobe pro pai
  useEffect(() => {
    const payload: InfoAdicionaisLocal = {
      observacao,
      situacao,
      tuMaiorIgual10: tuLocal,
      obsolescenciaAlta: otLocal,
      docs: docsLocal,
    };
    onStateChange?.(payload);
  }, [observacao, situacao, tuLocal, otLocal, docsLocal, onStateChange]);

  // ===== Validação da justificativa (inteligente) =====
  const obrigatorios = ["uso", "funcionamento", "defeito", "manutenção", "tombamento"];
  function hasSemanticaMinima(txt: string) {
    const t = txt.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const achados = obrigatorios.filter(
      (k) => t.includes(k) || (k === "manutenção" && t.includes("manutencao"))
    );
    return achados.length >= 3; // exige ao menos 3 temas
  }

function isJustificativaModelo(atual: string, modelo: string) {
  const a = (atual ?? "").trim().replace(/\s+/g, " ");
  const m = (modelo ?? "").trim().replace(/\s+/g, " ");
  if (!m) return false;      // sem modelo, não há com o que igualar
  return a === m;            // apenas igual, nada além
}

// abaixo dos seus states/consts
const openDoc = useCallback((i: number) => {
  const f = docsLocal[i];
  if (!f) return;

  const url = URL.createObjectURL(f);

  // abre PDF e imagens em nova aba; outros formatos baixam
  const isPreviewable =
    f.type === "application/pdf" ||
    f.type.startsWith("image/") ||
    f.name.toLowerCase().endsWith(".pdf") ||
    /\.(png|jpe?g)$/i.test(f.name);

  if (isPreviewable) {
    window.open(url, "_blank", "noopener,noreferrer");
    // libera o objeto depois de um tempo
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
}, [docsLocal]);


const modeloAtual = gerarTexto();
const justificativaEhModelo = (observacao.trim() == modeloAtual.trim())
  const isIdx7 = idx === 7;
// Quando idx==7, não exigimos texto; caso contrário, precisa ser diferente do modelo
const obsOk = isIdx7 ? true : !(observacao.trim() == modeloAtual.trim());
const sitOk = shouldShowSituacao ? situacao !== "" : true;

// Mantém o onValidityChange atualizado, sem toasts
useEffect(() => {
  onValidityChange(
        obsOk 
    && sitOk 
    && docsOk
    && !isIdx7);
}, [obsOk, sitOk, docsOk, onValidityChange, idx, isIdx7]);

useEffect(() => {
  if (isIdx7 && observacao) setObservacao("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isIdx7]);
 // Toasts apenas ao tentar avançar
useImperativeHandle(ref, () => ({
  validateBeforeNext: () => {
    if (!isIdx7 && justificativaEhModelo) {
      toast("Personalize a justificativa", {
        description: "O texto não pode ser idêntico ao modelo sugerido.",
        action: { label: "Ok", onClick: () => {} },
      });
      return false;
    }
    if (showUploadDocs && docsLocal.length === 0) {
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

  // ===== Escala 7 níveis (verde → vermelho) =====
  // Mapeia idx (0..7) para nível 0..6
// ===== Escala 7 níveis (0=melhor verde → 6=pior vermelho) =====
// Ajustado para que TU<10 (tuLocal=false) seja melhor que TU≥10, como você pediu.
const nivelPorIdx: Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, number> = {
  // CO=1 (funcional: 4..7) — melhores níveis
  4: 0, // funcional, TU<10, OT baixa  → Excelente
  5: 1, // funcional, TU<10, OT alta   → Muito bom
  6: 2, // funcional, TU≥10, OT baixa  → Bom
  7: 3, // funcional, TU≥10, OT alta   → Uso moderado

  // CO=0 (quebrado: 0..3) — piores níveis
  0: 4, // quebrado, TU<10, OT baixa   → Necessita reparos
  1: 5, // quebrado, TU<10, OT alta    → Inoperante
  2: 6, // quebrado, TU≥10, OT baixa   → Antieconômico
  3: 6, // quebrado, TU≥10, OT alta    → Antieconômico
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

  const nivelAtivo = (() => {
    const i = getIdx();
    if (i === null) return 2; // neutro "Bom"
    return nivelPorIdx[i];
  })();

  // ======== (mantidos) variáveis do seu exemplo de outro upload (não removidas) ========
  const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFilePicked = (files: File[]) => {
    const uploadedFile = files?.[0];
    if (!uploadedFile) return;

    // validações simples
    const ext = uploadedFile.name.toLowerCase();
    if (!ext.endsWith(".xls") && !ext.endsWith(".xlsx") && !ext.endsWith(".csv")) {
      toast("Arquivo inválido", {
        description: "",
        action: { label: "Fechar", onClick: () => {} },
      });
      return;
    }

    setFile(uploadedFile);
    setFileInfo({ name: uploadedFile.name, size: uploadedFile.size });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFilePicked(acceptedFiles);
  }, []);

  // (mantido) — não é usado visualmente pois substituímos pelo dropzone principal
  // const { getRootProps: getRootPropsOld, getInputProps: getInputPropsOld, isDragActive: isDragActiveOld } = useDropzone({
  //   onDrop,
  //   maxFiles: 1,
  //   multiple: false,
  //   accept: {
  //     "application/vnd.ms-excel": [".xls"],
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  //     "text/csv": [".csv"],
  //   },
  // });

  const [serverFiles, setServerFiles] = useState<ExistingFileDTO[]>(existingFiles ?? []);

// Se a prop mudar (ex: re-hidratação), sincroniza:
useEffect(() => {
  setServerFiles(existingFiles ?? []);
}, [existingFiles]);

const {urlGeral} = useContext(UserContext)
 const token = localStorage.getItem("jwt_token") || "";

const handleDeleteFile = useCallback(
  async (file: ExistingFileDTO) => {
    try {
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

      // Remove da lista local
      setServerFiles((prev) => prev.filter((f) => f.id !== file.id));

      toast("Documento removido com sucesso!", {
        description: file.file_name,
      });
    } catch (e: any) {
      console.error(e);
      toast("Erro ao remover documento", {
        description: e?.message || "Tente novamente.",
      });
    }
  },
  [urlGeral, token]
);



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
              Descreva o estado real do bem (ex.: uso, funcionamento, defeitos, histórico de manutenção, ano/critério de tombamento).
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
       

          {/* Switches TU/OT — também visíveis em idx 3,4,7 mesmo que antieconômico */}
         
            <Alert className="mb-2">
              <div className="flex w-full gap-4">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">Tempo de Uso maior ou igual a 10 anos</p>
                    <p className="text-xs text-muted-foreground">
                      Vida útil igual ou superior a 10 anos (IN RFB nº 1.700/2017).
                    </p>
                  </div>
                  <Switch checked={tuLocal} onCheckedChange={setTuLocal} />
                </div>

                <Separator orientation="vertical" className="h-10" />

                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">Obsolescência Tecnológica</p>
                    <p className="text-xs text-muted-foreground">
                      Defasagem tecnológica/ausência de suporte (Lei nº 12.305/2010; Decreto nº 9.373/2018).
                    </p>
                  </div>
                  <Switch checked={otLocal} onCheckedChange={setOtLocal} />
                </div>
              </div>
            </Alert>
      

          {/* Orientação + Upload (apenas idx 0 ou 1) */}
          {showUploadDocs && (
            <>
              <Alert className="">
                <Accordion type="single" defaultValue="item-1" collapsible>
                  <AccordionItem value="item-1">
                    <div className="flex justify-between  items-center  gap-2">
                      <div className="flex  gap-2 items-center">
                        <div>
                          <AlertCircleIcon size={16} />
                        </div>

                        <p className="font-medium">
                          Bens com menos de 10 anos de uso, mas que demandam manutenção
                        </p>
                      </div>
                      <AccordionTrigger className="p-0"></AccordionTrigger>
                    </div>
                    <AccordionContent className="p-0">
                      <div>
                        <p className="text-gray-500 text-sm text-justify mb-4">
                          Quando um bem permanente com menos de 10 anos de uso encontra-se inoperante ou danificado, é necessário apresentar elementos probatórios que justifiquem sua classificação como irrecuperável ou antieconômico, conforme os critérios definidos no art. 4º do Decreto nº 9.373/2018. Para subsidiar essa classificação, o guardião do bem deverá comprovar que o custo de reparo é superior a 50% de seu valor atual, de acordo com a metodologia de depreciação prevista na Instrução Normativa RFB nº 1.700/2017 (Anexo III). Abaixo, seguem sugestões de possíveis encaminhamentos para apresentação da comprovação técnica:
                        </p>

                        <Alert className="mb-4">
                          <div className="flex mb-2 gap-2 items-center">
                            <div>
                              <Wrench size={16} />
                            </div>

                            <p className="font-medium">1. Orçamento de reparo emitido por empresa ou técnico</p>
                          </div>
                          <p className="text-gray-500 text-sm text-justify">
                            Sempre que possível, o guardião deve obter um orçamento detalhado, contendo descrição dos serviços, peças e valores, que demonstre que o custo de reparo ultrapassa 50% do valor atual do bem.
                          </p>
                        </Alert>

                        <Alert className="">
                          <div className="flex mb-2 gap-2 items-center">
                            <div>
                              <FileText size={16} />
                            </div>

                            <p className="font-medium">2. Laudo Técnico Simplificado (autodeclaração fundamentada)</p>
                          </div>
                          <p className="text-gray-500 text-sm text-justify">
                            Caso não seja possível obter orçamento, o guardião poderá emitir um Laudo Técnico Simplificado, assinado e datado, descrevendo detalhadamente: O estado atual do bem e o tipo de dano identificado; As tentativas realizadas para obtenção de orçamento (ex.: contatos, e-mails, ligações); A inexistência de peças ou empresas de serviços de reparo, ou mesmo descontinuidade da tecnologia; As razões técnicas que tornam inviável sua recuperação ou reaproveitamento, inclusive em setores com menor demanda técnica. Esse documento deve ser redigido com clareza e objetividade, identificando o bem (marca, modelo, número de série e patrimônio) e fundamentando a avaliação com base em critérios técnicos e de obsolescência. Nos termos do art. 22 da Lei nº 9.784/1999, que regula o processo administrativo no âmbito da Administração Pública Federal, o servidor responsável pelo bem atua sob o princípio da fé pública, podendo emitir declaração técnica com validade probatória administrativa, desde que devidamente fundamentada e assinada.
                          </p>
                        </Alert>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Alert>

              {/* Dropzone obrigatório (substitui input file) */}
              <div className="grid gap-2 w-full">
                <Label htmlFor="observacoes">Comprovantes*</Label>
                <div
                  {...getRootProps()}
                  className="border-dashed h-full mb-2 flex-col border bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <input {...getInputProps()} />
                  <div className="p-4 border rounded-md dark:border-neutral-800">
                    <FileIcon size={24} className="whitespace-nowrap" />
                  </div>
                  {isDragActive ? (
                    <p>Solte o arquivo aqui…</p>
                  ) : (
                    <p>Arraste e solte o arquivo aqui ou clique para selecionar</p>
                  )}
                 
                </div>

                {docsLocal.length > 0 && (
                  <div className="">
                
                    <ul className="text-xs space-y-2">
                      {docsLocal.map((f, i) => (
                        <Alert key={i} className=" flex group items-center justify-between">
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
  title="Abrir em nova aba"
>
  <ScanEye size={16} />
</Button>
                            <Button variant='destructive' size="icon" className="h-8 w-8 hidden group-hover:flex" onClick={() => removeDoc(i)}>
                           <Trash size={16} />
                          </Button>
                        </div>
                        </Alert>
                      ))}
                    </ul>
                  </div>
                )}

{serverFiles && serverFiles.length > 0 && (
  <div className="mb-4">
    <Label>Documentos já anexados a este bem</Label>
    <ul className="text-xs space-y-2 mt-2">
      {serverFiles.map((f) => (
        <Alert key={f.id} className="flex group items-center justify-between">
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
                window.open(f.file_path, "_blank", "noopener,noreferrer")
              }
              title="Abrir em nova aba"
            >
              <ScanEye size={16} />
            </Button>

                            <Button variant='destructive' size="icon" className="h-8 w-8 hidden group-hover:flex"    onClick={() => handleDeleteFile(f)}>
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

          {/* Estado de conservação – apenas para ocioso/recuperável */}
          {!isIdx7 && shouldShowSituacao && (
            <div className="grid gap-3 w-full">
              <Label>Estado de conservação</Label>
              <div className="flex items-center gap-3">
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger id="condicao" className="items-start [&_[data-description]]:hidden">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excelente estado">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle className="size-5 text-green-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">Excelente estado</p>
                          <p className="text-xs text-muted-foreground" data-description>
                            Completo, funcional e com sinais mínimos de uso.
                          </p>
                        </div>
                      </div>
                    </SelectItem>

                    <SelectItem value="Semi-novo">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <CheckSquareOffset className="size-5 text-emerald-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">Semi-novo</p>
                          <p className="text-xs text-muted-foreground" data-description>
                            Ótimo funcionamento, leves marcas de uso.
                          </p>
                        </div>
                      </div>
                    </SelectItem>

                    <SelectItem value="Necessita de pequenos reparos">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <WrenchIcon className="size-5 text-orange-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">Pequenos reparos</p>
                          <p className="text-xs text-muted-foreground" data-description>
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
              <div className="flex gap-2 ">
          <BadgePercent size={24} />
          <div>
            <p className="font-medium">Mude a situação atual</p>
            <p className="text-gray-500 text-sm">
             Por favor, <b>recadastre o bem como “Antieconômico” no passo anterior</b> para prosseguir corretamente com o fluxo.
            </p>
          </div>
        </div>
           </Alert>
          ):(
<div className="grid gap-2 w-full">
            <Label htmlFor="observacoes">Justificativa (descrição do estado do item)*</Label>
            {justificativaEhModelo && (
              <p className="text-xs text-red-500 ">
               Obrigatório: Personalize a justificativa com uso, funcionamento, defeitos, histórico de manutenção e ano/critério de tombamento para prosseguir.
              </p>
            )}
            <Textarea
              id="observacoes"
              className="w-full"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
            <div className="">
              <p className="text-xs text-muted-foreground">
  <>CO: {CO} • TU≥10: {tuLocal ? "1" : "0"} • OT alta: {otLocal ? "1" : "0"}</>
</p>


            </div>
          
          </div>
          )}

          {/* Escala de 7 níveis (verde → vermelho) */}
          <div className="mt-4">
         
            <div className="flex gap-2">
              {escala7.map((it, i) => {
                const ativo = i === nivelAtivo;
                return (
                  <div
                    key={it.rotulo}
                    className={`rounded-md p-0 h-4 w-4 ${it.bg} ${
                      ativo ? "opacity-100  " : "opacity-20"
                    }`}
                   
                  >

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});