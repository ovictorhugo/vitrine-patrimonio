import { Bird, Check, ChevronDown, ChevronLeft, ChevronUp, Download, ListTodo, MapPin, Plus, Rabbit, Tag, Ticket, Turtle, User, X } from "lucide-react";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../ui/alert";
import QRCode from "react-qr-code";
import { useCallback, useContext, useState } from "react";
import { UserContext } from "../../context/context";
import React, {  useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Draggable from 'react-draggable';
import PdfViewer from './PdfViewer';  // Certifique-se de que o caminho está correto

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
import logo_eng from '../../assets/logo_eng.png';
import { toast } from "sonner"
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Funnel } from "phosphor-react";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }
  

export function CreateBarCode() {
    const { isOpen, type} = useModalDashboard();
    const isModalOpen = isOpen && type === 'create-bar-bode';
    const {loggedIn, urlGeral} = useContext(UserContext)
    const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([])

    const history = useNavigate();
    

    const handleVoltar = () => {
      history(-1);
    }

       //retorna url
       const query = useQuery();
       const navigate = useNavigate();
    const bem_cod = query.get('bem_cod');
    const bem_dgv = query.get('bem_dgv');
  
    let bemCod = bem_cod ?? '';  // Default value if bem_cod is null
    let bemDgv = bem_dgv ?? '';  // Default value if bem_dgv is null

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

       bemCod = parseInt(input.split('-')[0], 10).toString();
            bemDgv = input.split('-')[1];

     let urlPatrimonio = `${urlGeral}checkoutPatrimonio?bem_cod=${bemCod}&bem_dgv=${bemDgv}`;
     console.log(urlPatrimonio)
         
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

     const qualisColor = {
        'BM': 'bg-green-500',
        'AE': 'bg-red-500',
        'IR': 'bg-yellow-500',
        'OC': 'bg-blue-500',
        'BX': 'bg-gray-500',
        'RE': 'bg-purple-500'
      };
    
      const csvCodToText = {
        'BM': 'Bom',
        'AE': 'Anti-Econômico',
        'IR': 'Irrecuperável',
        'OC': 'Ocioso',
        'BX': 'Baixado',
        'RE': 'Recuperável'
      };

      const onClickBuscaPatrimonio = () => {
        fetchData()
       if (bemCod && bemDgv) {
        query.set('bem_cod', bemCod);
        query.set('bem_dgv', bemDgv);
        navigate({
          pathname: '/criar-etiqueta',
          search: query.toString(),
        });
      }
        
      }
  
      const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          onClickBuscaPatrimonio();
        }
      }, [onClickBuscaPatrimonio]);


const [onOpenBar, setOnOpenBar] = useState(false)

    return(
        <>
        {isModalOpen && (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-2 md:p-8">
            
                
                <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Criar código da plaqueta
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
         
               
          
                <Button size="sm"><ListTodo size={16}/> Gerar plaquetas para todos os bens SQ</Button>
              </div>
            </div>

            </div>

                

            <div className="flex gap-4 h-full md:gap-8 ">
               <div className={` w-[375px] max-w-[375x] fixed bottom-0 ${!onOpenBar && (' ')}`}>
               <Alert className="border-none bg-transparent p-0 h-full ">
                    <div className="h-full">
                <div className=" rounded-xl ">
                    <div className="flex justify-between w-full">
                        <div className="flex gap-3 bg-eng-blue  rounded-tl-xl w-full items-center text-white p-4">
                            <Tag size={20}/>
                            <div>
                                <p className="font-medium">Informações da etiqueta</p>
                                <p className="text-xs">Informações da etiqueta</p>
                            </div>
                        </div>

                        <div className="flex">
                            <div>
                            <div className="h-full w-[44px] bg-eng-blue rounded-tr-xl "></div>
                            </div>
                            <div className="flex flex-col h-full">
                            <div className="flex">
                                <div className="bg-eng-blue absolute top-0 w-[44px]  h-full  max-h-[80px]"></div>
                            <div className="bg-neutral-50 z-[9] h-fit dark:bg-neutral-900 p-2 flex gap-3 rounded-bl-xl ">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                <Download className="h-4 w-4" />

              </Button>

              <Button variant="outline" onClick={() => setOnOpenBar(!onOpenBar)} size="icon" className="h-7 w-7">
                {onOpenBar ? (
                  <ChevronDown className="h-4 w-4" />
                ):(
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
                        </div>
                            </div>
                        <div className="h-full">
                            <div className="min-h-[44px] h-full max-h-[80px] w-full bg-eng-blue rounded-tr-xl "></div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>

               {onOpenBar && (
                 <div className="bg-eng-blue flex items-center flex-col ">
                 <div className="p-6">
                 <QRCode size={200} className={'bg-transparent'} value={``} bgColor={'#559FB8'} fgColor={'#ffffff'}/>
                 </div>
  
                  <Alert className="border-b-0 rounded-xl rounded-b-none p-6">
                 {patrimonio.map((props) => {
                  return(
                      <div>
                          <div className="flex justify-between mb-4">
                 <div>
                 <p className="text-xs">{props.bem_cod}-{props.bem_dgv}</p>
                                  <p className="font-bold text-xl">{props.mat_nom}</p>
  
                                  
  
                              </div>
  
                              <Button size={'sm'}><Plus size={16}/>Adicionar</Button>
                 </div>
  
                 <p className="text-xs text-muted-foreground">
                    {props.bem_dsc_com} {props.ite_mar !== "" && (`| ${props.ite_mar}`)}
                  </p>
                      </div>
                  )
                 })}
                  </Alert>
                  </div>
               )}

                   
                    </div>
                    </Alert>
               </div>

              {onOpenBar && (
                 <div className="w-[375px]"></div>
              )}
               

                    <div  className="w-full p-0 flex flex-col flex-1">
                    <div className="grid w-full items-start gap-6 overflow-auto ">
                <fieldset className="grid gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Configurações
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="model">Modelo</Label>
                    <Select>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Selecione um tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="genesis">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Rabbit className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                               Grande
                              </p>
                              <p className="text-xs" data-description>
                                Para armários e itens maiores que 1 metro
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="explorer">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Bird className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                               Médio
                              </p>
                              <p className="text-xs" data-description>
                                Performance and speed for efficiency.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="quantum">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Turtle className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Pequeno
                              </p>
                              <p className="text-xs" data-description>
                                Para itens 
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="temperature">Número de patrimônio</Label>
                    <div className="flex gap-3">
                    <Input id="temperature" type="text" onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} value={input} className="flex flex-1" />
                    <Button  size={'icon'} onClick={() =>  onClickBuscaPatrimonio()}>
                        <Funnel size={16} className="" /> 
                        
                            </Button>
                    </div>
                  </div>

                  <Button disabled={patrimonio.length == 0} ><Ticket size={16}/>Gerar etiqueta</Button>
                 

                </fieldset>

                <fieldset className="grid gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Plaquetas geradas
                  </legend>
                  </fieldset>
               
              </div>
                    </div>
                </div>
               
             </main>
        )}
        </>
    )
}