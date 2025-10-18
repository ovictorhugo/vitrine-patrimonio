import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../context/context";

import {
  Bell,
  AlertCircle,
  BadgePlus,
  Heart,
  RefreshCcw,
  UserPlus,
  MessageCircle,
  LogIn,
  CalendarClock,
} from "lucide-react";

import {
  NotificationDTO,
  NotificationsResponse,
} from "../dashboard/administrativo/tabs/notification";
import { NotificationItem } from "../dashboard/administrativo/components/notification-item";
import { Drop } from "phosphor-react";
import { Separator } from "../ui/separator";

// Tipagem da prévia flutuante
export type NotificationPreview = {
  id: string;
  title: string;
  description?: string;
  type: string;
  show: boolean;
};

// Fallback por TIPO (quando detail.icon não existir)
export const notificationsTypes = [
  { type: "NEW_LOGIN", icon: LogIn, bg_color: "bg-gray-200" },
  { type: "MESSAGE", icon: MessageCircle, bg_color: "bg-purple-100" },
  { type: "SYSTEM", icon: AlertCircle, bg_color: "bg-eng-blue" },
];

export function Notifications() {
  const { urlGeral } = useContext(UserContext);

  // Token em state (reage quando for salvo/alterado no localStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);

  // URL segura, independente de barra final em urlGeral
  const baseUrl = (() => {
    try {
      return new URL("notifications/my", urlGeral).toString();
    } catch {
      return `${(urlGeral || "").replace(/\/+$/, "")}/notifications/my`;
    }
  })();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationPreview, setNotificationPreview] =
    useState<NotificationPreview | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chave por token
  const storageKey = authToken
    ? `notifications_${authToken.substring(0, 10)}`
    : null;

  const saveToStorage = (items: NotificationDTO[]) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(items));
  };
  const loadFromStorage = (): NotificationDTO[] => {
    if (!storageKey) return [];
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  };
  const clearStorage = () => {
    if (storageKey) localStorage.removeItem(storageKey);
  };

  const checkForNewNotifications = (
    fresh: NotificationDTO[],
    old: NotificationDTO[]
  ) => {
    const oldIds = new Set(old.map((n) => n.id));
    const newOnes = fresh.filter((n) => !oldIds.has(n.id));
    if (newOnes.length > 0) {
      setHasNewNotifications(true);
      const first = newOnes[0];
      setNotificationPreview({
        id: first.id,
        title: first.detail?.title ?? "Notificação",
        description: first.detail?.description,
        type: first.type,
        show: true,
      });
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(
        () => setNotificationPreview(null),
        3000
      );
    }
  };

  async function fetchNotifications(
    isInitial = false,
    signal?: AbortSignal
  ): Promise<void> {
    if (!authToken) {
      if (isInitial) setLoading(false);
      return;
    }
    try {
      const res = await fetch(baseUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("[notifications] HTTP", res.status, res.statusText, txt);
        throw new Error(`Erro ao buscar notificações (${res.status})`);
      }

      // Ajuste caso sua API retorne array direto
      const payload: NotificationsResponse | NotificationDTO[] = await res
        .json()
        .catch(() => ({} as NotificationsResponse));

      const list = Array.isArray((payload as NotificationsResponse)?.notifications)
        ? (payload as NotificationsResponse).notifications
        : Array.isArray(payload)
        ? (payload as NotificationDTO[])
        : [];

      if (!isInitial) {
        const old = loadFromStorage();
        checkForNewNotifications(list, old);
      }

      setNotifications(list);
      saveToStorage(list);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("[notifications] fetch falhou:", e);
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  // Lê token inicialmente e observa mudanças (mesma aba e outras abas)
  useEffect(() => {
    try {
      const tk =
        typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
      setAuthToken(tk);
    } catch (e) {
      console.error("[notifications] erro lendo jwt_token:", e);
    }

    // Observa mudanças no mesmo tab (ex.: login sobrescreve token)
    const interval = setInterval(() => {
      try {
        const tk = localStorage.getItem("jwt_token");
        setAuthToken((prev) => (prev !== tk ? tk : prev));
      } catch {}
    }, 1000);

    // Observa mudanças em outras abas
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "jwt_token") {
        setAuthToken(ev.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Polling de 1 em 1 minuto
  useEffect(() => {
    if (!authToken) {
      clearStorage();
      setNotifications([]);
      setHasNewNotifications(false);
      setLoading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const controller = new AbortController();

    // Primeira carga
    fetchNotifications(true, controller.signal);

    // Intervalo de 60.000 ms
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchNotifications(false), 60_000);

    return () => {
      controller.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, authToken]);

  // Marcar como lida localmente
  const handleMarkedRead = (id: string) => {
    setHasNewNotifications(false);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
      )
    );
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
    );
    saveToStorage(updated);
  };

  return (
    <>
      {/* Prévia flutuante */}
      {notificationPreview && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-in slide-in-from-top-5">
          <Alert className="bg-blue-50 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <AlertTitle className="text-sm font-medium">
                  {notificationPreview.title}
                </AlertTitle>
                {notificationPreview.description && (
                  <AlertDescription className="text-xs text-gray-600">
                    {notificationPreview.description}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Botão + Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="h-full w-full flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                  {hasNewNotifications && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-eng-blue rounded-full animate-pulse" />
                  )}
                  <span className="sr-only">Notificações</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notificações</p>
              </TooltipContent>
            </Tooltip>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 gap-2 p-2 m-8 mt-0 max-h-96 overflow-y-auto flex flex-col">
          <DropdownMenuLabel className="pb-1">Notificações</DropdownMenuLabel>
          <Separator className="mb-2" />
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 h-full items-center flex">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 h-full w-full justify-center items-center flex">
              Nenhuma notificação encontrada {`>_<`}
            </div>
          ) : (
            notifications.map((n) => (
              <Alert key={n.id} className="p-0">
                <NotificationItem
                  notification={n}
                  baseUrl={baseUrl}
                  token={authToken!}
                  notificationsTypes={notificationsTypes}
                  onMarkedRead={handleMarkedRead}
                />
              </Alert>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
