import { memo, useContext } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../../ui/alert";
import { Calendar, User as UserIcon, Bell as BellIcon } from "lucide-react";
import * as LucideMap from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { UserContext } from "../../../../context/context";

/** Tolerante a:
 *  - Objeto achatado (FlatNotification)
 *  - Objeto aninhado { id, created_at, notification: { type, detail, source_user } }
 */

type TypeInfo = { type: string; icon: any; bg_color: string };

type Props = {
  notification: any; // FlatNotification OU ApiNotificationItem
  baseUrl: string;   // base sem /my (ex.: https://.../)
  token: string;
  notificationsTypes: TypeInfo[];
  onMarkedRead?: (id: string) => void;
  className?: string;
};

/* ========================= Helpers ========================= */

function normalizeIconKey(name?: string) {
  if (!name) return undefined;
  const cleaned = String(name).trim();

  const candidates = [
    cleaned,                                   // "Bell"
    cleaned.toLowerCase(),                     // "bell"
    cleaned.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()), // "alert-circle" -> "alertCircle"
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1),      // "bell" -> "Bell"
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

function resolveTypeInfo(
  type: string | undefined,
  notificationsTypes: TypeInfo[]
) {
  const found = type ? notificationsTypes.find((t) => t.type === type) : null;
  return found ?? { icon: BellIcon, bg_color: "bg-gray-100" };
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
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
  const url = `${baseUrl.replace(/\/+$/, "")}/notifications/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) throw new Error("Falha ao marcar notificação como lida");
}

const hasHttp = (url?: string) => !!url && /^https?:\/\//i.test(url);
const isInternal = (url?: string) => !!url && url.startsWith("/");

function getSender(n: any) {
  return n?.source_user ?? n?.notification?.source_user ?? null;
}

/* ===================== Componente ===================== */

export const NotificationItemDialog = memo(function NotificationItem({
  notification,
  baseUrl,
  token,
  notificationsTypes,
  onMarkedRead,
  className,
}: Props) {
  const { urlGeral } = useContext(UserContext);

  const envelopeId: string = notification?.id;
  const created_at: string | undefined =
    notification?.created_at ?? notification?.notification?.created_at;

  const type: string | undefined =
    notification?.type ?? notification?.notification?.type;

  const detail: any =
    notification?.detail ?? notification?.notification?.detail ?? {};

  const sender = getSender(notification);
  const senderName: string = sender?.username || sender?.name || sender?.email || "—";

  const avatarUrl =
    sender?.id && urlGeral
      ? `${urlGeral.replace(/\/+$/, "")}/user/upload/${sender.id}/icon`
      : undefined;

  const IconFromDetail = getIconFromDetail(detail?.icon);
  const typeInfo = resolveTypeInfo(type, notificationsTypes);
  const FallbackIcon = typeInfo.icon || BellIcon;
  const bgColor = typeInfo.bg_color;
  const IconComp = IconFromDetail ?? FallbackIcon;

  const link: string | undefined = detail?.link;
  const clickable = !!link;
  const external = hasHttp(link);
  const internal = isInternal(link);

  const navigate = () => {
    if (!clickable) return;
    if (external) {
      window.open(link!, "_blank", "noopener,noreferrer");
    } else if (internal) {
      window.location.assign(link!);
    } else {
      window.location.assign(link!);
    }
  };

  const handleClick = async () => {
    try {
      await patchRead(baseUrl, envelopeId, token);
      onMarkedRead?.(envelopeId);
      navigate();
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
      <div className={`${bgColor} w-2 rounded-l-md border`} />

      <Alert
        className={`w-full border-l-0 rounded-l-none border-0 dark:text-white transition-all ${
          clickable ? "hover:opacity-90" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <IconComp className="h-5 w-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-sm font-medium truncate">
              {detail?.title ?? "Notificação"}
            </AlertTitle>

            {detail?.description && (
              <AlertDescription className="text-xs text-gray-600 line-clamp-2">
                {detail.description}
              </AlertDescription>
            )}

            <div className="flex flex-wrap items-center mt-8 gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} className="text-gray-400" />
                <span>{formatDate(created_at)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs ">
                <Avatar className="rounded-md h-4 w-4 shrink-0">
                  {avatarUrl ? (
                    <AvatarImage className="rounded-md h-5 w-5" src={avatarUrl} />
                  ) : (
                    <AvatarImage className="rounded-md h-5 w-5" src="" />
                  )}
                  <AvatarFallback className="flex items-center justify-center">
                    <UserIcon size={10} />
                  </AvatarFallback>
                </Avatar>
                <span
                  className="text-xs text-gray-500 truncate max-w-[10rem]"
                  title={senderName}
                >
                  {senderName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
});
