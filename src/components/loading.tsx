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
import { useIsMobile } from "../hooks/use-mobile";

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

    // ✅ NOVO (contexto estável):
    setSessionExpMs,
  } = useContext(UserContext);

  const { theme } = useTheme();
  const navigate = useNavigate();

  // ========= B) timer de expiração =========
  const logoutTimerRef = useRef<number | null>(null);

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

  const handleLogout = useCallback(async () => {
    clearLogoutTimer();

    localStorage.removeItem("jwt_token");
    localStorage.removeItem("permission");
    localStorage.removeItem("role");

    setLoggedIn(false);
    setUser({} as any);
    setPermission([]);
    setRole("");

    setToken(null);
    setLoading(false);

    // ✅ zera expiração no contexto
    setSessionExpMs(null);

    // se quiser forçar a tela de login:
    // navigate("/auth", { replace: true });
  }, [navigate, setLoggedIn, setUser, setPermission, setRole, setSessionExpMs]);

  // ========= fetch com retry/backoff =========
  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retries = 3) => {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const res = await fetch(url, options);

          if (res.status >= 500 && attempt < retries - 1) {
            await delay(500 * 2 ** attempt);
            continue;
          }

          return res;
        } catch (err) {
          if (attempt < retries - 1) {
            await delay(500 * 2 ** attempt);
            continue;
          }
          throw err;
        }
      }

      return fetch(url, options);
    },
    [delay]
  );

  // ========= busca usuário (logout só em 401/403) =========
  const fetchUser = useCallback(
    async (token: string) => {
      try {
        const response = await fetchWithRetry(`${urlGeral}users/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          await handleLogout();
          return;
        }

        if (response.status >= 500) {
          console.warn("Backend instável ao buscar usuário:", response.status);
          setLoading(false);
          return;
        }

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

          await delay(600);
          setLoading(false);
        } else {
          await handleLogout();
        }
      } catch (err) {
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
    // ========= escutar mudanças no localStorage (outra aba) =========
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jwt_token") {
        setToken(e.newValue);
      }
    };

    // ========= evento custom na mesma aba =========
    const onTokenChange = () => {
      setToken(localStorage.getItem("jwt_token"));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("token-change", onTokenChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "token-change",
        onTokenChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const isNewToken = token !== lastTokenRef.current;
    lastTokenRef.current = token;

    if (!hasCheckedRef.current || isNewToken) {
      setLoading(true);
    }

    clearLogoutTimer();

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

      // ✅ salva expiração no contexto UMA vez por token
      setSessionExpMs(expMs);

      // ✅ agenda logout automático (sem interval global)
      logoutTimerRef.current = window.setTimeout(() => {
        handleLogout();
      }, msToExpire);

      fetchUser(token).finally(() => {
        hasCheckedRef.current = true;
      });
    } catch (err) {
      console.error("[LoadingWrapper] decode falhou", err);
      handleLogout();
    }

    return () => {
      clearLogoutTimer();
    };
  }, [token, fetchUser, handleLogout, setSessionExpMs]);

  const isMobile = useIsMobile();
  const sizeReduction = isMobile ? 2 : 1;

  return loading ? (
    <main className="h-screen w-full flex items-center justify-center">
      <div className="animate-pulse">
        {theme === "dark" ? (
          <div className="flex items-center gap-2">
            <div className={`h-${16 / sizeReduction} flex items-center gap-2`}>
              <SymbolEEWhite />
            </div>
            <div className={`h-${10 / sizeReduction} flex items-center gap-2`}>
              <LogoVitrineWhite />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className={`h-${16 / sizeReduction} flex items-center gap-2`}>
              <SymbolEE />
            </div>
            <div className={`h-${10 / sizeReduction} flex items-center gap-2`}>
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
