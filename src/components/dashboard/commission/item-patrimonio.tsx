import { useContext, useMemo } from "react";
import { Pencil, Repeat, Trash } from "lucide-react";
import { UserContext } from "../../../context/context";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

/* ===== Tipos (iguais ao Block) ===== */
interface Unit { id: string; unit_name: string; unit_code: string; unit_siaf: string; }
interface Agency { id: string; agency_name: string; agency_code: string; unit_id: string; unit: Unit; }
interface Sector { id: string; sector_name: string; sector_code: string; agency_id: string; agency: Agency; }
interface Location { id: string; location_name: string; location_code: string; sector_id: string; sector: Sector; }
interface Material { id: string; material_name: string; material_code: string; }
interface LegalGuardian { id: string; legal_guardians_name: string; legal_guardians_code: string; }
interface Asset {
  id: string;
  asset_code: string;
  asset_check_digit: string;
  atm_number: string | null;
  serial_number: string | null;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string | null;
  item_model: string | null;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  is_official: boolean;
  material?: Material;
  legal_guardian?: LegalGuardian;
  location?: Location;
}
interface User {
  id: string; username: string; email: string; provider: string;
  linkedin: string | null; lattes_id: string | null; orcid: string | null; ramal: string | null;
  photo_url: string | null; background_url: string | null; matricula: string | null;
  verify: boolean; institution_id: string;
}
interface Image { id: string; catalog_id: string; file_path: string; }
interface WorkflowHistory {
  id: string; workflow_status: string; catalog_id: string; user_id: string;
  detail: { message: string };
}
interface CatalogEntry {
  id: string;
  situation: string;
  conservation_status: string;
  description: string;
  asset: Asset;
  user: User;
  location: Location;
  images: Image[];
  workflow_history: WorkflowHistory[];
  created_at?: string;
}

/** Props: recebe progress do arraste (−1..1) para overlay, e as ações do pai */
type Props = CatalogEntry & {
  progress?: number;               // -1 (esq) .. 1 (dir)
  onPromptDelete: () => void;      // abre diálogo de deletar no pai
  onPromptMove: () => void;        // abre diálogo de movimentar no pai
};

export function ItemPatrimonioTinder(props: Props) {
  const { urlGeral, user } = useContext(UserContext);

  const firstImageUrl = useMemo(() => {
    const p = props.images?.[0]?.file_path || "";
    const clean = p.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${clean}`;
  }, [props.images, urlGeral]);

  const title =
    props.asset?.material?.material_name ??
    props.asset?.asset_description ??
    "Item";

  const code = props.asset?.asset_code ?? "";
  const dgv  = props.asset?.asset_check_digit ?? "";
  const showOwnerActions = props.user?.id === user?.id;

  // Overlay “MOVER” (fica mais intenso conforme o arraste)
  const p = Math.max(-1, Math.min(1, props.progress ?? 0));
  const side = p < 0 ? "left" : "right";
  const opacity = Math.min(Math.abs(p), 1);

  

  return (
    <div
      className="relative w-full h-[520px] rounded-xl overflow-hidden border bg-background"
      onClick={() => window.open(`/item?id=${props.id}`, "_blank")}
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${firstImageUrl})` }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40 pointer-events-none" />

      {/* OVERLAY TINDER “MOVER” */}
      <div
        className={`absolute top-6 ${side === "left" ? "left-6 -rotate-12" : "right-6 rotate-12"} 
                    border-2 rounded-md px-3 py-1 select-none`}
        style={{
          opacity,
          borderColor: "rgb(16 185 129)",  // emerald-500
          color: "rgb(16 185 129)",
          background: "rgba(16,185,129,0.08)",
        }}
      >
        MOVER
      </div>

      {/* AÇÕES (editar/mover/deletar) */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {showOwnerActions && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/dashboard/editar-item?id=${props.id}`, "_blank");
              }}
            >
              <Pencil size={16} />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                props.onPromptMove();
              }}
            >
              <Repeat size={16} />
            </Button>

            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                props.onPromptDelete();
              }}
            >
              <Trash size={16} />
            </Button>
          </>
        )}
      </div>

      {/* FOOTER: título + código */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-white text-xl font-semibold drop-shadow-sm">
              {title}
            </h3>
            <p className="text-white/80 text-sm">
              {code}{dgv ? ` - ${dgv}` : ""}
            </p>
          </div>
          {!!props.created_at && (
            <Badge className="bg-white/90 text-black hover:bg-white">
              {new Date(props.created_at).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
