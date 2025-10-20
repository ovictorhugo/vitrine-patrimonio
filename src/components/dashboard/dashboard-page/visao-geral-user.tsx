import { ChevronLeft, ChevronRight, DoorClosed, Home, MailIcon, Package, Recycle, Shield, Store, Trash, Upload, User } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "../novo-item/search-bar";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList } from "../../ui/tabs";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { UserContext } from "../../../context/context";
import { toast } from "sonner";
import { Homepage } from "./tabs/homepage";
import { Patrimonios } from "./tabs/patrimonios";
import { Anunciados } from "./tabs/anunciados";
import { PerfilSegurancaDashboard } from "./tabs/perfil-seguranca";


export function VisaoGeralUser() {

  const tabs = [
             
    { id: "visao_geral", label: "Visão Geral", icon: Home },
    { id: "bens", label: "Patrimônios", icon: Package },
   { id: "anunciados", label: "Vitrine e desfazimento", icon: Recycle },
    { id: "perfil_seguranca", label: "Perfil e segurança", icon: Shield },
  ];

      const { user, urlGeral } = useContext(UserContext);
    const history = useNavigate();

  const [isOn, setIsOn] = useState(true);
  const queryUrl = useQuery();

  const tab = queryUrl.get('tab');
  const [value, setValue] = useState(tab || tabs[0].id)

    // Componente principal
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    
    // Adicione estas funções:
    const checkScrollability = () => {
      if (scrollAreaRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };
    
    const scrollLeft = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      }
    };
    
    const scrollRight = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    };
    
    // Adicione este useEffect:
    useEffect(() => {
      checkScrollability();
      const handleResize = () => checkScrollability();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigate = useNavigate();
    const location = useLocation()
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


    const token = localStorage.getItem('jwt_token');

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
    

    return(
      <main className=" w-full grid grid-cols-1 ">
        <Helmet>
               <title>Dashboard | Sistema Patrimônio</title>
               <meta name="description" content={`Dashboard | Sistema Patrimônio`} />
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
                                            Dashboard
                                        </h1>
                                    </div>
                                </div>

                                <div
                                    className="
                      flex items-center gap-2 flex-wrap
                    "
                                >


 <Button variant="outline" size="sm" onClick={() => handleUpload("background", user?.id || '')} className="h-8 text-eng-blue hover:text-eng-blue">
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
                                            <AvatarFallback className="flex items-center justify-center"><User size={24} /></AvatarFallback>
                                          </Avatar>
                                         <div
                                                  className="aspect-square backdrop-blur rounded-md h-24 group-hover:flex bg-black/20 items-center justify-center absolute hidden -top-12 xl:top-0  z-[1] cursor-pointer"
                                                  onClick={() => handleUpload("profile", user?.id || '')}
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
                                        {user?.username}
                                    </h1>

                                    <p className="max-w-[750px] text-lg font-light text-foreground">
                                        <div className="flex flex-wrap gap-4 ">
                                           

                                            {user?.email && (
                                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><MailIcon size={12} />{user?.email}</div>
                                            )}
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
                          <Homepage/>
                        </TabsContent>

                          <TabsContent value="bens" className="m-0">
                          <Patrimonios
                          type={'user'}
                          />
                        </TabsContent>

                         <TabsContent value="anunciados" className="m-0">
                          <Anunciados/>
                        </TabsContent>

                         <TabsContent value="perfil_seguranca" className="m-0">
                          <PerfilSegurancaDashboard/>
                        </TabsContent>
                        </div>
                        </Tabs>
                        </main>



        </main>
    )
}