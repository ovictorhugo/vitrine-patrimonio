import {
  Badge,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock,
  User,
  UserCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../context/context";
import { Separator } from "../../../ui/separator";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Alert } from "../../../ui/alert";

type Unit = {
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
  id: string;
};
type Agency = {
  agency_name: string;
  agency_code: string;
  unit_id: string;
  id: string;
  unit: Unit;
};
type Sector = {
  agency_id: string;
  sector_name: string;
  sector_code: string;
  id: string;
  agency: Agency;
};
type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: string;
};

type LocationDTO = {
  legal_guardian_id: string;
  sector_id: string;
  location_name: string;
  location_code: string;
  id: string;
  sector: Sector;
  legal_guardian: LegalGuardian;
};

export function Emprestimos() {
  const { urlGeral } = useContext(UserContext);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const [emprestimos, setEmprestimos] = useState([]);

  async function getCatalog() {
    const res = await fetch(`${urlGeral}catalog/emprestimos/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();

    const catalogosComEmprestimos =
      json?.catalog_entries?.map((catalogo) => {
        const emprestimosFiltrados = catalogo.workflow_history
          ? catalogo.workflow_history.filter(
              (item) => item.workflow_status === "AUDIOVISUAL_EMPRESTIMO",
            )
          : [];
        return {
          ...catalogo,
          workflow_history: emprestimosFiltrados,
        };
      }) || [];

    console.log("Catálogos com histórico filtrado:", catalogosComEmprestimos);

    if (res.ok) {
      setEmprestimos(catalogosComEmprestimos);
    }
  }

  useEffect(() => {
    getCatalog();
  }, [urlGeral]);

  async function handleOpen(emp) {
    console.log(emp);
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item">
        <AccordionTrigger>
          <HeaderResultTypeHome
            title="Meus empreśtimos"
            icon={<CalendarCheck size={24} className="text-gray-400" />}
          />
        </AccordionTrigger>
        <AccordionContent>
          <Alert>
            {emprestimos?.map((catalog) => {
              const formatData = (isoString?: string) => {
                if (!isoString) return "Não informada";
                return new Date(isoString)
                  .toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .replace(",", " às");
              };

              return (
                <Alert className="flex flex-col h-fit rounded mb-4">
                  <div className="flex mb-1 p-4 pb-0">
                    <p className="font-semibold flex gap-3 items-center text-left flex-1">
                      {catalog.asset?.asset_code?.trim()} -{" "}
                      {catalog.asset?.asset_check_digit}
                    </p>
                  </div>

                  <div className="flex flex-col p-4 pt-0 justify-between">
                    <div>
                      <div className="text-lg font-bold">
                        {catalog.asset?.material?.material_name || "Sem nome"}
                      </div>
                      <p className="text-left uppercase">
                        {catalog.asset?.asset_description}
                      </p>
                    </div>
                  </div>

                  {/* 2. LISTA DE EMPRÉSTIMOS DESTE CATÁLOGO */}
                  <div className="pl-4 ml-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase">
                      Registros de Empréstimo (
                      {catalog.workflow_history?.length || 0})
                    </p>

                    {catalog.workflow_history?.map((emp, empIndex) => {
                      // Guardião legal específico deste passo de empréstimo
                      const loanGuardianName =
                        emp.detail?.legal_guardian?.legal_guardians_name;
                      const dataInicio = formatData(emp.detail?.inicio);
                      const dataFim = formatData(emp.detail?.fim);

                      return (
                        <>
                          <div
                            key={emp.id || empIndex}
                            className=""
                            onClick={() => handleOpen(emp)}
                          >
                            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/40 transition delay-150 duration-300 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700">
                              {/* Datas */}
                              <div className="flex items-center gap-6 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="size-4 text-muted-foreground" />
                                  <p className="text-sm font-semibold uppercase">
                                    Início:
                                  </p>
                                  <span className="text-sm text-gray-500 dark:text-gray-300">
                                    {dataInicio}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="size-4 text-muted-foreground" />
                                  <p className="text-sm font-semibold uppercase">
                                    Fim:
                                  </p>
                                  <span className="text-sm text-gray-500 dark:text-gray-300">
                                    {dataFim}
                                  </span>
                                </div>
                              </div>

                              {/* Guardião do Empréstimo */}
                              {!!loanGuardianName &&
                                loanGuardianName !== "None" && (
                                  <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 px-2 py-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
                                      <Avatar className="rounded-md h-5 w-5">
                                        <AvatarImage
                                          className="rounded-md h-5 w-5 object-cover"
                                          src={`${urlGeral}Researchercatalog/Image?name=${loanGuardianName}`}
                                        />
                                        <AvatarFallback className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                                          <User size={10} />
                                        </AvatarFallback>
                                      </Avatar>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                        {loanGuardianName}
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                </Alert>
              );
            })}
          </Alert>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
