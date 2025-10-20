import React, { memo, useContext, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../../ui/alert";
import { Calendar, ExternalLink, Mail, User, CheckCircle2, Clock, Link as LinkIcon, Hash, Bell, Eye, Users } from "lucide-react";
import { icons as LucideMap } from "lucide-react";
import { Separator } from "../../../ui/separator";
import { Badge } from "../../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import type { NotificationDTO } from "../tabs/notification";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { UserContext } from "../../../../context/context";
import { ArrowUUpLeft } from "phosphor-react";

type TypeInfo = { type: string; icon: any; bg_color: string };

type Props = {
  notification: NotificationDTO;
  baseUrl: string;               // mantido por compatibilidade com o pai (não é necessário aqui)
  token: string;                 // mantido por compatibilidade com o pai (não é necessário aqui)
  notificationsTypes: TypeInfo[];
  className?: string;
};

/* ========================= Helpers ========================= */

function normalizeIconKey(name?: string) {
  if (!name) return undefined;
  const cleaned = String(name).trim();

  const candidates = [
    cleaned,
    cleaned.toLowerCase(),
    cleaned.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()), // kebab/snake -> camel
    cleaned.charAt(0).toLowerCase() + cleaned.slice(1),
  ];

  for (const c of candidates) {
    if ((LucideMap as any)[c]) return c;
  }
  return undefined;
}

function getIconFromDetail(detailIcon?: string) {
  const key = normalizeIconKey(detailIcon);
  return key ? (LucideMap as any)[key] : null;
}

function resolveTypeInfo(type: string, notificationsTypes: TypeInfo[]) {
  const found = notificationsTypes.find((t) => t.type === type);
  return found ?? { icon: (LucideMap as any).bell, bg_color: "bg-gray-100" };
}

function formatDateBR(dateString: string, timeZone = "America/Sao_Paulo") {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

const hasHttp = (url?: string) => !!url && /^https?:\/\//i.test(url);

/* ===================== Componente ===================== */

export const NotificationItemAdmin = memo(function NotificationItemAdmin({
  notification,
  baseUrl,
  token,
  notificationsTypes,
  className,
}: Props) {
  const { id, type, detail, created_at, recipients = [] } = notification;
const {urlGeral} = useContext(UserContext)
  const IconFromDetail = getIconFromDetail(detail?.icon);
  const typeInfo = resolveTypeInfo(type, notificationsTypes);
  const FallbackIcon = typeInfo.icon;
  const bgColor = typeInfo.bg_color;
  const IconComp = IconFromDetail ?? FallbackIcon;

  const [open, setOpen] = useState(false);

  const total = recipients.length;
  const readCount = recipients.filter((r: any) => !!r?.read_at).length;

  const Time = useMemo(() => formatDateBR(created_at), [created_at]);

  // Ao clicar no card: NÃO navega mais. Apenas abre o Dialog.
  const handleOpenDialog = () => setOpen(true);

  return (
    <>
      <div
        onClick={handleOpenDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpenDialog(); } }}
        className={`w-full flex text-left cursor-pointer ${className ?? ""}`}
      >
        {/* barrinha lateral */}
        <div className={`${bgColor} w-2 rounded-l-md border`} />

        <Alert className="w-full border-l-0 rounded-l-none border-0 dark:text-white transition-all hover:opacity-90">
          <div className="flex items-start gap-3">
            <IconComp className="h-5 w-5 shrink-0" />

            <div className="flex-1 min-w-0">
              {/* título + ícones auxiliares */}
              <div className="flex items-center gap-2">
                <AlertTitle className="text-sm font-medium truncate">
                  {detail?.title ?? "Notificação"}
                </AlertTitle>
              </div>

              {/* descrição */}
              {detail?.description && (
                <AlertDescription className=" text-gray-600 line-clamp-2">
                  {detail.description}
                </AlertDescription>
              )}

              {/* meta */}
              <div className="flex flex-wrap  items-center gap-2 mt-8 text-sm text-gray-500">
                <Calendar size={12} className="text-gray-400" />
                <span>{Time}</span>

                {/* contadores */}
                  <Users size={12} className="text-gray-400" /> 
                <span className="font-medium">{total}</span>
                <span>destinatário{total === 1 ? "" : "s"}</span>

               <Eye size={12} className="text-gray-400" />  
                <span className="font-medium">{readCount}</span>
                <span>lida{readCount === 1 ? "" : "s"}</span>
              </div>

            
            </div>
          </div>
        </Alert>
      </div>

      {/* ===================== Dialog de detalhes / destinatários ===================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="">
              <DialogHeader>
                      <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px] flex items-center gap-2">   <IconComp size={24} className=" shrink-0" />{detail?.title ?? "Notificação"}</DialogTitle>
                     {detail?.description && (
 <DialogDescription className="text-zinc-500 ">
                        {detail.description}
                      </DialogDescription>
                     )}
                     
                    </DialogHeader>
          
            <Separator className="my-4" />

            <div className="mb-4 grid gap-4">
<div className="flex flex-wrap  items-center gap-2 text-sm text-gray-500">
               <div className="flex gap-2 items-center">
                 <Calendar size={12} className="text-gray-400" />
                <span>{Time}</span>

                </div>  

                {detail.link && (
 <div className="flex gap-2 items-center">
                  
              <LinkIcon size={12} /> Link:{" "}
                    <a
                      href={detail.link}
                      target={hasHttp(detail.link) ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 truncate max-w-[240px]"
                    >
                      {detail.link}
                    </a>
                    {hasHttp(detail.link) && <ExternalLink size={12} className="text-gray-400" />}

                </div>
                )}
             
               
             
              </div>

                          <Separator className="my-4" />

              {/* Lista de destinatários no modelo "Button + Avatar" */}
<div className="max-h-[250px] overflow-y-auto elementBarra">
  <div className="flex flex-col gap-1 p-2">
    {total === 0 ? (
      <div className="p-4 text-sm text-center text-gray-500">
        Nenhum destinatário informado.
      </div>
    ) : (
      recipients.map((r: any) => {
        const read = !!r?.read_at;
        const username = r?.target_user?.username || "(sem nome)";
        const email = r?.target_user?.email || "-";
        const userId = r?.target_user?.id ?? r?.id;

        return (
          <Button
            variant="ghost"
            key={r?.id}
            className={`text-left justify-start h-auto 
           `}
   
          >
            <Avatar className="cursor-pointer rounded-md h-8 w-8 mr-2">
              <AvatarImage
                className="rounded-md h-8 w-8"
                src={`${urlGeral}user/upload/${userId}/icon`}
              />
              <AvatarFallback className="flex items-center justify-center">
                <User size={12} />
              </AvatarFallback>
            </Avatar>

            <div className="flex items-start justify-between w-full">
              <div className="min-w-0">
                <p className="font-medium truncate">{username}</p>
                <div className="text-xs text-gray-500 font-normal truncate">
                  ({email})
                </div>
              </div>

              <div className="ml-2 text-[11px] text-gray-600 flex items-center gap-1 shrink-0">
                {read ? (
                  <>
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span className="whitespace-nowrap">
                      {formatDateBR(r.read_at!)}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock size={12} className="text-amber-600" />
                    <span className="whitespace-nowrap">não lida</span>
                  </>
                )}
              </div>
            </div>
          </Button>
        );
      })
    )}
  </div>
</div>

            </div>

          <DialogFooter >
<div className="flex justify-between items-center w-full">
              <div className="flex text-sm gap-2 items-center text-gray-500">
                 {/* contadores */}
                   <div className="flex gap-2 items-center">
                      <Users size={12} className="text-gray-400" /> 
                <span className="font-medium">{total}</span>
                <span>destinatário{total === 1 ? "" : "s"}</span>

                   </div>
                
                <div className="flex gap-2 items-center">
  <Eye size={12} className="text-gray-400" />  
                <span className="font-medium">{readCount}</span>
                <span>lida{readCount === 1 ? "" : "s"}</span>
                </div>
             
            </div>
 
            <Button variant="ghost" onClick={() => setOpen(false)}>
            <ArrowUUpLeft size={16} /> Cancelar
            </Button>
</div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* =================== /Dialog =================== */}
    </>
  );
});
