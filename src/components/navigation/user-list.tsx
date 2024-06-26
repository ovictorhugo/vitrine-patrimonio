"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
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
import { Button } from "../ui/button"
import { ChevronDown, PanelLeftDashed } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useTheme } from "next-themes"
import { SymbolEEWhite } from "../svg/SymbolEEWhite"
import { SymbolEE } from "../svg/SymbolEE"
  

export function AccountSwitcher({
  isCollapsed,

}: AccountSwitcherProps) {

  const {user, setIsCollapsed, mode} = React.useContext(UserContext)
  const { theme } = useTheme()
  return (
    <DropdownMenu>
        <div className="w-full  gap-3 flex items-center">
        <DropdownMenuTrigger className="w-full flex-1  items-center flex justify-center   ">
            <div className={cn(
          "flex items-center h-10 w-full dark:border-neutral-800 gap-2 pr-4 border rounded-md",
          isCollapsed &&
            "flex h-10 w-10 shrink-0 items-center justify-center p-0 "
        )}> 
        
     <div className="flex  w-[36px] items-center justify-center">
     <div className="h-[22px]  "  >{(theme ==  'dark' ) ? (<SymbolEEWhite />):(<SymbolEE />)}</div>
     </div>

           
                {!isCollapsed && (
                <div className="flex gap-3 items-center flex-1 w-full">
                    <p className="text-sm font-medium w-full text-left">{mode}</p>
         

            <ChevronDown size={16}/>

                </div>
             )}
             
            
        </div>
        
        </DropdownMenuTrigger>

       {!isCollapsed && (
         <Button onClick={() => setIsCollapsed(true)} variant='outline' size="icon" >
         <PanelLeftDashed className="h-4 w-4" />
         <span className="sr-only">Menu de ações rápidas</span>
       </Button>
       )}


        </div>

        <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
  </DropdownMenuContent>


    
    </DropdownMenu>
  )
}