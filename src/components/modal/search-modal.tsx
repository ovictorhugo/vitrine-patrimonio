import { Funnel, MagnifyingGlass } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function SearchModal() {
    const query = useQuery();
     const navigate = useNavigate();

    const { onClose, isOpen, type } = useModal();
    const isModalOpen = isOpen && type === "search";

    const [input, setInput] = useState("");

    let bemCod = parseInt(input.split('-')[0], 10).toString();
    let bemDgv = input.split('-')[1];

    const handleChange = (value:any) => {

        // Remover caracteres não numéricos
        value = value.replace(/[^0-9]/g, '');
    
        if (value.length > 1) {
          // Inserir "-" antes do último caractere
          value = value.slice(0, -1) + "-" + value.slice(-1);
        }
    
        setInput(value);
      };

      const handlePesquisaFinal = () => {
        if (bemCod && bemDgv) {
            query.set('bem_cod', bemCod);
            query.set('bem_dgv', bemDgv);
            navigate({
              pathname: '/buscar-patrimonio',
              search: query.toString(),
            });
          }

          onClose()
       
      };

      const handleEnterPress = (event:any) => {
        if (event.key === "Enter") {
          handlePesquisaFinal()
        }
      };
    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}  >
        <DialogContent   className="p-0 border-none min-w-[60vw] bg-transparent dark:bg-transparent">
        <Alert onKeyDown={handleEnterPress}  className="h-14 bg-white p-2 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 w-full flex-1">
        <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />

        <Input
         onChange={(e) => handleChange(e.target.value)}
          type="text" 
          value={input}
          className="border-0  flex-1 p-0 w-auto inline-block"
        />
            </div>
1
        <div className="w-fit">
            <Button onClick={() => handlePesquisaFinal()}  className={` text-white border-0 z-[9999] `} size={'icon'}>
       <Funnel size={16} className="" /> 
       
        </Button>
            </div>
        </Alert>
            </DialogContent>
        </Dialog>
    )
}