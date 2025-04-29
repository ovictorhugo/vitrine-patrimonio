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

  const handleSubmit = async () => {

  }

   const [patrimonio, setPatrimonio] = useState<Patrimonio>();

   const [data, setData] = useState<Patrimonio>({
    bem_cod: patrimonio?.bem_cod || '',
    bem_dgv: patrimonio?.bem_dgv || '',
    bem_num_atm: patrimonio?.bem_num_atm || '',
    csv_cod: patrimonio?.csv_cod || '',
    bem_serie: patrimonio?.bem_serie || '',
    bem_sta: patrimonio?.bem_sta || '',
    bem_val: patrimonio?.bem_val || '',
    tre_cod: patrimonio?.tre_cod || '',
    bem_dsc_com: patrimonio?.bem_dsc_com || '',
    uge_cod: patrimonio?.uge_cod || '',
    uge_nom: patrimonio?.uge_nom || '',
    org_cod: patrimonio?.org_cod || '',
    uge_siaf: patrimonio?.uge_siaf || '',
    org_nom: patrimonio?.org_nom || '',
    set_cod: patrimonio?.set_cod || '',
    set_nom: patrimonio?.set_nom || '',
    loc_cod: patrimonio?.loc_cod || '',
    loc_nom: loc_nom || patrimonio?.loc_nom || '',
    ite_mar: patrimonio?.ite_mar || '',
    ite_mod: patrimonio?.ite_mod || '',
    tgr_cod: patrimonio?.tgr_cod || '',
    grp_cod: patrimonio?.grp_cod || '',
    ele_cod: patrimonio?.ele_cod || '',
    sbe_cod: patrimonio?.sbe_cod || '',
    mat_cod: patrimonio?.mat_cod || '',
    mat_nom: patrimonio?.mat_nom || '',
    pes_cod: patrimonio?.pes_cod || '',
    pes_nome: patrimonio?.pes_nome || '',
  });

  const [dataUser, setDataUser] = useState<any>({
    name: user?.display_name|| '',
    matricula: user?.matricula || '',
    email: user?.email || '',
    tel: user?.telephone || '',
    ramal: user?.ramal || ''
  })

  const [dataPatrimonio, setDataPatrimonio] = useState<any>({
    condicao:'',
    descricao: '',
    alocacao: false,
    desfazimento:false
  })
  
let url = urlGeral + ``

if(terms != undefined) {
  if (type_search == 'atm') {
    url = urlGeral + `checkoutPatrimonio?bem_num_atm=${terms}`
    } else if (type_search == 'cod') {
      url = urlGeral + `checkoutPatrimonio?etiqueta=${terms}`
      }
}

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


  const {onOpen} = useModal()

  const handleChange = (field: keyof Patrimonio, value: string) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeUser = (field: keyof any, value: string) => {
    setDataUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePatrimonio = (field: keyof any, value: any) => {
    setDataPatrimonio((prev) => ({
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
             
              <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">
                <Button onClick={() => {

                }} variant="outline" >
                <Trash size={16}/> Descartar
                </Button>
                <Button onClick={handleSubmit} ><Check size={16} />Publicar item</Button>
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


                    {/* Dígito Verificador */}
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
            disabled={data.mat_nom !== ""}
            onChange={(e) => handleChange('mat_nom', e.target.value)}
          />
        </div>
      </div>

                  </div>

                  <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
 
  {/* Código CSV */}
  <div className="grid gap-3 w-full">
  <Label htmlFor="csv_cod">Estado de conservação</Label>
  <div className="flex items-center gap-3">
    <Select
      value={data.csv_cod || ""}
      onValueChange={(value) => handleChange('csv_cod', value)}
      disabled={data.csv_cod !== ""}
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


 {/* Status */}
 <div className="grid gap-3 w-full">
  <Label htmlFor="bem_sta">Situação</Label>
  <div className="flex items-center gap-3">
    <Select
      value={data.bem_sta || ""}
      onValueChange={(value) => handleChange('bem_sta', value)}
      disabled={data.bem_sta !== ""}
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
        <SelectItem value="BX">Baixado</SelectItem>
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
            disabled={data.bem_val !== ""}
            onChange={(e) => handleChange('bem_val', e.target.value)}
          />
        </div>
      </div>

        {/* Código TRE */}
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

      
                  </div>

                   {/* Código TRE */}
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
      <div className="grid gap-3 w-full">
        <Label htmlFor="bem_dsc_com">Descrição </Label>
        <div className="flex items-center gap-3">
          <Input
            id="bem_dsc_com"
         type="text"
            className="w-full"
            value={data.bem_dsc_com}
            disabled={data.bem_dsc_com !== ""}
            onChange={(e) => handleChange('bem_dsc_com', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 w-full">
        <Label htmlFor="observacao">Observações</Label>
        <div className="flex items-center gap-3">
          <Textarea
            id="observacao"
            className="w-full"
            value={dataPatrimonio.observacao}
            onChange={(e) => handleChangePatrimonio('observacao', e.target.value)}
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
                      Lipsum dolor sit amet, consectetur adipiscing elit
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
            value={dataUser.name}
            onChange={(e) => handleChangeUser('name', e.target.value)}
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
            value={dataUser.name}
            onChange={(e) => handleChangeUser('matricula', e.target.value)}
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
                      Lipsum dolor sit amet, consectetur adipiscing elit
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
                          value={dataUser.email}
                          onChange={(e) => handleChangeUser('email', e.target.value)}
                        />
                      </div>

                      <div className="grid gap-3 w-full mb-6">
                        <Label htmlFor="name">Telefone</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={dataUser.tel}
                          onChange={(e) => handleChangeUser('telefone', e.target.value)}
                        />
                      </div>

                      
                      <div className="grid gap-3 w-full mb-6">
                        <Label htmlFor="name">Ramal</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={dataUser.ramal}
                          onChange={(e) => handleChangeUser('ramal', e.target.value)}
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
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="grid gap-3 w-full">
        <Label htmlFor="bem_dgv">Condição do item</Label>
        <div className="flex items-center gap-3">
        <Select 
                   value={dataPatrimonio.condicao || ""}
                   onValueChange={(value) => handleChangePatrimonio('condicao', value)}
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
      {dataPatrimonio.desfazimento
        ? "Este item será destinado ao desfazimento."
        : "Este item será anunciado na Vitrine."}
    </p>
    <p className="text-xs text-muted-foreground">
      Use o botão ao lado para alterar a destinação do item.
    </p>
  </div>
  <Switch
    checked={dataPatrimonio.desfazimento}
    onCheckedChange={(e) => handleChangePatrimonio('desfazimento', e)}
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