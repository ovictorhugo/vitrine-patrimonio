import {
  Archive,
  CheckIcon,
  Download,
  FileSignature,
  HelpCircle,
  Home,
  Hourglass,
  LoaderCircle,
  MoveRight,
  Undo2,
  User,
  XIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import { Alert } from "../ui/alert";
import { Separator } from "@radix-ui/react-separator";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

export function AssinarTransferencia() {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // ESTADOS PARA GERENCIAR O CARREGAMENTO E OS DADOS
  // Inicializa com o state da navegação se existir, senão null
  const [loading, setLoading] = useState<boolean>(true);
  const [document, setDocument] = useState<any>(
    location.state?.DocumentData || null,
  );
  const [catalog, setCatalog] = useState<any>(
    location.state?.CatalogData || null,
  );
  const [urlToken, setUrlToken] = useState<string | null>(null);

  // Token de Autenticação do Usuário Logado (JWT)
  const authToken = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") || ""
        : "",
    [],
  );

  const useQuery = () => {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  };
  const query = useQuery();

  // --- EFEITO: BUSCAR DADOS (Se não vieram pelo state) ---
  useEffect(() => {
    const tokenFromUrl = query.get("token");

    // Se já temos os dados via navegação (Login), não precisa buscar
    if (document && catalog) {
      setLoading(false);
      return;
    }

    // Se não temos dados, mas temos TOKEN na URL (Link Externo)
    if (tokenFromUrl) {
      setUrlToken(tokenFromUrl);

      const fetchByToken = async () => {
        try {
          // Chama o endpoint novo que busca por token
          const res = await fetch(
            `${urlGeral}transfers/details_by_token/${tokenFromUrl}`,
            {
              headers: {
                Accept: "application/json",
                // Não enviamos Authorization obrigatória aqui, pois pode ser acesso público
              },
            },
          );

          if (!res.ok) throw new Error("Erro ao buscar dados do token");

          const data = await res.json();

          // Preenche os estados com o retorno do backend
          // Ajuste aqui se o back retornar { document: {...}, catalog: {...} } ou plano
          setDocument(data);
          setCatalog(data.catalog);
        } catch (error) {
          console.error(error);
          toast.error("Link inválido ou expirado.");
        } finally {
          setLoading(false);
        }
      };

      fetchByToken();
    } else {
      // Sem dados e sem token
      setLoading(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function handleDownload() {
    setLoading(true);
    if (!document) return;
    try {
      const res = await fetch(`${urlGeral}transfers/pdf/${document.id}`, {
        headers: {
          Accept: "application/pdf",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const pdf = URL.createObjectURL(blob);
      window.open(pdf, "_blank");
      if ((pdf ?? []).length === 0) {
        toast.error("Nada encontrado para gerar o PDF.");
      }
    } catch (e) {
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setLoading(false);
    }
  }

  // Função Unificada de Assinatura
  async function handleSignAction() {
    if (!document) return;
    setLoading(true);
    let tokenToSign = "";

    if (urlToken) {
      tokenToSign = urlToken;
    } else {
      const myNamedSlot = document.signers.find(
        (s: any) => s.user?.id === user?.id && !s.isSigned,
      );

      const openGenericSlot = document.signers.find(
        (s: any) => s.user === null && !s.isSigned,
      );

      // 2. Prioridade: Slot nominal (específico para este usuário)
      if (myNamedSlot) {
        tokenToSign = myNamedSlot.token;
      }
      // 3. Prioridade: Slot genérico (Chefia/Não identificado)
      else if (openGenericSlot) {
        tokenToSign = openGenericSlot.token;
      }
      // 4. Nenhum slot disponível
      else {
        toast.error(
          "Não há assinaturas pendentes disponíveis para você neste documento.",
        );
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${urlGeral}transfers/sign/${tokenToSign}`, {
        headers: {
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.status === "already_signed") {
          toast.info("Esta assinatura já foi processada.");
        } else {
          toast.error("Não foi possível assinar o PDF.");
        }
      } else {
        toast.success("Assinatura realizada com sucesso!");

        // Pequeno delay para o usuário ver o toast antes de sair
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão ao assinar.");
    } finally {
      // Se der erro, tira o loading. Se der sucesso, o navigate acontece.
      // Manter loading true no sucesso evita clique duplo.
    }
  }

  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo.",
        );
      }, 15000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco",
        );
      }, 15000),
    );

    return () => {
      // Limpa os timeouts ao desmontar ou quando isOpen mudar
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // --- MAPAS DE ESTILO ---
  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };

  const csvCodToText: Record<string, string> = {
    BM: "Bom",
    AE: "Anti-Econômico",
    IR: "Irrecuperável",
    OC: "Ocioso",
    RE: "Recuperável",
  };

  const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
    NO: { text: "Normal", icon: <CheckIcon size={12} /> },
    NI: { text: "Não inventariado", icon: (<HelpCircle size={12} />) as any },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <XIcon size={12} /> },
  };

  // --- RENDERIZAÇÃO: LOADING ---
  if (loading) {
    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={54} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[400px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else
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

  // --- RENDERIZAÇÃO: NÃO ENCONTRADO (U_U) ---
  if (!document || !catalog || !catalog.asset) {
    // Mantive exatamente o seu layout condicional Mobile/Desktop
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div
          className={
            isMobile
              ? "w-[90%] flex flex-col items-center justify-center"
              : "w-full flex flex-col items-center justify-center"
          }
        >
          <p
            className={
              isMobile
                ? "text-6xl text-[#719CB8] font-bold mb-16 animate-pulse"
                : "text-9xl text-[#719CB8] font-bold mb-16 animate-pulse"
            }
          >
            U_U
          </p>
          <h1 className="text-center text-xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
            Sem dados para mostrar aqui. Tente novamente ou verifique o link.
          </h1>

          <div className="flex gap-3 mt-8">
            <Button onClick={() => navigate("/")} variant={"ghost"}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={"/"}>
              <Button>
                <Home size={16} /> Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se existe algum slot nominal pendente para este usuário
  const pendingNamedSlot = document?.signers?.some(
    (s: any) => s.user?.id === user?.id && !s.isSigned,
  );

  // Verifica se existe algum slot genérico (sem usuário) pendente
  const pendingGenericSlot = document?.signers?.some(
    (s: any) => s.user === null && !s.isSigned,
  );

  const canSign = loggedIn && (pendingNamedSlot || pendingGenericSlot);

  // --- PREPARAÇÃO DE VARIÁVEIS VISUAIS ---
  const csvCodTrimmed = (catalog.asset.csv_code || "").trim();
  const bemStaTrimmed = (catalog.asset.asset_status || "").trim();
  const status = statusMap[bemStaTrimmed];

  // Verifica se o usuário atual já assinou (para desabilitar botão)
  // Se for via Token URL, a verificação é feita no click ou checando o status do signer específico se mapeado
  const isUserSigned = urlToken
    ? document.signers.some((s: any) => s.token === urlToken && s.isSigned)
    : document.signers.some((e: any) => e.user?.id === user?.id && e.isSigned);

  const allSigned =
    document.signers?.length > 0 &&
    document.signers.every((s: any) => s.isSigned);

  if (allSigned) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center px-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
            <CheckIcon
              size={48}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <h1 className="text-center text-2xl md:text-4xl text-neutral-800 dark:text-neutral-200 font-bold mb-4">
            Documento Finalizado!
          </h1>

          <p className="text-center text-neutral-500 dark:text-neutral-400 max-w-[500px] mb-8 text-lg">
            Todas as partes já assinaram este documento e a transferência foi
            concluída com sucesso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => handleDownload()}
            >
              <Download size={18} className="mr-2" />
              Baixar Documento
            </Button>

            <Link to={"/"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <Home size={18} className="mr-2" /> Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Assinar Transferência | Sistema Patrimônio</title>
      </Helmet>

      <main className="flex flex-col ">
        <div
          className={
            isMobile
              ? "max-w-[936px] mt-8 mx-auto flex flex-col justify-center"
              : "max-w-[1000px] mt-8 h-full mx-auto flex flex-col justify-center"
          }
        >
          <h1
            className={
              isMobile
                ? "mb-4 text-2xl font-semibold max-w-[1000px]"
                : "mb-8 text-4xl font-semibold max-w-[1200px]"
            }
          >
            Assinatura de transferência de bem
          </h1>
          <div className={isMobile ? "" : "ml-8"}>
            <>
              <div className="flex group cursor-pointer ">
                <div
                  className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
                    qualisColor[csvCodTrimmed as keyof typeof qualisColor] ||
                    "bg-zinc-300"
                  } min-h-full`}
                />
                <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-0">
                  <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
                    <p
                      className={
                        isMobile
                          ? "font-semibold flex gap-3 items-center text-left flex-1"
                          : "font-semibold flex gap-3 items-center text-left mb-4 flex-1"
                      }
                    >
                      {catalog.asset.asset_code?.trim()} -{" "}
                      {catalog.asset.asset_check_digit}
                      {!!catalog.asset.atm_number &&
                        catalog.asset.atm_number !== "None" && (
                          <Badge variant="outline">
                            ATM: {catalog.asset.atm_number}
                          </Badge>
                        )}
                    </p>
                  </div>

                  <div className="flex flex-col p-4 pt-0 justify-between">
                    <div>
                      <div
                        className={
                          isMobile
                            ? "text-base mb-2 font-bold"
                            : "text-lg mb-2 font-bold"
                        }
                      >
                        {catalog.asset.material.material_name || "Sem nome"}
                      </div>
                      <p
                        className={
                          isMobile
                            ? "text-left mb-4 text-xs uppercase"
                            : "text-left mb-4 uppercase"
                        }
                      >
                        {catalog.asset.asset_description}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {!!catalog.asset.csv_code &&
                          catalog.asset.csv_code !== "None" && (
                            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                              <div
                                className={`w-4 h-4 rounded-md ${
                                  qualisColor[
                                    csvCodTrimmed as keyof typeof qualisColor
                                  ] || "bg-zinc-300"
                                }`}
                              />
                              {csvCodToText[
                                csvCodTrimmed as keyof typeof csvCodToText
                              ] || "—"}
                            </div>
                          )}

                        {status && (
                          <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                            {status.icon}
                            {status.text}
                          </div>
                        )}

                        {/* Logica de mostrar guardiao legal apenas se logado ou se vier na API */}
                        {!!catalog.asset.legal_guardian?.legal_guardians_name &&
                          catalog.asset.legal_guardian?.legal_guardians_name !==
                            "None" && (
                            <div className="flex gap-1 items-center">
                              <Avatar className="rounded-md h-5 w-5">
                                <AvatarImage
                                  className="rounded-md h-5 w-5"
                                  src={`${urlGeral}Researchercatalog/Image?name=${catalog.asset.legal_guardian.legal_guardians_name}`}
                                />
                                <AvatarFallback className="flex items-center justify-center">
                                  <User size={10} />
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm text-gray-500 dark:text-gray-300 font-normal">
                                {
                                  catalog.asset.legal_guardian
                                    .legal_guardians_name
                                }
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </Alert>
              </div>

              <Separator className="my-8" />

              <div className="grid gap-2 mb-4">
                <Label>Documento</Label>
                <Input
                  disabled
                  value={document.file_path || "Arquivo Digital"}
                />
              </div>
              <Label className="mt-4">Assinantes</Label>
              <div className="grid grid-cols-2 gap-3 px-4 mt-4">
                {document.signers?.map((signer: any, index: number) => {
                  const hasSignerData = signer.user ? true : false;
                  const displayName = hasSignerData
                    ? signer.user.username
                    : "Usuário";
                  const displayEmail = hasSignerData ? signer.user.email : "—";

                  const isSigned = signer?.isSigned ?? false;

                  return (
                    <Alert
                      key={index}
                      className="flex flex-wrap items-center justify-between p-2 mb-2"
                    >
                      <div className="flex gap-3 items-center">
                        <Avatar className="rounded-md h-8 w-8">
                          {hasSignerData && (
                            <AvatarImage
                              src={`${urlGeral}user/upload/${signer.user.id}/icon`}
                              alt={displayName}
                            />
                          )}
                          <AvatarFallback className="flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <User size={16} className="text-gray-500" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <p className="text-black text-sm dark:text-white font-medium truncate">
                            {displayName}
                          </p>
                          <p className="text-gray-400 text-sm dark:text-gray-300 font-medium truncate">
                            {displayEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-8 m-0 items-center">
                        <div className="flex flex-col items-end">
                          {isSigned ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-400 border-green-200 flex gap-1">
                              Assinado
                            </Badge>
                          ) : (
                            <Badge className="bg-eng-blue text-white flex gap-1">
                              Pendente
                            </Badge>
                          )}

                          {isSigned && signer?.signedAt && (
                            <span className="text-[10px] text-gray-400 mt-1">
                              {formatDate(signer.signedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Alert>
                  );
                })}
              </div>
            </>
          </div>
        </div>
        <div
          className={
            isMobile
              ? "flex items-center w-full"
              : "flex w-full justify-end pt-8 pr-8 gap-4 items-center"
          }
        >
          {/* Mensagem: Precisa estar logado */}
          {!loggedIn && (
            <div className="animate-shake-gentle text-red-600 font-medium text-sm">
              Você precisa estar logado para assinar!
            </div>
          )}

          {loggedIn && !canSign && !allSigned && (
            <div className="text-zinc-500 font-medium text-sm">
              Você não possui pendências neste documento.
            </div>
          )}

          <Button variant="outline" size="lg" onClick={() => handleDownload()}>
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Baixar documento
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded mr-8 gap-2"
            disabled={!canSign || loading}
            onClick={() => {
              handleSignAction();
            }}
          >
            <FileSignature size={16} />
            Assinar
          </Button>
        </div>
      </main>
    </div>
  );
}
