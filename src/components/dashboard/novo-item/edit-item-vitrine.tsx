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
import { Checks, Check, Warning, Wrench, X, Trash, MagnifyingGlass, Funnel, User  } from "phosphor-react";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ArrowUpRight, ChevronLeft, DollarSign, Upload, ChevronsUpDown, ImageDown, Barcode, Package } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Item } from "../itens-vitrine/itens-vitrine";

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

export function EditItemVitrine() {
  const history = useNavigate();
const {urlGeral, user} = useContext(UserContext)
  const handleVoltar = () => {
    history(-1);
  };

    const queryUrl = useQuery();

  const query = useQuery();
  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');
  const loc_nom = queryUrl.get('loc_nom');

  const [input, setInput] = useState("");
  const newImageNames: string[] = [];
  const docId = uuidv4();
  const BemCodId = Math.floor(10000000 + Math.random() * 90000000).toString();
  const BemDgvId = Math.floor(Math.random() * 9 + 1).toString();

  const handleSubmit = async () => {
  


    try {
      const dataFinal = [{
       
      }]

       let urlProgram = urlGeral + '/formulario'

       const fetchData = async () => {
    
        if (!patrimonio && data.mat_nom.length == 0) {
         toast("Preencha todos os campos antes de enviar", {
           description: "Parece que alguns campos estão vazios",
           action: {
             label: "Fechar",
             onClick: () => console.log("Undo"),
           },
         })
         return;
        } else if (data.condicao.length == 0) {
          toast("Campo 'ondição do item' vazio", {
            description: "Preencha o campo",
            action: {
              label: "Fechar",
              onClick: () => console.log("Undo"),
            },
          })
          return;
         } else if (images.length != 4) {
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
             body: JSON.stringify(dataFinal),
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
               setImages([])
             
              
   
           } else {
             console.error('Erro ao enviar dados para o servidor.');
             toast("Erro ao enviar dados para o servidor.", {
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

    } catch {

    }
  }


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
  

   const [patrimonio, setPatrimonio] = useState<Item>();

   const [data, setData] = useState<Item>({
    codigo_atm: patrimonio?.codigo_atm || '',
    condicao: patrimonio?.condicao || '',
    desfazimento: patrimonio?.desfazimento || false,
    email: patrimonio?.email || '',
    imagens: patrimonio?.imagens || [],
    loc: patrimonio?.loc || '',
    material: patrimonio?.material || '',
    matricula: patrimonio?.matricula || '',
    num_patrimonio: patrimonio?.num_patrimonio || 0,
    num_verificacao: patrimonio?.num_verificacao || 0,
    observacao: patrimonio?.observacao || '',
    patrimonio_id: patrimonio?.patrimonio_id || '',
    phone: patrimonio?.phone || '',
    situacao: patrimonio?.situacao || '',
    u_matricula: patrimonio?.u_matricula || '',
    user_id: patrimonio?.user_id || '',
    verificado: patrimonio?.verificado || false,
    vitrine: patrimonio?.vitrine || false,
    mat_nom: patrimonio?.mat_nom || '',
    bem_cod: patrimonio?.bem_cod || '',
    bem_dgv: patrimonio?.bem_dgv || '',
    bem_dsc_com: patrimonio?.bem_dsc_com || '',
    bem_num_atm: patrimonio?.bem_num_atm || '',
    bem_serie: patrimonio?.bem_serie || '',
    bem_sta: patrimonio?.bem_sta || '',
    bem_val: patrimonio?.bem_val || '',
    csv_cod: patrimonio?.csv_cod || '',
    display_name: patrimonio?.display_name || '',
    ele_cod: patrimonio?.ele_cod || '',
    grp_cod: patrimonio?.grp_cod || '',
    ite_mar: patrimonio?.ite_mar || '',
    ite_mod: patrimonio?.ite_mod || '',
    loc_cod: patrimonio?.loc_cod || '',
    loc_nom: patrimonio?.loc_nom || '',
    mat_cod: patrimonio?.mat_cod || '',
    org_cod: patrimonio?.org_cod || '',
    org_nom: patrimonio?.org_nom || '',
    pes_cod: patrimonio?.pes_cod || '',
    pes_nome: patrimonio?.pes_nome || '',
    sbe_cod: patrimonio?.sbe_cod || '',
    set_cod: patrimonio?.set_cod || '',
    set_nom: patrimonio?.set_nom || '',
    tgr_cod: patrimonio?.tgr_cod || '',
    tre_cod: patrimonio?.tre_cod || '',
    uge_cod: patrimonio?.uge_cod || '',
    uge_nom: patrimonio?.uge_nom || '',
    uge_siaf: patrimonio?.uge_siaf || '',
    qtd_de_favorito: patrimonio?.qtd_de_favorito || '',
    estado_transferencia: patrimonio?.estado_transferencia || '',
    created_at: patrimonio?.created_at || ''
  });
  


let url = urlGeral + `formulario?user_id=&loc=&verificado=&patrimonio_id=`

console.log(url)

const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(url, {
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
        setPatrimonio(data[0]);
        console.log('oi',patrimonio)
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  fetchData();

  console.log('oi',patrimonio)
}, [url, terms]);

useEffect(() => {
  if (patrimonio) {
    setData({
      ...patrimonio,
      loc_nom: loc_nom || patrimonio.loc_nom, // Se loc_nom existir, usa ele; senão, usa o do patrimônio
    });
  }
}, [patrimonio, loc_nom]);

const conectee = import.meta.env.VITE_BACKEND_CONECTEE || ''
    
  const {onOpen} = useModal()

  const handleChange = (field: keyof Patrimonio, value: string) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };




  ////imagem

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  const emptyPatrimonio: Patrimonio = {
    bem_cod: '',
    bem_dgv: '',
    bem_num_atm: '',
    csv_cod: '',
    bem_serie: '',
    bem_sta: '',
    bem_val: '',
    tre_cod: '',
    bem_dsc_com: '',
    uge_cod: '',
    uge_nom: '',
    org_cod: '',
    uge_siaf: '',
    org_nom: '',
    set_cod: '',
    set_nom: '',
    loc_cod: '',
    loc_nom: '',
    ite_mar: '',
    ite_mod: '',
    tgr_cod: '',
    grp_cod: '',
    ele_cod: '',
    sbe_cod: '',
    mat_cod: '',
    mat_nom: '',
    pes_cod: '',
    pes_nome: '',
  };
  

    return(
 
            <main  className="flex flex-1 flex-col gap-8 p-4 md:p-8 md:pb-0">
         <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Adicionar novo item
              </h1>

              {data.bem_cod && (
                <Badge variant="outline" className="ml-auto sm:ml-0">
                {`${data.bem_cod.trim()} - ${data.bem_dgv }`}
              </Badge>
              )}


                <Badge variant="outline" className={`ml-auto sm:ml-0 ${dataPatrimonio.desfazimento ? ('bg-red-600 text-white'):('bg-eng-blue text-white')}`}>
                {data.desfazimento ? ('Desfazimento'):('Anunciar na Vitrine')}
              </Badge>
          
             
              <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">
              
                <Button onClick={() => {
                 handleSubmit()
                 
                }} ><Check size={16} />Atualizar item</Button>
              </div>
            </div>

            </div>

            <div className="grid pb-8 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2  flex flex-col md:gap-8 gap-4"  >
            <Alert  className="p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader>
                    <div className="flex justify-between">
                    <div>
                    <CardTitle>Detalhes do item</CardTitle>
                    <CardDescription>
                     Adicione as informações básicas do patrimônio
                    </CardDescription>
                    </div>

                    <div className="flex gap-3 items-center">
                   

                      <Button   onClick={() => onOpen('search-cod-atm')}><Package size={16}/>Cadastrar patrimônio</Button>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                  <div className="flex flex-col gap-4">
                  <div className={`flex gap-4 w-full flex-col lg:flex-row `}>

                        {/* Código */}
                {(data.bem_cod != '') && (
                    <div className="grid gap-3 w-full">
                    <Label htmlFor="name">Código</Label>
                   <div className="flex items-center gap-3">
                   <Input
                  id="bem_cod"
                  type="text"
                  className="w-full"
                  value={data.bem_cod}
                  disabled={data.bem_cod !== ""}
                  onChange={(e) => handleChange('bem_cod', e.target.value)}
                />
                   </div>
                  </div>
                )}


                    {/* Dígito Verificador */}
                    {(data.bem_cod != '') && (
                       <div className="grid gap-3 w-full">
                       <Label htmlFor="bem_dgv">Díg. Verificador</Label>
                       <div className="flex items-center gap-3">
                         <Input
                           id="bem_dgv"
                           type="text"
                           className="w-full"
                           value={data.bem_dgv}
                           disabled={data.bem_dgv !== ""}
                           onChange={(e) => handleChange('bem_dgv', e.target.value)}
                         />
                       </div>
                     </div>
                    )}
     

      
      {/* Número ATM */}
     {(data.bem_num_atm != 'None' && data.bem_num_atm != '') && (
       <div className="grid gap-3 w-full">
       <Label htmlFor="bem_num_atm">Número ATM</Label>
       <div className="flex items-center gap-3">
         <Input
           id="bem_num_atm"
           type="text"
           className="w-full"
           value={data.bem_num_atm}
           disabled={data.bem_num_atm !== ""}
           onChange={(e) => handleChange('bem_num_atm', e.target.value)}
         />
       </div>
     </div>
     )}

     {/* Código CSV */}
     <div className="grid gap-3 w-full">
        <Label htmlFor="mat_nom">Material</Label>
        <div className="flex items-center gap-3">
          <Input
            id="mat_nom"
            type="text"
            className="w-full"
            value={data.mat_nom}
            disabled={!!patrimonio}
            onChange={(e) => handleChange('mat_nom', e.target.value)}
          />
        </div>
      </div>

                  </div>

                  <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
 
  {/* Código CSV */}
  <div className="grid gap-3 w-full">
  <Label htmlFor="bem_sta">Situação</Label>
  <div className="flex items-center gap-3">
    <Select
      value={data.bem_sta || ""}
      onValueChange={(value) => handleChange('bem_sta', value)}
      disabled={!!patrimonio}
    >
      <SelectTrigger id="bem_sta" className="w-full">
        <SelectValue  />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NO">Normal</SelectItem>
        <SelectItem value="NI">Não inventariado</SelectItem>
        <SelectItem value="CA">Cadastrado</SelectItem>
        <SelectItem value="TS">Aguardando aceite</SelectItem>
        <SelectItem value="MV">Movimentado</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

{/* Código CSV */}
<div className="grid gap-3 w-full">
  <Label htmlFor="csv_cod">Estado de conservação</Label>
  <div className="flex items-center gap-3">
    <Select
      value={data.csv_cod || ""}
      onValueChange={(value) => handleChange('csv_cod', value)}
      disabled={!!patrimonio}
    >
      <SelectTrigger id="csv_cod" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BM">Bom</SelectItem>
        <SelectItem value="AE">Anti-Econômico</SelectItem>
        <SelectItem value="IR">Irrecuperável</SelectItem>
        <SelectItem value="OC">Ocioso</SelectItem>
        <SelectItem value="RE">Recuperável</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

      {/* Valor */}
      <div className="grid gap-3 w-full">
        <Label htmlFor="bem_val">Valor</Label>
        <div className="flex items-center gap-3">
          <Input
            id="bem_val"
            type="text"
            className="w-full"
            value={data.bem_val}
            disabled={!!patrimonio}
            onChange={(e) => handleChange('bem_val', e.target.value)}
          />
        </div>
      </div>

        {/* Código TRE */}
       {data.tre_cod && (
         <div className="grid gap-3 w-full">
         <Label htmlFor="tre_cod">Termo de resp.</Label>
         <div className="flex items-center gap-3">
           <Input
             id="tre_cod"
             type="text"
             className="w-full"
             value={data.tre_cod}
             disabled={data.tre_cod !== ""}
             onChange={(e) => handleChange('tre_cod', e.target.value)}
           />
         </div>
       </div>
       )}

      
                  </div>

                   {/* Código TRE */}
                   <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
                   <div className="grid gap-3 w-full">
        <Label htmlFor="tre_cod">Unidade geral</Label>
        <div className="flex items-center gap-3">
          <Input
            id="uge_nom"
            type="text"
            className="w-full"
            value={data.uge_nom}
           
         onClick={() => onOpen('search-loc-nom')}
            onChange={(e) => handleChange('uge_nom', e.target.value)}
          />
          
        </div>
      </div>


      <div className="grid gap-3 w-full">
        <Label htmlFor="tre_cod">Setor de guarda</Label>
        <div className="flex items-center gap-3">
          <Input
            id="loc_nom"
            type="text"
            className="w-full"
            value={data.set_nom}
           
         onClick={() => onOpen('search-loc-nom')}
            onChange={(e) => handleChange('loc_nom', e.target.value)}
          />
          
        </div>
      </div>

        <div className="grid gap-3 w-full">
        <Label htmlFor="tre_cod">Local de guarda</Label>
        <div className="flex items-center gap-3">
          <Input
            id="loc_nom"
            type="text"
            className="w-full"
            value={data.loc_nom}
           
         onClick={() => onOpen('search-loc-nom')}
            onChange={(e) => handleChange('loc_nom', e.target.value)}
          />
          
        </div>
      </div>

                    {/* Descrição Completa */}
                   
      </div>

                   {/* Descrição Completa */}
      <div className="grid gap-3 w-full">
        <Label htmlFor="bem_dsc_com">Descrição </Label>
        <div className="flex items-center gap-3">
          <Input
            id="bem_dsc_com"
         type="text"
            className="w-full"
            value={data.bem_dsc_com}
            disabled={!!patrimonio}
            onChange={(e) => handleChange('bem_dsc_com', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 w-full">
        <Label htmlFor="pes_nome">Responsável (nome completo)</Label>
        <div className="flex items-center gap-3">
       {data.pes_nome && (
         <Avatar className=" rounded-md  h-10 w-10 border dark:border-neutral-800">
         <AvatarImage className={'rounded-md h-10 w-10'} src={`${conectee}ResearcherData/Image?name=${data.pes_nome}`} />
         <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
       </Avatar>
       )}
          <Input
            id="pes_nome"
         type="text"
            className="w-full"
            value={data.pes_nome}
            disabled={!!patrimonio}
            onChange={(e) => handleChange('pes_nome', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 w-full">
        <Label htmlFor="observacao">Observações</Label>
        <div className="flex items-center gap-3">
          <Textarea
            id="observacao"
            className="w-full"
            value={data.observacao}
            onChange={(e) => handleChange('observacao', e.target.value)}
          />
        </div>
      </div>



                  </div>
                  </CardContent>
            </Alert>


            <Alert>
                  <CardHeader>
                    <CardTitle>Informações pessoais</CardTitle>
                    <CardDescription>
                    Dados básicos do usuário registrados no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="flex flex-col gap-4">
                  <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
                  <div className="grid gap-3 w-full">
        <Label htmlFor="tre_cod">Nome completo</Label>
        <div className="flex items-center gap-3">
          <Input
            id="loc_nom"
            type="text"
            className="w-full"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          
        </div>
      </div>

      <div className="grid gap-3 w-full">
        <Label htmlFor="tre_cod">Matrícula</Label>
        <div className="flex items-center gap-3">
          <Input
            id="loc_nom"
            type="text"
            className="w-full"
            value={data.matricula}
            disabled={true}
            onChange={(e) => handleChange('matricula', e.target.value)}
          />
          
        </div>
      </div>
                  </div>
                  </div>
                    </CardContent>
                    </Alert>

                    <Alert>
                  <CardHeader>
                    <CardTitle>Informações de contato</CardTitle>
                    <CardDescription>
                    Detalhes para comunicação 
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="flex flex-col gap-4">
                  <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
                  <div className="grid gap-3 w-full mb-6">
                        <Label htmlFor="name">Email</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={data.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </div>

                      <div className="grid gap-3 w-full mb-6">
                        <Label htmlFor="name">Telefone</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={true}
                          value={data.tel}
                          onChange={(e) => handleChange('telefone', e.target.value)}
                        />
                      </div>

                      
                      <div className="grid gap-3 w-full mb-6">
                        <Label htmlFor="name">Ramal</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={data.ramal}
                          disabled={true}
                          onChange={(e) => handleChange('ramal', e.target.value)}
                        />
                      </div>
                    </div>
                    </div>
                    </CardContent>
                    </Alert>
            </div>

            <div className="  flex flex-col md:gap-8 gap-4"  >
            <Alert className="p-0">
                <CardHeader>
                    <CardTitle>Destinação</CardTitle>
                    <CardDescription>
                    Status e destino atual do item
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="grid gap-3 w-full">
        <Label htmlFor="bem_dgv">Condição do item</Label>
        <div className="flex items-center gap-3">
        <Select 
                   value={data.condicao || ""}
                   onValueChange={(value) => handleChange('condicao', value)}
                   >
  <SelectTrigger
    id="model"
    className="items-start [&_[data-description]]:hidden"
  >
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Excelente estado">
      <div className="flex items-start gap-3 text-muted-foreground">
        <Checks className="size-5 " />
        <div className="grid gap-0.5">
          <p className="font-medium whitespace-nowrap">Excelente estado</p>
          <p className="text-xs text-muted-foreground" data-description>
            Como novo. Com caixa original e todos os acessórios.
          </p>
        </div>
      </div>
    </SelectItem>
    <SelectItem value="Semi-novo">
      <div className="flex items-start gap-3 text-muted-foreground">
        <Check className="size-5 " />
        <div className="grid gap-0.5">
          <p className="font-medium whitespace-nowrap">Semi-novo</p>
          <p className="text-xs text-muted-foreground" data-description>
            Excelente estado, com leves sinais de uso.
          </p>
        </div>
      </div>
    </SelectItem>
    <SelectItem value="Quase novo">
      <div className="flex items-start gap-3 text-muted-foreground">
        <Warning className="size-5 " />
        <div className="grid gap-0.5">
          <p className="font-medium whitespace-nowrap">Quase novo</p>
          <p className="text-xs text-muted-foreground" data-description>
            Funciona bem, mas sem cabos ou periféricos.
          </p>
        </div>
      </div>
    </SelectItem>
    <SelectItem value="Necessita de pequenos reparos">
      <div className="flex items-start gap-3 text-muted-foreground">
        <Wrench className="size-5 " />
        <div className="grid gap-0.5">
          <p className="font-medium whitespace-nowrap">Pequenos reparos</p>
          <p className="text-xs text-muted-foreground" data-description>
            Funcional, mas precisa de manutenção leve.
          </p>
        </div>
      </div>
    </SelectItem>
    <SelectItem value="Inutilizável">
      <div className="flex items-start gap-3 text-muted-foreground">
        <X className="size-5 text-destructive" />
        <div className="grid gap-0.5">
          <p className="font-medium whitespace-nowrap">Inutilizável</p>
          <p className="text-xs text-muted-foreground" data-description>
            Sem condições de uso ou recuperação.
          </p>
        </div>
      </div>
    </SelectItem>
  </SelectContent>
</Select>
        </div>
      </div>
                 

<div className="flex gap-4 items-center justify-between mt-4">
  <div className="flex flex-col">
    <p className="text-sm font-medium">
      {data.desfazimento
        ? "Este item será destinado ao desfazimento."
        : "Este item será anunciado na Vitrine."}
    </p>
    <p className="text-xs text-muted-foreground">
      Use o botão ao lado para alterar a destinação do item.
    </p>
  </div>
  <Switch
    checked={data.desfazimento}
    onCheckedChange={(e) => handleChange('desfazimento', e)}
  />
</div>

                    </CardContent>
                    </Alert>


                    
                <Alert className="p-0">
      <CardHeader>
        <CardTitle>Imagens do item</CardTitle>
        <CardDescription>
        <Accordion type="single" collapsible>
  <AccordionItem value="item-1" className="border-none">
    <AccordionTrigger className="border-none p-0">Instruções</AccordionTrigger>
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