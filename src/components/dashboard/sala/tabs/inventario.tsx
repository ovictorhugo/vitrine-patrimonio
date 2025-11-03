import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../../../context/context";
import { useModal } from "../../../hooks/use-modal-store";
import { Button } from "../../../ui/button";
import { Alert } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { Skeleton } from "../../../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Separator } from "../../../ui/separator";
import { Plus, ChevronLeft, User as UserIcon, X } from "lucide-react";
import { toast } from "sonner";
import { PatrimonioItem } from "../components/patrimonio-item-inventario";
import { AssetDTO } from "../../collection/collection-page";

/* ===========================
   Types locais (conforme spec)
   =========================== */

type Permission = {
  id: string;
  name: string;
  code: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
};

type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: string;
};

type SystemIdentity = {
  id: string;
  legal_guardian: LegalGuardian;
};

type CreatedBy = {
  id: string;
  username: string;
  email: string;
  provider: string;
  linkedin: string;
  lattes_id: string;
  orcid: string;
  ramal: string;
  photo_url: string;
  background_url: string;
  matricula: string;
  verify: boolean;
  institution_id: string;
  roles: Role[];
  system_identity: SystemIdentity;
};

type InventoryCore = {
  key: string;
  avaliable: boolean; // conforme payload recebido
  id: string;
  created_at: string;
  created_by: CreatedBy;
};

// resposta do GET /inventories/
type InventoriesResponse = {
  inventories: InventoryCore[];
};

// Asset mínimo usado na UI (ajuste se precisar de mais campos)


// resposta do GET /inventories/:id/assets
type InventoryAssetsResponse = {
  assets: AssetDTO[];
};

/* ===========================
   Componente
   =========================== */

export function Inventario() {
  const { urlGeral } = useContext(UserContext);
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  const { data, onOpen, type, isOpen, resetData } = useModal();

  const [inventories, setInventories] = useState<InventoryCore[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [expandedInventoryId, setExpandedInventoryId] = useState<string | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetsByInventory, setAssetsByInventory] = useState<Record<string, AssetDTO[]>>({});
  const [addedByInventory, setAddedByInventory] = useState<Record<string, AssetDTO[]>>({}); // itens adicionados manualmente
  const [visibleCount, setVisibleCount] = useState(30);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const baseUrl = useMemo(() => String(urlGeral || "").replace(/\/+$/, ""), [urlGeral]);

  /* ===========
     Fetch list
     =========== */
  const fetchInventories = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${baseUrl}/inventories/`, { headers });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Falha ao carregar inventários (HTTP ${res.status}).`);
      }
      const js: InventoriesResponse = await res.json();
      setInventories(Array.isArray(js?.inventories) ? js.inventories : []);
    } catch (e: any) {
      toast("Erro ao carregar inventários", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setLoadingList(false);
    }
  }, [baseUrl, headers]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  /* ==========================
     Fetch assets (por inventário)
     ========================== */
  const fetchInventoryAssets = useCallback(
    async (inventoryId: string) => {
      const url = `${baseUrl}/inventories/${encodeURIComponent(inventoryId)}/assets`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Falha ao buscar patrimônios do inventário.");
      }
      const js: InventoryAssetsResponse = await res.json();
      return (js.assets || []).filter(
        (a) => !["BX", "NI"].includes(String(a.asset_status || "").toUpperCase())
      );
    },
    [baseUrl, headers]
  );

  // ao expandir, se ainda não tiver cache, busca
  useEffect(() => {
    (async () => {
      if (!expandedInventoryId) return;
      if (assetsByInventory[expandedInventoryId]) return;
      try {
        setLoadingAssets(true);
        const assets = await fetchInventoryAssets(expandedInventoryId);
        setAssetsByInventory((prev) => ({ ...prev, [expandedInventoryId]: assets }));
      } catch (e) {
        console.error(e);
        toast("Erro ao carregar patrimônios", {
          description: "Tente novamente mais tarde.",
          action: { label: "Fechar", onClick: () => {} },
        });
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, [expandedInventoryId, assetsByInventory, fetchInventoryAssets]);

  /* ==========================
     Adição via modal (mínimo)
     ========================== */
  const lastPickedRef = useRef<string>("");

  // busca avulsa para adicionar item por código/ATM
  const fetchAssetsByParams = useCallback(
    async (params: { asset_identifier?: string; atm_number?: string }) => {
      const q = new URLSearchParams();
      if (params.asset_identifier) q.set("asset_identifier", params.asset_identifier);
      if (params.atm_number) q.set("atm_number", params.atm_number);
      const url = `${baseUrl}/assets/?${q.toString()}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Falha ao buscar patrimônio pelo identificador.");
      const js: { assets: AssetDTO[] } = await res.json();
      return (js.assets || []).filter(
        (a) => !["BX", "NI"].includes(String(a.asset_status || "").toUpperCase())
      );
    },
    [baseUrl, headers]
  );

  useEffect(() => {
    if (!expandedInventoryId || !isOpen || type !== "search-patrimonio") return;

    const asset_code = String((data as any)?.asset_code || "");
    const asset_check_digit = String((data as any)?.asset_check_digit || "");
    const atm_number = String((data as any)?.atm_number || "");

    const key = atm_number
      ? `atm:${atm_number}`
      : asset_code
      ? `cod:${asset_code}-${asset_check_digit || ""}`
      : "";

    if (!key || key === lastPickedRef.current) return;

    (async () => {
      try {
        const params =
          key.startsWith("atm:")
            ? { atm_number }
            : {
                asset_identifier: asset_check_digit
                  ? `${asset_code}-${asset_check_digit}`
                  : asset_code,
              };

        const found = await fetchAssetsByParams(params);
        if (found.length === 0) {
          toast("Nenhum patrimônio encontrado", {
            description: "Verifique o código/ATM informado.",
            action: { label: "Fechar", onClick: () => {} },
          });
          lastPickedRef.current = key;
          return;
        }

        const candidate = found[0];

        setAddedByInventory((prev) => {
          const list = prev[expandedInventoryId] || [];
          const base = assetsByInventory[expandedInventoryId] || [];
          const alreadyInBase = base.some((a) => a.id === candidate.id);
          const alreadyAdded = list.some((a) => a.id === candidate.id);
          if (alreadyInBase || alreadyAdded) return prev;
          return { ...prev, [expandedInventoryId]: [candidate, ...list] };
        });

        toast("Patrimônio adicionado ao inventário", {
          description: `${candidate.asset_code || ""}${
            candidate.asset_check_digit ? "-" + candidate.asset_check_digit : ""
          }`,
          action: { label: "Fechar", onClick: () => {} },
        });
        resetData();
      } catch (e) {
        console.error(e);
        toast("Erro ao adicionar patrimônio", {
          description: "Tente novamente.",
          action: { label: "Fechar", onClick: () => {} },
        });
      } finally {
        lastPickedRef.current = key;
      }
    })();
  }, [data, isOpen, type, expandedInventoryId, assetsByInventory, fetchAssetsByParams, resetData]);

  /* ============
     Utilitários
     ============ */
  const formatDateTimeBR = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "short",
      }).format(d);
    } catch {
      return iso || "";
    }
  };

  const showMore = () => setVisibleCount((v) => v + 30);

  const handleRemoveAdded = useCallback((invId: string, assetId: string) => {
    setAddedByInventory((prev) => ({
      ...prev,
      [invId]: (prev[invId] || []).filter((a) => a.id !== assetId),
    }));
  }, []);

  /* =======
     Render
     ======= */
  const isLoadingSkeleton = loadingList || (expandedInventoryId && loadingAssets);

  return (
    <div className="flex flex-col gap-4 p-8 pt-0">
      <div className="h-[72px] flex items-center">
        <HeaderResultTypeHome
          title={expandedInventoryId ? "Inventário" : "Inventários"}
          icon={<ChevronLeft size={24} className="text-gray-400" />}
        />
      </div>

      {isLoadingSkeleton && (
        <div className="flex gap-4 flex-col">
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
        </div>
      )}

      {!isLoadingSkeleton && !expandedInventoryId && inventories.length === 0 && (
        <Alert className="text-sm">Nenhum inventário encontrado.</Alert>
      )}

      {/* Lista de inventários */}
      {!expandedInventoryId && inventories.length > 0 && (
        <div className="grid gap-4">
          {inventories.map((inv) => (
            <div key={inv.id} className="relative group flex">
              <div className="w-2 min-w-2 rounded-l-md border dark:border-neutral-800 bg-eng-blue" />
              <Alert
                className="rounded-l-none border-l-0 w-full cursor-pointer hover:shadow-sm transition"
                onClick={() => {
                  setExpandedInventoryId(inv.id);
                  setVisibleCount(30);
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-medium text-lg truncate">{inv.key}</span>
                  <Badge variant={inv.avaliable ? "default" : "outline"}>
                    {inv.avaliable ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Criado por:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Avatar className="rounded-md h-5 w-5 shrink-0">
                        {/* use sua rota real de ícone, se houver */}
                        <AvatarImage
                          className="rounded-md h-5 w-5"
                          src={inv.created_by?.photo_url || ""}
                        />
                        <AvatarFallback className="flex items-center justify-center">
                          <UserIcon size={10} />
                        </AvatarFallback>
                      </Avatar>
                      {inv.created_by?.username || "—"}
                    </span>
                  </div>

                  {inv.created_at && (
                    <div className="flex items-center gap-2">
                      Início: {formatDateTimeBR(inv.created_at)}
                    </div>
                  )}
                </div>
              </Alert>
            </div>
          ))}
        </div>
      )}

      {/* Inventário expandido */}
      {expandedInventoryId && (
        (() => {
          const inv = inventories.find((x) => x.id === expandedInventoryId);
          if (!inv) return null;

          const base = assetsByInventory[inv.id] || [];
          const baseIds = new Set(base.map((a) => a.id));
          const added = (addedByInventory[inv.id] || []).filter((a) => !baseIds.has(a.id));
          const combined = [...base, ...added];

          return (
            <div className="m-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{inv.key}</h2>
                  <Badge variant="outline">{combined.length}</Badge>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setExpandedInventoryId(null)}>
                    <ChevronLeft size={16} />
                    Voltar
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="mt-4 grid gap-4">
                <Alert
                  onClick={() => onOpen("search-patrimonio", {})}
                  className="flex cursor-pointer items-center gap-4 bg-transparent transition-all hover:bg-neutral-100 dark:bg-transparent dark:hover:bg-neutral-800"
                >
                  <div className="bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-md p-4 border ">
                    <Plus size={20} />
                  </div>
                  <p className="font-medium">Adicionar patrimônio</p>
                </Alert>

                {combined.slice(0, visibleCount).map((asset) => {
                  const isAdded = (addedByInventory[inv.id] || []).some((a) => a.id === asset.id);

                  return (
                    <div key={`${inv.id}:${asset.id}`} className="relative">
                      {isAdded && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute -top-2 -right-2 h-7 w-7"
                          onClick={() => handleRemoveAdded(inv.id, asset.id)}
                          title="Remover item adicionado"
                        >
                          <X size={16} />
                        </Button>
                      )}

                      {/* PatrimonioItem simplificado: só exibe. 
                         Se preferir, troque por um card leve inline */}
                      <PatrimonioItem
                        invId={inv.id}
                        asset={asset}
                        isLocked={false}
                        sel={""}
                        comm={""}
                        onStatusChange={() => {}}
                        onCommentChange={() => {}}
                      />
                    </div>
                  );
                })}
              </div>

              {combined.length > visibleCount && (
                <div className="flex justify-center mt-8">
                  <Button className="w-full" onClick={showMore}>
                    <Plus size={16} /> Mostrar mais
                  </Button>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
