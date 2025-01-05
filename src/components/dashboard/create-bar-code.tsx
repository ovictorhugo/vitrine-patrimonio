import { Barcode, Bird, Check, ChevronDown, ChevronLeft, ChevronUp, Download, ListTodo, MapPin, Plus, Rabbit, SquareArrowOutUpRight, Tag, Ticket, Turtle, User, X } from "lucide-react";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../ui/alert";
import html2pdf from 'html2pdf.js';
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import React, {  useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Draggable from 'react-draggable';
import QRCode from "react-qr-code";

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
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }
  

export function CreateBarCode() {
    const { isOpen, type} = useModalDashboard();
    const isModalOpen = isOpen && type === 'create-bar-bode';
    const {loggedIn, urlGeral} = useContext(UserContext)
    const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([])
    const [selectedValue, setSelectedValue] = useState('a');
    const history = useNavigate();
    const [semRegistro, setSemRegistro] = useState(false)

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
    const [responsavel, setResponsavel] = useState("");
    const [gerado, setGerado] = useState(false);


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

     let urlPatrimonio = `${urlGeral}checkoutPatrimonio?bem_cod=${bem_cod}&bem_dgv=${bem_dgv}`;
     console.log(urlPatrimonio)
     let urlPatrimonioBusca = `vitrine.eng.ufmg.br/buscar-patrimonio?bem_cod=${bem_cod}&bem_dgv=${bem_dgv}`; 
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
          if (bemCod && bemDgv) {
            query.set('bem_cod', bemCod);
            query.set('bem_dgv', bemDgv);
            navigate({
              pathname: '/dashboard/criar-etiqueta',
              search: query.toString(),
            });
          }
          setResponsavel('')
           setPatrimonio(data);

          
         
         } else {
         
          
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
          pathname: '/dashboard/criar-etiqueta',
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

useEffect(() => {
  fetchData()

  
}, []);

const handleDownload = () => {
  const element = document.getElementById('content-to-pdf');
  if (element) {
    const options = {
      filename: 'patrimonio.pdf',
      html2canvas: { 
        scale: 2, // Melhora a qualidade da renderização do PDF
        useCORS: true, // Para permitir que as imagens externas sejam carregadas
        logging: true // Ativa o log para depuração
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Espera o carregamento das imagens antes de criar o PDF
    html2pdf().from(element).set(options).save();
  }
};


const currentYear = new Date().getFullYear();

    return(
   <div className="p-4  md:p-8 gap-8 flex flex-col  h-full">
       <div className="flex items-center gap-4">
         
         <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
        
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Criar etiqueta
            </h1>
            
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant={'outline'} size="sm"><SquareArrowOutUpRight size={16} />Procurar sala</Button>
              <Button size="sm"><SquareArrowOutUpRight size={16} />Visualizar todos os patrimônios</Button>
            </div>
          </div>
                <main className="flex flex-1 h-full lg:flex-row flex-col-reverse  gap-8 ">
               
   
                 <Alert className={`h-full bg-neutral-100 dark:bg-black flex items-center justify-center `}>
                 {!(patrimonio.length > 0 || responsavel.length > 0) && (
                   <div className="w-full flex flex-col items-center justify-center h-full">
                   <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">^_^</p>
                   <p className="font-medium text-lg max-w-[350px] text-center">
                    Adicione o número de patrimônio para gerar a etique temporária do bem
                   </p>
                 </div>
                 )}
                 {(patrimonio.length > 0 || responsavel.length > 0) && (
                   <div id="content-to-pdf" className={` flex dark:text-black ${selectedValue == 'b' ? ('w-[380px] '): selectedValue == 'c'? ('w-[440px] '):('w-[340px]  ')}`}>
                   <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border-2  border-black border-r-0 bg-eng-blue min-h-full relative `}></div>
                   <Alert className={`dark:bg-white border-2 border-l-0 border-black rounded-l-none items-center flex gap-4 ${selectedValue == 'b' ? ('p-4 py-2'): selectedValue == 'c'? ('p-4 py-2'):('p-0 px-1 pl-4')}`}>
                   <div className="w-fit">
                   <QRCode
                    className={` w-fit  ${selectedValue == 'b' ? ('h-24'): selectedValue == 'c'? ('h-32'):('h-16')}`}
                       value={urlPatrimonioBusca}
                       
                     />
                   </div>
                   
                   <div className="flex flex-col h-full justify-center py-2">
                                 <p className={`dark:text-black  font-semibold ${selectedValue == 'b' ? ('text-[14px]'): selectedValue == 'c'? ('text'):('text-[14px]')}`}>Escola de Engenharia da UFMG</p>
                                 <p className={`text-muted-foreground dark:text-black  ${selectedValue == 'b' ? ('text-xs'): selectedValue == 'c'? ('text-xs'):('text-xs ')}`}>
                                    Resp.: {patrimonio.length > 0 && patrimonio.slice(0, 1).map((props) => (props.pes_nome))}{responsavel}
                                   </p>
                   
                                   <p className={`text-muted-foreground dark:text-black  ${selectedValue == 'b' ? ('text-xs'): selectedValue == 'c'? ('text-xs'):('text-xs ')}`}>
                                    Ano: {currentYear}
                                   </p>
                   
                   
                                   <div className={` font-bold dark:text-black mb-2 ${selectedValue == 'b' ? ('text-2xl'): selectedValue == 'c'? ('text-2xl'):('text-xl')}`}>{bem_cod}-{bem_dgv}</div>
                                 <div className="">
                                 <div
                     style={{
                       backgroundImage: `url(https://barcode.orcascan.com/?type=code39&data=${bem_cod}-${bem_dgv}&fontsize=Fit&format=svg)`,
                     }}
                     className={`  mix-blend-multiply bg-cover bg-no-repeat ${selectedValue == 'b' ? ('h-10'): selectedValue == 'c'? ('h-14'):(' h-7')}`}
                   ></div>
                                 </div>
                   
                                 </div>
                   
                   
                   
                   
                   </Alert>
                   </div>
                 )}
                 </Alert>
   
                 <div className="lg:w-[400px] lg:min-w-[400px] w-full">
                 <h2 className="text-2xl font-medium mb-8 ">Gerar etiqueta temporária de bem patrimoniado</h2>
                 <div className="grid gap-4">
                 <div className="grid gap-2">
                                     <Label htmlFor="temperature">Número de patrimônio</Label>
                                     <div className="flex gap-3">
                                     <Input id="temperature" type="text" onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} value={input} className="flex flex-1" />
                                     <Button  size={'icon'} onClick={() =>  onClickBuscaPatrimonio()}>
                                         <Funnel size={16} className="" /> 
                                         
                                             </Button>
                                     </div>
                                   </div>
   
                                   <div className="grid gap-2">
                                     <Label htmlFor="temperature">Tamanho da etiqueta</Label>
                                     <div className="flex gap-3">
                                     <ToggleGroup type="single" variant="outline" className="w-full gap-3" onValueChange={(e) => setSelectedValue(e)} value={selectedValue}>
         <ToggleGroupItem className="w-full" value="a">Pequena</ToggleGroupItem>
         <ToggleGroupItem className="w-full" value="b">Média</ToggleGroupItem>
         <ToggleGroupItem className="w-full" value="c">Grande</ToggleGroupItem>
       </ToggleGroup>
   
   
   
                                     </div>
                                   </div>
   
   
                                   {patrimonio.length > 0 && patrimonio.slice(0, 1).map((props) => (
       <div className="grid gap-4">
         <div className="grid gap-2">
       <Label htmlFor="temperature">Material</Label>
       <div className="flex gap-3">
       <Input id="temperature" type="text" disabled  value={props.mat_nom} className="flex flex-1" />
       
       </div>
     </div>
   
     <div className="grid gap-2">
       <Label htmlFor="temperature">Descrição</Label>
       <div className="flex gap-3">
       <Input id="temperature" type="text" disabled  value={props.bem_dsc_com} className="flex flex-1" />
       
       </div>
     </div>
   
     <div className="grid gap-2">
       <Label htmlFor="temperature">Responsável</Label>
       <div className="flex gap-3">
       <Input id="temperature" type="text" disabled  value={props.pes_nome} className="flex flex-1" />
       
       </div>
     </div>
   
     <div className="grid gap-2">
       <Label htmlFor="temperature">Localização</Label>
       <div className="flex gap-3">
       <Input id="temperature" type="text" disabled  value={props.loc_nom} className="flex flex-1" />
       
       </div>
     </div>
   
    
       </div>
       
                                 ))}
   
                                
   
   
                                 <Button className="" disabled={(patrimonio.length == 0 && responsavel.length == 0)} onClick={handleDownload}><Barcode size={16}/>Gerar plaqueta</Button>
                 </div>
                 </div>
                  
                </main>
   </div>
      
    )
}