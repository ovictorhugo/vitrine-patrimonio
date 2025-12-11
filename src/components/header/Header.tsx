import { Link } from "react-router-dom";

import { useContext } from "react";

import { cn } from "../../lib";
import * as React from "react";

import logo_4 from "../../assets/logo_4.png";
import logo_4_white from "../../assets/logo_4_white.png";
import { NavigationMenuLink } from "../../components/ui/navigation-menu";

import { Funnel, MagnifyingGlass } from "phosphor-react";
import { Info, LogIn } from "lucide-react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";

import { useTheme } from "next-themes";

import { useModalHomepage } from "../hooks/use-modal-homepage";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";
import { LogoVitrine } from "../svg/LogoVitrine";
import { Input } from "../ui/input";
import { useModal } from "../hooks/use-modal-store";
import { ModeToggle } from "../mode-toggle";
import { SpeedActions } from "./speed-actions";
import { NotificationsHeader } from "./notifications";
import { useIsMobile } from "../../hooks/use-mobile";

export function Header() {
  const { loggedIn } = useContext(UserContext);

  const { theme } = useTheme();
  const { onOpen } = useModalHomepage();
  const { onOpen: onOpenModal } = useModal();
  const isMobile = useIsMobile();

  const handleClick = () => {
    onOpen("initial-home");
  };

  if (isMobile) {
    return (
      <div className={"top-0  absolut w-full "}>
        <header
          className={`h-[100px] mb-2 px-4 flex justify-between dark:bg-black items-center`}
        >
          <div className="  flex items-center w-full justify-between">
            <div className="w-[200px] mb-4 mt-7 h-5">
              <Link to={"/"} onClick={() => handleClick()}>
                {theme == "dark" ? <LogoVitrineWhite /> : <LogoVitrine />}
              </Link>
            </div>
          </div>
          <div className="h-4 w-[1px]  bg-neutral-200 dark:bg-neutral-800"></div>

          <div className="flex-column justify-center m-auto w-[250px] pl-10 mb-0">
            <Link to={""} target="_blank" className=" whitespace-nowrap ">
              <img
                src={theme == "dark" ? logo_4_white : logo_4}
                alt=""
                className="whitespace-nowrap flex flex-1 h-[38px]"
              />
            </Link>
            <div className="justify-between w-full mt-2 gap-3">
              <Link to={"/informacoes"}>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Informações</span>
                </Button>
              </Link>

              <ModeToggle />

              {loggedIn && <NotificationsHeader />}

              <SpeedActions />
            </div>
          </div>
          <div className="flex gap-1 items-center justify-center">
            <div
              onClick={() => onOpenModal("search-patrimonio-exact")}
              className="xl:flex hidden  h-8 border border-neutral-200 dark:border-neutral-800 px-1 bg-white dark:bg-neutral-950 rounded-md items-center"
            >
              <MagnifyingGlass size={16} className="w-8" />
              <Input
                className="border-0 h-full flex flex-1 dark:bg-transparent"
                placeholder="Buscar patrimônio..."
              />
              <p className="bg-neutral-100 rounded-md text-[10px] mr-1  dark:bg-neutral-800 h-6 flex items-center justify-center px-2">
                Ctrl + Q
              </p>
              <Button
                className={` h-6 w-6  text-white border-0 `}
                size={"icon"}
              >
                <Funnel size={10} className="" />
              </Button>
            </div>

            {!loggedIn && (
              <Link to={"/signIn"}>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <LogIn className="h-4 w-4" />
                  Acessar
                </Button>
              </Link>
            )}
          </div>
        </header>
      </div>
    );
  } else {
    return (
      <div className={"top-0  absolut w-full "}>
        <header
          className={`h-[40px] mb-2  px-4  flex justify-between   dark:bg-black     items-center  `}
        >
          <div className="  flex items-center h-12 gap-4">
            <div className="flex gap-3 items-center h-full justify-center ">
              <Link
                to={"/"}
                className="h-[14px]  "
                onClick={() => handleClick()}
              >
                {theme == "dark" ? <LogoVitrineWhite /> : <LogoVitrine />}
              </Link>

              <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
              <Link to={""} target="_blank" className=" whitespace-nowrap ">
                <img
                  src={theme == "dark" ? logo_4_white : logo_4}
                  alt=""
                  className="whitespace-nowrap flex flex-1 h-[26px]"
                />
              </Link>
            </div>
          </div>

          <div></div>

          <div className="flex gap-1 items-center justify-center">
            <div
              onClick={() => onOpenModal("search-patrimonio-exact")}
              className="xl:flex hidden  h-8 border border-neutral-200 dark:border-neutral-800 px-1 bg-white dark:bg-neutral-950 rounded-md items-center"
            >
              <MagnifyingGlass size={16} className="w-8" />
              <Input
                className="border-0 h-full flex flex-1 dark:bg-transparent"
                placeholder="Buscar patrimônio..."
              />
              <p className="bg-neutral-100 rounded-md text-[10px] mr-1  dark:bg-neutral-800 h-6 flex items-center justify-center px-2">
                Ctrl + Q
              </p>
              <Button
                className={` h-6 w-6  text-white border-0 `}
                size={"icon"}
              >
                <Funnel size={10} className="" />
              </Button>
            </div>

            {!loggedIn && (
              <Link to={"/signIn"}>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <LogIn className="h-4 w-4" />
                  Acessar
                </Button>
              </Link>
            )}

            <Link to={"/informacoes"}>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
                <span className="sr-only">Informações</span>
              </Button>
            </Link>

            <ModeToggle />

            {loggedIn && <NotificationsHeader />}

            <SpeedActions />
          </div>
        </header>
      </div>
    );
  }
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
