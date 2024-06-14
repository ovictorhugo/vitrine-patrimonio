import { useContext, useState } from "react";
import { useModal } from "../hooks/use-modal-store";
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "../ui/dialog";
  import { v4 as uuidv4 } from 'uuid';

  interface User extends FirebaseAuthUser {
    photoURL:string
    cpf_aluno: string
    datnsc_aluno:string
    state: string
  }

  import { User as FirebaseAuthUser} from 'firebase/auth'

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowUUpLeft, Plus, Trash, Upload } from "phosphor-react";
import { Button } from "../ui/button";
import { storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "../ui/progress";
import { UserContext } from "../../context/context";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export function DeleteAcconunt() {
    const { onClose, isOpen, type: typeModal } = useModal();
    const isModalOpen = isOpen && typeModal === 'delete-account';
    const {user, setUser, setLoggedIn} = useContext(UserContext)
    const history = useNavigate();
const [input, setInput] = useState('')
    const backgroundImages = [
      'banana',
      'fump',
      'maça',
      'gato',
      'sapato',
      'cachorro',
      'televisão',
      'mala',
      'celular',
      'sandália',
      'cadeira',
      'cama',
      'feijão'
        // Adicione mais URLs de imagens de fundo, se necessário
      ];


      const [backgroundImage, setBackgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });

    const handleDeleteAccount = async () => {
        const user = auth.currentUser;
        if( input === backgroundImage) {
          try {
          
            if (user) {
              // Deletar os dados do usuário do Firestore
              const db = getFirestore();
              const userDocRef = doc(db, 'users', String(user.uid));
              await deleteDoc(userDocRef);
              await auth.signOut();
        
              // Deletar a conta do usuário do Firebase Authentication
              await deleteUser(user);
        
              // Limpar o estado e localStorage
              setLoggedIn(false);
              
              setUser({ photoURL: '', cpf_aluno: '', datnsc_aluno: '', state: '' ,...{} } as User); // Assuming you have a setUser function to update the user context
              localStorage.removeItem('user');
              setInput('')
        
              // Redirecionar para a página inicial
              history('/');
              
              toast("Conta deletada com sucesso", {
                description: "Sua conta foi deletada permanentemente.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar"),
                },
              });
  
              onClose()
            } else {
              throw new Error("Usuário não está autenticado");
            }
          } catch (error) {
            console.error('Erro ao deletar conta:', error);
            toast("Erro ao deletar conta", {
              description: "Não foi possível deletar sua conta. Tente novamente mais tarde.",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }
        } else {
          toast("Digite a palavra corretamente", {
            description: "Não foi possível deletar sua conta. Revise o campo.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
        }
      };

      


    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6">
                 <DialogTitle className="text-2xl text-center font-medium">
                 Tem certeza que deseja deletar?
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500">
                 Adicione as informações básicas do programa de pós-graduação como o nome, classificação e modalidade.
                 </DialogDescription>
               </DialogHeader>

               <div className="space-y-1 w-full">
                                    <Label htmlFor="username">Digite a palavra <strong className="text-[#00A19B]">{backgroundImage}</strong> para confirmar ação</Label>
                                    <Input   value={input} onChange={(e) => setInput(e.target.value)}   id="username" placeholder="Palavra aleatória" />
                                    </div>

               <DialogFooter>
                <Button onClick={() => onClose()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Cancelar</Button>
                <Button variant={'destructive'}  onClick={() => handleDeleteAccount()}><Trash size={16} className="" />Deletar conta</Button>
                </DialogFooter>

               </DialogContent>
               
               </Dialog>
        
    )
}