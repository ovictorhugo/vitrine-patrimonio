import { Link, useNavigate } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, FileCsv, FileXls, Package, Trash, User, Plus, MagnifyingGlass, Funnel, Check, ChartBar } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ChevronLeft, DollarSign, RefreshCcw, WalletCards } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";

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

interface TotalPatrimonios {
  total_patrimonio:string
  total_patrimonio_morto:string
}

import { toast } from "sonner"
import { Input } from "../ui/input";
import { PatrimonioItem } from "../busca-patrimonio/patrimonio-item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Checkbox } from "../ui/checkbox";

export function VisaoGeralUser() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral, permission} = useContext(UserContext)
    const {onOpen} = useModal();


    const isModalOpen = isOpen && type === "visao-geral-user";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=`;

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
              setTotal(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonioInsert]);

    const [input, setInput] = useState("");
    const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([])

    let urlPatrimonio = `${urlGeral}searchByBemNumAtm?bem_num_atm=${input}`;

      const fetchData = async () => {
        try {
         
          const response = await fetch( urlPatrimonio, {
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
            setPatrimonio(data);
            setInput('')
         
          } else {
            toast("Erro: Nenhum patrimônio encontrado", {
              description: "Revise o número",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }
        } catch (err) {
          console.log(err);
        }
      };

      const onClickBuscaPatrimonio = () => {
        fetchData()
 
      }

      const deletarCondicaoBem = () => {
        let urlPatrimonio = `${urlGeral}clearCondicaoBem`;

        const fetchDataP = async () => {
          try {
            const response = await fetch(urlPatrimonio, {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json", // Enviar como JSON
                "Access-Control-Allow-Origin": "*", // Headers CORS
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "3600"
              },
            });
        
            if (response.ok) {
              toast("Dados excluídos da tabela", {
                description: "Dados na condição de origem",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar"),
                },
              });
            } else {
              toast("Erro: Não foi possível resetar a tabela", {
                description: "Tente novamente",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar"),
                },
              });
            }
          } catch (err) {
            console.error("Erro ao processar a requisição:", err);
            toast("Erro ao processar a requisição", {
              description: "Verifique o console para mais detalhes",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }
        };
        
        fetchDataP();
        
 
      }

      const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          onClickBuscaPatrimonio();
        }
      }, [onClickBuscaPatrimonio]);

      const history = useNavigate();

      const handleVoltar = () => {
        history(-1);
      }


      const [cb, setCb] = useState('OC')

      
const [tab, setTab] = useState('all')


//permissoes
 
const has_editar_cargos_permissoes = permission.some(
  (perm) => perm.permission === 'editar_cargos_permissoes'
);

const has_editar_cargos_usuarios = permission.some(
  (perm) => perm.permission === 'editar_cargos_usuarios'
);

const has_editar_informacoes_usuarios = permission.some(
  (perm) => perm.permission === 'editar_informacoes_usuarios'
);

const has_editar_configuracoes_plataforma = permission.some(
  (perm) => perm.permission === 'editar_configuracoes_plataforma'
);




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
                Módulo administrativo
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
                
              <TabsTrigger value="all" onClick={() => setTab('all')} className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
              <TabsTrigger value="condicao" onClick={() => setTab('condicao')} className="text-zinc-600 dark:text-zinc-200">Condição dos bens</TabsTrigger>
              <TabsTrigger value="cargos" disabled={!has_editar_cargos_permissoes && !has_editar_cargos_usuarios && !has_editar_informacoes_usuarios} onClick={() => setTab('cargos')} className="text-zinc-600 dark:text-zinc-200">Cargos e permissões</TabsTrigger>
                <TabsTrigger value="unread" onClick={() => setTab('unread')}  className="text-zinc-600 dark:text-zinc-200">Configurações</TabsTrigger>
               
                </TabsList>
               
          
              
              </div>
            </div>

            </div>
            <TabsContent value="all" className="h-auto flex flex-col gap-4 md:gap-8 mt-2">
       
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de patrimônios
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{total.map((props) => props.total_patrimonio)}</div>
                    <p className="text-xs text-muted-foreground">
                      bens registrados
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de patrimônios baixados
                    </CardTitle>
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{total.map((props) => props.total_patrimonio_morto)}</div>
                    <p className="text-xs text-muted-foreground">
                      bens desfeitos
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de itens anunciados
                    </CardTitle>
                    <WalletCards className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{total.map((props) => props.total_patrimonio)}</div>
                    <p className="text-xs text-muted-foreground">
                      bens em exposição
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de transferência
                    </CardTitle>
                    <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{total.map((props) => props.total_patrimonio)}</div>
                    <p className="text-xs text-muted-foreground">
                      bens trocados
                    </p>
                  </CardContent>
                  </Alert>
                    </div>
               

              <div className="grid gap-4 h-full md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <Alert  className="xl:col-span-2 p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader className="flex gap-6 flex-col md:flex-row  justify-between">
              <div className="grid gap-2 ">
              <CardTitle>Usuários ativos por dia</CardTitle>
                <CardDescription>
                Dados do Google Analytics dos últimos 30 dias
                </CardDescription>
                </div>

                <div className="flex gap-3">
                  <ChartBar size={16}/>
                </div>
               </CardHeader>

               <CardContent>
              
               </CardContent>

               </Alert>

                <Alert   x-chunk="dashboard-01-chunk-5">
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Busca por código ATM</CardTitle>
                <CardDescription>
                Digite o código ATM para realizar a consulta patrimonial

                </CardDescription>
              </div>
             
            </CardHeader>
            <CardContent>
            <Alert  className="h-14 p-2 max-w-[500px] flex items-center justify-between">
            <div className="flex items-center gap-2 w-full flex-1">
            <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
            <Input placeholder="Digite o código ATM do patrimônio"  onKeyDown={handleKeyDown} onChange={(e) => setInput(e.target.value)} value={input}  type="text" className="border-0 w-full flex flex-1 "/>
                </div>
                <div className="w-fit gap-2 flex">
                
                <Button  size={'icon'} onClick={() =>  onClickBuscaPatrimonio()}>
       <Funnel size={16} className="" /> 
       
        </Button>
            </div>
            </Alert>

            <div>
            {patrimonio.map((props) => (
  <div className="mt-3 ">
    <PatrimonioItem
    bem_cod={props.bem_cod}
    bem_dgv={props.bem_dgv}
    bem_num_atm={props.bem_num_atm}
    csv_cod={props.csv_cod}
    bem_serie={props.bem_serie}
    bem_sta={props.bem_sta}
    bem_val={props.bem_val}
    tre_cod={props.tre_cod}
    bem_dsc_com={props.bem_dsc_com}
    uge_cod={props.uge_cod}
    uge_nom={props.uge_nom}
    org_cod={props.org_cod}
    uge_siaf={props.uge_siaf}
    org_nom={props.org_nom}
    set_cod={props.set_cod}
    set_nom={props.set_nom}
    loc_cod={props.loc_cod}
    loc_nom={props.loc_nom}
    ite_mar={props.ite_mar}
    ite_mod={props.ite_mod}
    tgr_cod={props.tgr_cod}
    grp_cod={props.grp_cod}
    ele_cod={props.ele_cod}
    sbe_cod={props.sbe_cod}
    mat_cod={props.mat_cod}
    mat_nom={props.mat_nom}
    pes_cod={props.pes_cod}
    pes_nome={props.pes_nome}
  />
  </div>
))}
            </div>
            </CardContent>
                </Alert>

                
              </div>
            </TabsContent>

            <TabsContent value="unread" className="flex flex-col gap-4 md:gap-8">
              <Alert className="p-0">
              <CardHeader>
                <CardTitle>Diretório dos plugins</CardTitle>
                <CardDescription>
                  The directory within your project, in which your plugins are
                  located.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4">
                  <Input
                    placeholder="Project Name"
                    defaultValue="/content/plugins"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include" defaultChecked />
                    <label
                      htmlFor="include"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow administrators to change the directory.
                    </label>
                  </div>
                </form>
              </CardContent>
              </Alert>
            </TabsContent>

            <TabsContent value="condicao">
            <Alert  className="xl:col-span-2 p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader className="flex flex-col md:flex-row items-center justify-between">
              <div className="grid gap-2 ">
              <CardTitle>Condição dos bens</CardTitle>
                <CardDescription>
                  Exercício de 
                </CardDescription>
              </div>
             <div className="flex gap-3">
             <Select  defaultValue={'OC'} value={cb} onValueChange={(value) => setCb(value)} >
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="OC">OC</SelectItem>
    <SelectItem value="QB">BM</SelectItem>
    <SelectItem value="NE">NE</SelectItem>
    <SelectItem value="SP">SP</SelectItem>
  </SelectContent>
</Select>


             <Button variant={'destructive'} onClick={() => {deletarCondicaoBem()}}   size="sm" className="ml-auto gap-1">
              <Trash className="h-4 w-4" />
              Resetar tabela
               
              </Button>
             </div>
            </CardHeader>
            <CardContent>
      <TabelaPatrimonio
      filter={cb}
      />
            </CardContent>
                </Alert>
            </TabsContent>
          </Tabs>
             
            </main>
        )}
        </>
    )
}