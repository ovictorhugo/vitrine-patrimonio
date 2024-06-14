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
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
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
import { SignUpModal } from "./signUpModal";

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


    return(
        <div className="w-full h-screen flex">
            <div className="w-1/2 h-full md:flex hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

            <div className="md:w-1/2 w-full h-full flex items-center justify-center flex-col">

            <div className="max-w-[400px]">
            <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Criar conta</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Crie sua forma de acesso na plataforma. Clique em continuar quando terminar.</p>

            <div>
              <SignUpModal
              route="/signIn"/>
            </div>
            </div>
                
            </div>
        </div>
    )
}