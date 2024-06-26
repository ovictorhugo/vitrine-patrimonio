import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FileCsv, FileXls } from "phosphor-react";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonioMorto } from "./components/tabela-patrimonios-morto";
import { Input } from "../ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { TooltipProvider } from "../ui/tooltip";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { ItensListVitrine } from "./components/itens-list-vitrine";
import { DisplayItemPatrimonio } from "./components/display-item-patrimonio";
import { Bird, ChevronLeft, Plus, Rabbit, Search, Turtle } from "lucide-react";
import { DisplayItemEmpenho } from "./components/display-item-empenho";
import { Link, useNavigate } from "react-router-dom";

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
import { toast } from "sonner"

import axios from 'axios';
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DataTable } from "./data-table";
import { columnsFornecedores } from "./components/columns-fornecedores";
interface Empenho {
    id: string;
    status_tomb: string;
    data_tombamento: string;
    data_aviso: string;
    prazo_teste: string;
    atestado: string;
    solicitante: string;
    n_termo_processo: string;
    origem: string;
    cnpj: string;
    valor_termo: string;
    n_projeto: string;
    data_tomb_sei: string;
    nome: string;
    email: string;
    telefone: string;
    nf_enviada: string;
    loc_tom: string;
    des_nom: string;
    observacoes: string;
    pdf_empenho: string | null;
    pdf_nf: string | null;
    pdf_resumo: string | null;
    created_at: string;
    type_emp: string;
  }

  interface Fornecedores {
    sigla: string;
      nome: string;
      endereco: string;
      cep: string;
      cidade: string;
      cnpj: string;
      telefone: string;
      email: string;
      observacoes: string;
  }

export function Empenhos() {
  const { isOpen, type} = useModalDashboard();
  const {user, urlGeral, defaultLayout} = useContext(UserContext)
  const {onOpen} = useModal();

  const [empenhos, setEmpenhos] = useState<Empenho[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedores[]>([]);

  useEffect(() => {
    const fetchEmpenhos = async () => {
      try {
        const response = await axios.get(`${urlGeral}AllEmpenhos`);
        setEmpenhos(response.data);
      } catch (error) {
        console.error('Error fetching empenhos', error);
      }
    };

    fetchEmpenhos();
  }, []);

  const downloadPDF = (base64String: string, filename: string) => {
    const linkSource = `data:application/pdf;base64,${base64String}`;
    const downloadLink = document.createElement('a');
    const fileName = filename;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  console.log(empenhos)

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
        { id: 2, title: 'Projetos', items: [] },
        { id: 3, title: 'Tombamento', items: [] },
       
        { id: 4, title: 'Agendamento', items: [] },
        { id: 5, title: 'Concluídos', items: [] },
 
      ]);

      const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }


    const [formData, setFormData] = useState([
      {
        sigla: '',
        nome: '',
        endereco: '',
        cep: '',
        cidade: '',
        cnpj: '',
        telefone: '',
        email: '',
        observacoes: ''
      }
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmitPatrimonio = async () => {
      try {
    
    
        let urlPatrimonioInsert = `${urlGeral}insertFornecedor`;


        
          const response = await fetch(urlPatrimonioInsert, {
            mode: 'cors',
            method: 'POST',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            toast("Dados enviados com sucesso", {
              description: "Todos os dados foram enviados.",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }

        setFormData(
          [{sigla: '',
          nome: '',
          endereco: '',
          cep: '',
          cidade:'',
          cnpj:'',
          telefone:'',
          email:'',
          observacoes:''}]
        )

    
      } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        toast("Erro ao processar a requisição", {
          description: "Tente novamente mais tarde.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      }
    }


    //todos os fornecedores

    
    const urlPatrimonioInsert = `${urlGeral}getFornecedores`;

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(urlPatrimonioInsert , {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Max-Age": "3600",
              "Content-Type": "text/plain",
            },
          });
          const data = await response.json();
          if (data) {
              setFornecedores(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonioInsert]);
  

console.log(formData)
  return(
      <>
      {isModalOpen && (
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <Tabs defaultValue={'all'} className="h-full" >
                
                <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Empenhos
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
              <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">Fornecedores</TabsTrigger>
                </TabsList>
               
          
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                 <FileCsv size={16}/> Gerar relatório
                </Button>
                <Button onClick={() => onOpen('adicionar-empenho')} size="sm"><Plus size={16}/>Adicionar empenho</Button>
              </div>
              </div>
            </div>

            </div>

                

                <TabsContent value="all" className="h-auto">
                <div className="h-full elementBarra w-full flex gap-3 overflow-x-auto md:max-w-[calc(100vw-115px)] max-w-[calc(100vw-83px)]">
            <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6">
        {columns.map(column => (
          <Column key={column.id} column={column} setColumns={setColumns} columns={columns} />
        ))}
      </div>
    </DndProvider>
            </div>
                </TabsContent>

                <TabsContent value="unread" className="h-auto">
                <div className="grid gap-4 h-full md:gap-8 lg:grid-cols-2 xl:grid-cols-3">

                <fieldset className="grid xl:col-span-2 gap-6 rounded-lg border p-4 bg-white">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Todos os fornecedores
                  </legend>

                  <DataTable columns={columnsFornecedores} data={fornecedores}></DataTable>
                  
                </fieldset>

                <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Adicionar novo fornecedor
                  </legend>

                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Nome da empresa</Label>
                    <Input name="nome" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                 <div className="flex w-full gap-6">
     
                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Sigla</Label>
                    <Input name="sigla" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">CNPJ</Label>
                    <Input name="cnpj" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                 </div>

                  <div className="grid gap-3">
                    <Label htmlFor="temperature">Endereço</Label>
                    <Input name="endereco" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                  <div className="flex w-full gap-6 ">
                 <div className="grid gap-3 w-full">
                    <Label htmlFor="model">CEP</Label>
                    <Input name="cep" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Cidade</Label>
                    <Input name="cidade" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                  
                 </div>

                 <div className="flex w-full gap-6 ">
                 <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Telefone</Label>
                    <Input name="telefone" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Email</Label>
                    <Input name="email" onChange={(e) => handleChange(e)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                 </div>

            

                 <div className="grid gap-3">
                    <Label htmlFor="content">Observação</Label>
                    <Textarea name="observacoes" onChange={(e) => handleChange(e)} id="content" placeholder="You are a..." />
                  </div>

                  <Button onClick={() => handleSubmitPatrimonio()} className="ml-auto w-fit"><Plus size={16}/> Adicionar </Button>
                 
                </fieldset>
             
              </div>
                </TabsContent>
                </Tabs>

           
          </main>
      )}
      </>
    )
}