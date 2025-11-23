import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useTheme } from "next-themes";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/context";

import { SymbolEEWhite } from "./svg/SymbolEEWhite";
import { LogoVitrineWhite } from "./svg/LogoVitrineWhite";
import { SymbolEE } from "./svg/SymbolEE";
import { LogoVitrine } from "./svg/LogoVitrine";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

interface JwtPayload {
  exp?: number;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // ========= A) token em estado =========
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("jwt_token")
  );

  const {
    setLoggedIn,
    setUser,
    setPermission,
    setRole,
    urlGeral,

    // TIMER (contexto)
    timeLoggedIn,
    setTimeLoggedIn,
  } = useContext(UserContext);

  const { theme } = useTheme();
  const navigate = useNavigate();

  // ========= B) timer de expiração =========
  const logoutTimerRef = useRef<number | null>(null);

  // TIMER (intervalo para atualizar restante)
  const countdownIntervalRef = useRef<number | null>(null);

  // ========= evita loading a cada rota =========
  const hasCheckedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);

  const delay = useCallback(
    (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
    []
  );

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const clearCountdownInterval = () => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const formatRemaining = (totalMs: number) => {
    const totalSec = Math.max(0, Math.floor(totalMs / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };

  const handleLogout = useCallback(async () => {
    clearLogoutTimer();
    clearCountdownInterval();

    localStorage.removeItem("jwt_token");
    localStorage.removeItem("permission");
    localStorage.removeItem("role");

    setLoggedIn(false);
    setUser({} as any);
    setPermission([]);
    setRole("");

    setToken(null);
    setLoading(false);

    // zera timer no contexto
    setTimeLoggedIn(0);

    // se quiser forçar a tela de login:
    // navigate("/auth", { replace: true });
  }, [
    navigate,
    setLoggedIn,
    setUser,
    setPermission,
    setRole,
    setTimeLoggedIn,
  ]);

  // ========= (2) fetch com retry/backoff para 5xx/rede =========
  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retries = 3) => {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const res = await fetch(url, options);

          // se erro de servidor (5xx), tenta de novo
          if (res.status >= 500 && attempt < retries - 1) {
            await delay(500 * 2 ** attempt); // 0.5s, 1s, 2s...
            continue;
          }

          return res;
        } catch (err) {
          // erro de rede → tenta de novo
          if (attempt < retries - 1) {
            await delay(500 * 2 ** attempt);
            continue;
          }
          throw err;
        }
      }

      // fallback (não deve chegar aqui)
      return fetch(url, options);
    },
    [delay]
  );

  // ========= (1) logout só em 401/403 =========
  const fetchUser = useCallback(
    async (token: string) => {
      try {
        const response = await fetchWithRetry(`${urlGeral}users/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // ✅ logout SOMENTE se for autenticação inválida
        if (response.status === 401 || response.status === 403) {
          await handleLogout();
          return;
        }

        // ✅ backend instável (5xx) → mantém logado, não derruba sessão
        if (response.status >= 500) {
          console.warn("Backend instável ao buscar usuário:", response.status);
          setLoading(false); // libera render do app
          return;
        }

        // outros erros não-auth: não derruba sessão
        if (!response.ok) {
          console.warn("Erro não-auth ao buscar usuário:", response.status);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data) {
          const user = data;
          user.roles = user.roles || [];

          setLoggedIn(true);
          setUser(user);

          const storedPermission = localStorage.getItem("permission");
          const storedRole = localStorage.getItem("role");

          if (storedPermission) setPermission(JSON.parse(storedPermission));
          if (storedRole) setRole(JSON.parse(storedRole));

          await delay(600); // UX mínima
          setLoading(false);
        } else {
          // veio vazio sem ser 5xx → aí sim algo estranho, desloga
          await handleLogout();
        }
      } catch (err) {
        // ✅ erro de rede/timeout → NÃO desloga
        console.error("Erro de rede ao buscar dados do usuário:", err);
        setLoading(false);
      }
    },
    [
      urlGeral,
      setLoggedIn,
      setUser,
      setPermission,
      setRole,
      handleLogout,
      fetchWithRetry,
      delay,
    ]
  );

  useEffect(() => {
    // ========= A) escutar mudanças no localStorage (outra aba) =========
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jwt_token") {
        setToken(e.newValue);
      }
    };

    // ========= A) escutar evento custom na MESMA aba =========
    const onTokenChange = () => {
      setToken(localStorage.getItem("jwt_token"));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("token-change", onTokenChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("token-change", onTokenChange as EventListener);
    };
  }, []);

  useEffect(() => {
    // detecta se token realmente mudou
    const isNewToken = token !== lastTokenRef.current;
    lastTokenRef.current = token;

    // Só entra em loading se:
    // 1) é a primeira checagem do app
    // 2) token mudou (login/logout/refresh)
    if (!hasCheckedRef.current || isNewToken) {
      setLoading(true);
    }

    clearLogoutTimer();
    clearCountdownInterval();

    if (!token) {
      handleLogout();
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const nowSec = Date.now() / 1000;

      if (!decoded.exp || decoded.exp <= nowSec) {
        handleLogout();
        return;
      }

      const expMs = decoded.exp * 1000;
      const nowMs = Date.now();
      const msToExpire = expMs - nowMs;

      // ========= B) agenda logout automático =========
      logoutTimerRef.current = window.setTimeout(() => {
        handleLogout();
      }, msToExpire);

      // ========= TIMER: atualiza restante a cada 1s =========
      const updateCountdown = () => {
        const remainingMs = expMs - Date.now();
        setTimeLoggedIn(Math.max(0, remainingMs));

        if (remainingMs <= 0) handleLogout();
      };

      updateCountdown(); // já atualiza instantâneo
      countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);

      // token ok => busca usuário
      fetchUser(token).finally(() => {
        hasCheckedRef.current = true;
      });
    } catch (err) {
      console.error("[LoadingWrapper] decode falhou", err);
      handleLogout();
    }

    return () => {
      clearLogoutTimer();
      clearCountdownInterval();
    };
  }, [token, fetchUser, handleLogout, setTimeLoggedIn]);

  return loading ? (
    <main className="h-screen w-full flex items-center justify-center">
      <div className="animate-pulse">
        {theme === "dark" ? (
          <div className="flex items-center gap-2">
            <div className="h-16 flex items-center gap-2">
              <SymbolEEWhite />
            </div>
            <div className="h-10 flex items-center gap-2">
              <LogoVitrineWhite />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-16 flex items-center gap-2">
              <SymbolEE />
            </div>
            <div className="h-10 flex items-center gap-2">
              <LogoVitrine />
            </div>
          </div>
        )}
      </div>
    </main>
  ) : (
    <>{children}</>
  );
};

export default LoadingWrapper;
