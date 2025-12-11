import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/context";

import {
  AlertCircle,
  MessageCircle,
  LogIn,
  Bell as BellIcon,
} from "lucide-react";
import { NotificationItemDialog } from "../dashboard/administrativo/components/notification-item";

/* ========================= Tipos da NOVA API ========================= */
type PermissionDTO = {
  id: string;
  name: string;
  code: string;
  description: string;
};

type RoleDTO = {
  id: string;
  name: string;
  description: string;
  permissions: PermissionDTO[];
};

type LegalGuardianDTO = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: string;
};

type SystemIdentityDTO = {
  id: string;
  legal_guardian?: LegalGuardianDTO;
};

type SourceUserDTO = {
  id: string;
  username: string;
  email: string;
  provider?: string;
  linkedin?: string;
  lattes_id?: string;
  orcid?: string;
  ramal?: string;
  photo_url?: string;
  background_url?: string;
  matricula?: string;
  verify?: boolean;
  institution_id?: string;
  roles?: RoleDTO[];
  system_identity?: SystemIdentityDTO;
};

type NotificationEnvelopeDTO = {
  id: string;
  type?: string;
  detail?: any;
  source_user?: SourceUserDTO;
};

export type ApiNotificationItem = {
  id: string; // envelope id
  read_at?: string | null;
  created_at?: string;
  notification?: NotificationEnvelopeDTO;
};

export type ApiNotificationPayload =
  | { notifications: ApiNotificationItem[] }
  | ApiNotificationItem[];

/* ========================= Formato achatado (UI) ========================= */
export type FlatNotification = {
  id: string; // envelope id
  read_at?: string | null;
  created_at?: string;
  type?: string;
  detail?: any;
  source_user?: SourceUserDTO;
  __raw?: ApiNotificationItem;
};

/* ========================= Prévia flutuante ========================= */
export type NotificationPreview = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  show: boolean;
};

/* ========================= Fallback por TIPO ========================= */
export const notificationsTypes = [
  { type: "NEW_LOGIN", icon: LogIn, bg_color: "bg-gray-200" },
  { type: "MESSAGE", icon: MessageCircle, bg_color: "bg-purple-100" },
  { type: "SYSTEM", icon: AlertCircle, bg_color: "bg-eng-blue" },
];

/* ========================= Helpers ========================= */
function isArray<T = any>(v: any): v is T[] {
  return Array.isArray(v);
}

function resolveListFromData(
  data?: ApiNotificationPayload
): ApiNotificationItem[] {
  if (!data) return [];
  if (isArray<ApiNotificationItem>(data)) return data;
  if (isArray<ApiNotificationItem>((data as any).notifications))
    return (data as any).notifications;
  return [];
}

function flattenApiItem(item: ApiNotificationItem): FlatNotification {
  return {
    id: item.id,
    read_at: item.read_at ?? null,
    created_at: item.created_at,
    type: item.notification?.type,
    detail: item.notification?.detail,
    source_user: item.notification?.source_user,
    __raw: item,
  };
}

/* ========================= Props ========================= */
type NotificationsProps = {
  data?: ApiNotificationPayload;
  disablePolling?: boolean;
  pollIntervalMs?: number;
};

export function NotificationsHeader({
  data,
  disablePolling,
  pollIntervalMs = 60_000,
}: NotificationsProps) {
  const { urlGeral } = useContext(UserContext);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const baseUrl = useMemo(() => {
    try {
      return new URL("notifications/my", urlGeral).toString();
    } catch {
      return `${(urlGeral || "").replace(/\/+$/, "")}/notifications/my`;
    }
  }, [urlGeral]);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<FlatNotification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationPreview, setNotificationPreview] =
    useState<NotificationPreview | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = authToken
    ? `notifications_${authToken.substring(0, 10)}`
    : null;

  const saveToStorage = (items: FlatNotification[]) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(items));
  };
  const loadFromStorage = (): FlatNotification[] => {
    if (!storageKey) return [];
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  };
  const clearStorage = () => {
    if (storageKey) localStorage.removeItem(storageKey);
  };

  const checkForNewNotifications = (
    fresh: FlatNotification[],
    old: FlatNotification[]
  ) => {
    const oldIds = new Set(old.map((n) => n.id));
    const newOnes = fresh.filter((n) => !oldIds.has(n.id));
    if (newOnes.length > 0) {
      setHasNewNotifications(true);
      const first = newOnes[0];
      const title =
        first.detail?.title ??
        first.detail?.message ??
        first.detail?.texto ??
        "Notificação";
      const description =
        first.detail?.description ??
        first.detail?.descricao ??
        first.detail?.body ??
        undefined;

      setNotificationPreview({
        id: first.id,
        title,
        description,
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

      const payload: ApiNotificationPayload = await res
        .json()
        .catch(() => [] as ApiNotificationItem[]);
      const rawList: ApiNotificationItem[] = resolveListFromData(payload);
      const list: FlatNotification[] = rawList.map(flattenApiItem);

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

  // token + listener
  useEffect(() => {
    if (data) return;

    try {
      const tk =
        typeof window !== "undefined"
          ? localStorage.getItem("jwt_token")
          : null;
      setAuthToken(tk);
    } catch (e) {
      console.error("[notifications] erro lendo jwt_token:", e);
    }

    const interval = setInterval(() => {
      try {
        const tk = localStorage.getItem("jwt_token");
        setAuthToken((prev) => (prev !== tk ? tk : prev));
      } catch {}
    }, 1000);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "jwt_token") setAuthToken(ev.newValue);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [data]);

  // via props controlado
  useEffect(() => {
    if (!data) return;
    const rawList = resolveListFromData(data);
    const list = rawList.map(flattenApiItem);

    checkForNewNotifications(list, []);
    setNotifications(list);
    setHasNewNotifications(list.some((n) => !n.read_at));
    setLoading(false);
  }, [data]);

  // polling
  useEffect(() => {
    if (data || disablePolling) {
      clearStorage();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

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
    fetchNotifications(true, controller.signal);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => fetchNotifications(false),
      Math.max(15_000, pollIntervalMs)
    );

    return () => {
      controller.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, authToken, data, disablePolling, pollIntervalMs]);

  const handleMarkedRead = (id: string) => {
    setHasNewNotifications(false);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, read_at: n.read_at ?? new Date().toISOString() }
          : n
      )
    );
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
    );
    saveToStorage(updated);
  };

  return (
    <>
      {notificationPreview && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-in slide-in-from-top-5">
          <Alert className="bg-blue-50 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {notificationPreview.title}
                </div>
                {notificationPreview.description && (
                  <div className="text-xs text-gray-600">
                    {notificationPreview.description}
                  </div>
                )}
              </div>
            </div>
          </Alert>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="h-full w-full flex items-center justify-center">
                  <BellIcon className="h-4 w-4" />
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
                <NotificationItemDialog
                  notification={n as any}
                  baseUrl={baseUrl.replace(/\/my$/, "")} // PATCH vai em /notifications/:id
                  token={authToken ?? ""}
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
