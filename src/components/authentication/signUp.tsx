import { useContext, useEffect, useState } from "react";
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

import "firebase/auth";
import { auth } from "../../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";


import { UserContext } from "../../context/context";
import { User as FirebaseAuthUser} from 'firebase/auth'
import { GoogleLogo, SignIn } from "phosphor-react";
import { UserPlus } from "lucide-react";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";




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
      const { setUser, urlGeral } = useContext(UserContext);

      const [value, setValue] = useState('account')


      const [createUserWithEmailAndPassword, userw, loading, error] =
  useCreateUserWithEmailAndPassword(auth);

  const handleSignOut = async (e: any) => {
  try {

    if(name.length == 0) {
      toast("Revise os dados", {
        description: "Preencha o nome completo",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })

      return
    }

    if(email.length == 0) {
      toast("Revise os dados", {
        description: "Preencha o email",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })

      return
    }

    if(password.length == 0) {
      toast("Revise os dados", {
        description: "Preencha a senha",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })

      return
    }

    if(password.length <= 7 ) {
      toast("Revise os dados", {
        description: "A senha precisa ter 8 ou mais caractéries",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })

      return
    }

    if(password != confPassword ) {
      toast("Revise os dados", {
        description: "As senhas não conferem",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })

      return
    }

    if( password == confPassword && password.length >= 8 && email.length != 0 && name.length != 0) {
      e.preventDefault();
      createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        userCredential?.user && updateProfile(userCredential.user, { displayName: name });
     })



     history('/signIn');
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


//google

function handleGoogleSignIn() {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then(async(result) => {

try {
  const data = [
    {
      displayName:result.user.displayName,
      email:result.user.email,
      uid:result.user.uid,
      photoURL:result.user.photoURL,
      provider:'google'
    }
  ]

  let urlProgram = urlGeral + 's/user'
   let urlUser = urlGeral + `s/user?uid=${result.user.uid}`

  const fetchData = async () => {
  
    try {
      const response = await fetch(urlProgram, {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '3600',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const fetchDataLogin = async () => {
          try {
            const response = await fetch(urlUser, {
              mode: "cors",
              method: 'GET',
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "3600",
                "Content-Type": "text/plain",
              },
            });
            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
              data[0].roles = data[0].roles || [];
              setLoggedIn(true)
              setUser(data[0]);
             
           
         
              history('/');
            }
          } catch (err) {
            console.log(err);
          }
        };
        fetchDataLogin();
    
       
      } else {
        const fetchDataLogin = async () => {
          try {
            const response = await fetch(urlUser, {
              mode: "cors",
              method: 'GET',
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "3600",
                "Content-Type": "text/plain",
              },
            });
            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
              data[0].roles = data[0].roles || [];
              setLoggedIn(true)
              setUser(data[0]);
             
           
         
              history('/');
            }
          } catch (err) {
            console.log(err);
          }
        };
        fetchDataLogin();
      }
      
    } catch (err) {
      console.log(err);
    } 
   
  };

  fetchData();
  
} catch (error) {
    toast("Erro ao processar requisição", {
        description: "Tente novamente",
        action: {
          label: "Fechar",
          onClick: () => console.log("Undo"),
        },
      })
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


 //frases

 const quotesWithAuthors = [
  {
    quote: 'A gente continua apaixonado pela Escola de Engenharia e pelas pessoas que flutuam nela',
    author: 'Newton Urias Pinto, técnico em metalurgia aposentado. Na escola desde os 11 anos de idade.'
  },
  {
    quote: 'Às vezes eles me perguntaravam onde que eu tinha estudado, simplesmente o nome da Escola quase que já bastava, né? Aquilo ali já falava tudo por você.',
    author: 'Maria da Fátima Solis Ribeiro. Engenheira Civil formada pela Escola em 1986.'
  },
  {
    quote: 'É difícil definir o que eu vou levar. Acho que o que pode resumir é minha formação. Enquanto pessoa e enquanto profissional.',
    author: 'Paloma de Assis Ribeiro Batista, Aluna do 4º periodo de Engenharia de Produção e mebro da PJ Consultoria & Assesoria, empresa junior do seu curso. Na escola desde 2010.'
  },
  {
    quote: 'Aqui a gente procura participar dos eventos, das coisas mesmo, por causa desse encontro com os colegas',
    author: 'Iracema Alves Torres. Funcionária Técnico-administrativo do Departamento de Engenharia de Estruturas. Na escola desde 1991.'
  },
  {
    quote: 'Assim que eu cheguei na Escola foi tipo amor à primeira vista',
    author: 'Fátima Aparecida de Carvalho. Funcionária Técnico-administrativo do Departamento de Engenharia de Estruturas. Na escola desde 1983.'
  },
];

  // Estado para a frase e autor atuais
  const [currentQuote, setCurrentQuote] = useState({ quote: '', author: '' });

  // Função para selecionar uma frase aleatória
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotesWithAuthors.length);
    return quotesWithAuthors[randomIndex];
  };

  // Efeito para definir uma nova frase quando o componente é montado
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, []);


    return(
        <div className="w-full h-screen flex">
           <div className="w-1/2 h-full p-16 md:flex justify-between flex-col hidden bg-cover bg-center bg-no-repeat bg-[#274B5E]" >
           <Link to={'/'} className="w-fit">
           <div className="h-[22px]"><LogoVitrineWhite/></div></Link>
            <div>
             <div>
             <p className="font-medium text-white max-w-[500px]">
        "{currentQuote.quote}"
      </p>
      <p className="text-white mt-2 text-sm">{currentQuote.author}</p>
             </div>
            </div>
            </div>
            <div className="md:w-1/2 w-full h-full flex md:px-16 items-center justify-center flex-col">
           

           <div className="max-w-[400px] w-full">
            <CardHeader className="p-0 pb-6">
            <CardTitle>Criar conta</CardTitle>
            <CardDescription className="pt-2">
             Crie conta apenas para usuários externos da instituição
            </CardDescription>
          </CardHeader>

      <div className="flex gap-3 flex-col">
  
        <Button className=" w-full" variant={'outline'} onClick={handleGoogleSignIn} ><GoogleLogo size={16} className="" /> Criar conta com Google</Button>
       
        </div>
 

      <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-800 my-6">
          <div className="w-full h-[0.5px] bg-neutral-400 dark:bg-neutral-800"></div>
          ou
          <div className="w-full h-[0.5px]  bg-neutral-500 dark:bg-neutral-800"></div>
        </div>

          <CardContent className=" p-0 w-full flex flex-col gap-3">
          <div className="space-y-1">
              <Label htmlFor="name">Nome completo</Label>
              <Input onChange={(e) => setName(e.target.value)} id="name"  />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Email</Label>
              <Input onChange={(e) => setEmail(e.target.value)} id="username"  />
            </div>

        <div className="flex gap-3 ">
        <div className="space-y-1">
              <Label htmlFor="current">Senha</Label>
              <Input onChange={(e) => setPassword(e.target.value)} id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Confirmar senha</Label>
              <Input  onChange={(e) => setConfPassword(e.target.value)} id="new" type="password"  />
            </div>
        </div>

            <Button onClick={handleSignOut} className="text-white dark:text-white w-full"><UserPlus size={16}/>Criar conta</Button>
          </CardContent>
            </div>
          
    
                
            </div>
        </div>
    )
}