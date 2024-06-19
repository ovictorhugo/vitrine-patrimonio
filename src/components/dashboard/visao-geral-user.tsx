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
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, FileCsv, FileXls, Package, Trash, User } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, DollarSign } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";

interface Patrimonio {
  bem_cod:string
  bem_dgv:string
  bem_num_atm:string
  csv_cod:string
  bem_serie:string
  bem_sta:string
  bem_val:string
  tre_cod:string
  bem_dsc_com:string
  uge_cod:string
  uge_nom:string
  org_cod:string
  uge_siaf:string
  org_nom:string
  set_cod:string
  set_nom:string
  loc_cod:string
  loc_nom:string
  ite_mar:string
  ite_mod:string
  tgr_cod:string
  grp_cod:string
  ele_cod:string
  sbe_cod:string
  mat_cod:string
  mat_nom:string
  pes_cod:string
  pes_nome:string
}

interface TotalPatrimonios {
  total_patrimonio:string
  total_patrimonio_morto:string
}

export function VisaoGeralUser() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral} = useContext(UserContext)
    const {onOpen} = useModal();


    const isModalOpen = isOpen && type === "visao-geral-user";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=`;

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(urlPatrimonioInsert , {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Max-Age": "3600",
              "Content-Type": "text/plain",
            },
          });
          const data = await response.json();
          if (data) {
              setTotal(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonioInsert]);


    return(
        <>
        {isModalOpen && (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              {total.map((props) => {
                  return(
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de patrimônios
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{props.total_patrimonio}</div>
                    <p className="text-xs text-muted-foreground">
                      bens registrados
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de patrimônios baixados
                    </CardTitle>
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{props.total_patrimonio_morto}</div>
                    <p className="text-xs text-muted-foreground">
                      bens desfeitos
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de itens anunciados
                    </CardTitle>
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{props.total_patrimonio_morto}</div>
                    <p className="text-xs text-muted-foreground">
                      bens em exposição
                    </p>
                  </CardContent>
                  </Alert>

                  <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de transações
                    </CardTitle>
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{props.total_patrimonio_morto}</div>
                    <p className="text-xs text-muted-foreground">
                      bens trocados
                    </p>
                  </CardContent>
                  </Alert>
                    </div>
                  )
                })}

              <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Alert  className="xl:col-span-2 p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button onClick={() => onOpen('import-csv')}  size="sm" className="ml-auto gap-1">
              <FileXls className="h-4 w-4" />
                  Importar arquivo .xls
                  
               
              </Button>
            </CardHeader>
            <CardContent>
      
            </CardContent>
                </Alert>

                <Alert   x-chunk="dashboard-01-chunk-5">
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Administradores</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
             
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