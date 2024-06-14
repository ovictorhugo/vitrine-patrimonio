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
import { toast } from "sonner"
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"


import { UserContext } from "../../context/context";
import { User as FirebaseAuthUser} from 'firebase/auth'
import { GoogleLogo } from "phosphor-react";

interface User extends FirebaseAuthUser {
  img_url: string;
  state: string;
  name: string
  email: string
  institution_id: string
}



export function SignUpContent() {
    const backgroundImages = [
     'ewe'
      ];
    
      //background
      const [backgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });


      //firebase
      const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confPassword, setConfPassword] = useState('');
      const {setLoggedIn} = useContext(UserContext);
      const history = useNavigate();
      const { setUser } = useContext(UserContext);

      const [value, setValue] = useState('account')


      const [createUserWithEmailAndPassword, userw, loading, error] =
  useCreateUserWithEmailAndPassword(auth);

  const handleSignOut = async (e: any) => {
  try {

    if( password == confPassword && password.length >= 8 && email.length != 0 && name.length != 0) {
      e.preventDefault();
      createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        userCredential?.user && updateProfile(userCredential.user, { displayName: name });
     })



      setTimeout(() => {
        history('/signIn');
      }, 0);
    }
   
  } catch (error) {
   console.error('Authentication error:', error);
   toast("Erro ao criar conta", {
    description: "Revise os dados e tente novamente",
    action: {
      label: "Fechar",
      onClick: () => console.log("Undo"),
    },
  })
  }
  
}

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

      setUser(userDataFinal);
      setLoggedIn(true);
      setTimeout(() => {
        history('/');
      }, 0);
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

    return(
      <Card className="p-0">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Crie sua forma de acesso na plataforma. Clique em continuar quando terminar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">Nome</Label>
          <Input onChange={(e) => setName(e.target.value)} id="name" placeholder="Nome" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="username">Email</Label>
          <Input onChange={(e) => setEmail(e.target.value)} id="username" placeholder="Email" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="current">Senha</Label>
          <Input onChange={(e) => setPassword(e.target.value)} id="current" type="password" placeholder="Senha" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new">Confirmar senha</Label>
          <Input  onChange={(e) => setConfPassword(e.target.value)} id="new" type="password" placeholder="Confirmar senha" />
        </div>

      </CardContent>
      <CardFooter>
      <div className="flex flex-col gap-4 w-full">
      <Button onClick={handleSignOut} className="text-white dark:text-white w-full">Criar conta</Button>
     <Button className=" w-full" variant={'outline'} onClick={handleGoogleSignIn} ><GoogleLogo size={16} className="" /> Fazer login com o Google</Button>

     </div>
      </CardFooter>
    </Card>
    )
}