import { ArrowUUpLeft, MagnifyingGlass } from "phosphor-react";
import { Input } from "../../../ui/input";
import { useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "../../../ui/alert";
import { UserContext } from "../../../../context/context";
import { Skeleton } from "../../../ui/skeleton";
import { Calendar, Mail, Send, Star, Trash, ArrowRight, Loader2, Bug, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Separator } from "../../../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../../ui/dialog";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { useLocation, useNavigate } from "react-router-dom";

interface Feedback {
  created_at: string;
  description: string;
  email: string;
  id: string;
  name: string;
  rating: number;
}

export function Feedback() {
  const [pesquisaInput, setPesquisaInput] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- navegação / paginação na URL ---
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const initialOffset = Number(qs.get("offset") || "0");
  const initialLimit  = Number(qs.get("limit")  || "20");

  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit]   = useState<number>(initialLimit);

  // paginação auxiliar
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // dialogs
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);

  const [replyOpen, setReplyOpen] = useState<boolean>(false);
  const [replyTarget, setReplyTarget] = useState<Feedback | null>(null);
  const [replyTitle, setReplyTitle] = useState<string>("");
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replySending, setReplySending] = useState<boolean>(false);

  const { urlGeral } = useContext(UserContext);

  const baseUrl = `${urlGeral}feedback/`;
  const token = localStorage.getItem("jwt_token");

  const authHeaders: HeadersInit = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const handleNavigate = (newOffset: number, newLimit: number, replace = false) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", String(newOffset));
    params.set("limit", String(newLimit));
    navigate({ pathname: location.pathname, search: params.toString() }, { replace });
  };

  useEffect(() => {
    // reflete mudanças de offset/limit na URL (sem empilhar histórico)
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  // --------- FETCH ----------
  const fetchData = async (_offset = 0, _limit = limit, append = false) => {
    const url = `${baseUrl}?offset=${_offset}&limit=${_limit}&q=${pesquisaInput}`;
    try {
      if (!append) setLoading(true);
      const res = await fetch(url, { method: "GET", headers: authHeaders, mode: "cors" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar feedbacks (HTTP ${res.status}).`);
      }
      const data = await res.json();
      const list: Feedback[] = Array.isArray(data?.feedbacks) ? data.feedbacks : [];

      const safe = list.map((f) => ({
        ...f,
        rating: Number(f.rating ?? 0),
        created_at: f.created_at,
      }));

      setHasMore(safe.length === _limit);
      setOffset(_offset);
      setLimit(_limit);
      setFeedbacks((prev) => (append ? [...prev, ...safe] : safe));
    } catch (err: any) {
      console.error(err);
      toast("Erro ao carregar feedbacks", {
        description: err?.message || String(err),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      if (!append) setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // carrega página atual (de acordo com a URL) ao montar
    fetchData(initialOffset, initialLimit, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, pesquisaInput]);

  // quando offset/limit mudarem por interação dos botões "Anterior/Próximo" ou Select, recarrega (sem append)
  useEffect(() => {
    fetchData(offset, limit, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextOffset = offset + limit;
    await fetchData(nextOffset, limit, true);
  };

  // estado para controles de paginação
  const isFirstPage = offset === 0;
  const isLastPage = !hasMore; // última busca trouxe menos que limit

  // --------- DELETE ----------
  const openDeleteDialog = (fb: Feedback) => {
    setDeleteTarget(fb);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const url = `${baseUrl}${deleteTarget.id}`; // DELETE /feedback/{feedback_id}
      const res = await fetch(url, { method: "DELETE", headers: authHeaders, mode: "cors" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao excluir (HTTP ${res.status}).`);
      }
      toast("Dados deletados com sucesso!", {
        description: "Feedback removido da base de dados",
        action: { label: "Fechar", onClick: () => {} },
      });
      // recarrega página atual a partir do início
      setDeleteOpen(false);
      setDeleteTarget(null);
      // se deletou o último item da página e não está na primeira, volta uma página
      if (feedbacks.length === 1 && offset > 0) {
        setOffset(Math.max(0, offset - limit));
      } else {
        fetchData(offset, limit, false);
      }
    } catch (err: any) {
      console.error(err);
      toast("Erro ao deletar dados", {
        description: err?.message || "Tente novamente",
        action: { label: "Fechar", onClick: () => {} },
      });
    }
  };

  // --------- REPLY POPUP ----------
  const openReplyDialog = (fb: Feedback) => {
    setReplyTarget(fb);
    setReplyTitle(`Retorno do seu feedback, ${fb.name}`);
    setReplyMessage(
      `Olá, ${fb.name}!\n\nRecebemos sua avaliação (${fb.rating}/10) e a mensagem:\n“${fb.description}”.\n\nObrigado por contribuir. Caso queira detalhar mais, responda este e-mail.\n\nAtenciosamente,\nEquipe`
    );
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyTarget) return;
    try {
      setReplySending(true);
      const res = await fetch(`${urlGeral}emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ to: replyTarget.email, subject: replyTitle, message: replyMessage }),
      });
      if (!res.ok) throw new Error(`Falha ao enviar (HTTP ${res.status}).`);

      toast("Mensagem enviada", {
        description: `Destinatário: ${replyTarget.email}`,
        action: { label: "Fechar", onClick: () => {} },
      });
      setReplyOpen(false);
      setReplyTarget(null);
    } catch (err: any) {
      console.error(err);
      toast("Erro ao preparar envio", {
        description: err?.message || "Tente novamente",
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setReplySending(false);
    }
  };

  // --------- FILTER ----------
  const normalize = (str: string) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

 

  const itemsLoading = Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="w-full rounded-md h-[170px]" />);

  const getColor = (rating: number) => {
    if (rating <= 2) return "bg-red-500";
    if (rating <= 4) return "bg-orange-500";
    if (rating <= 6) return "bg-yellow-500";
    if (rating <= 8) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <div className="flex gap-8 p-8 flex-col">
      <Alert className="h-14 p-2 flex items-center justify-between w-full">
        <div className="flex items-center gap-2 w-full flex-1">
          <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
          <Input
            value={pesquisaInput}
            onChange={(e) => setPesquisaInput(e.target.value)}
            type="text"
            className="border-0 w-full"
          />
        </div>
        <div className="w-fit" />
      </Alert>

      <div>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-0">
              <HeaderResultTypeHome title={"Todos os Feedbacks"} icon={<Bug size={24} className="text-gray-400" />} />
            </AccordionTrigger>

            <AccordionContent className="p-0">
              {loading ? (
                <div className="flex gap-4 flex-col">
                  {itemsLoading}
                </div>
              ) : (
                <div className="grid gap-3">
                  {feedbacks
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((f) => {
                      const formattedDate = (() => {
                        try {
                          return format(new Date(f.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
                        } catch {
                          return f.created_at;
                        }
                      })();

                      return (
                        <div className="flex group" key={f.id}>
                          <Alert className={`rounded-r-none border-r-0 w-2 min-w-2 p-0 ${getColor(Number(f.rating))}`} />
                          <Alert className="rounded-l-none">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h1 className="font-medium">{f.name}</h1>
                                <div className="flex gap-2 flex-wrap mt-2">
                                  <div className="text-gray-500 text-sm flex gap-1 items-center">
                                    <Mail size={12} />
                                    <p>{f.email}</p>
                                  </div>
                                  <div className="text-gray-500 text-sm flex gap-1 items-center">
                                    <Star size={12} />
                                    <p>{f.rating}</p>
                                  </div>
                                  <div className="text-gray-500 text-sm flex gap-1 items-center">
                                    <Calendar size={12} />
                                    <p>{formattedDate}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="hidden gap-2 group-hover:flex">
                                <Button
                                  onClick={() => openReplyDialog(f)}
                                  className="h-8 w-8 whitespace-nowrap min-w-8"
                                  size={"icon"}
                                  variant={"outline"}
                                  title="Responder"
                                >
                                  <Send size={16} />
                                </Button>

                                <Button
                                  onClick={() => openDeleteDialog(f)}
                                  className="h-8 w-8 whitespace-nowrap min-w-8"
                                  size={"icon"}
                                  variant={"destructive"}
                                  title="Excluir"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>

                            <Separator className="my-4" />
                            <div>
                              <p className="text-gray-500 text-sm">{f.description}</p>
                            </div>
                          </Alert>
                        </div>
                      );
                    })}

                  {feedbacks.length === 0 && (
                    <div className="items-center justify-center w-full flex text-center py-12">
                      Nenhum resultado encontrado
                    </div>
                  )}

                  {/* Carregar mais (mantido) */}
                  {hasMore && feedbacks.length > 0 && (
                    <div className="flex justify-center pt-2">
                      <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
                        {loadingMore ? <Loader2 className="animate-spin mr-2" size={16} /> : <ArrowRight className="mr-2" size={16} />}
                        Carregar mais
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* ----- Controles de paginação ----- */}
      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            const newLimit = parseInt(value);
            setOffset(0);
            setLimit(newLimit);
            handleNavigate(0, newLimit);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Itens" />
          </SelectTrigger>
          <SelectContent>
            {[12, 24, 36, 48, 84, 162].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex justify-center items-center gap-10 mt-4">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} className="mr-2" />
            Anterior
          </Button>

          <Button
            onClick={() => !isLastPage && setOffset((prev) => prev + limit)}
            disabled={isLastPage}
          >
            Próximo
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* ======= POPUP CONFIRMAR EXCLUSÃO ======= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[600px]">Excluir feedback</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Esta ação é <span className="font-semibold">irreversível</span>. Deseja realmente excluir o feedback de{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>?
            </DialogDescription>
          </DialogHeader>

          {deleteTarget?.description && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2 mb-4">
                <Label>Descrição</Label>
                <Textarea disabled value={deleteTarget?.description}/>
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash size={16} /> Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======= POPUP RESPONDER ======= */}
      <Dialog
        open={replyOpen}
        onOpenChange={(open) => {
          setReplyOpen(open);
          if (!open) setReplyTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[600px]">Responder feedback</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Revise o assunto e a mensagem. O e-mail do destinatário já está preenchido.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label>Para</Label>
              <Input disabled value={replyTarget?.email || ""} className="bg-muted cursor-not-allowed" />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label>Assunto</Label>
              <Input value={replyTitle} onChange={(e) => setReplyTitle(e.target.value)} />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label>Mensagem</Label>
              <Textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
              {replyTarget && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Alert className={` h-4 w-4 min-w-2 p-0 rounded-md ${getColor(Number(replyTarget.rating))}`} />
                  Nota recebida: <span className="font-medium">{replyTarget.rating}/10</span>
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleSendReply} disabled={replySending || !replyTitle.trim() || !replyMessage.trim()}>
              {replySending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
              Enviar resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
