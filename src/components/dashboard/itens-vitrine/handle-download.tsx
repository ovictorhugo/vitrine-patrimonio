// src/utils/exportCatalogXlsx.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* =========================
   Tipos
========================= */
export type UUID = string;

export type EstadoKindPt =
  | "quebrado"
  | "ocioso"
  | "anti-economico"
  | "recuperavel";

export type EstadoKindEn =
  | "BROKEN"
  | "UNUSED"
  | "UNECONOMICAL"
  | "RECOVERABLE";

export type ReviewerRef = { id: UUID; username: string };

export type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: {
    reviewers?: ReviewerRef[] | string[];
    [key: string]: any;
  };
  id: UUID;
  user: {
    id: UUID;
    username: string;
    email: string;
    provider: string;
    linkedin: string | null;
    lattes_id: string | null;
    orcid: string | null;
    ramal: string | null;
    photo_url: string | null;
    background_url: string | null;
    matricula: string | null;
    verify: boolean;
    institution_id: UUID;
  };
  catalog_id: UUID;
  created_at: string;
};

export type CatalogEntry = {
  id: UUID;
  description?: string;
  situation?: string;
  images: { id: UUID; catalog_id: UUID; file_path: string }[];
  asset: {
    asset_code: string;
    asset_check_digit: string;
    asset_value?: string;
    is_official?: boolean;
    material?: { material_name?: string };
    asset_description?: string; // coluna "Descrição"
  };
  workflow_history: WorkflowHistoryItem[];
};

export type ExportXlsxParams = {
  items: CatalogEntry[];
  urlBase: string;
  sheetName?: string;
  filename?: string;
};

/* =========================
   Helpers
========================= */
const WF_DESFAZIMENTO = "DESFAZIMENTO";
const WF_REVIEW_REQUESTED_COMISSION = "REVIEW_REQUESTED_COMISSION";
const WF_REJEITADOS_COMISSAO = "REJEITADOS_COMISSAO";

const safe = (v?: string | null) => (v ?? "").toString().trim();

const buildImgUrl = (urlBase: string, p: string) => {
  const cleanPath = p?.startsWith("/") ? p.slice(1) : p;
  return `${urlBase}${cleanPath}`;
};

const getIdentificacao = (e: CatalogEntry) =>
  [safe(e?.asset?.asset_code), safe(e?.asset?.asset_check_digit)]
    .filter(Boolean)
    .join("-");

const simNao = (b?: boolean) => (b ? "Sim" : "Não");

/** último (mais recente) = primeiro da lista */
const firstWorkflow = (e: CatalogEntry): WorkflowHistoryItem | null =>
  Array.isArray(e?.workflow_history) && e.workflow_history.length > 0
    ? e.workflow_history[0]
    : null;

/** primeira ocorrência de um status específico (na ordem do array) */
const firstWorkflowByStatus = (
  e: CatalogEntry,
  status: string
): WorkflowHistoryItem | null => {
  const list = Array.isArray(e?.workflow_history) ? e.workflow_history : [];
  for (const h of list) {
    if (safe(h?.workflow_status) === status) return h;
  }
  return null;
};

const reviewersToString = (raw: ReviewerRef[] | string[] | undefined): string => {
  if (!raw) return "";
  if (Array.isArray(raw) && raw.length === 0) return "";

  // ReviewerRef[] -> username; string[] -> id
  if (typeof raw[0] === "object") {
    const arr = raw as ReviewerRef[];
    return arr
      .map((r) => safe(r?.username) || safe(r?.id))
      .filter(Boolean)
      .join(" | ");
  } else {
    const arr = raw as string[];
    return arr.map((s) => safe(s)).filter(Boolean).join(" | ");
  }
};

/** Normaliza `situation` para PT */
const estadoToPt = (v?: string): EstadoKindPt | "" => {
  const s = safe(v);
  if (s === "quebrado" || s === "ocioso" || s === "anti-economico" || s === "recuperavel") {
    return s;
  }
  switch (s) {
    case "BROKEN": return "quebrado";
    case "UNUSED": return "ocioso";
    case "UNECONOMICAL": return "anti-economico";
    case "RECOVERABLE": return "recuperavel";
    default: return "" as const;
  }
};

/* =========================
   Export principal
========================= */
export async function handleDownloadXlsx({
  items = [],
  urlBase,
  sheetName = "Itens",
  filename,
}: ExportXlsxParams) {
  const list: CatalogEntry[] = Array.isArray(items) ? items : [];
  if (!urlBase) console.warn("handleDownloadXlsx: 'urlBase' vazio/indefinido.");

  const wb = new ExcelJS.Workbook();
  // força recálculo no abrir (ajuda a evitar @ implícito)
  wb.calcProperties.fullCalcOnLoad = true;

  const ws = wb.addWorksheet(sheetName);

  ws.columns = [
    { header: "Identificação", key: "ident", width: 22 },
    { header: "Material", key: "material", width: 28 },
    { header: "Descrição", key: "descricao_asset", width: 28 },
    { header: "Imagem 1", key: "img1", width: 36 },
    { header: "Imagem 2", key: "img2", width: 36 },
    { header: "Imagem 3", key: "img3", width: 36 },
    { header: "Imagem 4", key: "img4", width: 36 },
    { header: "Identificável", key: "identificavel", width: 14 },
    { header: "Valor estimado", key: "valor", width: 18 },

    // Revisor: vem do primeiro REVIEW_REQUESTED_COMISSION (só entra se status final for DESFAZIMENTO/REJEITADOS_COMISSAO)
    { header: "Revisor (DESFAZIMENTO)", key: "rev_desfaz", width: 28 },

    // Parecer: só se o 1º workflow (mais recente) for DESFAZIMENTO
    { header: "Parecer (DESFAZIMENTO)", key: "parecer", width: 42 },

    { header: "Situação", key: "situacao", width: 18 },
  ];

  ws.views = [{ state: "frozen", ySplit: 1 }];

  // Altura ~100px (≈ 75pt) para TODAS as linhas (incluindo header)
  ws.properties.defaultRowHeight = 75;
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).height = 75;

  for (const e of list) {
    // status final (mais recente): primeiro item
    const latest = firstWorkflow(e);
    const latestStatus = safe(latest?.workflow_status);
    const allowReviewer =
      latestStatus === WF_DESFAZIMENTO || latestStatus === WF_REJEITADOS_COMISSAO || latestStatus === WF_REVIEW_REQUESTED_COMISSION;

    // parecer: só quando o status final é DESFAZIMENTO
    const parecer = latestStatus === WF_DESFAZIMENTO || latestStatus === WF_REJEITADOS_COMISSAO
      ? safe(latest?.detail?.justificativa) || safe(latest?.detail?.observation?.text)
      : "";

    // revisor: sempre lido do primeiro REVIEW_REQUESTED_COMISSION,
    // mas só inserido se allowReviewer === true
    const comission = firstWorkflowByStatus(e, WF_REVIEW_REQUESTED_COMISSION);
    const revisores = allowReviewer ? reviewersToString(comission?.detail?.reviewers) : "";

    const row = ws.addRow({
      ident: getIdentificacao(e),
      material: safe(e?.asset?.material?.material_name),
      descricao_asset: safe(e?.asset?.asset_description),
      img1: "",
      img2: "",
      img3: "",
      img4: "",
      identificavel: simNao(e?.asset?.is_official),
      valor: safe(e?.asset?.asset_value),
      rev_desfaz: revisores,
      parecer,
      situacao: estadoToPt(e?.situation),
    });

    // garantir ~100px por linha
    row.height = 75;

    // Imagens (até 4) – escrever fórmula com IMAGE (inglês) para evitar '@'
    const imgs = (e.images || [])
      .slice(0, 4)
      .map((im) => buildImgUrl(urlBase, safe(im.file_path)));
    while (imgs.length < 4) imgs.push("");
    const imgCols = [4, 5, 6, 7]; // após a coluna "Descrição"

    imgs.forEach((url, j) => {
      const cell = row.getCell(imgCols[j]);
      cell.value = url ? { formula: `IMAGE("${url}")` } : "";
    });
  }

  // Centralizar TODAS as células e habilitar quebra de linha
  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  const finalName =
    filename ||
    `itens_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx`;

  saveAs(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    finalName
  );
}
