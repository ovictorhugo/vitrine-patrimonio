import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FileXls } from "phosphor-react";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonioMorto } from "./components/tabela-patrimonios-morto";
import { Input } from "../ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { TooltipProvider } from "../ui/tooltip";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
import { ItensListVitrine } from "./components/itens-list-vitrine";
import { DisplayItemPatrimonio } from "./components/display-item-patrimonio";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { DisplayItemEmpenho } from "./components/display-item-empenho";
import { Link } from "react-router-dom";

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from "./components/columns-dnd";

interface Patrimonio {
  bem_cod:string
  bem_dgv:string
  bem_num_atm:string
  csv_cod:string
  bem_serie:string
  bem_sta:string
  bem_val:string
  tre_cod:string
  bem_dsc_com:string
  uge_cod:string
  uge_nom:string
  org_cod:string
  uge_siaf:string
  org_nom:string
  set_cod:string
  set_nom:string
  loc_cod:string
  loc_nom:string
  ite_mar:string
  ite_mod:string
  tgr_cod:string
  grp_cod:string
  ele_cod:string
  sbe_cod:string
  mat_cod:string
  mat_nom:string
  pes_cod:string
  pes_nome:string
}

export function Empenhos() {
  const { isOpen, type} = useModalDashboard();
  const {user, urlGeral, defaultLayout} = useContext(UserContext)
  const {onOpen} = useModal();


  const isModalOpen = isOpen && type === 'empenhos';

  const [total, setTotal] = useState<Patrimonio | null>(null);

  // Função para lidar com a atualização de researcherData
  const handleResearcherUpdate = (newResearcherData: Patrimonio) => {
      setTotal(newResearcherData);
    };

    console.log(total)
    const [search, setSearch] = useState('')


    const [columns, setColumns] = useState([
        { id: 1, title: 'Recebidos', items: ['Item 1', 'Item 2'] },
        { id: 2, title: 'Tombamento', items: [] },
        { id: 3, title: 'Projetos', items: [] },
        { id: 4, title: 'Agendamento', items: [] },
        { id: 5, title: 'Concluídos', items: [] },
 
      ]);

  return(
      <>
      {isModalOpen && (
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
<div className="  gap-4">
            <div className="flex items-center gap-4">
           <Link to={'/'}>
           <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Empenhos
              </h1>
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Gerar relatório
                </Button>
                <Button onClick={() => onOpen('adicionar-empenho')} size="sm"><Plus size={16}/>Adicionar empenho</Button>
              </div>
            </div>

            </div>

            <div className="h-full elementBarra w-full flex gap-3 overflow-x-auto md:max-w-[calc(100vw-115px)] max-w-[calc(100vw-83px)]">
            <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6">
        {columns.map(column => (
          <Column key={column.id} column={column} setColumns={setColumns} columns={columns} />
        ))}
      </div>
    </DndProvider>
            </div>
          </main>
      )}
      </>
    )
}