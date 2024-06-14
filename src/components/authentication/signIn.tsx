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
import { SignInModal } from "./signInModal";

export function SignInContent() {

    const backgroundImages = [
     'ewe'
      ];
    
      //background
      const [backgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });



      const [value, setValue] = useState('account')

    return(
        <div className="w-full h-screen flex">
            <div className="w-1/2 h-full md:flex hidden bg-cover bg-center bg-no-repeat   bg-[#02A8A8]" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

            <div className="md:w-1/2 w-full h-full flex items-center justify-center flex-col">
            <div className="max-w-[400px]">
            <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Fazer login</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Crie sua forma de acesso na plataforma. Clique em continuar quando terminar.</p>

            <div>
              <SignInModal
              route="/signIn"/>
            </div>
            </div>
            </div>
        </div>
    )
}