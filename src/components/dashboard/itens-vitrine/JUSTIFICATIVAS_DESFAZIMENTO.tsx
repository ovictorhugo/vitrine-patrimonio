import { CatalogEntry } from "./itens-vitrine";

const safeTxt = (v?: string | null) => (v ?? "").toString().trim();

const inferYear = (e?: CatalogEntry): string => {
  if (!e) return "";
  const tryYear = (s?: string | null) => safeTxt(s).match(/(?:19|20)\d{2}/)?.[0] ?? "";
  const fromDesc = tryYear(e?.asset?.asset_description);
  const fromSerial = tryYear(e?.asset?.serial_number);
  const fromCreated = safeTxt(e?.created_at) ? new Date(e!.created_at).getFullYear().toString() : "";
  return fromDesc || fromSerial || fromCreated || "";
};

const varsFrom = (e: CatalogEntry) => {
  const material = safeTxt(e.asset?.material?.material_name);
  const descricao = safeTxt(e.asset?.asset_description);
  const marca = safeTxt(e.asset?.item_brand);
  const modelo = safeTxt(e.asset?.item_model);
  const patrimonio = safeTxt(e.asset?.asset_code);
  const dgv = safeTxt(e.asset?.asset_check_digit);
  const codigo = [patrimonio, dgv].filter(Boolean).join("-");
  const atm = safeTxt(e.asset?.atm_number);
  const serial = safeTxt(e.asset?.serial_number);
  const responsavel =
    safeTxt(e.asset?.legal_guardian?.legal_guardians_name) ||
    safeTxt(e.location?.legal_guardian?.legal_guardians_name);
  const setor = safeTxt(e.location?.sector?.sector_name);
  const unidade = safeTxt(e.location?.sector?.agency?.unit?.unit_name);
  const ano = inferYear(e); // mantido, mas não utilizado nos textos
  const isEletronico =
    descricao.toLowerCase().includes("comput") ||
    descricao.toLowerCase().includes("monitor") ||
    descricao.toLowerCase().includes("notebook");
  return { material, descricao, marca, modelo, patrimonio, dgv, codigo, atm, serial, responsavel, setor, unidade, ano, isEletronico };
};

type JustPreset = { id: string; label: string; build: (e: CatalogEntry) => string };

export const JUSTIFICATIVAS_DESFAZIMENTO: JustPreset[] = [
  {
    id: "sicpat-baixado-ou-nao-localizado",
    label: "Bem com número patrimonial baixado ou não localizado no SICPAT",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material ? `O(a) ${material}` : "O bem";
      return `Parecer técnico:
${alvo} encontra-se com número patrimonial já baixado ou não localizado no sistema SICPAT. Não há valor de uso, de recuperação ou de venda associado ao item.
Fundamentação legal: Conforme o art. 4º, inciso I, do Decreto nº 9.373/2018, e considerando a ausência de identificação e valor residual, o item enquadra-se como inservível e deve ser baixado definitivamente do acervo patrimonial.`;
    },
  },
  {
    id: "antigo-depreciado-obsoleto",
    label: "Bem antigo e depreciado (obsoleto)",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material ? `O(a) ${material}` : "O bem";
      return `Parecer técnico:
${alvo} apresenta vida útil esgotada, obsolescência tecnológica e elevado grau de depreciação, conforme critérios da Instrução Normativa RFB nº 1.700/2017, utilizada como referência de avaliação pela PRA/UFMG (Nota nº 1/2025/PRA-GAB).
Fundamentação legal: Enquadra-se no art. 4º, inciso II, do Decreto nº 9.373/2018, como bem antieconômico, uma vez que a continuidade do uso ou manutenção é desvantajosa à Administração. Recomenda-se a baixa patrimonial e posterior desfazimento ambiental adequado, em conformidade com o art. 5º do mesmo Decreto.`;
    },
  },
  {
    id: "danificado-ou-quebrado",
    label: "Bem danificado ou quebrado (sem condições de uso)",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material ? `O(a) ${material}` : "O item";
      return `Parecer técnico:
Constatou-se que ${alvo} apresenta danos estruturais e perda de funcionalidade, sendo inviável sua recuperação técnica ou econômica.
Fundamentação legal: Conforme o art. 4º, inciso III, do Decreto nº 9.373/2018, trata-se de bem irrecuperável, cuja reposição ou reparo não se justifica sob o princípio da economicidade. O item deve ser encaminhado para desfazimento ambientalmente adequado, nos termos do art. 5º do mesmo Decreto e do art. 9º, inciso XII, da Lei nº 12.305/2010.`;
    },
  },
  {
    id: "parte-ou-fragmento",
    label: "Parte ou fragmento de bem (resto, pedaço, sucata)",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo =
        material ? `partes/restos de ${material}` : "partes, restos ou fragmentos de bens móveis";
      return `Parecer técnico:
O item consiste em ${alvo} sem integridade física ou valor de mercado, sem possibilidade de reaproveitamento.
Fundamentação legal: Em conformidade com o art. 4º, inciso III, do Decreto nº 9.373/2018, caracteriza-se como bem irrecuperável, devendo ser destinado ao desfazimento com aproveitamento de materiais recicláveis, conforme preconizado pelo art. 7º do mesmo Decreto e pela Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010).`;
    },
  },
  {
    id: "eletronico-obsoleto-inservivel",
    label: "Equipamento eletrônico obsoleto ou inservível (monitores de tubo, impressoras, estabilizadores etc.)",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material ? `O(a) ${material}` : "O equipamento";
      return `Parecer técnico:
${alvo} encontra-se fora de especificação técnica atual ou danificado de forma irreversível, não possuindo valor de uso, de troca ou de venda, tampouco justificativa técnica para manutenção.
Fundamentação legal: Nos termos do art. 4º, inciso III, do Decreto nº 9.373/2018, enquadra-se como bem irrecuperável. O destino final deve observar a Lei nº 12.305/2010 (art. 33, §1º, inciso II), que determina a logística reversa e o descarte ambientalmente correto de resíduos eletroeletrônicos.`;
    },
  },
  {
    id: "obsoleto-funcional-destinacao-social",
    label: "Bem obsoleto, porém funcional – descarte com destinação social ambientalmente adequada",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material ? `O(a) ${material}` : "O item";
      return `Parecer técnico:
${alvo} encontra-se em funcionamento, porém obsoleto e totalmente depreciado, conforme a IN RFB nº 1.700/2017 (Anexo III), que define vida útil média de bens móveis e equipamentos.
Fundamentação legal: Classifica-se como bem antieconômico (art. 4º, II, do Decreto nº 9.373/2018), justificando baixa patrimonial e destinação ambientalmente adequada, com possibilidade de reaproveitamento social por ONGs ou cooperativas, conforme o art. 7º do Decreto nº 9.373/2018 e o art. 9º da Lei nº 12.305/2010.`;
    },
  },
];
