import { Plus, UserPlus } from "phosphor-react";
import { Alert } from "../../ui/alert";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useState } from "react";
import { toast } from "sonner"
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export function AddAdmin() {
    const [email, setEmail] = useState('')
    const db = getFirestore();


    const handleSubmit = async () => {
        try {
          // Referência à coleção 'users'
          const usersRef = collection(db, 'users');
          
          // Cria uma consulta para verificar se o email existe
          const q = query(usersRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
      
          // Verifica se existe algum documento com o email fornecido
          if (!querySnapshot.empty) {
            // Atualiza o estado para 'admin' se o email for encontrado
            querySnapshot.forEach(async (userDoc) => {
              const userDocRef = doc(db, 'users', userDoc.id);
              await updateDoc(userDocRef, { state: 'admin' });
            });
      
            toast("Administrador adicionado", {
                description: "Dados atualizados",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Undo"),
                },
              })
           
          } else {
            toast("Email não encontrado", {
                description: "Revise os dados e tente novamente",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Undo"),
                },
              })
          }
        } catch (error) {
          console.error('Erro ao buscar email no Firestore: ', error);
        
        }
      };

    return(
        <div className="w-full flex mb-3">
        <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#00A19B] whitespace-nowrap"></div>

        <Alert  className="rounded-l-none ">
        <div className="flex items-center gap-3 mb-2">
                        <UserPlus size={20} />
                            <p className="text-sm font-bold">Adicionar administrador</p>
                            
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">Adicione o email para vincular um novo administrador na plataforma </p>

                            <div className="flex gap-4 mt-4">
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"/> 
                    <Button onClick={() => handleSubmit()} className="dark:text-white"><Plus size={16}/>Cadastrar</Button>
                   </div>
            </Alert>
        </div>
    )
}