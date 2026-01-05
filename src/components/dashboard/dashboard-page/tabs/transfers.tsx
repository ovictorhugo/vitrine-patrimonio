import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { TransferCard } from "../components/transfer-card";

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
  }

  useEffect(() => {
    getCatalog();
  }, [urlGeral, user]);

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
