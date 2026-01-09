import {
  Briefcase,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  GitBranchPlus,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "../../ui/tabs";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "../../authentication/signIn";
import { RoleDTO, Roles, UserInRoleDTO } from "./tabs/roles";
import { UsersPage } from "./tabs/users";
import { UserContext } from "../../../context/context";
import { usePermissions } from "../../permissions";
import { useIsMobile } from "../../../hooks/use-mobile";

export function CargosFuncoes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { permission } = useContext(UserContext);
  const { hasPermissoes, hasUsuarios } = usePermissions();

  const tabs = [
    { id: "roles", label: "Cargos", icon: BriefcaseBusiness },
    { id: "users", label: "Usuários", icon: Users, condition: !hasUsuarios },
  ];

  const [isOn, setIsOn] = useState(true);
  const queryUrl = useQuery();
  const tab = queryUrl.get("tab");
  const [value, setValue] = useState(tab || tabs[0].id);

  // ===== Scroll dos tabs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollAreaRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== Estatísticas: GET /statistics/catalog/count-by-workflow-status
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  // controla o diálogo "Criar permissão" mostrado dentro de <Roles />
  const [openCreatePerm, setOpenCreatePerm] = useState(false);
  const [openListPerm, setOpenListPerm] = useState(false);

  //volta pro inicio
  useEffect(() => {
    setValue(tabs[0].id);
  }, [permission]);

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Cargos e funções | Sistema Patrimônio</title>
      </Helmet>

      <main className="flex flex-col gap-8  flex-1 ">
        {/* Header */}
        <div className="flex items-center p-8 pb-0 justify-between flex-wrap gap-3">
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => {
                const path = location.pathname;
                const hasQuery = location.search.length > 0;
                if (hasQuery) navigate(path);
                else {
                  const seg = path.split("/").filter(Boolean);
                  if (seg.length > 1) {
                    seg.pop();
                    navigate("/" + seg.join("/"));
                  } else navigate("/");
                }
              }}
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight">
              Cargos e funções
            </h1>
          </div>

          <div className="hidden gap-2 items-center xl:flex"></div>
        </div>

        {/* CARROSSEL no PAI mapeando cada role */}

        <Tabs defaultValue={tabs[0].id} value={value} className="relative ">
          {isMobile ? (
            <>
              <div className="sticky top-[68px] z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
                <div
                  className={
                    "px-4 border-b border-b-neutral-200 dark:border-b-neutral-800"
                  }
                >
                  <div className={"flex flex-col pt-2"}>
                    <div
                      ref={scrollAreaRef}
                      className="overflow-x-auto scrollbar-hide scrollbar-hide"
                      onScroll={checkScrollability}
                    >
                      <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
                        {tabs.map(
                          ({ id, label, icon: Icon, condition }) =>
                            !condition && (
                              <div
                                key={id}
                                className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                  value === id
                                    ? "border-b-[#719CB8]"
                                    : "border-b-transparent"
                                }`}
                                onClick={() => {
                                  setValue(id);

                                  navigate({
                                    pathname: location.pathname,
                                    search: queryUrl.toString(),
                                  });
                                }}
                              >
                                <Button variant="ghost" className="m-0">
                                  <Icon size={16} />
                                  {label}
                                </Button>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" flex m-auto justify-center mt-4">
                  {value === "roles" && (
                    <Button
                      variant={"ghost"}
                      onClick={() => setOpenListPerm(true)}
                    >
                      <GitBranchPlus size={16} />
                      Permissões
                    </Button>
                  )}
                  {value == "roles" && hasPermissoes && (
                    <Button onClick={() => setOpenCreatePerm(true)}>
                      <Plus size={16} />
                      Criar permissão
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sticky top-[68px] z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
                <div
                  className={`w-full ${
                    isOn ? "px-8" : "px-4"
                  } border-b border-b-neutral-200 dark:border-b-neutral-800`}
                >
                  <div className={"flex pt-2 justify-between"}>
                    <div className="flex gap-2">
                      <div className="relative grid grid-cols-1">
                        <div className=" mx-10 ">
                          <div
                            ref={scrollAreaRef}
                            className="overflow-x-auto scrollbar-hide scrollbar-hide"
                            onScroll={checkScrollability}
                          >
                            <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
                              {tabs.map(
                                ({ id, label, icon: Icon, condition }) =>
                                  !condition && (
                                    <div
                                      key={id}
                                      className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                        value === id
                                          ? "border-b-[#719CB8]"
                                          : "border-b-transparent"
                                      }`}
                                      onClick={() => {
                                        setValue(id);

                                        navigate({
                                          pathname: location.pathname,
                                          search: queryUrl.toString(),
                                        });
                                      }}
                                    >
                                      <Button variant="ghost" className="m-0">
                                        <Icon size={16} />
                                        {label}
                                      </Button>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-nowrap gap-2">
                      <div className="md:flex md:flex-nowrap gap-2">
                        {value === "roles" && (
                          <Button
                            variant={"ghost"}
                            onClick={() => setOpenListPerm(true)}
                          >
                            <GitBranchPlus size={16} />
                            Permissões
                          </Button>
                        )}
                        {value == "roles" && hasPermissoes && (
                          <Button onClick={() => setOpenCreatePerm(true)}>
                            <Plus size={16} />
                            Criar permissão
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <TabsContent value="roles">
            <Roles
              openCreatePerm={openCreatePerm}
              setOpenCreatePerm={setOpenCreatePerm}
              openListPerm={openListPerm}
              setOpenListPerm={setOpenListPerm}
            />
          </TabsContent>

          {hasUsuarios && (
            <TabsContent value="users">
              <UsersPage />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
