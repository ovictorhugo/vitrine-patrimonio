import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { TransferCard } from "../components/transfer-card";
import { LoaderCircle } from "lucide-react";
import { useIsMobile } from "../../../../hooks/use-mobile";

type UUID = string;

type LegalGuardian = {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
};

type User = {
  id: UUID;
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
  institution_id: UUID;
  roles: Array<{
    id: UUID;
    name: string;
    description: string;
    permissions: Array<{
      id: UUID;
      name: string;
      code: string;
      description: string;
    }>;
  }>;
  system_identity?: { id: UUID; legal_guardian?: LegalGuardian };
};

export type TransferRequestItem = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: User;
  location: Location;
};

export function Transfers() {
  const { urlGeral, user } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<TransferRequestItem[]>([]);

  async function getCatalog() {
    const items = await fetch(
      `${urlGeral}catalog/?offset=0&limit=100&user_id=${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!items.ok) {
      throw new Error(`Falha ao carregar items (HTTP ${items.status}).`);
    }

    const res = await items.json();

    let catalogItems = res.catalog_entries;
    catalogItems = catalogItems.filter(
      (item) =>
        item.workflow_history?.some(
          (historico) => historico.workflow_status === "VITRINE"
        ) &&
        item.workflow_history?.some(
          (historico) => historico.detail?.transfer_requests.length > 0
        )
    );
    setItems(catalogItems);
    setLoading(false);
  }

  useEffect(() => {
    getCatalog();
  }, [urlGeral, user]);
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde."
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde."
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo."
        );
      }, 15000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco"
        );
      }, 15000)
    );

    return () => {
      // Limpa os timeouts ao desmontar ou quando isOpen mudar
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const isMobile = useIsMobile();

  if (loading) {
    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={54} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[400px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={108} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[500px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
  }
  return (
    <div className="p-8 pt-0 grid gap-8">
      {items.map((ci) => (
        <TransferCard
          catalog={ci}
          urlGeral={urlGeral}
          token={token}
          onChange={() => {}}
        />
      ))}
    </div>
  );
}
