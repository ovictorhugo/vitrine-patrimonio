"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

import { UserContext } from "../../context/context"

interface AccountSwitcherProps {
  isCollapsed: boolean

}

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "../../components/ui/dropdown-menu"

import {  ChevronsUpDown, GalleryVerticalEnd, User} from "lucide-react"

import { useTheme } from "next-themes"
import { SymbolEEWhite } from "../svg/SymbolEEWhite"
import { SymbolEE } from "../svg/SymbolEE"
import { useLocation, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { TeamSwitcher } from "../team-switcher"
  

export function AccountSwitcher() {

  const {user,  setPermission,  setRole, role, loggedIn} = React.useContext(UserContext)
  const { theme } = useTheme()





  const teams = (
    Array.isArray(user?.roles) && user.roles.length > 0
      ? user.roles
          .filter((rola) => rola?.id && rola?.id) // evita valores null/undefined
          .map((rola) => ({
            name: rola.name,
            id: rola.id,
            plan: "Administrativo",
          }))
      : [

        ]
  );
  
  
  return (
    <TeamSwitcher teams={teams} />
  )
}