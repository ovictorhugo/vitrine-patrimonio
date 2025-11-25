// src/hooks/useSessionCountdown.ts
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/context";

export function useSessionCountdown() {
  const { sessionExpMs } = useContext(UserContext);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!sessionExpMs) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const ms = Math.max(0, sessionExpMs - Date.now());
      setRemainingMs(ms);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sessionExpMs]);

  return remainingMs;
}

export function formatRemaining(totalMs: number) {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}
