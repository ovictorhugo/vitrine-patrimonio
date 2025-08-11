import { Alert } from "../../ui/alert";
import { Helmet } from "react-helmet";
import { Button } from "../../ui/button";
import { ArrowLeft, ArrowRight,  Barcode,  Camera, Check, ChevronLeft, FormInput, Image, ImageDown, PanelRightOpen, Play, Plus, RefreshCcw, RotateCcw, ScanEye, Search, Trash, Upload, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BreadcrumbHeader } from "../../breadcrumb-header";
import { BreadcrumbHeaderCustom } from "../../breadcrumb-header-custom";
import { Tabs, TabsContent } from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { SelectTypeNewItem } from "../../search/select-type-new-item";
import { Input } from "../../ui/input";
import { UserContext } from "../../../context/context";
import { PatrimoniosSelecionados } from "../../../App";
import { useModal } from "../../hooks/use-modal-store";
import { useQuery } from "../../modal/search-modal-patrimonio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";
import { ArrowUUpLeft } from "phosphor-react";
import { Separator } from "../../ui/separator";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { SearchBarNewItem } from "./search-bar";

interface Patrimonio {
  asset_code: string;
  asset_check_digit: string;
  atm_number: string;
  serial_number: string;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string;
  item_model: string;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  id: string;
  agency: {
    agency_name: string;
    agency_code: string;
    id: string;
  };
  unit: {
    unit_name: string;
    unit_code: string;
    unit_siaf: string;
    id: string;
  };
  sector: {
    sector_name: string;
    sector_code: string;
    id: string;
  };
  location: {
    location_code: string;
    location_name: string;
    id: string;
  };
  material: {
    material_code: string;
    material_name: string;
    id: string;
  };
  legal_guardian: {
    legal_guardians_code: string;
    legal_guardians_name: string;
    id: string;
  };
  is_official: boolean;
}

export function NovoItem() {
   const location = useLocation();
    const navigate = useNavigate();

   const handleVoltar = () => {

    const currentPath = location.pathname;
    const hasQueryParams = location.search.length > 0;
    
    if (hasQueryParams) {
      // Se tem query parameters, remove apenas eles
      navigate(currentPath);
    } else {
      // Se não tem query parameters, remove o último segmento do path
      const pathSegments = currentPath.split('/').filter(segment => segment !== '');
      
      if (pathSegments.length > 1) {
        pathSegments.pop();
        const previousPath = '/' + pathSegments.join('/');
        navigate(previousPath);
      } else {
        // Se estiver na raiz ou com apenas um segmento, vai para raiz
        navigate('/');
      }
    }
  };


  const [tab, setTab] = useState('1')

  const [value, setValue] = useState<string>("nao");

  const hasPlaqueta = value === "sim";

  const {} = useContext(UserContext)

      const queryUrl = useQuery();

  const query = useQuery();

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');
  const loc_nom = queryUrl.get('loc_nom');

  const [itemType, setItemType] = useState('cod')
    const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] = useState<PatrimoniosSelecionados[]>([])

     useEffect(() => {
            if (terms) {
              const termList: PatrimoniosSelecionados[] = terms
                .split(';')
                .filter(t => t.trim() !== '')
                .map(t => ({
                  term: t.trim(),
                  type: itemType
                }));
            
              setItensSelecionadosPopUp(termList);
            }
          }, [terms]);

           const handleRemoveItem = (index: number) => {
     queryUrl.delete("terms");
  queryUrl.delete("type_search");
            const newItems = [...itemsSelecionadosPopUp];
    newItems.splice(index, 1);
    setItensSelecionadosPopUp(newItems);

     navigate({
    pathname: location.pathname,
    search: queryUrl.toString(),
  });
    
  };

    const {onOpen} = useModal()

     ////imagem

 const [images, setImages] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
 const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
 const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.createRef<HTMLInputElement>();

  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) {
        throw new Error("No files selected");
      }

      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      const availableSlots = Math.max(4 - images.length, 0);
      const imagesToAdd = newImages.slice(0, availableSlots);

      setImages(prevImages => [...prevImages, ...imagesToAdd]);
      setShowUploadDialog(false);
    } catch (error) {
  const errorAsError = error as Error;
  console.error("Error during file upload:", errorAsError);
  toast("Erro ao carregar arquivo", {
    description: errorAsError.message,
    action: {
      label: "Fechar",
      onClick: () => console.log("Fechar"),
    },
  });
}
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId);
      }
    } catch (error) {
      console.error('Erro ao obter câmeras:', error);
    }
  };

  const startCamera = async () => {
    try {
      // Stop the existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Define constraints for the camera
      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Request the camera stream
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      // Set the video source if ref is available
      if (videoRef.current) {
  (videoRef.current as HTMLVideoElement).srcObject = newStream;
} else {
        console.warn('videoRef is null or undefined');
      }
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current as HTMLVideoElement;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
    
    const ctx = (canvasRef.current as HTMLCanvasElement).getContext('2d');
ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(photoDataUrl);
      setShowPhotoPreview(true);
      // Para com delay de 200ms para transição suave
setTimeout(() => stopCamera(), 200);
stopCamera();
if (videoRef.current) {
  (videoRef.current as HTMLVideoElement).srcObject = null;
}
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      setImages(prevImages => [...prevImages, capturedPhoto]);
      setCapturedPhoto(null);
      setShowPhotoPreview(false);
      setShowCameraDialog(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
    startCamera();
  };

  const openUploadDialog = () => {
    setShowUploadDialog(true);
  };

  const openCameraDialog = async () => {
    setShowUploadDialog(false);
    await getCameras();
    setShowCameraDialog(true);
    setTimeout(() => startCamera(), 500);
  };

  const closeCameraDialog = () => {
    stopCamera();
    setShowCameraDialog(false);
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
  };

  const openFileDialog = () => {
    setShowUploadDialog(false);
    fileInputRef.current?.click();
  };


  //formulario

   const [patrimonio, setPatrimonio] = useState<Patrimonio>();
  

  const [data, setData] = useState<any>({
   bem_cod: patrimonio?.asset_code || "",
  bem_dgv: patrimonio?.asset_check_digit || "",
  bem_num_atm: patrimonio?.atm_number || "",
  bem_serie: patrimonio?.serial_number || "",
  bem_sta: patrimonio?.asset_status || "",
  bem_val: patrimonio?.asset_value || "",
  bem_dsc_com: patrimonio?.asset_description || "",
  csv_cod: patrimonio?.csv_code || "",
  tre_cod: patrimonio?.accounting_entry_code || "",
  agency_id: patrimonio?.agency?.id || "",
  unit_id: patrimonio?.unit?.id || "",
  sector_id: patrimonio?.sector?.id || "",
  location_id: patrimonio?.location?.id || "",
  material_id: patrimonio?.material?.id || "",
  legal_guardian_id: patrimonio?.legal_guardian?.id || "",
  ite_mar: patrimonio?.item_brand || "",
  ite_mod: patrimonio?.item_model || "",
  tgr_cod: patrimonio?.group_type_code || "",
  grp_cod: patrimonio?.group_code || "",
  ele_cod: patrimonio?.expense_element_code || "",
  sbe_cod: patrimonio?.subelement_code || ""
});

  const handleChange = (field: any, value: string) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  return(
     <div className="p-4  md:p-8 gap-8 flex flex-col  h-full">
      <Helmet>
              <title>
                Cadastrar novo item | Vitrine Patrimônio
              </title>
              <meta name="description" content={`Cadastrar novo item | Vitrine Patrimônio`} />
              <meta name="robots" content="index, follow" />
            </Helmet>
      <Progress className="absolute top-0 left-0 rounded-b-none rounded-t-lg h-1" value={33} />
       <main className="flex flex-1 h-full lg:flex-row flex-col-reverse  gap-8 ">
       
        <div className="w-full flex flex-col gap-8">
          <BreadcrumbHeaderCustom/>
          <div className="flex gap-2">
             <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7 ">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Voltar</span>
                    </Button>

                     <div
                      className="
                        flex flex-col gap-4

                        md:flex-col

                        lg:flex-row
                      "
                    >
                      <h1 className="flex-1 shrink-0  whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Cadastrar novo item
        
      </h1>
      </div>
          </div>


        <Tabs defaultValue="1" value={tab} className="grid grid-cols-1 h-full w-full">
            <TabsContent value="1" className="m-0">
             <div className="h-full m-0 flex flex-col w-full justify-between">
              <div className="flex flex-1 flex-col">
               <h1 className="mb-16 text-4xl font-medium max-w-[700px]">
                Vamos começar, o item possui plaqueta de identificação?
                </h1>

                <div className="flex gap-2">
 <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => setValue(val)}
      className="gap-2"
      variant={'outline'}
    >
      <ToggleGroupItem value="sim" aria-label="Sim, possui plaqueta">
        Sim, possui plaqueta
      </ToggleGroupItem>
      <ToggleGroupItem value="nao" aria-label="Não tem plaqueta">
        Não, terei que cadastrar manualmente
      </ToggleGroupItem>
    </ToggleGroup>
                </div>
             </div>

                <div className="flex  items-center justify-between">
<div className="flex items-start gap-0 flex-col">
                      <p className="text-sm">Se já cadastrou algum item, você pode</p>
                    <Link to={''}>  <Button variant={'link'} className="text-eng-blue p-0 h-fit">acessar o painel</Button></Link>
</div>

                    <div className="flex gap-2 items-center">
                      <Button size={'lg'} onClick={() => setTab('2')}>Continuar <ArrowRight size={16}/></Button>
                    </div>
                </div>
             </div>
          </TabsContent>


          <TabsContent value="2" className="m-0">
             <div className="h-full m-0 flex flex-col w-full justify-between">
             <div className="flex flex-1 flex-col">
               <h1 className="mb-16 text-4xl font-medium max-w-[700px]">
              Antes de continuar, atenha-se as informações
                </h1>

                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <FormInput size={24}/>
                    <div>
                      <p className="font-medium">Lorem Ipsum\defwef</p>
                      <p className="text-gray-500 text-sm">import must precede all other statements (besides @charset or empty @layer)</p>
                    </div>
                  </div>
                </div>
             </div>

                <div className="flex  items-center justify-between">
<div className="flex gap-2 items-center">
                        <Button size={'lg'} onClick={() => setTab('1')} variant={'ghost'} className="text-eng-blue hover:text-eng-dark-blue"><ArrowLeft size={16}/>Anterior</Button>
</div>

                    <div className="flex gap-2 items-center">
                      <Button size={'lg'} onClick={() => {
                        if(value == 'sim') {
                          setTab('3')
                        } else {
                          setTab('4')
                        }
                      }}>Continuar <ArrowRight size={16}/></Button>
                    </div>
                </div>
                </div>
          </TabsContent>


           <TabsContent value="3" className="m-0">
             <div className="h-full m-0 flex flex-col w-full justify-between">
             <div className="flex flex-1 flex-col">
               <h1 className=" text-4xl font-medium max-w-[700px]">
             Digite o número de patrimônio para que possamos encontrar o item
                </h1>

                <Separator className="my-8"/>

                <div className="flex gap-2 flex-col">
                 <SearchBarNewItem/>
                </div>
             </div>

                <div className="flex  items-center justify-between">
<div className="flex gap-2 items-center">
                        <Button size={'lg'} onClick={() => setTab('4')} variant={'ghost'} className="text-eng-blue hover:text-eng-dark-blue"><ArrowLeft size={16}/>Anterior</Button>
</div>

                    <div className="flex gap-2 items-center">
                      <Button size={'lg'} onClick={() => {
                        setTab('4')
                      }}>Continuar <ArrowRight size={16}/></Button>
                    </div>
                </div>
                </div>
          </TabsContent>

            <TabsContent value="4" className="m-0">
             <div className="h-full m-0 flex flex-col w-full justify-between">
              <div className="flex flex-1 flex-col">
               <h1 className="mb-16 text-4xl font-medium max-w-[700px]">
                Vamos começar, o item possui plaqueta de identificação?
                </h1>

                <div className="flex gap-2">
 
                </div>
             </div>

                <div className="flex  items-center justify-between">
<div className="flex items-start gap-0 flex-col">
                      <p className="text-sm">Se já cadastrou algum item, você pode</p>
                    <Link to={''}>  <Button variant={'link'} className="text-eng-blue p-0 h-fit">acessar o painel</Button></Link>
</div>

                    <div className="flex gap-2 items-center">
                      <Button size={'lg'} onClick={() => setTab('5')}>Continuar <ArrowRight size={16}/></Button>
                    </div>
                </div>
             </div>
          </TabsContent>

          
            <TabsContent value="5" className="m-0">
             <div className="h-full m-0 flex flex-col w-full justify-between">
              <div className="flex flex-1 flex-col">
               <h1 className=" text-4xl font-medium max-w-[700px]">
              Adicione as informações de patrimônio
                </h1>

                    <Separator className="my-8"/>

                <div className="flex gap-2 w-full">
   <div className="flex flex-col gap-4 w-full mb-8">
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
         <AvatarImage className={'rounded-md h-10 w-10'} src={`ResearcherData/Image?name=${data.pes_nome}`} />
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
                  </div>
                </div>
             </div>

                <div className="flex  items-center justify-between">
<div className="flex items-start gap-0 flex-col">
                      <p className="text-sm">Se já cadastrou algum item, você pode</p>
                    <Link to={''}>  <Button variant={'link'} className="text-eng-blue p-0 h-fit">acessar o painel</Button></Link>
</div>

                    <div className="flex gap-2 items-center">
                      <Button size={'lg'} onClick={() => setTab('6')}>Continuar <ArrowRight size={16}/></Button>
                    </div>
                </div>
             </div>
          </TabsContent>


          
            <TabsContent value="6" className="m-0">
             <div className="h-full m-0 flex flex-col w-full justify-between">
              <div className="flex flex-1 flex-col">
               <h1 className=" text-4xl font-medium max-w-[600px]">
               Estamos finalizando, insira as fotos do patrimônio
                </h1>

                <Separator className="my-8"/>

                 <div className="grid md:grid-cols-2 grid-cols-1 gap-8 flex-col mb-8">
                  <div className="flex gap-2">
                    <ImageDown size={24}/>
                    <div>
                      <p className="font-medium">Passo 1</p>
                      <p className="text-gray-500 text-sm">Imagem frontal do patrimônio</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Barcode size={24}/>
                    <div>
                      <p className="font-medium">Passo 2</p>
                      <p className="text-gray-500 text-sm">Imagem com a idetificação do item (caso houver)</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <PanelRightOpen size={24}/>
                    <div>
                      <p className="font-medium">Passo 3</p>
                      <p className="text-gray-500 text-sm">Imagem lateral ou traseira</p>
                    </div>
                  </div>

                   <div className="flex gap-2">
                    <ScanEye size={24}/>
                    <div>
                      <p className="font-medium">Passo 4</p>
                      <p className="text-gray-500 text-sm">Imagem com detalhe da condição</p>
                    </div>
                  </div>
                </div>

                  <Separator className="my-8"/>

                <div className="flex gap-2 w-full mb-8">
 <div className="w-full ">
     <div className="grid grid-cols-4 w-full gap-2">
  {Array.from({ length: 4 }).map((_, index) => {
    const image = images[index];

    return (
      <div key={index} className="relative group">
        {image ? (
          <div className="flex items-center justify-center object-cover border aspect-square w-full rounded-md dark:border-neutral-800">
            <img
              className="aspect-square w-full rounded-md object-cover "
              src={image}
              alt={`Upload ${index + 1}`}
            />
            <Button
              onClick={() => handleRemoveImage(index)}
              variant="destructive"
              className="absolute  z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              size="icon"
            >
              <Trash size={16} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => openUploadDialog()} // agora passando o index
            className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-800 hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
          </button>
        )}
      </div>
    );
  })}
</div>


      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      {/* Dialog de Opções de Upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
             <DialogHeader>
        <DialogTitle className="text-2xl  mb-2 font-medium max-w-[450px]">
      Adicionar imagem
          </DialogTitle>
          <DialogDescription className=" text-zinc-500">
         Você pode capturar uma nova imagem com a câmera ou escolher um arquivo já existente do seu computador.  
          </DialogDescription>
            </DialogHeader>
         
          <div className="flex flex-col space-y-3">
            <Button onClick={openCameraDialog} className="flex items-center justify-center space-x-2">
              <Camera size={20} />
              <span>Tirar Foto</span>
            </Button>
            <Button onClick={openFileDialog} variant="outline" className="flex items-center justify-center space-x-2">
              <Image size={20} />
              <span>Escolher do Computador</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

       {/* Dialog da Câmera */}
      <Dialog open={showCameraDialog} onOpenChange={closeCameraDialog}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
        <DialogTitle className="text-2xl  mb-2 font-medium max-w-[450px]">
      Capturar foto
          </DialogTitle>
         <DialogDescription className="text-zinc-500">
  Fotografe o item patrimonial com atenção à boa iluminação e enquadramento.  
  Essa foto será utilizada para registrar e exibir o item no sistema Vitrine Patrimônio.
</DialogDescription>
            </DialogHeader>
          
          {!showPhotoPreview ? (
            <div className="space-y-4">
              {/* Seleção de Câmera */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium mb-2 block">
                  Câmeras Disponíveis <Badge variant='outline'>{availableCameras.length}</Badge>
                </label>

                 {/* Botões adicionais para gerenciar câmeras */}
              <div className="flex justify-center space-x-2">
                <Button 
                  onClick={getCameras} 
                  variant='outline' 
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCcw size={16}/> Atualizar Câmeras
                </Button>
              
              </div>
                </div>
                <div className="space-y-2">
                  <Select 
                    value={selectedCamera} 
                    onValueChange={(value) => {
                      setSelectedCamera(value);
                      // Auto-iniciar nova câmera quando selecionada
                      setTimeout(() => startCamera(), 100);
                    }}
                  >
                    <SelectContent>
                    {availableCameras.map((camera, index) => {
                      const cameraName = camera.label || `Câmera ${index + 1}`;
                      const isDefault = camera.deviceId === selectedCamera;
                      
                      return (
                        <SelectItem key={camera.deviceId} value={camera.deviceId}>
                          {cameraName} {isDefault && '(Ativa)'}
                        </SelectItem>
                      );
                    })}
                    </SelectContent>
                  </Select>
                  
                  {/* Informações da câmera selecionada */}
                  {selectedCamera && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Câmera Ativa:</strong> {
                        availableCameras.find(c => c.deviceId === selectedCamera)?.label || 
                        `Câmera ${availableCameras.findIndex(c => c.deviceId === selectedCamera) + 1}`
                      }
                    </div>
                  )}
                </div>
              </div>
              
              {/* Preview da Câmera */}
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: '300px' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Overlay com informações */}
                <div className="absolute top-2 left-2 flex gap-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                 <Camera size={16}/> {stream ? 'Ao vivo' : 'Iniciando...'}
                </div>
              </div>
              
              {/* Controles */}
              <div className="flex justify-center space-x-3">
                  <Button onClick={closeCameraDialog} className="w-full" variant="outline">
                 <ArrowUUpLeft size={16} className="" />  Cancelar
                </Button>
                <Button 
                  onClick={capturePhoto} 
                  disabled={!stream}
                  className="w-full"
                >
                  <Camera size={16} />
                  <span>Capturar Foto</span>
                </Button>
             
              </div>
              
             
            </div>
          ) : (
            <div className="space-y-4">
            
              <div className="relative">
                <img 
                  src={capturedPhoto ?? ''} 
                  alt="Foto capturada" 
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
              
              <div className="flex justify-center space-x-3">
               
                <Button onClick={retakePhoto} variant="outline" className="w-full">
                  <ArrowUUpLeft size={16} className="" />
                  <span>Tirar Outra</span>
                </Button>
                <Button onClick={confirmPhoto} className="w-full">
                  <Check size={16} />
                  <span>Usar Esta Foto</span>
                </Button>
               
              </div>
              
            
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
                </div>
             </div>

                <div className="flex  items-center justify-between">
<div className="flex items-start gap-0 flex-col">
                      <p className="text-sm">Se já cadastrou algum item, você pode</p>
                    <Link to={''}>  <Button variant={'link'} className="text-eng-blue p-0 h-fit">acessar o painel</Button></Link>
</div>

                    <div className="flex gap-2 items-center">
                      <Button size={'lg'} onClick={() => setTab('2')}>Continuar <ArrowRight size={16}/></Button>
                    </div>
                </div>
             </div>
          </TabsContent>

        </Tabs>
        </div>

            <div className="lg:w-[400px] rounded-lg bg-eng-blue  w-full">

            </div>
       </main>
     </div>
  )
}