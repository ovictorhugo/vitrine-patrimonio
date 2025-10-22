import { ArrowUUpLeft, FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { useDropzone } from "react-dropzone";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Separator } from "../ui/separator";
import { Alert } from "../ui/alert";
import { MUfmg } from "../svg/MUfmg";


export function SignInModal() {
      const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = (isOpen && typeModal === "sign-in") 

    const [uploading, setUploading] = useState(false);
       const UrlAuthentication = import.meta.env.VITE_URL_AUTHENTICATION || ''

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0  max-w-4xl grid grid-cols-2 h-[60vh]">
        <Alert className="rounded-r-none border-0 bg-eng-blue">

        </Alert>
       <div className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-center flex-col h-full ">
             <DialogHeader className="w-full">
          <DialogTitle className="text-2xl mb-2 w-full font-medium max-w-[450px]">
           Fazer login
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
           Faça login com sua conta Minha UFMG.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

          <div className="mb-4 w-full">
                               <a href={UrlAuthentication}><Button className=" w-full" variant={'outline'} ><div className="h-[12px]"><MUfmg /></div>Login com Minha UFMG
                         <div className="relative float-right top-0 right-0">
                             <div className="bg-[#719CB8] w-2 rounded-full h-2 animate-ping float-right flex right-0">
                             </div><div className="bg-[#719CB8] w-2 rounded-full h-2"></div></div></Button></a>
          </div>
        </div>


          <DialogFooter>
          <Button onClick={onClose} variant={"ghost"}>
            <ArrowRight size={16} /> Continuar sem login
          </Button>

     
        </DialogFooter>
       </div>
      </DialogContent>
      </Dialog>
    )
}