// src/pages/item/index.tsx
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import { ChevronLeft, ChevronRight, LoaderCircle, MapPin, Trash, Pencil} from "lucide-react";
import { UserContext } from "../../context/context";
import { toast } from "sonner";
import { ArrowUUpLeft } from "phosphor-react";

/* ===================== Tipos DTO ===================== */
interface UnitDTO {
  id: string;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
}
interface AgencyDTO {
  id: string;
  agency_name: string;
  agency_code: string;
  unit_id?: string;
  unit?: UnitDTO;
}
interface SectorDTO {
  id: string;
  sector_name: string;
  sector_code: string;
  agency_id?: string;
  agency?: AgencyDTO;
  unit_id?: string;
  unit?: UnitDTO;
}
interface LocationDTO {
  id: string;
  location_name: string;
  location_code: string;
  sector_id?: string;
  sector?: SectorDTO;
}
interface MaterialDTO {
  id: string;
  material_code: string;
  material_name: string;
}
interface LegalGuardianDTO {
  id: string;
  legal_guardians_code: string;
  legal_guardians_name: string;
}
interface AssetDTO {
  id: string;
  asset_code: string;
  asset_check_digit: string;
  atm_number: string;
  serial_number: string;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string;
  item_model: string;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  is_official?: boolean;
  material?: MaterialDTO | null;
  legal_guardian?: LegalGuardianDTO | null;
  location?: LocationDTO | null;
}
type ApiSituation = "UNUSED" | "BROKEN" | "UNECONOMICAL" | "RECOVERABLE";

interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}
interface CatalogResponseDTO {
  id: string;
  situation: ApiSituation;
  conservation_status: string;
  description: string;
  asset: AssetDTO;
  user?: {
    id: string;
    username: string;
    email: string;
  } | null;
  location?: LocationDTO | null; // localização ATUAL do item no catálogo
  images: CatalogImageDTO[];
}

/* ===================== Utils ===================== */
const buildImageUrl = (base: string, imageId: string) => `${base}uploads/${imageId}.jpg`;

const situationToText: Record<ApiSituation, string> = {
  UNUSED: "Ocioso",
  BROKEN: "Quebrado",
  UNECONOMICAL: "Anti-econômico",
  RECOVERABLE: "Recuperável",
};

const money = (v?: string) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const chain = (loc?: LocationDTO | null) => {
  if (!loc || !loc.sector) return [];
  const s = loc.sector;
  const a = s.agency;
  const u = a?.unit ?? s.unit;
  // ordem: Unidade -> Agência -> Setor -> Local
  const parts: string[] = [];
  if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
  if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
  parts.push(`${s.sector_code} - ${s.sector_name}`);
  parts.push(`${loc.location_code} - ${loc.location_name}`);
  return parts;
};

/* ===================== Hook query ===================== */
const useQuery = () => new URLSearchParams(useLocation().search);

/* ===================== Página ===================== */
export function ItemPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  const catalogId = query.get("id") || ""; // <-- novo: pega ?id= da URL

  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<CatalogResponseDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCatalog = useCallback(async () => {
    if (!catalogId) return;
    setLoading(true);
    try {
      const r = await fetch(`${urlGeral}catalog/${catalogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`Erro ${r.status}`);
      const data: CatalogResponseDTO = await r.json();
      setCatalog(data);
    } catch (e: any) {
      toast("Erro ao carregar", { description: e?.message || "Não foi possível obter o item." });
    } finally {
      setLoading(false);
    }
  }, [catalogId, urlGeral, token]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const images = useMemo(() => {
    return (catalog?.images ?? []).slice(0, 4).map((img) => ({
      category: "",
      title: "",
      src: buildImageUrl(urlGeral, img.id),
    }));
  }, [catalog?.images, urlGeral]);

  const cards = useMemo(
    () => images.map((card, index) => <Card key={card.src} card={card} index={index} layout={true} />),
    [images]
  );

  const handleBack = () => navigate(-1);

  const handleEdit = () => {
    if (!catalog) return;
    navigate(`/edit-item-vitrine?id=${catalog.id}`);
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openDelete = () => setIsDeleteOpen(true);
  const closeDelete = () => setIsDeleteOpen(false);
  
  const handleConfirmDelete = async () => {
    if (!catalog) return;
    try {
      setDeleting(true);
      const r = await fetch(`${urlGeral}catalog/${catalog.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao excluir (${r.status}): ${t}`);
      }
      toast("Item excluído com sucesso.");
      navigate("/dashboard");
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  };


  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <LoaderCircle className="animate-spin" size={48} />
      </main>
    );
  }

  if (!catalog) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <Alert>Item não encontrado.</Alert>
      </main>
    );
  }

  const asset = catalog.asset;
  const titulo = asset.material?.material_name || asset.item_model || asset.item_brand || "Item sem nome";
  const valorFormatado = money(asset.asset_value);

  const locCatalogoParts = chain(catalog.location);
  const locAssetParts = chain(asset.location);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Helmet>
        <title>{titulo} | Vitrine Patrimônio</title>
        <meta name="description" content={`Detalhes do item ${asset.asset_code}-${asset.asset_check_digit}`} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={handleBack} variant="outline" size="icon" className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>

        <h1 className="flex-1 flex flex-wrap gap-2 items-center text-xl font-semibold tracking-tight">
          Detalhes do item
          <Badge variant="outline">
            {asset.asset_code}-{asset.asset_check_digit}
          </Badge>
          {asset.atm_number && asset.atm_number !== "None" && (
            <Badge variant="outline">ATM: {asset.atm_number}</Badge>
          )}
        </h1>

        <div className="hidden md:flex items-center gap-2">
          <Button onClick={handleEdit} variant="secondary" size="sm">
            <Pencil size={16} /> Editar
          </Button>
          <Button onClick={openDelete} variant="destructive" size="sm" disabled={deleting}>
  <Trash size={16} /> Excluir
</Button>
        </div>
      </div>

      {/* Imagens */}
      <div className="grid grid-cols-1">
        {cards.length > 0 ? (
          <Carousel items={cards} />
        ) : (
          <Alert>Nenhuma imagem enviada para este item.</Alert>
        )}

        <div className="flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse gap-8">
          {/* Coluna principal */}
          <div className="flex w-full flex-col">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">{titulo}</h2>
            </div>

            <p className="mb-8 text-gray-500">{asset.asset_description || "Sem descrição."}</p>

            <div className="flex">
              <div className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`} />
              <Alert className="flex flex-col rounded-l-none">
                <div className="flex flex-wrap gap-3">
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                    Situação: <Badge>{situationToText[catalog.situation]}</Badge>
                  </div>

                  {catalog.conservation_status && (
                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                      Conservação: <Badge variant="outline">{catalog.conservation_status}</Badge>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                    Valor estimado: <strong>{valorFormatado}</strong>
                  </div>

                  {asset.accounting_entry_code && (
                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                      Termo de resp.: {asset.accounting_entry_code}
                    </div>
                  )}
                </div>

                {catalog.description && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-500 dark:text-gray-300">{catalog.description}</div>
                  </>
                )}

                {/* Localização atual (Catálogo) */}
                <Separator className="my-4" />
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm uppercase font-bold">Localização (Catálogo):</p>
                  <MapPin size={16} />
                  {locCatalogoParts.length ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {locCatalogoParts.map((p, i) => (
                        <div key={i} className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
                          {i > 0 && <ChevronRight size={14} />} {p}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Não definido.</span>
                  )}
                </div>

                {/* Localização do asset (origem) */}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <p className="text-sm uppercase font-bold">Localização (Asset):</p>
                  <MapPin size={16} />
                  {locAssetParts.length ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {locAssetParts.map((p, i) => (
                        <div key={i} className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
                          {i > 0 && <ChevronRight size={14} />} {p}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Não definido.</span>
                  )}
                </div>
              </Alert>
            </div>

            {/* Material / Metadados rápidos */}
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <div className="text-sm uppercase font-bold mb-2">Material</div>
                <div className="text-sm text-gray-600">
                  {asset.material?.material_code ? `${asset.material.material_code} - ` : ""}
                  {asset.material?.material_name || "—"}
                </div>
              </Alert>
              <Alert>
                <div className="text-sm uppercase font-bold mb-2">Marca / Modelo</div>
                <div className="text-sm text-gray-600">
                  {asset.item_brand || "—"} {asset.item_model ? `• ${asset.item_model}` : ""}
                </div>
              </Alert>
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="lg:w-[380px] flex flex-col gap-4 lg:min-w-[380px] w-full">
            <Alert className="p-4">
              <div className="text-sm uppercase font-bold mb-2">Identificação</div>
              <div className="grid text-sm gap-1 text-gray-600">
                <div>
                  <span className="font-medium">Patrimônio:</span> {asset.asset_code}-{asset.asset_check_digit}
                </div>
                {asset.atm_number && asset.atm_number !== "None" && (
                  <div>
                    <span className="font-medium">ATM:</span> {asset.atm_number}
                  </div>
                )}
                {asset.serial_number && (
                  <div>
                    <span className="font-medium">Série:</span> {asset.serial_number}
                  </div>
                )}
              </div>
            </Alert>

            <div className="flex md:hidden gap-2">
              <Button onClick={handleEdit} variant="secondary" className="flex-1">
                <Pencil size={16} /> Editar
              </Button>
              <Button onClick={openDelete} variant="destructive" size="sm" disabled={deleting}>
  <Trash size={16} /> Excluir
</Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
  <DialogContent>
    <DialogHeader className="pt-8 px-6 flex flex-col items-center">
      <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
        <strong className="bg-red-500 text-white px-1 rounded">Deletar</strong> item {titulo}
      </DialogTitle>
      <DialogDescription className="text-zinc-500 text-center">
        Esta ação é irreversível. Ao deletar, todas as informações deste item no catálogo serão perdidas.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="py-4">
      <Button variant="ghost" onClick={closeDelete}>
        <ArrowUUpLeft size={16} /> Cancelar
      </Button>
      <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
        <Trash size={16} /> {deleting ? "Deletando…" : "Deletar"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </main>
  );
}

export default ItemPage;
