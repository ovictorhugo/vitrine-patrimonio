import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FileXls } from "phosphor-react";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonioMorto } from "./components/tabela-patrimonios-morto";

export function ListaPatrimonios() {
    const { isOpen, type} = useModalDashboard();
    const {onOpen} = useModal();

    const isModalOpen = isOpen && type === 'lista-patrimonio';
    return(
        <>
        {isModalOpen && (
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Tabs defaultValue="patrimonios">
            <div className="flex items-center mt-8">
              <TabsList>
                <TabsTrigger value="patrimonios">Patrimônios</TabsTrigger>
                <TabsTrigger value="patrimonios-baixados">Patrimônios baixados</TabsTrigger>
            
              </TabsList>
            </div>

            <TabsContent value="patrimonios" className="mb-8">
            <Alert  className=" p-0" x-chunk="dashboard-01-chunk-4" >
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
        <ScrollArea>
        <TabelaPatrimonio/>
        </ScrollArea>
            </CardContent>
                </Alert>
            </TabsContent>

            <TabsContent value="patrimonios-baixados" className="mb-8">
            <Alert  className=" p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button onClick={() => onOpen('import-csv-morto')}  size="sm" className="ml-auto gap-1">
              <FileXls className="h-4 w-4" />
                  Importar arquivo .xls
                  
               
              </Button>
            </CardHeader>
            <CardContent>
        <ScrollArea>
        <TabelaPatrimonioMorto/>
        </ScrollArea>
            </CardContent>
                </Alert>
            </TabsContent>
            </Tabs>
            </main>
        )}
        </>
    )
}