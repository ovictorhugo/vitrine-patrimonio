import { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../../../context/context"
import { Alert } from "../../ui/alert"
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { ArrowLeftRight, Check, Info, MapPin, Plus, Save, User } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { setISODay } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"

interface TotalPatrimonios {
    total_patrimonio:string
    total_patrimonio_morto:string
    unique_values:unique_values
  }

  import { Checkbox } from "../../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { LinhaTempo } from "./linha-tempo"

  
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
  

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function MovimentacaoBrns() {

    const query = useQuery();
    const sala = query.get('sala');

    const [input, setInput] = useState("");

    const [onOpen, setIsOpen] = useState(false)

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);
    const {user, urlGeral} = useContext(UserContext)

     const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([])

     const [patrimonioSelecionado, setPatrimonioSelecionado] = useState<Patrimonio[]>([])

     const handleChange = (value:any) => {

      // Remover caracteres não numéricos
      value = value.replace(/[^0-9]/g, '');
  
      if (value.length > 1) {
        // Inserir "-" antes do último caractere
        value = value.slice(0, -1) + "-" + value.slice(-1);
      }
  
      setInput(value);
    };


     let bemCod = parseInt(input.split('-')[0], 10).toString();
     let bemDgv = input.split('-')[1];

     let urlPatrimonio = `${urlGeral}checkoutPatrimonio?bem_cod=${bemCod}&bem_dgv=${bemDgv}`


     
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

    console.log(patrimonio)

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

    const onClickBuscaPatrimonio = () => {
      fetchData();
      
    }

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onClickBuscaPatrimonio();
      }
    }, [onClickBuscaPatrimonio]);

    const handleAddItem = () => {
      if (patrimonio.length > 0) {
        const { bem_cod, bem_dgv } = patrimonio[0];
    
        const itemExiste = patrimonioSelecionado.some(
          (item) => item.bem_cod === bem_cod && item.bem_dgv === bem_dgv
        );
    
        if (!itemExiste) {
          setPatrimonioSelecionado((prev) => [...prev, patrimonio[0]]);
          setPatrimonio([]);
        } else {
          toast("Patrimônio já adicionado", {
            description: "Adicione outro bem ou finalize o formulário",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });

          setPatrimonio([]);
        }
      }
    };
    
const [motivo, setMotivo] = useState('')

    return(
        <div className="flex flex-col w-full md:gap-8 gap-4">
            {total.map((props) => {
                  return(
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Alert className="p-0 "  >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Informações
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de movimentações
                    </CardTitle>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold"></div>
                    <p className="text-xs text-muted-foreground">
                      solicitações registradas
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert onClick={() => setIsOpen(!onOpen)} className="p-0 hover:bg-[#274B5E] bg-[#719CB8] text-white transition-all cursor-pointer "  >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      
                    </CardTitle>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>

                  <CardContent>
                    <h2 className="font-medium text-2xl">Adicionar <br/> movimentação</h2>
                  </CardContent>
                  </Alert>
                  </div>
                )
                 })}

               {onOpen && (
                  <div className="flex flex-col gap-8">

                    <LinhaTempo
                    links={[
                        {
                          title:'Preencher movimentação',
                          selected:true
                        },
                        {
                          title:'Assinaturas',
                        },
                        {
                          title:'Protocolação',
                        }
                    ]}
                    />

                    <Alert>
                    <CardHeader className="flex p-2 flex-row items-center">
                    <div className="grid gap-2">
                   
                <CardTitle>Nota de movimentação de material permanente</CardTitle>
                <CardDescription>
                SEÇÃO DE PATRIMÔNIO DA ESCOLA DE ENGENHARIA DA UFMG
                </CardDescription>
              </div>
              </CardHeader>
                       <div>
                       <div className="w-full flex gap-6 items-end p-2">

                       <div className="grid gap-3 w-full ">
                        <Label htmlFor="name">Motivo de saída</Label>
                        <Select defaultValue={motivo} value={motivo} onValueChange={(value) => setMotivo(value)}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value={'Empréstimo'}>Empréstimo</SelectItem>
                            <SelectItem value={'Manutenção'}>Manutenção</SelectItem>
                         
                            </SelectContent>
                          </Select>
                      </div>

                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Data prevista de devolução</Label>
                        <Input
                        id="name"
                        type="text"
                        className="w-full"
                        
                      />
                      </div>
                      </div>
                       </div>
                    </Alert>


                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2" >
                  {total.map((props) => {
                    return props.unique_values.map((item) => {
                      return (
                       
                          <Alert className="p-0 ">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Local de origem do(s) bem(ns)
                              </CardTitle>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="w-full flex gap-6 items-end mt-6">
                            <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Unidade</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                         
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Depto/setor</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          
                        />
                      </div>
                      </div>

                      <div className="w-full flex gap-6 items-end mt-6">
                            <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Sala</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                         
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Telefone</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          
                        />
                      </div>
                      </div>

                      <div className="grid gap-3 mt-6 w-full">
                        <Label htmlFor="name" className="w-[150px]">Email</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                         
                        />
                      </div>

                      <div className="w-full flex gap-6 items-end mt-6">
                            <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Responsável</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                         
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Data</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          
                        />
                      </div>

                     
                      </div>
                     
                    
                            </CardContent>
                          </Alert>
                        
                      );
                    });
                  })}


                 
                          <Alert className="p-0 ">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Local de destino
                              </CardTitle>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="w-full flex gap-6 items-end mt-6">
                            <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Empresa/local</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                         
                         
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Logradouro</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                        
                          
                        />
                      </div>
                      </div>

                      <div className="w-full flex gap-6 items-end mt-6">
                            <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Bairro</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                        
                         
                        />
                      </div>

                     <div className="flex gap-6">
                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Cidade</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                         
                          
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">UF</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                       
                          
                        />
                      </div>
                     </div>
                      </div>

                      <div className="grid gap-3 mt-6 w-full">
                        <Label htmlFor="name" className="w-[150px]">Email</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                         
                         
                        />
                      </div>

                      <div className="w-full flex gap-6 items-end mt-6">
                            <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Responsável</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                      
                         
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name" className="w-[150px]">Data</Label>
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
                     

                                        <Alert className="p-0">

                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                De acordo da chefia do Depto/setor
                              </CardTitle>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <div className="w-full flex gap-6 p-6  items-end px-6">
                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Nome do chefe</Label>
                        <Input
                        id="name"
                        type="text"
                        className="w-full"
                        onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} 
                        value={patrimonio.length > 0 ? (`${patrimonio[0].bem_cod.trim()}-${patrimonio[0].bem_dgv.trim() }`) : input}
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

                      <Button  ><Plus size={16}/>Solicitar assinatura</Button>

                    </div>        

                          </Alert>

                  <Alert className="  min-h-[150px] p-0 flex items-center gap-3">
                    <div className="min-w-8 min-h-12 left-[-1px] relative border border-l-0 bg-neutral-50 dark:bg-neutral-900 rounded-r-full"></div>
                    <div className="w-full flex gap-6 items-end px-6">
                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Número de patrimônio</Label>
                        <Input
                        id="name"
                        type="text"
                        className="w-full"
                        onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} 
                        value={patrimonio.length > 0 ? (`${patrimonio[0].bem_cod.trim()}-${patrimonio[0].bem_dgv.trim() }`) : input}
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
                        <Label htmlFor="name">Descrição</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={patrimonio.length > 0 ?  patrimonio[0].bem_dsc_com : ''}
                        />
                      </div>

                      <Button  onClick={handleAddItem}><Plus size={16}/>Adicionar item</Button>

                    </div>
                    <div className="min-w-8 min-h-12 right-[-1px] relative border border-r-0 bg-neutral-50 dark:bg-neutral-900 rounded-l-full"></div>
                  </Alert>

                 {patrimonioSelecionado.length > 0 && (
                   <Alert className="w-full flex">
                   <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead className="w-[150px] whitespace-nowrap">N° patrimônio</TableHead>
                           <TableHead className="w-full flex-1">Descrição do item</TableHead>
                           <TableHead className="w-[100px] whitespace-nowrap">TR</TableHead>
                           <TableHead className="w-[100px] whitespace-nowrap">Conservação</TableHead>
                           <TableHead className="w-[100px] whitespace-nowrap">Valor bem</TableHead>
                         </TableRow>
 
                       
                       </TableHeader>

                       <TableBody className="">
                         {patrimonioSelecionado.map((props) => {
                   return(
                     <TableRow className="w-full">
                       <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                             {props.bem_cod}-{props.bem_dgv}
                           </TableCell>
 
      
 
                           <TableCell className=" text-sm w-full flex-1 flex ">
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
 
                           
                     </TableRow>
                   )
                 })}
                         </TableBody>
                     </Table>
                   </Alert>

                  
                 )}

                 <Alert className="flex gap-3 items-center p-6">
                  <Checkbox/>
                  <div>
                    <p className="font-medium text-sm">Termo de responsabilidade</p>
                  <p className="text-sm text-justify">Declaro ter ciência que em caso de perecimento ou lesão ao patrimônio público, estarei sujeito às sanções e penalidades administrativas, cíveis e penais impostas pela legislação, sem prejuízo do ressarcimento ao erário, conforme o art. 5º da lei 8429/92</p>
                  </div>
                 </Alert>


                 <div className="flex gap-3 justify-end mb-8">
                  <Button variant={'ghost'}><Save size={16}/>Salvar alterações</Button>
                  <Button><Check size={16}/> Finalizar e solicitar assinaturas</Button>
                 </div>
                 </div>
               )}
        </div>
    )
}