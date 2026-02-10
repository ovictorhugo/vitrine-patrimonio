import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { TransferCard } from "../components/transfer-card";
import { ArrowLeftRight, LoaderCircle, Square, SquarePen } from "lucide-react";
import { useIsMobile } from "../../../../hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { setDoc } from "firebase/firestore";
import DocumentCard from "../components/document-card";
import { Alert } from "../../../ui/alert";
import { Separator } from "../../../ui/separator";
import { CatalogDTO } from "../../collection/collection-page";

type UUID = string;

type LocationDTO = {
  id: UUID;
  location_name: string;
  location_code: string;
};

export interface UserDTO {
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
}

export interface WorkflowTransferRequestDTO {
  id: UUID;
  status: string; // "PENDING" | "DECLINED" | "ACCEPTABLE" | ...
  user: UserDTO;
  location: LocationDTO;
}

export type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: Record<string, any> | undefined;
  id: UUID;
  user: {
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
  };
  catalog_id: UUID;
  created_at: string;
  transfer_requests: WorkflowTransferRequestDTO[];
};

export type SignerEntry = {
  user: UUID;
  document: UUID;
  isSigned: boolean;
  signedAt: Date;
  token: string;
};

export type DocumentEntry = {
  id: UUID;
  status: "PENDING" | "APPROVED" | "REJECTED";
  catalog: CatalogDTO;
  file_path: string;
  signers: SignerEntry[];
};

export function Transfers() {
  const { urlGeral, user } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<CatalogDTO[]>([]);
  const [itemsDone, setItemsDone] = useState<DocumentEntry[]>([]);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);

  async function getCatalog() {
    if (!user) return;
    const items = await fetch(
      `${urlGeral}catalog/?offset=0&limit=100&user_id=${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!items.ok) {
      throw new Error(`Falha ao carregar items (HTTP ${items.status}).`);
    }

    const res = await items.json();

    let catalogItems = res.catalog_entries;
    catalogItems = catalogItems.filter(
      (item) =>
        item.workflow_history?.some(
          (historico) => historico.workflow_status === "VITRINE",
        ) &&
        item.workflow_history?.some(
          (historico) => historico.detail?.transfer_requests.length > 0,
        ),
    );
    setItems(catalogItems);
  }

  async function getDocuments() {
    try {
      if (!user) return;
      const items = await fetch(`${urlGeral}transfers/pending/${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!items.ok) {
        throw new Error(`Falha ao carregar items (HTTP ${items.status}).`);
      }
      const res = await items.json();
      const documents = res.pending;
      setDocuments(documents);
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
    try {
      if (!user) return;
      const items = await fetch(`${urlGeral}transfers/completed/${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!items.ok) {
        throw new Error(`Falha ao carregar items (HTTP ${items.status}).`);
      }
      const res = await items.json();
      const documents = res.pending;
      setItemsDone(documents);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    getCatalog();
    getDocuments();
  }, [urlGeral, user]);
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo.",
        );
      }, 15000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco",
        );
      }, 15000),
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
    <div className="flex flex-col p-8 pt-0">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-8">
            <HeaderResultTypeHome
              title="Assinaturas pendentes"
              icon={<SquarePen size={24} className="text-gray-400" />}
            />
          </AccordionTrigger>

          <AccordionContent className="">
            <div className="p-8 flex">
              <div className={`w-2 min-w-2 bg-eng-blue rounded-l-md `} />
              {documents.length > 0 ? (
                <Alert className="rounded-l-none">
                  <h1 className="text-2xl font-bold">Pendentes</h1>
                  <div className="grid flex-1">
                    {documents.map((ci, index) => (
                      <div key={index}>
                        <DocumentCard catalog_id={ci.catalog.id} data={ci} />
                        {index < items.length ? (
                          <Separator className="my-3" />
                        ) : (
                          <></>
                        )}
                      </div>
                    ))}
                  </div>
                </Alert>
              ) : (
                <Alert className="rounded-l-none">
                  <h1 className="text-2xl font-bold">
                    Nenhuma assinatura pendente
                  </h1>
                </Alert>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-8">
            <HeaderResultTypeHome
              title="Assinaturas realizadas"
              icon={<ArrowLeftRight size={24} className="text-gray-400" />}
            />
          </AccordionTrigger>

          <AccordionContent className="">
            <div className="p-8 flex">
              <div className={`w-2 min-w-2 bg-eng-blue rounded-l-md `} />
              {itemsDone.length > 0 ? (
                <Alert className="rounded-l-none">
                  <h1 className="text-2xl font-bold">Concluídos</h1>
                  <div className="grid flex-1">
                    {itemsDone.map((ci, index) => (
                      <div key={index}>
                        <DocumentCard catalog_id={ci.catalog.id} data={ci} />
                        {index < items.length ? (
                          <Separator className="my-3" />
                        ) : (
                          <></>
                        )}
                      </div>
                    ))}
                  </div>
                </Alert>
              ) : (
                <Alert className="rounded-l-none">
                  <h1 className="text-2xl font-bold">
                    Nenhum documento concluído
                  </h1>
                </Alert>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-8">
            <HeaderResultTypeHome
              title="Transferências pendentes"
              icon={<ArrowLeftRight size={24} className="text-gray-400" />}
            />
          </AccordionTrigger>

          <AccordionContent className="">
            <div className="p-8 flex">
              <div className={`w-2 min-w-2 bg-eng-blue rounded-l-md `} />
              {items.length > 0 ? (
                <>
                  {items.map((ci) => (
                    <TransferCard
                      catalog={ci}
                      urlGeral={urlGeral}
                      token={token}
                      onChange={() => {}}
                    />
                  ))}{" "}
                </>
              ) : (
                <Alert className="rounded-l-none">
                  <h1 className="text-2xl font-bold">
                    Nenhuma transferência pendente
                  </h1>
                </Alert>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
