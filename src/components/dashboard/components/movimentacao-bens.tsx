import { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../../../context/context"
import { Alert } from "../../ui/alert"
import { CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Info, Plus } from "lucide-react"
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
        setPatrimonioSelecionado((prev) => [...prev, patrimonio[0]]);
        setPatrimonio([])
      }
    };


    return(
        <div className="flex flex-col w-full gap-6">
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
                  <div className="flex flex-col gap-6">
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

                  <Alert>
                  <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px] whitespace-nowrap">N° patrimônio</TableHead>
                         
                          <TableHead className="w-full flex-1">Descrição do item</TableHead>
                          <TableHead className="w-[100px] whitespace-nowrap">TR</TableHead>
                          <TableHead className="w-[100px] whitespace-nowrap">Conservação</TableHead>
                          <TableHead className="w-[100px] whitespace-nowrap">Valor bem</TableHead>
                        
                        </TableRow>

                        <TableBody className="w-full">
                        {patrimonioSelecionado.map((props, index) => {
                  return(
                    <TableRow>
                      <TableCell className=" text-sm w-[150px] whitespace-nowrap">
                            {props.bem_cod}-{props.bem_dgv}
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

                          
                    </TableRow>
                  )
                })}
                        </TableBody>
                      </TableHeader>
                    </Table>
                  </Alert>
                 </div>
               )}
        </div>
    )
}