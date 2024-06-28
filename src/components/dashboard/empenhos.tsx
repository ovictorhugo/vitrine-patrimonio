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

import { columnsFornecedores } from "./components/columns-fornecedores";
import { Solicitantes } from "./components/solicitantes";
import { Skeleton } from "../ui/skeleton";
import { DataTable } from "./components/data-table-fornecedores";

interface Empenho {
  id:string
  coluna:string
  emp_nom:string
  status_tomb:string
  tipo_emp:string
  pdf_empenho:string
  data_fornecedor:string
  prazo_entrega:string
  status_recebimento:string
  loc_entrega:string
  loc_entrega_confirmado:string
  cnpj:string
  loc_nom:string
  des_nom:string
  status_tombamento:string
  data_tombamento:string
  data_aviso :string
  prazo_teste:string
  atestado:string
  loc_tom:string
  status_nf:string
  observacoes:string
  data_agendamento:string
  n_termo_processo:string
  origem:string
  valor_termo:string
  n_projeto:string
  data_tomb_sei:string
  pdf_nf:string
  pdf_resumo:string
  created_at:string
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
    let urlEmpenhos = `${urlGeral}AllEmpenhos`;
    const fetchDataP = async () => {
      try {
        const response = await fetch(urlEmpenhos , {
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
            setEmpenhos(data)
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchDataP();
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


    const [search, setSearch] = useState('')


    const [columns, setColumns] = useState([
      { id: 1, title: 'Recebidos', items: [] as Empenho[] },
      { id: 2, title: 'Projetos', items: [] as Empenho[] },
      { id: 3, title: 'Tombamento', items: [] as Empenho[] },
      { id: 4, title: 'Agendamento', items: [] as Empenho[] },
      { id: 5, title: 'Concluídos', items: [] as Empenho[] },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    console.log(columns)
  
    useEffect(() => {
      const updatedColumns = columns.map((column) => ({
        ...column,
        items: empenhos.filter((empenho) => empenho.coluna.trim() === column.title.toLowerCase()),
      }));
      setColumns(updatedColumns);
    }, [empenhos]);

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

    // Função para atualizar um item específico no formData
  const updateItem = (index:any, field:any, value:any) => {
    const newFormData = formData.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData(newFormData);
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

            fetchDataP()
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
   
    const fetchDataP = async () => {
      try {
        setIsLoading(true)
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
            setIsLoading(false)
        }
      } catch (err) {
        console.log(err);
      }
    };

    useEffect(() => {  
      fetchDataP()
  
     
    }, [urlPatrimonioInsert]);
  


const formatCep = (value:any) => {
  // Remove todos os caracteres que não são dígitos
  value = value.replace(/\D/g, '');
  // Aplica a máscara
  value = value.replace(/^(\d{5})(\d)/, '$1-$2');
  // Limita a 9 caracteres
  return value.slice(0, 9);
};

// Função para lidar com a mudança no input do CEP
const handleCepChange = (index:any, e:any) => {
  const formattedCep = formatCep(e.target.value);
  updateItem(index, 'cep', formattedCep);
};


const formatCnpj = (value:any) => {
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');
  return value.slice(0, 18);
};

const handleCnpjChange = (index:any, e:any) => {
  const formattedCnpj = formatCnpj(e.target.value);
  updateItem(index, 'cnpj', formattedCnpj);
};

const formatPhone = (value:any) => {
  value = value.replace(/\D/g, ''); // Remove todos os caracteres que não são dígitos
  value = value.replace(/^(\d{2})(\d)/, '($1) $2'); // Adiciona parênteses em torno dos dois primeiros dígitos
  value = value.replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2-$3'); // Formata o restante como x xxxx-xxxx
  return value.slice(0, 16); // Limita a 15 caracteres
};

const handlePhoneChange = (index:any, e:any) => {
  const formattedPhone = formatPhone(e.target.value);
  updateItem(index, 'telefone', formattedPhone);
};


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
                <TabsTrigger value="solicitantes" className="text-zinc-600 dark:text-zinc-200">Solicitantes</TabsTrigger>
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
                {isLoading ? (
                  <div className="flex gap-6">
                    <Skeleton className="w-[320px] rounded-md h-64"/>
                    <Skeleton className="w-[320px] rounded-md h-[400px]"/>
                    <Skeleton className="w-[320px] rounded-md h-[300px]"/>
                    <Skeleton className="w-[320px] rounded-md h-[100px]"/>
                    <Skeleton className="w-[320px] rounded-md h-[400px]"/>
                  </div>
                ):(
                  <DndProvider backend={HTML5Backend}>
                  <div className="flex gap-6">
                    {columns.map((column) => (
                      <Column key={column.id} column={column} setColumns={setColumns} columns={columns} />
                    ))}
                  </div>
                </DndProvider>
                )}
            </div>
                </TabsContent>

                <TabsContent value="unread" className="h-auto md:pb-8 ob-4">
                <div className="grid gap-4 h-full md:gap-8 lg:grid-cols-2 xl:grid-cols-3">

                <fieldset className="grid xl:col-span-2 gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Todos os fornecedores
                  </legend>

                  <DataTable columns={columnsFornecedores} data={fornecedores}></DataTable>
                  
                </fieldset>

                <fieldset className="grid gap-6 rounded-lg  p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Adicionar novo fornecedor
                  </legend>
                  {formData.map((item, index) => (
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Nome da empresa</Label>
                    <Input name="nome" value={item.nome} 
                    onChange={(e) => updateItem(index, 'nome', e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                 <div className="flex w-full gap-6">
     
                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Sigla</Label>
                    <Input name="sigla" value={item.sigla}
                    onChange={(e) => updateItem(index, 'sigla', e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">CNPJ</Label>
                    <Input
              name="cnpj"
              value={item.cnpj}
              onChange={(e) => handleCnpjChange(index, e)}
              id="cnpj"
              type="text"
              className="flex flex-1"
            />
                  </div>
                 </div>

                  <div className="grid gap-3">
                    <Label htmlFor="temperature">Endereço</Label>
                    <Input name="endereco" value={item.endereco}
                    onChange={(e) => updateItem(index, 'endereco', e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                  <div className="flex w-full gap-6 ">
                 <div className="grid gap-3 w-full">
                    <Label htmlFor="model">CEP</Label>
                    <Input
                    name="cep"
                    value={item.cep}
                    onChange={(e) => handleCepChange(index, e)}
                    id="cep"
                    type="text"
                    className="flex flex-1"
                  />
                  </div>
                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Cidade</Label>
                    <Input name="cidade" value={item.cidade}
                    onChange={(e) => updateItem(index, 'cidade', e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                  
                 </div>

                 <div className="flex w-full gap-6 ">
                 <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Telefone</Label>
                    <Input
              name="telefone"
              value={item.telefone}
              onChange={(e) => handlePhoneChange(index, e)}
              id="telefone"
              type="text"
              className="flex flex-1"
            />
                  </div>

                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Email</Label>
                    <Input name="email" value={item.email}
                    onChange={(e) => updateItem(index, 'email', e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                 </div>

            

                 <div className="grid gap-3">
                    <Label htmlFor="content">Observação</Label>
                    <Textarea name="observacoes" value={item.observacoes}
                    onChange={(e) => updateItem(index, 'observacoes', e.target.value)} id="content"/>
                  </div>

                  <Button onClick={() => handleSubmitPatrimonio()} ><Plus size={16}/> Adicionar </Button>
                  </div>
                ))}
                </fieldset>
             
              </div>
                </TabsContent>

                <TabsContent value="solicitantes" className="h-auto">
                  <Solicitantes/>
                </TabsContent>
                </Tabs>

           
          </main>
      )}
      </>
    )
}