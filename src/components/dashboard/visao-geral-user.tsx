import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../components/ui/breadcrumb"
import { useContext } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, FileCsv, User } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, DollarSign } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";

export function VisaoGeralUser() {
    const { isOpen, type} = useModalDashboard();
    const {user} = useContext(UserContext)
    const {onOpen} = useModal();


    const isModalOpen = isOpen && type === "visao-geral-user";


    return(
        <>
        {isModalOpen && (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <Alert className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
            </Alert>
              </div>

              <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Alert  className="xl:col-span-2 p-0" >
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button onClick={() => onOpen('import-csv')}  size="sm" className="ml-auto gap-1">
              <FileCsv className="h-4 w-4" />
                  Importar csv
                  
               
              </Button>
            </CardHeader>
            <CardContent>

            </CardContent>
                </Alert>
              </div>
            </main>
        )}
        </>
    )
}