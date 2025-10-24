import { ChevronLeft, DoorClosed, DoorOpen, Home, List, ListChecks, LoaderCircle, Mail, Package, Recycle, Undo2, Upload, User } from "lucide-react";
import { Button } from "../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { useQuery } from "../authentication/signIn";
import { Alert } from "../ui/alert";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BlockItemsVitrine } from "../homepage/components/block-items-vitrine";

interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface LegalGuardian {
  id: string;
  legal_guardians_code: string;
  legal_guardians_name: string;
}

interface SystemIdentity {
  id: string;
  legal_guardian: LegalGuardian;
}

export interface UserResponseDTO {
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
  roles: Role[];
  system_identity: SystemIdentity | null;
}

export function UserPublicPage() {
   const { urlGeral, user:usuario } = useContext(UserContext);
      const navigate = useNavigate();
      const queryUrl = useQuery();
    const type_search = queryUrl.get('id');
       const [loading, setLoading] = useState(true);
     const [user, setUser] = useState<UserResponseDTO | null>(null);
        const location = useLocation();
           const token = localStorage.getItem("jwt_token");
        useEffect(() => {
    const locId = type_search?.trim();
    if (!locId) {
      setUser(null);
      return;
    }

    const controller = new AbortController();

    async function fetchUser() {
      try {
        setLoading(true);


        const res = await fetch(`${urlGeral}users/${type_search}`, {
          method: "GET",
          signal: controller.signal,
         headers: { Authorization: `Bearer ${token}` }, // se precisar de auth, descomente e injete o token
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha ao buscar localização (${res.status})`);
        }

        const data: UserResponseDTO = await res.json();
        setUser(data);
        setLoading(false);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
      
          setUser(null);
        }
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [type_search]);

      
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
             { id: "anunciados", label: "Vitrine e desfazimento", icon: Recycle },
             
            ];


            
              const tab = queryUrl.get('tab');
              const [value, setValue] = useState(tab || tabs[0].id)
            

              
     type UploadFolder = "profile" | "background";
    
                    
                           
    const [urlBackground, setUrlBackground] = useState(
      `${urlGeral}user/upload/${user?.id}/cover`
    );
    
    const [urlPerfil, setUrlPerfil] = useState(
      `${urlGeral}user/upload/${user?.id}/icon`
    );
    
    useEffect(() => {
    setUrlBackground(
          `${urlGeral}user/upload/${user?.id}/cover`
        );
        setUrlPerfil(
          `${urlGeral}user/upload/${user?.id}/icon`
        );
    }, [user]);
    
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
            ? `${urlGeral}user/upload/icon`
            : `${urlGeral}user/upload/cover`;
    
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
              `${urlGeral}user/upload/${user?.id}/icon`
            );
          } else {
            setUrlBackground(
              `${urlGeral}user/upload/${user?.id}/cover`
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


             if (!user ) {
            return (
              <div
                className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900"
                
              >
           
          
                <div className="w-full flex flex-col items-center justify-center">
                <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
                    (⊙_⊙)
                  </p>
                  <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
                    Não foi possível acessar as <br/>  informações deste usuário.
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
               <title>{user.username} | Sistema Patrimônio</title>
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
                                           Usuário
                                        </h1>
                                    </div>
                                </div>

                                <div
                                    className="
                      flex items-center gap-2 flex-wrap
                    "
                                >


{(usuario?.id === user?.id) && (
     <Button variant="outline" size="sm" onClick={() => handleUpload("background", user?.id || '')} className="h-8 text-eng-blue hover:text-eng-blue">
          <Upload size={16} /> Alterar imagem
      </Button>
)}

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
                                          {(usuario?.id === user?.id) && (
     <div
                                                  className="aspect-square backdrop-blur rounded-md h-24 group-hover:flex bg-black/20 items-center justify-center absolute hidden -top-12 xl:top-0  z-[1] cursor-pointer"
                                                  onClick={() => handleUpload("profile", user?.id || '')}
                                                >
                                                  <Upload size={20} />
                                                </div>
)}
                                        
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
                                        {user.username}
                                    </h1>

                                    <p className="max-w-[750px] text-lg font-light text-foreground">
                                        <div className="flex flex-wrap gap-4 ">
                                           

                                          
                                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Mail size={12} />{user.email}</div>
                                           
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




                        <TabsContent value="visao_geral" className="m-0">
                    <BlockItemsVitrine workflow="VITRINE" user_id={type_search || ''}/>
                        </TabsContent>

                         
                        </div>
                        </Tabs>
                        </main>



        </main>
    )
}