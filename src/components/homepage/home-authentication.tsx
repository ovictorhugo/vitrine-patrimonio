import { ArrowLeft } from "phosphor-react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowRight } from "lucide-react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "../ui/tabs"
import { useState } from "react";
import { SignInContent } from "./signIn";
import { SignUpContent } from "./signUp";
  

export function HomeAuthentication() {
    const { isOpen, type, onOpen } = useModalHomepage();


    const isModalOpen = isOpen && type === "authentication-home";
    const [value, setValue] = useState('account')
    return(
        <>
        {isModalOpen && (
            <div className="h-screen w-full py-20 mx-16">
                <div className="justify-between flex flex-col w-full h-full">
                
                <div className="flex items-center gap-3 font-medium text-gray-500">
                    <Button variant={'ghost'} size={'icon'} onClick={() => onOpen('initial-home')}> <ArrowLeft size={16}  /></Button>Fazer doação <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent">Passo 2 de 3</Badge>
                        </div>

            <div>
            <Tabs defaultValue="account" value={value} className="w-[360px]">

            <TabsContent value="account">
                <SignInContent/>
            </TabsContent>

            <TabsContent value="password">
            <SignUpContent/>
            </TabsContent>
            </Tabs>
            </div>

                        <div className="flex items-center gap-3">
                <Button variant={'ghost'} onClick={()=> onOpen('initial-home')}>  <ArrowLeft size={16}  />Voltar</Button>
                 
                  </div>
                </div>
     
            </div>
        )}
        </>
    )
}