"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon | React.ElementType
    isActive?: boolean
    items?: ({
      title: string
      url?: string // Agora opcional
      icon?: LucideIcon | React.ElementType
      onClick?: () => void // Adiciona a opção de clique direto
    })[]
  }[]
})  {

  const location = useLocation()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
              <SidebarMenuSub>
  {item.items?.map((subItem) => (
    <SidebarMenuSubItem key={subItem.title}>
      {subItem.onClick ? (
        <SidebarMenuSubButton 
          onClick={subItem.onClick} 
          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-800 transition-all"
        >
          <span className="flex z-[99] items-center gap-1">
            {subItem.icon && <subItem.icon className="h-4" />} 
            {subItem.title}
          </span>
        </SidebarMenuSubButton>
      ) : (
        <SidebarMenuSubButton asChild className={` ${subItem.url == location.pathname ? ('bg-eng-blue hover:bg-eng-dark-blue  hover:text-white transition-all text-white'):('cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-800 transition-all')}`}>
          <Link to={subItem.url!}>
            <span className="flex z-[99] items-center gap-1">
              {subItem.icon && <subItem.icon className="h-4" />} 
              {subItem.title}
            </span>
          </Link>
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  ))}
</SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
