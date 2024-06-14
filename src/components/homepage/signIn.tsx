import { useContext, useState } from "react";
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../ui/card"
import { Button } from "../ui/button";
import { signInWithEmailAndPassword} from 'firebase/auth';
import "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"
import { toast } from "sonner"

import { User as FirebaseAuthUser} from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserContext } from "../../context/context";
interface User extends FirebaseAuthUser {
    state: string;
    name: string
    email: string
    img_url: string;
    institution_id: string
  }


  import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { GoogleLogo } from "phosphor-react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

export function SignInContent() {
  const { isOpen, type, onOpen } = useModalHomepage();
    const backgroundImages = [
     'ewe'
      ];
    
      //background
      const [backgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });


      //firebase
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const {setLoggedIn} = useContext(UserContext);
      const history = useNavigate();
      const { setUser, user } = useContext(UserContext);

      const handleLogin = async () => {
        try {
         if(email.length != 0 && password.length != 0 && password.length >= 8 ) {
          const result = await signInWithEmailAndPassword(auth, email, password);
          setLoggedIn(true);
      
         

           // Recupere dados personalizados do usuário no Firestore
            const db = getFirestore();
            const userDocRef = doc(db, 'institution', String(result.user.email));
            const snapshot = await getDoc(userDocRef);
            

            // Verifique se os dados personalizados existem antes de adicionar ao objeto result.user
            if (snapshot.exists()) {
              
             
              const userData = snapshot.data();

              const userDataFinal: User = {
                ...result.user,
                img_url: userData.img_url || '', // Set to the appropriate default value or leave it empty if you don't have a default
                state: userData.state || '',
                name: userData.name || '',
                email: result.user.email || '',
                institution_id: userData.institution_id || '',
              };
             
              // Adicione os dados personalizados diretamente ao objeto result.user

              // Atualize o estado com o objeto modificado
              setUser(userDataFinal)
              localStorage.setItem('user', JSON.stringify(userDataFinal));
            }

             // Save user information to local storage
          
    
      
             onOpen('payment-home')
         }
        } catch (error) {
          console.error('Authentication error:', error);
          toast("Erro ao fazer login", {
            description: "Revise os dados e tente novamente",
            action: {
              label: "Fechar",
              onClick: () => console.log("Undo"),
            },
          })
        }
      };

      function handleGoogleSignIn() {
        const provider = new GoogleAuthProvider();
    
        signInWithPopup(auth, provider)
          .then(async(result) => {
            
            const db = getFirestore();
            const userDocRef = doc(db, 'institution', String(result.user.email));
            const snapshot = await getDoc(userDocRef);
            const userData: User = {
              ...result.user,
              img_url: '', // Set to the appropriate default value or leave it empty if you don't have a default
              state: '',
              name:  '',
              email: result.user.email || '',
              institution_id: '',
            };

            // Verifique se os dados personalizados existem antes de adicionar ao objeto result.user
            if (snapshot.exists()) {
              
             
              const userData = snapshot.data();

              const userDataFinal: User = {
                ...result.user,
                img_url: userData.img_url || '', // Set to the appropriate default value or leave it empty if you don't have a default
                state: userData.state || '',
                name: userData.name || '',
                email: result.user.email || '',
                institution_id: userData.institution_id || '',
              };
             
              // Adicione os dados personalizados diretamente ao objeto result.user

              // Atualize o estado com o objeto modificado
              setUser(userDataFinal)
              localStorage.setItem('user', JSON.stringify(userDataFinal));
              
              onOpen('payment-home')
              setLoggedIn(true);
          } else {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setLoggedIn(true);
            setTimeout(() => {
              history('/');
            }, 0);
          }

          
           
          })
          .catch((error) => {
            console.log(error)
            toast("Erro ao fazer login", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })
          })
      }

      const [value, setValue] = useState('account')

    return(
      <Card className="p-0 bg-transparent border-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Fazer login</CardTitle>
        <CardDescription>
          Coloque seu email cadastrado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-0">
        <div className="space-y-1">
          <Label htmlFor="name">Email</Label>
          <Input onChange={(e) => setEmail(e.target.value)} id="name" placeholder="Seu email" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="current">Senha</Label>
          <Input onChange={(e) => setPassword(e.target.value)} id="current" type="password" placeholder="Sua senha" />
        </div>
    
      </CardContent>
      <CardFooter className="px-0">
     <div className="flex flex-col gap-4 w-full">
     <Button onClick={handleLogin} className="text-white w-full dark:text-white">Fazer login</Button>
     <Button className=" w-full" variant={'outline'} onClick={handleGoogleSignIn} ><GoogleLogo size={16} className="" /> Fazer login com o Google</Button>

     </div>
      </CardFooter>
    </Card>
    )
}