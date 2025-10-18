import { Link } from "react-router-dom";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";

import { LogoUfmg } from "../../svg/logo-ufmg";
import { Logo } from "../../svg/logo";


import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../ui/breadcrumb"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Button } from "../../ui/button";
import { CoinVertical, Coins, Envelope, FileCsv, FilePdf, FileXls, Package, Check, Trash, Info, ArrowUUpLeft, MapPin, User, CursorText, Calendar, Copy } from "phosphor-react";
import { Alert } from "../../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ArrowUpRight, DollarSign, ChevronLeft, Plus } from "lucide-react";
import { useModal } from "../../hooks/use-modal-store";
import { TabelaPatrimonio } from "../components/tabela-patrimonios";
import { ScrollArea } from "../../ui/scroll-area";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../ui/toggle-group"

import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table"
import { Badge } from "../../ui/badge";

import { useLocation, useNavigate } from 'react-router-dom';


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

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
  toggleGroupValue?: string
}

interface TotalPatrimonios {
  total_patrimonio:string
  total_patrimonio_morto:string
  unique_values:unique_values
}

interface unique_values {
  loc_cod:string
  loc_nom:string
  org_nom:string
  org_cod:string
  pes_cod:string
  pes_nome:string
  set_cod:string
  set_nom:string
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import DownloadButton from "../pdf-condicao-bem";
import { useTheme } from "next-themes";
import { SymbolEEWhite } from "../../svg/SymbolEEWhite";
import { SymbolEE } from "../../svg/SymbolEE";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";


export function VisaoSala() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral} = useContext(UserContext)
    const {onOpen} = useModal();

    const { onClose, isOpen:isOpenModal, type: typeModal } = useModal();
    
    const isModalOpenItensOciosos = (isOpenModal && typeModal === 'itens-ociosos')

    const query = useQuery();
  const sala = query.get('sala');


    const isModalOpen = isOpen && type === "visao-sala";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=${(sala != null || sala != "" || sala != undefined) && sala}`;
console.log(urlPatrimonioInsert)

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

    const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([]);

    const urlPatrimonio = `${urlGeral}allPatrimonio?loc_nom=${sala !== null ? sala: ''}`;

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(urlPatrimonio  , {
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
              setPatrimonio(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonio ]);

    const handleToggleChange = (value: string, index: number) => {
      setPatrimonio((prevPatrimonio) => {
        const updatedPatrimonio = [...prevPatrimonio];
        updatedPatrimonio[index].toggleGroupValue = value;
        return updatedPatrimonio;
      });
      
    };

    const isValidCsvCod = (value: any) => ["OC", "QB", "NE", "SP"].includes(value);

const data = patrimonio.map((item) => {
  const csvCod = isValidCsvCod(item.csv_cod.trim()) ? item.csv_cod.trim() : item.toggleGroupValue;
  
  return {
    bem_cod: item.bem_cod,
    bem_dgv: item.bem_dgv,
    bem_num_atm: item.bem_num_atm,
    bem_dsc_com: item.bem_dsc_com,
    tre_cod: item.tre_cod,
    bem_val: item.bem_val,
    csv_cod: item.toggleGroupValue == undefined ? item.csv_cod : item.toggleGroupValue, // Valor de csv_cod definido com base na lógica acima
  };
});


    console.log(patrimonio)
    console.log(data)

    const[ validData, setValidData ]= useState<any[]>([])

    useEffect(() => {
    setValidData(patrimonio.filter(item => item.toggleGroupValue === 'OC'));
  }, [patrimonio]);

    const handleButtonClick = async () => {
      const validValues = ["OC", "QB", "NE", "SP"];
      const invalidItems = patrimonio.filter(item => !validValues.includes(item.toggleGroupValue!));
    
     
    
         console.log(validData)
        if (validData.length > 0) {
          onOpen('itens-ociosos');
        } else {
          try {

            let urlPatrimonioInsert = urlGeral + `insertCondicaoBem`
            const response = await fetch(urlPatrimonioInsert, {
              mode: 'cors',
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '3600',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
    
            if (response.ok) {
              toast("Dados enviados com sucesso", {
                description: "Todos os dados foram enviados.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar"),
                },
              });
            } else {
              throw new Error('Network response was not ok');
            }
          } catch (error) {
            toast("Erro ao processar a requisição", {
              description: "Tente novamente mais tarde.",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }
        }
      
    };
    console.log(sala)
    const { theme } = useTheme()

    const handleBtnNaoVitrine = async () => {
      try {

        let urlPatrimonioInsert = urlGeral + `insertCondicaoBem`
        const response = await fetch(urlPatrimonioInsert, {
          mode: 'cors',
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          toast("Dados enviados com sucesso", {
            description: "Todos os dados foram enviados.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
          onClose()
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        toast("Erro ao processar a requisição", {
          description: "Tente novamente mais tarde.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      }
    }

    const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }

    return(
        <>
        {isModalOpen && (
            sala != undefined ? (
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <Tabs defaultValue={'all'} className="h-full" >
                
                <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                {sala}
              </h1>
              

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
              <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">Todos os itens</TabsTrigger>
                <TabsTrigger value="movimentacao-bens" className="text-zinc-600 dark:text-zinc-200">Movimentação de bens</TabsTrigger>
                </TabsList>
               
          
                <Button size="sm"><Check size={16}/>Atualizar condição dos bens 2024</Button>
              </div>
            </div>

            </div>

                

                <TabsContent value="all" className="h-auto">
                <div className="grid h-full gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Alert  className="xl:col-span-2 p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
              <CardTitle>Administradores</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button   size="sm" className="ml-auto gap-1">
              <Plus className="h-4 w-4" />
                  Adicionar administrador
                  
               
              </Button>
            </CardHeader>
            <CardContent>
      
            </CardContent>
                </Alert>

                <Alert  className=" p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
              <CardTitle>Administradores</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
             
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input/>
                <Button ><Copy size={16}/>Copiar link</Button>
              </div>

              <div className="w-full my-4 h-[0.5px] border-neutral-200 border-b dark:border-neutral-800"></div>
             
              <div>
                <p className="font-medium text-sm mb-4">Responsável</p>

                <div className="flex gap-3 items-center">
                <Avatar className="cursor-pointer rounded-md  h-[36px] w-[36px]">
                <AvatarImage  className={'rounded-md h-[36px] w-[36px]'} src={``} />
                <AvatarFallback className="flex items-center justify-center"></AvatarFallback>
            </Avatar>

            <div >
            <p className="font-medium text-sm">Responsável</p>
            <p className=" text-sm">Responsável</p>
            </div>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm my-4">Pessoas com acesso</p>

                <div className="flex gap-3 items-center">
                <Avatar className="cursor-pointer rounded-md  h-[36px] w-[36px]">
                <AvatarImage  className={'rounded-md h-[36px] w-[36px]'} src={``} />
                <AvatarFallback className="flex items-center justify-center"></AvatarFallback>
            </Avatar>

            <div >
            <p className="font-medium text-sm">Responsável</p>
            <p className=" text-sm">Responsável</p>
            </div>

            <Select>
  <SelectTrigger className="ml-auto w-[130px]">
    <SelectValue placeholder="" />
  </SelectTrigger>
  <SelectContent>
  <SelectItem value="administrador">Administrador</SelectItem>
    <SelectItem value="colaborador">Colaborador</SelectItem>
  </SelectContent>
</Select>
                </div>
              </div>
            </CardContent>
                </Alert>
                </div>
                </TabsContent>

                <TabsContent value="unread" className="flex flex-col gap-4 md:gap-8">
                

              {total.map((props) => {
                  return(
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Alert className="p-0 md:col-span-3"  >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Informações
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                 {Array(props.unique_values).map((item) => {
                  return(
                    <CardContent className="flex gap-6">
                    <div>
                    <p className="text-xs flex gap-1 mb-2 items-center">
                        <MapPin size={12}/> Órgão: {item.org_cod} - {item.org_nom}
                       </p>
   
                       <p className="text-xs flex gap-1 mb-2 items-center">
                        <MapPin size={12}/> Local: {item.loc_cod} - {item.loc_nom}
                       </p>
                    </div>
                    <div>
                    <p className="text-xs flex gap-1 mb-2 items-center">
                        <MapPin size={12}/> Setor: {item.set_cod} - {item.set_nom}
                       </p>
   
                       <p className="text-xs flex gap-1 mb-2 items-center">
                        <User size={12}/> Responsável: {item.pes_cod} - {item.pes_nome}
                       </p>
                    </div>
                     </CardContent>
                  )
                 })}
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de patrimônios
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{props.total_patrimonio}</div>
                    <p className="text-xs text-muted-foreground">
                      bens registrados
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Dados da assinatura
                    </CardTitle>
                    <CursorText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex gap-6">
                  <div>
                  <p className="text-xs flex gap-1 mb-2 items-center">
                        <Calendar size={12}/> Verificado em:
                       </p>
   
                       <p className="text-xs flex gap-1 mb-2 items-center">
                        <MapPin size={12}/> Nome:
                       </p>
                 
                  </div>

                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Legendas
                    </CardTitle>
                    <CursorText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex gap-6">
                  <div>
                  <p className="text-xs flex gap-1 mb-2 items-center">OC - Ocioso </p>
                  <p className="text-xs flex gap-1 mb-2 items-center">QB - Quebrado </p>
                 
                  </div>
                  <div>
    
                  <p className="text-xs flex gap-1 mb-2 items-center">NE - Não encontrado </p>
                  <p className="text-xs flex gap-1 mb-2 items-center">SP - Sem Plaqueta </p>
                  </div>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0 md:col-span-2"  >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Informações
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>

                  <CardContent>
                    
                  </CardContent>
                  </Alert>
                    </div>
                  )
                })}

              
                <Alert  className=" p-0 mb-4 md:mb-8" x-chunk="dashboard-01-chunk-4 " >
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Relação de bens para inventário</CardTitle>
                <CardDescription>
                  Exercício de 
                </CardDescription>
              </div>
             <div className="ml-auto flex gap-3">
  
              <Button onClick={() => onOpen('import-csv')}  size="sm" variant={'ghost'}  className="ml-auto gap-1">
              <FileCsv className="h-4 w-4" />
                  Baixar arquivo .csv
                  
               
              </Button>

              <DownloadButton/>

              <Button onClick={() => handleButtonClick()}  size="sm" className="ml-auto gap-1">
              <Check className="h-4 w-4" />
                  Salvar alterações
                  
               
              </Button>
             </div>
            </CardHeader>
            <CardContent>
            <Accordion type="single" collapsible>
  <AccordionItem className="border-none" value="item-1">
    <AccordionTrigger className="border-b-none">Todos os itens</AccordionTrigger>
    <AccordionContent>
    <ScrollArea>
           <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px] whitespace-nowrap">N° patrimônio</TableHead>
                          <TableHead className="w-[150px] whitespace-nowrap">Número ATM</TableHead>
                          <TableHead className="w-full flex-1">Descrição do item</TableHead>
                          <TableHead className="w-[100px] whitespace-nowrap">TR</TableHead>
                          <TableHead className="w-[100px] whitespace-nowrap">Conservação</TableHead>
                          <TableHead className="w-[100px] whitespace-nowrap">Valor bem</TableHead>
                          <TableHead className="whitespace-nowrap">Condição do bem</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                {patrimonio.map((props, index) => {
                  return(
                    <TableRow>
                      <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                            {props.bem_cod}-{props.bem_dgv}
                          </TableCell>

                          <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                            {props.bem_num_atm || ''}
                          </TableCell>

                          <TableCell className=" text-sm w-full flex-1">
                            {props.bem_dsc_com}
                          </TableCell>

                          <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                            {props.tre_cod}
                          </TableCell>

                          <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                          {props.csv_cod.trim() == "BM" ? 'Bom': props.csv_cod.trim() == 'AE' ? 'Anti-Econômico': props.csv_cod.trim() == 'IR' ? 'Irrecuperável': props.csv_cod.trim() == 'OC' ? 'Ocioso': props.csv_cod.trim() == 'BX' ? 'Baixado': props.csv_cod.trim() == 'RE' ? 'Recuperável': ''}
                          </TableCell>

                          <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                          {props.bem_val.trim() === '' ? '0.00' : parseFloat(props.bem_val).toFixed(2)}
                          </TableCell>

                          <TableCell className=" text-sm w-[150px]">
                          <ToggleGroup
  type="single"
  defaultValue={props.csv_cod.trim()} // Valor inicial é props.csv_cod.trim()
  onValueChange={(value) => handleToggleChange(value, index )} // Envia o novo valor para handleToggleChange
  variant="outline"
>
  <ToggleGroupItem value="OC">OC</ToggleGroupItem>
  <ToggleGroupItem value="QB">QB</ToggleGroupItem>
  <ToggleGroupItem value="NE">NE</ToggleGroupItem>
  <ToggleGroupItem value="SP">SP</ToggleGroupItem>
</ToggleGroup>

                          </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
           </ScrollArea>
    </AccordionContent>
  </AccordionItem>
</Accordion>
          

              
            </CardContent>
                </Alert>

                <Dialog open={isModalOpenItensOciosos} onOpenChange={onClose}> 
        <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                 <DialogTitle className="text-2xl text-center font-medium">
               {validData.length == 1 ? (
                ' Você possui 1 novo item ocioso, deseja divulgar no Sistema Patrimônio?'
               ):(
                `  Você possui ${validData.length} novos itens ociosos, deseja divulgar no Sistema Patrimônio?`
               )}
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500 max-w-[350px]">
                 Atualize os itens do {typeModal == 'import-csv' ? ('patrimônio'):('patrimônio baixado')} na Vitrine com a planilha .xls gerada no SICPAT
                 </DialogDescription>
               </DialogHeader>

               <div className="mb-4">
               
               </div>


               <DialogFooter>
                <Button onClick={() => handleBtnNaoVitrine()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Continuar e não anunciar no Vitrine</Button>
                <Button   ><Check size={16} className="" />Atualizar dados</Button>

                </DialogFooter>

                <div>
              
               </div>

               </DialogContent>
               
               </Dialog>
                </TabsContent>

                <TabsContent value="movimentacao-bens">
                 
                </TabsContent>
              </Tabs>
            </main>
            ):(
              <main className="flex items-center justify-center flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
           
               <div className="w-full h-full flex flex-col items-center justify-center">
       <p className="text-9xl  text-[#719CB8]  font-bold mb-16 animate-pulse">{'>_<'}</p>
        <p className="font-medium text-lg max-w-[300px] text-center"> Ei, parece que você está tentando acessar uma página que não existe </p>
      </div>
              </main>
            )
        )}
        </>
    )
}