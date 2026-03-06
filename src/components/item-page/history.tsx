import { useContext } from "react";
import { UserContext } from "../../context/context";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"; // Assumindo o caminho do seu Avatar
import { cn } from "../../lib";

type UUID = string;

export interface LoanableItemDTO {
  id: UUID;
  catalog_id: UUID;
  legal_guardian_id: UUID;
  owner_notes: string | null;
  catalog: CatalogResponseDTO;
  legal_guardian: UserDTO;
  loans: LoanDTO[];
}

export interface CatalogResponseDTO {
  id: UUID;
  created_at: string;
  situation: string;
  conservation_status: string;
  description: string;
  asset: AssetDTO;
  files: any[] | null;
  user: UserDTO;
  location: LocationDTO;
  images: CatalogImageDTO[];
  workflow_history: any[];
}

interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}

export interface LoanDTO {
  id: UUID;
  loanable_item_id: UUID;
  requester_id: UUID | null;
  temporary_guardian_id: UUID;

  start_at: string; // ISO Date
  end_at: string | null;
  returned_at: string | null;

  is_confirmed: boolean;
  is_executed: boolean;
  is_returned: boolean;
  is_maintenance: boolean;

  lend_detail: string | null;
  returned_detail: string | null;
  rejection_reason: string | null;

  requester?: UserDTO;
  temporary_guardian?: UserDTO;
}

export interface UserDTO {
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
  is_official: boolean;
  material: MaterialDTO;
  legal_guardian: LegalGuardianDTO;
  location: LocationDTO;
}
interface LocationDTO {
  legal_guardian_id: UUID;
  sector_id: UUID;
  location_name: string;
  location_code: string;
  id: UUID;
  sector: {
    agency_id: UUID;
    sector_name: string;
    sector_code: string;
    id: UUID;
    agency: {
      agency_name: string;
      agency_code: string;
      unit_id: UUID;
      id: UUID;
      unit: {
        unit_name: string;
        unit_code: string;
        unit_siaf: string;
        id: UUID;
      };
    };
  };
  legal_guardian: LegalGuardianDTO;
}

interface HistoryTabProps {
  item: LoanableItemDTO | undefined;
}

export default function HistoryTab({ item }: HistoryTabProps) {
  const { urlGeral } = useContext(UserContext);

  const loans = item?.loans || [];

  // Função auxiliar para formatar datas (estilo 20/05/2024)
  const formatData = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const isAtrasado = (loan: LoanDTO) => {
    if (loan.is_returned || !loan.end_at) return false;
    return new Date(loan.end_at) < new Date();
  };

  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="pl-4 ml-4 flex flex-col gap-3">
        {loans.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            Nenhum registro de empréstimo encontrado para este item.
          </div>
        ) : (
          [...loans].reverse().map((loan, idx) => {
            const requesterName = loan.requester?.username || "N/A";
            const guardianName = loan.temporary_guardian?.username || "N/A";
            const atrasado = isAtrasado(loan);

            // Definição da cor da barra lateral
            const statusColor = loan.is_maintenance
              ? "bg-amber-500"
              : atrasado
                ? "bg-red-500"
                : loan.is_returned
                  ? "bg-green-500"
                  : "bg-eng-blue";

            return (
              <div key={loan.id || idx} className="flex mb-3">
                {/* Barra Lateral Colorida */}
                <div
                  className={cn(
                    "w-2 min-w-2 rounded-l-md border border-neutral-200 border-r-0 dark:border-neutral-800",
                    statusColor,
                  )}
                />

                {/* Card Alert */}
                <div className="flex flex-col flex-1 h-fit bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-r-md p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  {/* Cabeçalho de Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {loan.is_maintenance ? (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          <Wrench size={12} /> Manutenção
                        </div>
                      ) : !loan.is_executed && !loan.is_returned ? (
                        <div className="flex items-center gap-1.5 text-white bg-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Pedido
                        </div>
                      ) : null}

                      {atrasado && (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">
                          <AlertCircle size={12} /> Atrasado
                        </div>
                      )}

                      {loan.is_returned ? (
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          <CheckCircle2 size={12} /> Devolvido
                        </div>
                      ) : (
                        loan.is_executed &&
                        !atrasado && (
                          <div className="flex items-center gap-1.5 text-eng-blue bg-eng-blue/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            <Timer size={12} /> Emprestado
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="flex items-center gap-6 flex-wrap mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <p className="text-sm font-semibold uppercase">Início:</p>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {formatData(loan.start_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <p className="text-sm font-semibold uppercase">
                        Prev. Fim:
                      </p>
                      <span
                        className={cn(
                          "text-sm text-gray-500 dark:text-gray-300",
                          atrasado && "text-red-600 font-bold",
                        )}
                      >
                        {formatData(loan.end_at)}
                      </span>
                    </div>

                    {loan.returned_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-500" />
                        <p className="text-sm font-semibold uppercase">
                          Retorno:
                        </p>
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {formatData(loan.returned_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Envolvidos */}
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                        Solicitante
                      </p>
                      <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
                        <Avatar className="rounded-md h-5 w-5">
                          <AvatarImage
                            className="rounded-md h-5 w-5 object-cover"
                            src={`${urlGeral}Researchercatalog/Image?name=${requesterName}`}
                          />
                          <AvatarFallback className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                            <User size={10} />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {requesterName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                        Guardião Temporário
                      </p>
                      <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
                        <Avatar className="rounded-md h-5 w-5">
                          <AvatarImage
                            className="rounded-md h-5 w-5 object-cover"
                            src={`${urlGeral}Researchercatalog/Image?name=${guardianName}`}
                          />
                          <AvatarFallback className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                            <User size={10} />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {guardianName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Empréstimo */}
                  {(loan.lend_detail || loan.rejection_reason) && (
                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      {loan.lend_detail && (
                        <p className="text-xs text-muted-foreground italic">
                          " {loan.lend_detail} "
                        </p>
                      )}
                      {loan.rejection_reason && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          Motivo Rejeição: {loan.rejection_reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
