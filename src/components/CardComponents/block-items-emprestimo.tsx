import {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { UserContext } from "../../context/context";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ItemPatrimonio } from "../homepage/components/item-patrimonio";
import { Skeleton } from "../ui/skeleton";
import { CatalogEntry } from "../dashboard/itens-vitrine/card-item-dropdown";
import { LoanableItemDTO } from "../dashboard/audiovisual/audiovisual";

/* ===== Resposta da API ===== */
export interface LoanResponse {
  loanable_items: LoanableItemDTO[];
}

/* ===== Props ===== */
interface Props {
  workflow: string[];
  materialIdFilter?: string;
  assetFilter?: string;
}

const first = (v: string | null) =>
  v ? (v.split(";").filter(Boolean)[0] ?? "") : "";
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");

const getPluralOrSingular = (
  sp: URLSearchParams,
  pluralKey: string,
  singularKey: string,
) => sp.get(pluralKey) ?? sp.get(singularKey);

const firstFromPluralOrSingular = (
  sp: URLSearchParams,
  pluralKey: string,
  singularKey: string,
) => first(getPluralOrSingular(sp, pluralKey, singularKey));

export function BlockItemsEmprestimo(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const navigate = useNavigate();
  const location = useLocation();
  const sp = new URLSearchParams(location.search);

  // ===== Lê PLURAL OU SINGULAR na URL =====
  const offset = Number(sp.get("offset") || "0");
  const limit = Number(sp.get("limit") || "10");
  const initialFetchDone = useRef(false);

  const [items, setItems] = useState<LoanableItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseHeaders: HeadersInit = useMemo(() => {
    const token = localStorage.getItem("jwt_token") || "";
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  // ===== Atualiza URL (mantendo PLURAL do modal) e scroll =====

  const handleNavigate = (newOffset: number, newLimit: number) => {
    const currentSp = new URLSearchParams(location.search);
    currentSp.set("offset", newOffset.toString());
    currentSp.set("limit", newLimit.toString());
    navigate({ pathname: location.pathname, search: currentSp.toString() });
  };

  useEffect(() => {
    const controller = new AbortController();
    const sp = new URLSearchParams(location.search);

    const currentQ = sp.get("q") || "";
    const currentOffset = sp.get("offset") || "0";
    const currentLimit = sp.get("limit") || "10";

    const currentMaterialId = firstFromPluralOrSingular(
      sp,
      "material_ids",
      "material_id",
    );

    const runFetch = async (overrideLimit?: string, isSilent = false) => {
      try {
        // Só mostra Skeleton se NÃO for uma busca silenciosa
        if (!isSilent) {
          setLoading(true);
          setError(null);
        }

        const workflowsToFetch = Array.isArray(props.workflow)
          ? props.workflow
          : props.workflow
            ? [props.workflow]
            : [null];

        const requests = workflowsToFetch.map(async (wfStatus) => {
          const url = new URL(`${baseUrl}/loans/cards`);

          url.searchParams.set("is_visible", "true");

          if (wfStatus) url.searchParams.set("workflow_status", wfStatus);

          if (currentQ) url.searchParams.set("q", currentQ);
          if (currentMaterialId)
            url.searchParams.set("material_id", currentMaterialId);

          url.searchParams.set("offset", currentOffset);
          url.searchParams.set("limit", overrideLimit || currentLimit);

          const res = await fetch(url.toString(), {
            method: "GET",
            signal: controller.signal,
            headers: baseHeaders,
          });

          if (!res.ok)
            throw new Error(`Erro ao buscar catálogo (${res.status})`);
          return res.json() as Promise<LoanResponse>;
        });

        const responses = await Promise.all(requests);
        let combinedItems = responses.flatMap((data) =>
          Array.isArray(data.loanable_items) ? data.loanable_items : [],
        );

        setItems(combinedItems);
        if (!isSilent) setLoading(false);

        if (overrideLimit === "5" && currentOffset === "0") {
          runFetch(currentLimit, true); // true = isSilent
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Erro inesperado ao carregar itens.");
          setItems([]);
          if (!isSilent) setLoading(false);
        }
      }
    };

    // ✅ REGRA DE DISPARO: É a primeira vez abrindo a tela? Busca 4. Senão, busca normal.
    if (!initialFetchDone.current && currentOffset === "0") {
      initialFetchDone.current = true;
      runFetch("5", false);
    } else {
      runFetch(undefined, false);
    }

    return () => controller.abort();
  }, [location.search, baseUrl, baseHeaders, props.workflow]);

  const skeletons = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md aspect-square" />
      )),
    [],
  );

  return (
    <div>
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {skeletons.map((item, index) => (
            <div className="w-full" key={index}>
              {item}
            </div>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <div>
          <p className="items-center justify-center w-full flex text-center pt-6">
            Nenhum item encontrado na busca
          </p>
          {error && (
            <p className="items-center justify-center w-full flex text-center pt-2 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {items.map((item: LoanableItemDTO) => (
            <ItemPatrimonio key={item.id} {...item.catalog} />
          ))}
        </div>
      )}

      {/* Controle "itens por página" */}
      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            const newLimit = parseInt(value);
            handleNavigate(0, newLimit);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Itens" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 80, 160].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
