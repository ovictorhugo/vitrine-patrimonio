import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { UserContext } from "./context";

/* ---------- Tipagens ---------- */
interface FavoriteId {
  id: string;
}

interface StarsContextValue {
  favorites: FavoriteId[];
  isLoading: boolean;
  fetchFavorites: () => Promise<void>;
  addStar: (entryId: string) => Promise<void>; // toggle só com o ID
}

/* ---------- Contexto ---------- */
const StarsContext = createContext<StarsContextValue | undefined>(undefined);

/* ---------- Provider ---------- */
interface StarsProviderProps {
  children: ReactNode;
}

export const FavoriteProvider: React.FC<StarsProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token");

  // Normaliza possíveis formatos de resposta
  const normalizeFavorites = (data: any): FavoriteId[] => {
    const pickIds = (arr: any[]): FavoriteId[] =>
      arr
        .filter((x) => x && typeof x.id === "string")
        .map((x) => ({ id: x.id as string }));

    if (Array.isArray(data)) return pickIds(data);
    if (data && Array.isArray(data.favorites)) return pickIds(data.favorites);
    return [];
  };

  /* --- GET /favorites --- */
  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${urlGeral}favorites/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        setFavorites(normalizeFavorites(res.data));
      }
    } catch (err) {
      console.error("Erro ao buscar favoritos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, urlGeral]);

  /* --- TOGGLE favorito (atualiza lista local sem refetch) --- */
  const toggleFavorite = useCallback(
    async (entryId: string) => {
      const alreadyExists = favorites.some((f) => f.id === entryId);

      if (alreadyExists) {
        // DELETE /favorites/{catalog_id}
        try {
          const res = await axios.delete(`${urlGeral}favorites/${entryId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.status === 200 || res.status === 204) {
            // Remove localmente sem chamar fetchFavorites
            setFavorites((prev) => prev.filter((f) => f.id !== entryId));
            toast.info("Removido dos favoritos");
          }
        } catch (err) {
          console.error("Erro ao remover favorito:", err);
          toast.error("Erro ao remover dos favoritos");
        }
      } else {
        // POST /favorites/{catalog_id}  (sem body)
        try {
          const res = await axios.post(`${urlGeral}favorites/${entryId}`, null, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.status === 201 || res.status === 200) {
            // Adiciona localmente sem chamar fetchFavorites
            setFavorites((prev) => {
              // evita duplicado caso dois cliques rápidos
              if (prev.some((f) => f.id === entryId)) return prev;
              return [...prev, { id: entryId }];
            });
            toast.success("Adicionado aos favoritos");
          }
        } catch (err) {
          console.error("Erro ao adicionar favorito:", err);
          toast.error("Erro ao adicionar aos favoritos");
        }
      }
    },
    [favorites, token, urlGeral]
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <StarsContext.Provider
      value={{
        favorites,
        isLoading,
        fetchFavorites,
        addStar: toggleFavorite,
      }}
    >
      {children}
    </StarsContext.Provider>
  );
};

/* ---------- Hook de consumo ---------- */
export const useStars = (): StarsContextValue => {
  const ctx = useContext(StarsContext);
  if (!ctx)
    throw new Error("useStars must be used within a FavoriteProvider.");
  return ctx;
};
