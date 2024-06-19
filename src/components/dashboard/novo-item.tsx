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
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { Checks, Check, Warning, Wrench  } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ChevronLeft, DollarSign, Upload } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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



export function NovoItem() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral} = useContext(UserContext)
    const {onOpen} = useModal();


    const isModalOpen = isOpen && type === "novo-item";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    ///

    const [input, setInput] = useState("");

    const handleChange = (value:any) => {

      // Remover caracteres não numéricos
      value = value.replace(/[^0-9]/g, '');
  
      if (value.length > 1) {
        // Inserir "-" antes do último caractere
        value = value.slice(0, -1) + "-" + value.slice(-1);
      }
  
      setInput(value);
    };

    const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([])

    useEffect(() => {   
      if(type !=  'novo-item') {
        setPatrimonio([])
      
      }
        }, [type]);

    const bemCod = parseInt(input.split('-')[0], 10).toString();
    const bemDgv = input.split('-')[1];
    let urlPatrimonio = `${urlGeral}checkoutPatrimonio?bem_cod=${bemCod}&bem_dgv=${bemDgv}`;

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
      fetchData();
    }


    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onClickBuscaPatrimonio();
      }
    }, [onClickBuscaPatrimonio]);


console.log(patrimonio)


//


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
                Adicionar novo item
              </h1>
              {patrimonio.length > 0 && (
                <Badge variant="outline" className="ml-auto sm:ml-0">
                {`${patrimonio[0].bem_cod.trim()} - ${patrimonio[0].bem_dgv.trim() }`}
              </Badge>
              )}
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button size="sm"><Check size={16} />Publicar item</Button>
              </div>
            </div>

            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
               <div className="xl:col-span-2  flex flex-col md:gap-8 gap-4"  >
               <Alert  className="p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader>
                    <CardTitle>Detalhes do item</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                     <div className="flex gap-6 w-full">
                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Número do patrimônio</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} 
                          value={patrimonio.length > 0 ? (`${patrimonio[0].bem_cod.trim()} - ${patrimonio[0].bem_dgv.trim() }`) : input}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Material</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? patrimonio[0].mat_nom : ''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Condição do bem</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? (patrimonio[0].csv_cod.trim() == "BM" ? 'Bom': patrimonio[0].csv_cod.trim() == 'AE' ? 'Anti-Econômico': patrimonio[0].csv_cod.trim() == 'IR' ? 'Irrecuperável': patrimonio[0].csv_cod.trim() == 'OC' ? 'Ocioso': patrimonio[0].csv_cod.trim() == 'BX' ? 'Baixado': patrimonio[0].csv_cod.trim() == 'RE' ? 'Recuperável': ''):''}
                        />
                      </div>

                     
                     </div>

                     <div className="flex gap-6">
                      {(patrimonio.length > 0 && patrimonio[0].bem_val.trim().length > 0) && (
                        <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Valor</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? parseFloat(patrimonio[0].bem_val) : ''}
                        />
                      </div>
                      ) }
                     

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Responsável</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? patrimonio[0].pes_nome : ''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Situação</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? (patrimonio[0].bem_sta.trim() == "NO" ? ('Normal'):('Não encontrado no local de guarda')):''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Localização</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? patrimonio[0].loc_nom : ''}
                        />
                      </div>
                     </div>

                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Descrição</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ? patrimonio[0].bem_dsc_com : ''}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="description">Observações</Label>
                        <Textarea
                          id="description"
                          
                          className="min-h-32"
                        />
                      </div>
                    </div>
                    
                  </CardContent>
                  </Alert>

                  <Alert>
                  <CardHeader>
                    <CardTitle>Informações de contato</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="flex gap-6 w-full">
                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Email corporativo</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          
                        />
                      </div>

                     

                     
                     </div>

                     <div className="flex gap-6 mt-6">
                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Telefone</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                        
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Ramal</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                         
                        />
                      </div>
                     </div>
                    </CardContent>
                    </Alert>
               </div>

               <div className="  flex flex-col md:gap-8 gap-4"  >
                <Alert className="p-0">
                <CardHeader>
                    <CardTitle>Condição do bem</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                    <Select className={'w-auto'}>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Selecione a condição do bem" className={'whitespace-nowrap'} />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="quantum">
                          <div className="flex items-start gap-3 text-muted-foreground ">
                            <Checks className="size-5" />
                            <div className="grid gap-0.5 ">
                              <p>
                                Em boas condições
                              </p>
                              <p className="text-xs" data-description>
                                Não necessita de qualquer tipo de reparo
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="genesis">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Check className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Semi novo ou em excelente estado 

                              </p>
                              <p className="text-xs" data-description>
                              possui todos acessórios necessários para uso (se tiver ou não )
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="explorer">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Warning className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Semi novo
                              </p>
                              <p className="text-xs" data-description>
                                mas e necessário algum acessório para o completo uso
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Wrench className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Necessita de pequenos reparos
                              </p>
                              <p className="text-xs" data-description>
                                The most powerful model for complex
                                computations.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </CardContent>
                </Alert>

                <Alert className="p-0">
                <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <img
                        alt="Product image"
                        className="aspect-square w-full rounded-md object-cover"
                        height="300"
                        src="/placeholder.svg"
                        width="300"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <button>
                          <img
                            alt="Product image"
                            className="aspect-square w-full rounded-md object-cover"
                            height="84"
                            src="/placeholder.svg"
                            width="84"
                          />
                        </button>
                        <button>
                          <img
                            alt="Product image"
                            className="aspect-square w-full rounded-md object-cover"
                            height="84"
                            src="/placeholder.svg"
                            width="84"
                          />
                        </button>
                        <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Upload</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Alert>
               </div>
              </div>
           </main>
        )}
        </>
    )
}