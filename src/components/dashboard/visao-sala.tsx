import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../components/ui/breadcrumb"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, FileCsv, FilePdf, FileXls, Package, Trash, Info, MapPin, User, CursorText, Calendar } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, DollarSign, ChevronLeft } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/ui/toggle-group"

import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Badge } from "../ui/badge";

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

export function VisaoSala() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral} = useContext(UserContext)
    const {onOpen} = useModal();

    const query = useQuery();
  const sala = query.get('sala');


    const isModalOpen = isOpen && type === "visao-sala";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=${sala}`;
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

    const urlPatrimonio = `${urlGeral}allPatrimonio?loc_nom=${sala}`;

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

    const data = patrimonio.map((item) => ({
      bem_cod: item.bem_cod,
      bem_dgv: item.bem_dgv,
      bem_num_atm: item.bem_num_atm,
      bem_dsc_com: item.bem_dsc_com,
      tre_cod: item.tre_cod,
      csv_cod: item.csv_cod,
      bem_val: item.bem_val,
      condicao: item.toggleGroupValue, 

    }))

    const handleButtonClick = async () => {
      const validValues = ["OC", "QB", "NE", "SP"];
      const invalidItems = patrimonio.filter(item => !validValues.includes(item.toggleGroupValue!));
    
      if (invalidItems.length > 0) {
        toast("Revise antes de enviar", {
          description: "Verifique se todos os bens constam com a condição",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      } else {
        const validData = patrimonio.filter(item => item.toggleGroupValue === "OC");
    
        if (validData.length > 0) {
          onOpen('itens-ociosos');
        } else {
          try {

            let urlPatrimonioInsert = urlGeral + ``
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
      }
    };
    

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
                {sala}
              </h1>
            
                <Badge variant="outline" className="ml-auto sm:ml-0">
                
              </Badge>
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button size="sm">Publicar item</Button>
              </div>
            </div>

            </div>

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
                 {props.unique_values.map((item) => {
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
             <Button onClick={() => onOpen('import-csv')}  size="sm" variant={'ghost'} className="ml-auto gap-1">
              <FilePdf className="h-4 w-4" />
                  Baixar arquivo .pdf
                  
               
              </Button>
              <Button onClick={() => onOpen('import-csv')}  size="sm" variant={'ghost'}  className="ml-auto gap-1">
              <FileCsv className="h-4 w-4" />
                  Baixar arquivo .csv
                  
               
              </Button>

              <Button onClick={() => handleButtonClick()}  size="sm" className="ml-auto gap-1">
              <FileCsv className="h-4 w-4" />
                  Salvar alterações
                  
               
              </Button>
             </div>
            </CardHeader>
            <CardContent>
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
                              defaultValue={props.csv_cod}
                         
                              onValueChange={(value) => handleToggleChange(value, index)}
                              variant="outline"
                            >
                               <ToggleGroupItem value="OC">OC</ToggleGroupItem>
                              <ToggleGroupItem value="QB">QB</ToggleGroupItem>
                              <ToggleGroupItem value="NE">NE</ToggleGroupItem>
                              <ToggleGroupItem  value="SP">SP</ToggleGroupItem>
                             
                            </ToggleGroup>
                          </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
           </ScrollArea>

              
            </CardContent>
                </Alert>

              
            </main>
        )}
        </>
    )
}