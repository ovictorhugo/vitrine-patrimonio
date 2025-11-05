import { ChevronLeft, DoorClosed, DoorOpen, Home, List, ListChecks, LoaderCircle, Package, Recycle, Undo2, Upload, User } from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { useQuery } from "../../authentication/signIn";
import { Alert } from "../../ui/alert";
import { Tabs, TabsContent, TabsList } from "../../ui/tabs";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Inventario } from "./tabs/inventario";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Patrimonios } from "../dashboard-page/tabs/patrimonios";
import { AnunciadosSala } from "./tabs/anunciados";
import { usePermissions } from "../../permissions";

type Unit = { unit_name: string; unit_code: string; unit_siaf: string; id: string };
type Agency = { agency_name: string; agency_code: string; unit_id: string; id: string; unit: Unit };
type Sector = { agency_id: string; sector_name: string; sector_code: string; id: string; agency: Agency };
type LegalGuardian = { legal_guardians_code: string; legal_guardians_name: string; id: string };


interface RoomResponseDTO {
    legal_guardian_id: string;
  sector_id: string;
  location_name: string;
  location_code: string;
  id: string;
  sector: Sector;
  legal_guardian: LegalGuardian;
  location_inventories: LocationInventoryDTO[]
}

export type UnitDTO = {
  id: string;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
};

export type AgencyDTO = {
  id: string;
  agency_name: string;
  agency_code: string;
  unit_id: string;
  unit: UnitDTO;
};

export type SectorDTO = {
  id: string;
  sector_name: string;
  sector_code: string;
  agency_id: string;
  agency: AgencyDTO;
};

export type LegalGuardianDTO = {
  id: string;
  legal_guardians_code: string;
  legal_guardians_name: string;
};

export type MaterialDTO = {
  id: string;
  material_code: string;
  material_name: string;
};

export type AssetDTO = {
  id: string;
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
  material: MaterialDTO;
  legal_guardian: LegalGuardianDTO;
  location: string;
  is_official: boolean;
};

// ========= INVENTORY =========
export type InventoryDTO = {
  id: string;
  key: string;
  avaliable: boolean;
  created_by: UserDTO;
};

// ========= USER =========
export type UserDTO = {
  id: string;
  username: string;
  email: string;
  provider: string;
  linkedin: string;
  lattes_id: string;
  orcid: string;
  ramal: string;
  photo_url: string;
  background_url: string;
  matricula: string;
  verify: boolean;
  institution_id: string;
};

export type LocationInventoryDTO = {
  id: string;
  assets: AssetDTO[];
  inventory: InventoryDTO;
  filled: boolean;
};

export function VisaoSala() {
   const { urlGeral, user } = useContext(UserContext);
      const navigate = useNavigate();
      const queryUrl = useQuery();
    const type_search = queryUrl.get('loc_id');
       const [loading, setLoading] = useState(true);
     const [room, setRoom] = useState<RoomResponseDTO | null>(null);
        const location = useLocation();
           const token = localStorage.getItem("jwt_token");
        useEffect(() => {
    const locId = type_search?.trim();
    if (!locId) {
      setRoom(null);
      return;
    }

    const controller = new AbortController();

    async function fetchLocation() {
      try {
        setLoading(true);


        const res = await fetch(`${urlGeral}locations/${type_search}`, {
          method: "GET",
          signal: controller.signal,
         headers: { Authorization: `Bearer ${token}` }, // se precisar de auth, descomente e injete o token
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha ao buscar localização (${res.status})`);
        }

        const data: RoomResponseDTO = await res.json();
        setRoom(data);
        setLoading(false);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
      
          setRoom(null);
        }
      }
    }

    fetchLocation();
    return () => controller.abort();
  }, [type_search]);


  const history = useNavigate();
      
        const handleVoltar = () => {
   history(-3)
  };


 
          const [loadingMessage, setLoadingMessage] = useState("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
      
          useEffect(() => {
            let timeouts: NodeJS.Timeout[] = [];
          
           
              setLoadingMessage("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Estamos quase lá, continue aguardando...");
              }, 5000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Só mais um pouco...");
              }, 10000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Está demorando mais que o normal... estamos tentando encontrar tudo.");
              }, 15000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Estamos empenhados em achar todos os dados, aguarde só mais um pouco");
              }, 15000));
            
          
            return () => {
              // Limpa os timeouts ao desmontar ou quando isOpen mudar
              timeouts.forEach(clearTimeout);
            };
          }, []);

            const tabs = [
                       
            
              { id: "bens", label: "Patrimônios", icon: Package },
              { id: "inventario", label: "Inventários", icon: ListChecks },
             { id: "anunciados", label: "Itens cadastrados", icon: Recycle },
             
            ];


            
              const tab = queryUrl.get('tab');
              const [value, setValue] = useState(tab || tabs[0].id)
            

              
     type UploadFolder = "profile" | "background";
    
                    
                           
    const [urlBackground, setUrlBackground] = useState(
      `${urlGeral}location/upload/${room?.id}/cover`
    );
    
    const [urlPerfil, setUrlPerfil] = useState(
      `${urlGeral}location/upload/${room?.id}/icon`
    );
    
    useEffect(() => {
    setUrlBackground(
          `${urlGeral}location/upload/${room?.id}/cover`
        );
        setUrlPerfil(
          `${urlGeral}location/upload/${room?.id}/icon`
        );
    }, [room]);
    
    const handleUpload = (folder: UploadFolder, programId: string) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
    
    
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          toast("Parece que os campos estão vazios", {
            description: "Selecione um arquivo de imagem para enviar.",
            action: { label: "Fechar", onClick: () => {} },
          });
          return;
        }
    
        const form = new FormData();
        // O backend (FastAPI) espera exatamente 'file' como campo:
        form.append("file", file, file.name);
    
        const endpoint =
          folder === "profile"
            ? `${urlGeral}location/upload/icon`
            : `${urlGeral}location/upload/cover`;
    
        try {
          const res = await fetch(endpoint, {
               mode: 'cors',
            method: "POST",
            body: form,
            headers: {
            'Authorization': `Bearer ${token}`,
      'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'POST',
    
                         
            },
          credentials: "include",
          });
    
          if (!res.ok) {
            let desc = `HTTP ${res.status}`;
            try {
              const j = await res.json();
              desc = JSON.stringify(j);
            } catch {
              try { desc = await res.text(); } catch {}
            }
    
            toast.error("Falha no upload", {
              description: desc,
              action: { label: "Fechar", onClick: () => {} },
            });
            return;
          }
    
          if (folder === "profile") {
            setUrlPerfil(
              `${urlGeral}user/upload/${room?.id}/icon`
            );
          } else {
            setUrlBackground(
              `${urlGeral}user/upload/${room?.id}/cover`
            );
          }
    
          toast(folder === "profile" ? "Ícone atualizado" : "Capa atualizada", {
            description: "Upload realizado com sucesso.",
            action: { label: "Fechar", onClick: () => {} },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro desconhecido";
          toast.error("Erro de rede", {
            description: message,
            action: { label: "Fechar", onClick: () => {} },
          });
        } finally {
          input.value = "";
        }
      };
    
      input.click();
    };

    const {hasSalas} = usePermissions()
    
console.log(room?.legal_guardian_id)
console.log('ertert',user?.system_identity.legal_guardian.id)
        if (loading) {
            return (
              <div className="flex justify-center items-center h-full">
              <div className="w-full flex flex-col items-center justify-center h-full">
                <div className="text-eng-blue mb-4 animate-pulse">
                  <LoaderCircle size={108} className="animate-spin" />
                </div>
                <p className="font-medium text-lg max-w-[500px] text-center">
                  {loadingMessage}
                </p>
              </div>
            </div>
            );
          }

           if (!hasSalas && !(room?.legal_guardian_id == user?.system_identity.legal_guardian.id)) {
            return (
              <div
                className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900"
                
              >
           
          
                <div className="w-full flex flex-col items-center justify-center">
                <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
                    (⊙_⊙)
                  </p>
                  <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
                   Você não tem permissão para <br/> acessar as  informações desta sala.
                  </h1>
                 
          
                  <div className="flex gap-3 mt-8">
                          <Button  onClick={handleVoltar} variant={'ghost'}><Undo2 size={16}/> Voltar</Button>
                           <Link to={'/'}> <Button><Home size={16}/> Página Inicial</Button></Link>
          
                          </div>
                </div>
              </div>
            );
          }


             if (!room ) {
            return (
              <div
                className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900"
                
              >
           
          
                <div className="w-full flex flex-col items-center justify-center">
                <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
                    (⊙_⊙)
                  </p>
                  <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
                    Não foi possível acessar as <br/>  informações desta sala.
                  </h1>
                 
          
                  <div className="flex gap-3 mt-8">
                          <Button  onClick={handleVoltar} variant={'ghost'}><Undo2 size={16}/> Voltar</Button>
                           <Link to={'/'}> <Button><Home size={16}/> Página Inicial</Button></Link>
          
                          </div>
                </div>
              </div>
            );
          }

    return(
        <main className=" w-full grid grid-cols-1 ">
        <Helmet>
               <title>{room.location_name} | Sistema Patrimônio</title>
               <meta name="description" content={`${room.location_name} | Sistema Patrimônio`} />
               <meta name="robots" content="index, follow" />
             </Helmet>
       
             <main className="grid grid-cols-1 ">
                <Tabs defaultValue={tabs[0].id} value={value} className="">
                    <div className="md:p-8 p-4 pb-0">
                    <div    style={{ backgroundImage: `url(${urlBackground})` }} className="bg-eng-blue bg-no-repeat bg-center bg-cover border dark:border-neutral-800 w-full rounded-md h-[300px]">
<div className={`w-full h-full rounded-md bg-black/25 pb-0 md:pb-0 p-4 md:p-8 flex-col flex justify-between `}>
                            <div
                                className="
                    flex flex-col items-center gap-4 justify-between

                    md:flex-row
                  "
                            >
                                <div className="flex gap-2">
                                    <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7 text-eng-blue hover:text-eng-blue">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="sr-only">Voltar</span>
                                    </Button>
                                    <div
                                        className="
                        flex flex-col gap-2

                        md:flex-col

                        lg:flex-row
                      "
                                    >
                                        <h1 className="flex-1 shrink-0 text-white whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                           Visão da sala
                                        </h1>
                                    </div>
                                </div>

                                <div
                                    className="
                      flex items-center gap-2 flex-wrap
                    "
                                >


 <Button variant="outline" size="sm" onClick={() => handleUpload("background", room?.id || '')} className="h-8 text-eng-blue hover:text-eng-blue">
          <Upload size={16} /> Alterar imagem
      </Button>

                                </div>
                            </div>

                            <div className="flex justify-end items-end flex-1 w-full ">
                                <div className="flex justify-between w-full gap-8">
 <div className="absolute">
                                        <div className="relative group">
                                              <Avatar className=" rounded-lg  h-24 w-24 relative -top-12 xl:top-0">
                                            <AvatarImage className={'rounded-md h-24 w-24'} src={urlPerfil} />
                                            <AvatarFallback className="flex items-center justify-center"><DoorClosed size={24} /></AvatarFallback>
                                          </Avatar>
                                         <div
                                                  className="aspect-square backdrop-blur rounded-md h-24 group-hover:flex bg-black/20 items-center justify-center absolute hidden -top-12 xl:top-0  z-[1] cursor-pointer"
                                                  onClick={() => handleUpload("profile", room?.id || '')}
                                                >
                                                  <Upload size={20} />
                                                </div>
                                                </div>
                                    </div>
                                 
                                    <div className="  w-24 min-w-24">

                                    </div>

                                    <div className="relative  grid-cols-1 hidden xl:grid">
                                        <ScrollArea className="relative overflow-x-auto">
                                            <TabsList className="p-0 justify-start flex gap-2 h-auto bg-transparent dark:bg-transparent">
                                                {tabs.map(
                                                    ({ id, label, icon: Icon, }) =>
                                                    (
                                                       <div
                                                                key={id}
                                                                className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id ? "border-b-white" : "border-b-transparent"
                                                                    }`}
                                                                onClick={() => setValue(id)}
                                                            >
                                                                <Button variant="ghost" className={`m-0 text-white hover:text-eng-blue ${value === id ? "bg-white text-eng-blue" : ""}`}>
                                                                    <Icon size={16} />
                                                                    {label}
                                                                </Button>
                                                            </div>
                                                    )


                                                )}
                                            </TabsList>
                                            <ScrollBar orientation="horizontal" />
                                        </ScrollArea>

                                        <div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:gap-8  z-[2] pt-8 md:p-0">

                        <div className="flex justify-between  md:px-8 items-center ">
                            <div className="flex flex-col  gap-6 mt-8 px-8">


                                <div>
                                    <h1 className="text-2xl mb-2 max-w-[800px] font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                                        {room.location_name}
                                    </h1>

                                    <p className="max-w-[750px] text-lg font-light text-foreground">
                                        <div className="flex flex-wrap gap-4 ">
                                           

                                          
                                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><User size={12} />{room.legal_guardian.legal_guardians_name}</div>
                                           
                                        </div>
                                    </p>




                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="px-8 md:px-8">
                                <div className="relative grid grid-cols-1 xl:hidden">
                                    <ScrollArea className="relative w-full overflow-x-auto">
                                        <div className="flex w-full gap-2">
                                            <TabsList className="p-0 justify-start flex gap-2 h-auto bg-transparent dark:bg-transparent border pt-2 px-2 dark:bg-neutral-800 w-full">
                                                {tabs.map(({ id, label, icon: Icon}) => (
                                                  (
                                                        <div
                                                            key={id}
                                                            className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                                                                }`}
                                                            onClick={() => setValue(id)}
                                                        >
                                                            <Button variant="ghost" className="m-0">
                                                                <Icon size={16} />
                                                                {label}
                                                            </Button>
                                                        </div>
                                                    )

                                                ))}
                                            </TabsList>
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                    <div></div>
                                </div>
                            </div>

                        </div>





                          <TabsContent value="inventario" className="m-0">
                                           <Inventario />
                        </TabsContent>

                          <TabsContent value="bens" className="m-0">
                                                  <Patrimonios
                                                  type={'loc'}
                                                  />
                                                </TabsContent>

                                                 <TabsContent value="anunciados" className="m-0">
                                                 <AnunciadosSala/>
                                                </TabsContent>
                        </div>
                        </Tabs>
                        </main>



        </main>
    )
}