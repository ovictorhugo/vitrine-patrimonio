"use client";
import { UserContext } from "../../context/context";

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

import { useTheme } from "next-themes";
import { TeamSwitcher } from "../team-switcher";
import { useContext } from "react";

export function AccountSwitcher() {
  const { user } = useContext(UserContext);

  const teams =
    Array.isArray(user?.roles) && user.roles.length > 0
      ? user.roles
        .filter((rola) => rola?.id && rola?.id) // evita valores null/undefined
        .map((rola) => ({
          name: rola.name,
          id: rola.id,
          plan: "Administrativo",
        }))
      : [];

  return <TeamSwitcher teams={teams} />;
}
