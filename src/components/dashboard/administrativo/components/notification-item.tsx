import { memo } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../../ui/alert";
import { Calendar } from "lucide-react";
import { icons as LucideMap } from "lucide-react";
import type { NotificationDTO } from "../tabs/notification"; // ajuste o caminho se necessário

type NotificationItemProps = {
  notification: NotificationDTO;
  // base do endpoint, ex.: `${urlGeral}notifications` (sem barra final)
  baseUrl: string;
  token: string;
  // fallback por tipo quando NÃO houver detail.icon
  notificationsTypes: Array<{ type: string; icon: any; bg_color: string }>;
  // callback para avisar o pai que marcou como lida
  onMarkedRead?: (id: string) => void;
  className?: string;
};

/* ========================= Helpers ========================= */

function toKey(name?: string) {
  if (!name) return undefined;
  const k = name.trim();
  const lower = k[0].toLowerCase() + k.slice(1);
  if ((LucideMap as any)[lower]) return lower;
  if ((LucideMap as any)[k]) return k; // caso já esteja lowercase
  return undefined;
}

function getIconFromDetail(detailIcon?: string) {
  const key = toKey(detailIcon);
  return key ? (LucideMap as any)[key] : null;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function patchRead(baseUrl: string, id: string, token: string) {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) {
    throw new Error("Falha ao marcar notificação como lida");
  }
}

function resolveTypeInfo(
  type: string,
  notificationsTypes: Array<{ type: string; icon: any; bg_color: string }>
) {
  const found = notificationsTypes.find((t) => t.type === type);
  return found ?? { icon: (LucideMap as any).bell, bg_color: "bg-gray-100" };
}

const hasHttp = (url?: string) => !!url && /^https?:\/\//i.test(url);
const isInternal = (url?: string) => !!url && url.startsWith("/");

/* ===================== Componente ===================== */

export const NotificationItem = memo(function NotificationItem({
  notification,
  baseUrl,
  token,
  notificationsTypes,
  onMarkedRead,
  className,
}: NotificationItemProps) {
  const { type, detail, created_at, id } = notification;

  // 1) ícone pelo detail.icon (lucide map)
  const IconFromDetail = getIconFromDetail(detail?.icon);

  // 2) fallback pelo tipo
  const typeInfo = resolveTypeInfo(type, notificationsTypes);
  const FallbackIcon = typeInfo.icon;
  const bgColor = typeInfo.bg_color;

  const IconComp = IconFromDetail ?? FallbackIcon;

  // Link behavior
  const link = detail?.link;
  const clickable = !!link;
  const external = hasHttp(link);
  const internal = isInternal(link);

  const handleNavigate = () => {
    if (!clickable) return;

    if (external) {
      window.open(link!, "_blank", "noopener,noreferrer");
    } else if (internal) {
      // Se usa React Router, substitua por navigate(link!)
      window.location.assign(link!);
    } else {
      // fallback (se veio algo não http e não começa com "/")
      window.location.assign(link!);
    }
  };

  const handleClick = async () => {
    try {
      await patchRead(baseUrl, id, token);
      onMarkedRead?.(id);
      handleNavigate();
    } catch (e) {
      console.error(e);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      onKeyDown={onKeyDown}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      className={`w-full flex text-left ${className ?? ""} ${
        clickable ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* barrinha lateral */}
      <div className={`${bgColor}  w-2 rounded-l-md border`} />

      <Alert
        className={` w-full border-l-0 rounded-l-none border-0  dark:text-white transition-all ${
          clickable ? "hover:opacity-90" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <IconComp className="h-5 w-5" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-sm font-medium truncate">
              {detail?.title ?? "Notificação"}
            </AlertTitle>

            {detail?.description && (
              <AlertDescription className="text-xs text-gray-600 line-clamp-2">
                {detail.description}
              </AlertDescription>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Calendar size={12} className="text-gray-400" />
              <p className="text-xs text-gray-500">{formatDate(created_at)}</p>

              {/* etiqueta opcional para sinalizar externo */}
              {external && (
                <span className="ml-auto text-[10px] text-gray-500">externo</span>
              )}
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
});
