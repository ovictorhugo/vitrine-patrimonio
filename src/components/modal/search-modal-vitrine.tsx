import { Funnel, MagnifyingGlass } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function SearchModalVitrine() {
    const query = useQuery();
     const navigate = useNavigate();

     const {bens, setItensSelecionados} = useContext(UserContext)

    const { onClose, isOpen, type } = useModal();
    const isModalOpen = isOpen && type === "search-vitrine";

    const [input, setInput] = useState("");

    const uniqueMatNom = [...new Set(bens.map((item) => item.mat_nom))];
    const filteredMatNom = uniqueMatNom.filter((matNom) =>
      matNom.toLowerCase().includes(input.toLowerCase())
    );

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}  >
        <DialogContent   className="p-0 border-none min-w-[60vw] bg-transparent dark:bg-transparent">
        <Alert   className="h-14 bg-white p-2 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 w-full flex-1">
        <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />

        <Input
         onChange={(e) => setInput(e.target.value)}
          type="text" 
          value={input}
          className="border-0  flex-1 p-0 w-auto inline-block"
        />
            </div>

        <div className="w-fit">
            <Button   className={` text-white border-0 z-[9999] `} size={'icon'}>
       <Funnel size={16} className="" /> 
       
        </Button>
            </div>
        </Alert>


        {(input.length >= 3 && filteredMatNom.length > 0) && (
          <Alert>
             <div className="flex flex-wrap gap-3 z-[3] w-full lg:w-[60vw]">
                              {filteredMatNom.map((word, index) => (
                                  <div
                                      key={index}
                                      className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                                  onClick={() => {
                                    setItensSelecionados([{ term: word }]);
                                    onClose()
                                  }}
                                  >
                                      {word}
                                  </div>
                              ))}
                          </div>
          </Alert>
        )}
            </DialogContent>
        </Dialog>
    )
}