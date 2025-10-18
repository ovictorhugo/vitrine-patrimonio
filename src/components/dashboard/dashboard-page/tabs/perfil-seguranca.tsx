import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../../../context/context";
import { toast } from "sonner";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { RefreshCcw } from "lucide-react";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { NotificationItem } from "../../administrativo/components/notification-item";
import { NotificationDTO, NotificationsResponse } from "../../administrativo/tabs/notification";
import { Alert } from "../../../ui/alert";
import { NotificationPreview, notificationsTypes } from "../../../header/notifications";

type UpdateUserPayload = {
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
};

const PAGE_SIZE = 5;

export function PerfilSegurancaDashboard() {
  const { user, urlGeral } = useContext(UserContext);

  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);
  const userId = user?.id;

  const [data, setData] = useState<UpdateUserPayload>({
    username: user?.username || "",
    email: user?.email || "",
    provider: user?.provider || "local",
    linkedin: user?.linkedin || "",
    lattes_id: user?.lattes_id || "",
    orcid: user?.orcid || "",
    ramal: user?.ramal || "",
    photo_url: user?.photo_url || "",
    background_url: user?.background_url || "",
    matricula: user?.matricula || "",
    verify: Boolean(user?.verify) || false,
    institution_id: user?.institution_id || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!userId) {
        toast("Usuário não identificado", {
          description: "Não foi possível obter o ID do usuário logado.",
          action: { label: "Fechar", onClick: () => {} },
        });
        return;
      }

      if (!data.username.trim()) {
        toast("O nome não pode ser vazio", {
          description: "Por favor, preencha o campo Nome completo.",
          action: { label: "Fechar", onClick: () => {} },
        });
        return;
      }

      if (!data.email.trim()) {
        toast("O e-mail é obrigatório", {
          description: "Informe um e-mail válido.",
          action: { label: "Fechar", onClick: () => {} },
        });
        return;
      }

      setIsSubmitting(true);

      const url = `${urlGeral}users/${userId}`;

      const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Falha ao atualizar (HTTP ${response.status}).`);
      }

      toast("Dados atualizados com sucesso", {
        description: "As informações do seu perfil foram salvas.",
        action: { label: "Fechar", onClick: () => {} },
      });
    } catch (error: any) {
      console.error("Erro ao processar a requisição:", error);
      toast("Erro ao processar a requisição", {
        description: error?.message || "Tente novamente mais tarde.",
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------
  // BLOCO DE NOTIFICAÇÕES
  // ------------------------------

  const [authToken, setAuthToken] = useState<string | null>(null);

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
  const [notificationPreview, setNotificationPreview] = useState<NotificationPreview | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = authToken ? `notifications_${authToken.substring(0, 10)}` : null;

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

  const checkForNewNotifications = (fresh: NotificationDTO[], old: NotificationDTO[]) => {
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
      previewTimeoutRef.current = setTimeout(() => setNotificationPreview(null), 3000);
    }
  };

  async function fetchNotifications(isInitial = false, signal?: AbortSignal): Promise<void> {
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
      setVisibleCount(PAGE_SIZE); // reinicia paginação
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("[notifications] fetch falhou:", e);
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  // Token e listeners
  useEffect(() => {
    try {
      const tk = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
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

  // Polling
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
    fetchNotifications(true, controller.signal);

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
  }, [baseUrl, authToken]);

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

  // ------------------------------
  // PAGINAÇÃO LOCAL
  // ------------------------------
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [authToken]);

  // ------------------------------
  // RENDERIZAÇÃO
  // ------------------------------
  return (
    <div className="flex gap-8 p-8 pt-0">
      <div className="flex flex-col flex-1 w-full gap-8">
        {/* INFORMAÇÕES BÁSICAS */}
        <fieldset className="grid gap-4 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950">
          <legend className="-ml-1 px-1 text-sm font-medium">Informações básicas</legend>

          <div className="flex w-full flex-col gap-2">
            <Label>Nome completo</Label>
            <Input
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
              type="text"
            />
          </div>

          <div className="flex flex-col md:flex-row w-full gap-4 items-end">
            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <Input
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                type="email"
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Matrícula</Label>
              <Input
                value={data.matricula}
                onChange={(e) => setData({ ...data, matricula: e.target.value })}
                type="text"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full gap-4 items-end">
            <div className="flex w-full flex-col gap-2">
              <Label>Provedor</Label>
              <Input
                value={data.provider}
                onChange={(e) => setData({ ...data, provider: e.target.value })}
                type="text"
                disabled
              />
            </div>
          </div>
        </fieldset>

        {/* CONTATO */}
        <fieldset className="grid gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950">
          <legend className="-ml-1 px-1 text-sm font-medium">Contato e perfis</legend>

          <div className="flex flex-col md:flex-row w-full gap-4 items-end">
            <div className="flex w-full flex-col gap-2">
              <Label>Ramal</Label>
              <Input
                value={data.ramal}
                onChange={(e) => setData({ ...data, ramal: e.target.value })}
                type="text"
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>ID Lattes</Label>
              <Input
                value={data.lattes_id}
                onChange={(e) => setData({ ...data, lattes_id: e.target.value })}
                type="text"
              />
            </div>
          </div>
        </fieldset>

        {/* AUTORIZAÇÕES */}
        <fieldset className="grid gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950">
          <legend className="-ml-1 px-1 text-sm font-medium">Autorizações e permissões</legend>

          <div className="flex gap-4 items-center">
            <Switch
              checked={data.verify}
              disabled
              onCheckedChange={(checked) => setData({ ...data, verify: checked })}
            />
            <div className="flex flex-col">
              <p className="font-medium">Conta verificada</p>
              <p className="text-xs text-muted-foreground">
                Marcar perfil como verificado na plataforma.
              </p>
            </div>
          </div>
        </fieldset>

        <Button
          className="w-fit ml-auto"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <RefreshCcw size={16} className={isSubmitting ? "animate-spin" : ""} />
          {isSubmitting ? "Salvando..." : "Atualizar dados"}
        </Button>
      </div>

      {/* PAINEL DE NOTIFICAÇÕES */}
      <div className="max-w-[400px] w-[400px] min-w-[400px]">
        <h1 className="mb-4 text-2xl font-semibold">Notificações</h1>

        <div ref={listRef} className="grid gap-4 max-h-[70vh] overflow-auto pr-2">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 h-full flex items-center justify-center">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 h-full flex items-center justify-center">
              Nenhuma notificação encontrada {`>_<`}
            </div>
          ) : (
            <>
              {notifications.slice(0, visibleCount).map((n) => (
                <Alert key={n.id} className="p-0">
                  <NotificationItem
                    notification={n}
                    baseUrl={baseUrl}
                    token={authToken!}
                    notificationsTypes={notificationsTypes}
                    onMarkedRead={handleMarkedRead}
                  />
                </Alert>
              ))}

              {notifications.length > visibleCount && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  onClick={() =>
                    setVisibleCount((c) => Math.min(c + PAGE_SIZE, notifications.length))
                  }
                >
                  Mostrar mais
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
