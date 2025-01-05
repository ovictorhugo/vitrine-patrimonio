import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
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
import { Checks, Check, Warning, Wrench, X, Trash, MagnifyingGlass  } from "phosphor-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ChevronLeft, DollarSign, Upload, ChevronsUpDown } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../../lib"

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

interface loc_nom {
  loc_nom:string
 
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}


import { toast } from "sonner"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"

import { useLocation,useNavigate } from 'react-router-dom';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import { Dialog } from "../ui/dialog";
import { LinhaTempo } from "./components/linha-tempo";


export function NovoItem() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral} = useContext(UserContext)
    const {onOpen} = useModal();

    const history = useNavigate();

    const handleVoltar = () => {
      history(-3);
    };



    const isModalOpen = isOpen && type === "novo-item";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const [locNomLista, setLocNomLista] = useState<loc_nom[]>([]);
  const[locState, setLocState] = useState(true)

    let urlLocNom = `${urlGeral}AllLocNom`;

    //retorna url
    const query = useQuery();
     const navigate = useNavigate();
  const bem_cod = query.get('bem_cod');
  const bem_dgv = query.get('bem_dgv');
  const type_cod = query.get('type_cod');
  const bem_num_atm = query.get('bem_num_atm');
  const [typeCod, setTypeCod] = useState(type_cod ?? 'cod')

  let bemCod = bem_cod ?? '';  // Default value if bem_cod is null
  let bemDgv = bem_dgv ?? '';  // Default value if bem_dgv is null

  const [input, setInput] = useState("");
  const [inputATM, setInputATM] = useState("");

  const [condicao, setCondicao] = useState("");
  const [descricao, setDescricao] = useState("");
 

  useEffect(() => {   
    query.set('type_cod', typeCod);
    navigate({
      pathname: '/dashboard/novo-item',
      search: query.toString(),
    });

    setPatrimonio([])
    setInputATM('')
    setInput('')
  
      }, [typeCod]);


    useEffect(() => {   
    const fetchDataLocNom = async () => {
      try {
       
        const response = await fetch( urlLocNom, {
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
          setLocNomLista(data);
       
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

    fetchDataLocNom()
  }, []);
    ///

   

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

        useEffect(() => {   
          handleChange(`${bem_cod}${bem_dgv}`)
          setInputATM(bem_num_atm|| '')
            }, []);

    bemCod = parseInt(input.split('-')[0], 10).toString();
    bemDgv = input.split('-')[1];
    let urlPatrimonio = ``;

    if(typeCod == 'cod') {
       urlPatrimonio = `${urlGeral}checkoutPatrimonio?bem_cod=${bemCod}&bem_dgv=${bemDgv}`
    } else if (typeCod == 'atm') {
      urlPatrimonio = `${urlGeral}searchByBemNumAtm?bem_num_atm=${inputATM}`
    }

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
      if(typeCod == 'cod') {

          query.set('bem_cod', bemCod);
          query.set('bem_dgv', bemDgv);
          query.set('type_cod', typeCod);
          query.set('bem_num_atm', '');
        
          navigate({
            pathname: '/dashboard/novo-item',
            search: query.toString(),
          });
        
      } else if (typeCod == 'atm') {
        query.set('bem_cod', '');
        query.set('bem_dgv', '');
          query.set('type_cod', typeCod);
          query.set('bem_num_atm', inputATM);
          navigate({
            pathname: '/dashboard/novo-item',
            search: query.toString(),
          });
        
      } 
    }


    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onClickBuscaPatrimonio();
      }
    }, [onClickBuscaPatrimonio]);


console.log(patrimonio)

const [openPopo, setOpenPopo] = useState(false)
  const [localizacao, setLocalizacao] = useState("")

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

//
console.log('loc', locNomLista)

//images
const [images, setImages] = useState<string[]>([]);

const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (files) {
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...newImages]);
  }
};


const [searchTerm, setSearchTerm] = useState('');

const normalizeString = (str:any) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const filteredList = locNomLista.filter((framework) =>
  normalizeString(framework.loc_nom).includes(normalizeString(searchTerm))
);

    return(
        <>
        {isModalOpen && (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
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
               {typeCod == 'scod' && (
                <Alert variant={'destructive'}>
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Atenção!</AlertTitle>
                  <AlertDescription>Apenas utilize esta opção se o item não tiver o código ATM ou o número do patrimônio
                  </AlertDescription>
                </Alert>
               )}


               <Alert  className="p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader>
                    <CardTitle>Detalhes do item</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                     <div className={`grid gap-6 w-full  sm:grid-cols-2 grid-cols-1 ${typeCod == 'scod' ? ('md:grid-cols-3'):('')}`}>
                     <div className="grid gap-3 w-full ">
                        <Label htmlFor="name">Tipo do código</Label>
                        <Select defaultValue={typeCod} value={typeCod} onValueChange={(value) => setTypeCod(value)}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value={'atm'}>Código ATM</SelectItem>
                            <SelectItem value={'cod'}>Número de patrimônio</SelectItem>
                            <SelectItem value={'scod'}>Sem código</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>

                     {typeCod == 'cod' && (
                      <div className="grid gap-3 w-full">
                      <Label htmlFor="name">Número do patrimônio</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} 
                        value={patrimonio.length > 0 ? (`${patrimonio[0].bem_cod.trim()}-${patrimonio[0].bem_dgv.trim() }`) : input}
                      />
                    </div>
                     )}

                  {typeCod == 'atm' && (
                      <div className="grid gap-3 w-full">
                      <Label htmlFor="name">Código ATM</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        onKeyDown={handleKeyDown} onChange={(e) => setInputATM(e.target.value)} 
                        value={patrimonio.length > 0 ? (`${patrimonio[0].bem_num_atm.trim()}`) : inputATM}
                      />
                    </div>
                     )}

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Material</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? patrimonio[0].mat_nom : ''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Condição do bem</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
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
                          disabled={typeCod != 'scod'}
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
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? patrimonio[0].pes_nome : ''}
                        />
                      </div>

                     </div>

                     <div className="flex gap-6">
                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Situação</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? (patrimonio[0].bem_sta.trim() == "NO" ? ('Normal'):('Não encontrado no local de guarda')):''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Localização</Label>
                        <div className="flex gap-3">
                        {locState ? (
                          <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? patrimonio[0].loc_nom : localizacao}
                        />
                        ):(
                          <Dialog open={openPopo} onOpenChange={setOpenPopo}>
                        <DialogTrigger className="w-full">
                        <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPopo}
                              className="w-full justify-between"
                            >
                              {localizacao
                                ? locNomLista.find((framework) => framework.loc_nom === localizacao)?.loc_nom
                                : 'Selecione um local'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
    <DialogHeader>
      <DialogTitle>Escolher localização</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>

    <div className="border rounded-md px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
                                <MagnifyingGlass size={16} />
                                <Input
                                  className="border-0"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  placeholder="Buscar localização"
                                />
                              </div>

                              <div className={'max-h-[350px] overflow-y-auto elementBarra'}>
                              
                              <div className="flex flex-col gap-1 p-2">
                                {filteredList.length > 0 ? (
                                  filteredList.map((props, index) => (
                                    <Button
                                      variant={'ghost'}
                                      key={index}
                                      className="text-left justify-start"
                                      onClick={() => {
                                        setLocalizacao(props.loc_nom);
                                        setLocState(true);
                                        setOpenPopo(false); // Fechar o popover após a seleção
                                      }}
                                    >
                                      {props.loc_nom}
                                    </Button>
                                  ))
                                ) : (
                                  <div>Nenhuma sala encontrada</div>
                                )}
                              </div>
                            </div>
  </DialogContent>

                        </Dialog>

                        )}

                       

                        {typeCod != 'scod' && (
                           <div className="flex gap-3">
                           <Button onClick={() => setLocState(false)} variant="outline" size={'icon'}><X size={16} /></Button>
                             <Button onClick={() => setLocState(true)}  size={'icon'}><Check size={16} /></Button>
                             </div>
                        )}
                       
                        </div>
                      </div>
                     </div>

                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Descrição</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? (localizacao.length > 0 ? localizacao : patrimonio[0].bem_dsc_com) : ''}
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
                    <CardTitle>Informações pessoais</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="flex gap-6 w-full">
                     <div className="grid gap-3 w-2/3">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={user?.display_name}
                          disabled={true}
                          
                        />
                      </div>

                      <div className="grid gap-3 w-1/3">
                        <Label htmlFor="name">Matrícula</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                        
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
                  <div className="grid gap-3 w-full mb-6">
                        <Label htmlFor="name">Email principal</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={user?.email}
                          disabled={true}
                        />
                      </div>
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
                    <Select>
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
        <CardTitle>Imagens do item</CardTitle>
        <CardDescription>
        <Accordion type="single" collapsible>
  <AccordionItem value="item-1" className="border-none">
    <AccordionTrigger className="border-none">Instruções</AccordionTrigger>
    <AccordionContent>
    <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 1</AlertTitle>
                  <AlertDescription>Apenas utilize esta opção se o item não tiver o código ATM ou o número do patrimônio
                  </AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 2</AlertTitle>
                  <AlertDescription>Apenas utilize esta opção se o item não tiver o código ATM ou o número do patrimônio
                  </AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 3</AlertTitle>
                  <AlertDescription>Apenas utilize esta opção se o item não tiver o código ATM ou o número do patrimônio
                  </AlertDescription>
                </Alert>
    </AccordionContent>
  </AccordionItem>
</Accordion>
       
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
         <div>
        {images.length == 0 ? (
          <div className="aspect-square w-full rounded-md object-cover border " >

          </div>
        ):(
          <div className="flex items-center justify-center group">
          <img
           
          className="aspect-square w-full rounded-md object-cover"
          height="300"
          src={images[0] || "/placeholder.svg"}
          width="300"
        />
        <Button onClick={() => handleRemoveImage(0)} variant={'destructive'} className="absolute z-[9] group-hover:flex hidden transition-all" size={'icon'}><Trash size={16}/></Button>
          </div>
        )}
         </div>
          <div className="grid grid-cols-3 gap-2">
            {images.slice(1, 4).map((image, index) => (
              <button key={index}>
              <div className="flex items-center justify-center group">
               <img
                
                className="aspect-square w-full rounded-md object-cover"
                height="84"
                src={image}
                width="84"
              />
                <Button onClick={() => handleRemoveImage(index+1)} variant={'destructive'} className="absolute z-[9] group-hover:flex hidden transition-all" size={'icon'}><Trash size={16}/></Button>
               </div>
             
              </button>
            ))}
            {images.length < 4 && (
              <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload"
                />
                <label htmlFor="upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Upload</span>
                </label>
              </button>
            )}
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