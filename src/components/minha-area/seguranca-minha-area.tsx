import { useContext, useState } from "react"
import { UserContext } from "../../context/context"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Lock, RefreshCcw, User, UserCheck } from "lucide-react"
import { AlertDescription, AlertTitle } from "../ui/alert"
import { toast } from "sonner"
import { auth } from '../../lib/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function SegurancaMinhaArea() {

    const {user, urlGeral} = useContext(UserContext)

    const [lattes, setLattes] = useState(user?.phone || '')
    const [name, setName] = useState(user?.display_name || '')
    const [linkedin, setLinkedin] = useState(user?.linkedin || '')

    const handleSubmit = async () => {
      try {

        const data = [
          {
            uid:(user?.uid),
            linkedin:linkedin,
            lattes_id:lattes,
            display_name:name
          }
        ]
          if (name.length === 0) {
              toast("O nome não pode ser vazio", {
                  description: "Por favor, tente novamente",
                  action: {
                      label: "Fechar",
                      onClick: () => console.log("Fechar"),
                  },
              });
              return;
          }
  
          let urlGruposPesquisaInsert = `${urlGeral}s/user`;
      
          const response = await fetch(urlGruposPesquisaInsert, {
              mode: 'cors',
              method: 'PUT',
              headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'PUT',
                  'Access-Control-Allow-Headers': 'Content-Type',
                  'Access-Control-Max-Age': '3600',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data),
          });

          if (response.ok) {
              toast("Dados enviados com sucesso", {
                  description: "Todos os dados foram enviados.",
                  action: {
                      label: "Fechar",
                      onClick: () => console.log("Fechar"),
                  },
              });
          }

  
      } catch (error) {
          console.error('Erro ao processar a requisição:', error);
          toast("Erro ao processar a requisição", {
              description: "Tente novamente mais tarde.",
              action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar"),
              },
          });
      }
  };



  ///wfwfawfawre

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');


  const handleSubmitChangeWord = async () => {


    // Verifica se as novas senhas coincidem
    if (newPassword !== confirmNewPassword) {

      toast("Tente novamente", {
        description: "As novas senhas não coincidem",
        action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
        },
    });
      return;
    }

    const user = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      try {
        // Reautenticar o usuário com a senha atual
        await reauthenticateWithCredential(user, credential);
        // Atualizar a senha do usuário
        await updatePassword(user, newPassword);
        toast("Requisição enviada com sucesso", {
            description: "Senha atualizada",
            action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
            },
        });
      } catch (error) {
        toast("Erro ao processar a requisição", {
            description: "Senha não alterada",
            action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
            },
        });
        console.error('Erro ao atualizar senha:', error);
      }
    } else {

      toast("Tente novamente", {
        description: "Usuário não autenticado",
        action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
        },
    });
    }
  }



    return(
        <div className="flex flex-col flex-1 w-full">
                      <div className="flex justify-between items-center">
                      <div>
                      <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                       Olá, {user?.display_name}
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                          Perfil e segurança
                        </h1>
                      </div>

                      
                      <Avatar className="cursor-pointer rounded-md  h-16 w-16">
      <AvatarImage  className={'rounded-md h-16 w-16'} src={`${user?.photo_url}`} />
      <AvatarFallback className="flex items-center justify-center"><User size={16}/></AvatarFallback>
  </Avatar>
                      </div>

                      <div className="my-6 border-b dark:border-b-neutral-800"></div>
                      <h5 className="font-medium text-xl">Perfil</h5>
                    <div className="flex items-center">

                    </div>

                    <div className="flex w-full flex-col gap-2 mt-4">
                <Label>Nome completo</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} type="text"/>
            </div>
                    <div className="flex w-full gap-4 items-end">
                    <div className="flex w-full flex-col gap-2 mt-4">
                <Label>LinkedIn</Label>
                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} type="text"/>
            </div>
                    <div className="flex w-full flex-col gap-2 mt-4">
                <Label>Id lattes</Label>
                <Input value={lattes} onChange={(e) => setLattes(e.target.value)} type="text"/>
            </div>

            <Button onClick={() => handleSubmit()}><RefreshCcw size={16}/>Atualizar dados</Button>
                    </div>

                    <div className="my-6 border-b dark:border-b-neutral-800"></div>
                    <h5 className="font-medium text-xl mb-4">Verificação do perfil</h5>
                    <div className="bg-neutral-100 flex gap-3 dark:bg-neutral-800 w-full p-8 rounded-md">

    <div>  <Lock size={24}/></div>
    <div>
    <AlertTitle className="whitespace-normal">Solicitar acesso para edição das produções</AlertTitle>
      <AlertDescription className="whitespace-normal mb-6">
     Sendo um perfil verificado, você pode adicionar mídia as suas produções entre outras ferramentas. Solicite a verificação da conta para obter acesso.
      </AlertDescription>

      <Button><UserCheck size={16}/>Solicitar acesso</Button>
      </div>

                    </div>

                   {user?.provider == 'firebase' && (
                    <div>
                         <div className="my-6 border-b dark:border-b-neutral-800"></div>
                    <h5 className="font-medium text-xl">Alterar senha</h5>


                    <div className="flex w-full flex-col gap-2 mt-4">
        <Label>Senha atual</Label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
                    <div className="flex w-full gap-4 items-end">
                  
                    <div className="flex w-full gap-4 items-end">
        <div className="flex w-full flex-col gap-2 mt-4">
          <Label>Nova senha</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

      
        <div className="flex w-full flex-col gap-2 mt-4">
          <Label>Confirmar nova senha</Label>
          <Input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>

            <Button onClick={() => handleSubmitChangeWord()}><RefreshCcw size={16}/>Atualizar senha</Button>
                    </div>

                  </div>
                    </div>
                   )}

                  </div>
    )
}