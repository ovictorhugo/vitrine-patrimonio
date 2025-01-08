import { Funnel, MagnifyingGlass } from "phosphor-react";
import { Alert } from "../ui/alert";
import { useModal } from "../hooks/use-modal-store";
import { useContext } from "react";
import { UserContext } from "../../context/context";
import { Trash, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function Search() {
  const {onOpen} = useModal()

  const {setItensSelecionados, itemsSelecionados} = useContext(UserContext)
    return(
        <Alert onClick={() => onOpen('search-vitrine')} className="h-14 p-2  mt-4 mb-2  flex items-center justify-between max-w-[60vw]">
        <div className="flex items-center gap-2 w-full flex-1">
          <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />

          <div>
          <div className='flex gap-2 mx-2 items-center'>
              {itemsSelecionados.map((valor, index) => {
          return(
              <>
              <div key={index} className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs bg-eng-blue text-white border-0 `} >
              {valor.term.replace(/[|;]/g, '')}
                  <X size={12} onClick={() => setItensSelecionados([])} className="cursor-pointer"/>
                  {/* Adicionando a escolha entre "e" ou "ou" */}
                  
              </div>

              </>
          );
      })}
                </div>

                <Input  type="text" className="border-0 w-full flex flex-1 "/>
          </div>
        </div>

        <div className="flex gap-2 items-center">
       {itemsSelecionados.length > 0 && (
         <Button size={'icon'} variant={'ghost'} onClick={() => {
          setItensSelecionados([])

         
        }}><Trash size={16}/></Button>
       )}

<Button  className={` text-white border-0 `} size={'icon'}>
       <Funnel size={16} className="" /> 
       
        </Button>
        </div>
      </Alert>
    )
}