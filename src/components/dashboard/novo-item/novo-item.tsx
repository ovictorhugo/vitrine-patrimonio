import { Link } from "react-router-dom";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { v4 as uuidv4 } from 'uuid';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"

import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Button } from "../../ui/button";
import { Checks, Check, Warning, Wrench, X, Trash, MagnifyingGlass, Funnel  } from "phosphor-react";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ArrowUpRight, ChevronLeft, DollarSign, Upload, ChevronsUpDown, ImageDown, Barcode } from "lucide-react";
import { useModal } from "../../hooks/use-modal-store";

import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../../lib"

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



import { useLocation,useNavigate } from 'react-router-dom';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion"
import { Dialog } from "../../ui/dialog";
import { LinhaTempo } from "../components/linha-tempo";
import { Switch } from "../../ui/switch";

interface NovoItem {
  patrimonio_id:string
  num_patrimonio:string
  loc:string
  observacao:string
  user_id:string
  vitrine:string
  condicao:string
  imagens:string
  desfazimento:boolean
  verificado:boolean
  num_verificacao:string
  codigo_atm:string
  situacao:string
  material:string
}

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
  let BemNumatm = bem_num_atm ?? ''

  const [input, setInput] = useState("");
  const [inputATM, setInputATM] = useState("");
  const [condicao, setCondicao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [relevance, setRelevance] = useState(false);
  const [desfazimento, setDesfazimento] = useState(false);

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
          setLocalizacao(patrimonio[0].loc_nom)
       
        } else {
          toast("Nenhum patrimônio encontrado", {
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

  useEffect(() => {   
   if(localizacao.length == 0 && patrimonio.length > 0) {
    setLocalizacao(patrimonio[0].loc_nom)
   }
      }, [patrimonio]);

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



//enviar 
const newImageNames: string[] = [];

const handleSubmit = async () => {

  const docId = uuidv4();

  try {
    const data = [
      {
        patrimonio_id:docId,
        num_patrimonio:patrimonio[0].bem_cod,
        loc: localizacao ,
        observacao:descricao,
        user_id:user?.user_id,
        vitrine:relevance,
        condicao:condicao,
        imagens:newImageNames,
        desfazimento:desfazimento,
        verificado:false,
        num_verificacao:patrimonio[0].bem_dgv,
        codigo_atm:BemNumatm,
        situacao:'',
        material:''
      
      }
    ]

    console.log(data)

    let urlProgram = urlGeral + '/formulario'


    const fetchData = async () => {
    
     if (condicao == '') {
      toast("Campo 'Nome do programa' vazio", {
        description: "Preencha o campo",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })
     } else if (images.length === 0) {
        toast("Nenhuma imagem selecionada!", {
          description: "Por favor, selecione ao menos uma imagem antes de enviar.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }
     
     else  {
      try {
       
        const response = await fetch(urlProgram, {
          mode: 'cors',
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
         
          toast("Dados enviados com sucesso", {
              description: "Item adicionado ao Vitrine",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

            handleFileUpload(docId)
         
        } else {
          console.error('Erro ao enviar dados para o servidor.');
          toast("Tente novamente!", {
              description: "Tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })
        }
        
      } catch (err) {
        console.log(err);
      } 
     }
    };
    fetchData();


  } catch (error) {
      toast("Erro ao processar requisição", {
          description: "Tente novamente",
          action: {
            label: "Fechar",
            onClick: () => console.log("Undo"),
          },
        })
  }
}

 // Constante para armazenar os nomes gerados
//imagemns

const handleFileUpload = async (id:string) => {
  if (images.length < 4) {
    toast("Você precisa submeter 4 imagens", {
      description: "Em caso de dúvida, acesse as instruções de como tirar as fotos",
      action: {
        label: "Fechar",
        onClick: () => console.log("Fechar"),
      },
    });
    return;
  }

  try {
    const uploadPromises = images.slice(0, 4).map((image, index) => {
      const formData = new FormData();
      const fileName = `${id}`; // Nome único para a imagem
      newImageNames.push(fileName); // Armazena o nome gerado

      // Converter a URL de imagem para Blob
      return fetch(image)
        .then((res) => res.blob())
        .then((blob) => {
          formData.append("file", blob, fileName);

          const urlUpload = `${urlGeral}imagem/${fileName}`;

          return fetch(urlUpload, {
            method: "POST",
            body: formData,
          });
        });
    });

    const responses = await Promise.all(uploadPromises);

    const allSuccessful = responses.every((response) => response.ok);

    if (allSuccessful) {
      toast("Upload realizado com sucesso!", {
        description: "As imagens foram enviadas com sucesso!",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });

      console.log("Novos nomes das imagens:", newImageNames); // Exibe os nomes gerados no console
      setImages([]); // Resetar o estado das imagens após o envio
    } else {
      throw new Error("Nem todas as imagens foram enviadas com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao enviar imagens:", error);
    toast("Erro no envio", {
      description: "Não foi possível enviar as imagens. Tente novamente.",
      action: {
        label: "Fechar",
        onClick: () => console.log("Fechar"),
      },
    });
  }
};


    return(
 
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
                {`${patrimonio[0].bem_cod} - ${patrimonio[0].bem_dgv }`}
              </Badge>
              )}
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button onClick={handleSubmit} size="sm"><Check size={16} />Publicar item</Button>
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
                     <div className="flex items-center gap-3">
                     <Input
                        id="name"
                        type="text"
                        className="w-ful"
                        onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} 
                        value={input}
                      />

                      <Button className="min-w-10" size={'icon'} onClick={onClickBuscaPatrimonio}><Funnel size={16}/></Button>
                     </div>
                    </div>
                     )}

                  {typeCod == 'atm' && (
                      <div className="grid gap-3 w-full">
                      <Label htmlFor="name">Código ATM</Label>
                      <div className="flex items-center gap-3">
                     <Input
                        id="name"
                        type="text"
                        className="w-full"
                        onKeyDown={handleKeyDown} onChange={(e) => setInputATM(e.target.value)} 
                        value={patrimonio.length > 0 ? (`${patrimonio[0].bem_num_atm}`) : inputATM}
                      />
                        <Button className="min-w-10" size={'icon'} onClick={onClickBuscaPatrimonio}><Funnel size={16}/></Button>
                     </div>
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
                          value={patrimonio.length > 0 ? (patrimonio[0].csv_cod == "BM" ? 'Bom': patrimonio[0].csv_cod == 'AE' ? 'Anti-Econômico': patrimonio[0].csv_cod == 'IR' ? 'Irrecuperável': patrimonio[0].csv_cod == 'OC' ? 'Ocioso': patrimonio[0].csv_cod == 'BX' ? 'Baixado': patrimonio[0].csv_cod == 'RE' ? 'Recuperável': ''):''}
                        />
                      </div>

                     
                     </div>

                     <div className="flex gap-6">
                      {(patrimonio.length > 0 && patrimonio[0].bem_val.length > 0) && (
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
                          value={patrimonio.length > 0 ? (patrimonio[0].bem_sta == "NO" ? ('Normal'):('Não encontrado no local de guarda')):''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Localização</Label>
                        <div className="flex gap-3">
                        {locState ? (
                          <Input
                         
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={localizacao}
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
                          value={descricao} onChange={(e) => setDescricao(e.target.value)}
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
                        disabled
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
                          disabled
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
                        disabled
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Ramal</Label>
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
               </div>

               <div className="  flex flex-col md:gap-8 gap-4"  >
                <Alert className="p-0">
                <CardHeader>
                    <CardTitle>Condição do item</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                    <Select value={condicao} onValueChange={(value) => setCondicao(value)}>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Selecione a condição do bem" className={'whitespace-nowrap'} />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="Excelente estado">
                          <div className="flex items-start gap-3 text-muted-foreground ">
                            <Checks className="size-5" />
                            <div className="grid gap-0.5 ">
                              <p>
                              Excelente estado
                              </p>
                              <p className="text-xs" data-description>
                              Como novo. Inclui caixa original e todos os acessórios.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Semi-novo">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Check className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Semi-novo  

                              </p>
                              <p className="text-xs" data-description>
                              Em excelente estado, mas apresenta sinais de uso.

                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Quase novo">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Warning className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                             Quase novo
                              </p>
                              <p className="text-xs" data-description>
                              Funcional, mas falta cabos ou periféricos para uso pleno.

                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Necessita de pequenos reparos">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Wrench className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Necessita de pequenos reparos
                              </p>
                              <p className="text-xs" data-description>
                              Funciona, mas exige reparos que não comprometem totalmente seu uso.

                              </p>
                            </div>
                          </div>
                        </SelectItem>

                        <SelectItem value="Inutilizável">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <X className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Inutilizável
                              </p>
                              <p className="text-xs" data-description>
                              Sem condições de uso
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
                    <CardTitle>Destinação do item</CardTitle>
                    <CardDescription>
                     jsdfgsdfgsdfg
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="">
                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Alocação no Vitrine (sala 4301)</Label>
                        <CardDescription>
                      Caso haja a disponibilidade, gostaria que o item seja guardado na sala física do Vitrine?
                    </CardDescription>
                        <div className="flex gap-2 items-center ">
            <Switch checked={relevance} onCheckedChange={(e) => {
              setRelevance(e)
              setDesfazimento(false)
            }} />
            <p className="text-sm">{relevance ? "Sim, preciso da alocação" : "Não, não preciso"} </p>
          </div>
                      </div>
                    
                    </div>

                    <div className="">
                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Desfazimento</Label>
                        <CardDescription>
                    Este é um item elegível para o desfazimento?
                    </CardDescription>
                        <div className="flex gap-2 items-center ">
            <Switch disabled={relevance} checked={desfazimento} onCheckedChange={(e) => setDesfazimento(e)} />
            <p className="text-sm">{desfazimento ? "Não, não preciso" : "Sim, preciso da alocação"} </p>
          </div>
                      </div>
                    
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
                  <ImageDown className="h-4 w-4" />
                  <AlertTitle>Passo 1</AlertTitle>
                  <AlertDescription>Imagem frontal do patrimônio
                  </AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Barcode className="h-4 w-4" />
                  <AlertTitle>Passo 2</AlertTitle>
                  <AlertDescription>Imagem com a idetificação do item</AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 3</AlertTitle>
                  <AlertDescription>
                    Imagem lateral ou traseira
                  </AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 4</AlertTitle>
                  <AlertDescription>
                    Imagem com detalhe da condição
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
      
    )
}