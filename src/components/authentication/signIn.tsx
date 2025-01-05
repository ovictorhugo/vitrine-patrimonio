import { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {

    CardContent,
    CardDescription,

    CardHeader,
    CardTitle,
  } from "../ui/card"
import { Button } from "../ui/button";
import { signInWithEmailAndPassword} from 'firebase/auth';
import "firebase/auth";
import { auth } from "../../lib/firebase";
import { Link,  useNavigate } from "react-router-dom";


import { toast } from "sonner"


import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserContext } from "../../context/context";


  interface Uid {
    uid:string
    provider:string
    displayName:string
    email:string
  }


import { GoogleLogo, SignIn } from "phosphor-react";

import { MUfmg } from "../svg/MUfmg";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";

export function SignInContent() {


  
      //firebase
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const {setLoggedIn, urlGeral} = useContext(UserContext);
      const history = useNavigate();
      const { setUser } = useContext(UserContext);

      const handleLogin = async () => {
        try { 
          if(email.length == 0) {
            toast("Erro ao fazer login", {
              description: "Preencha o email",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

            return
          }

          if(password.length == 0) {
            toast("Erro ao fazer login", {
              description: "Preencha a senha",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

            return
          }

          if(password.length <= 7 ) {
            toast("Erro ao fazer login", {
              description: "Senha incorreta",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

            return
          }

         else if (email.length != 0 && password.length != 0 && password.length >= 8 ) {
          const result = await signInWithEmailAndPassword(auth, email, password);

          try {
            const data = [
              {
                displayName:result.user.displayName,
                email:result.user.email,
                uid:result.user.uid,
                photoURL:result.user.photoURL,
                provider:result.user.providerId
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
      };



      ///minha ufmg
    

      const [uid, setUid] = useState<Uid| null>(null);;

      const handleLoginMinhaUfmg = async () => {
        try {
         
          let urlProgram = urlGeral + 's/ufmg/user'
          let urlPost = urlGeral + 's/user'
          let urlUser = `${urlGeral}s/user?uid=${uid?.uid} `;
          console.log(urlUser)

          const fetchData = async () => {
          
            try {
              const response = await fetch(urlProgram, {
                method: "GET",
                mode: "cors",
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET",
                  "Access-Control-Allow-Headers": "Content-Type",
                  "Access-Control-Max-Age": "3600",
                  "Content-Type": "application/json",
                }
              });

              const data = await response.json();

              if (data && Array.isArray(data) && data.length > 0) {
                data[0].roles = data[0].roles || [];
                setUid(data[0]);
                console.log(uid)

                
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
                      console.log('logou')
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
            <div className="w-1/2 h-full p-16 md:flex justify-between flex-col hidden bg-cover bg-center bg-no-repeat bg-eng-blue" >
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
            <CardTitle>Fazer login</CardTitle>
            <CardDescription className="pt-2">
              Para docentes e técnicos, acessar com o Minha UFMG. Usuários externos, fazer login com o google ou email cadastrado.
            </CardDescription>
          </CardHeader>

    <div className="flex gap-3 flex-col">
<div>

<a href={'/ufmg/'}><Button  className=" w-full" variant={'outline'} ><div className="h-[12px]"><MUfmg/></div>Login com Minha UFMG 
<div className="relative float-right top-0 right-0">
<div className="bg-eng-blue w-2 rounded-full h-2 animate-ping float-right flex right-0">
</div><div className="bg-eng-blue w-2 rounded-full h-2"></div></div></Button></a>

</div>
        <Button className=" w-full" variant={'outline'} onClick={handleGoogleSignIn} ><GoogleLogo size={16} className="" /> Login com Google</Button>
       
        </div>

    <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-800 my-6">
          <div className="w-full h-[0.5px] bg-neutral-400 dark:bg-neutral-800"></div>
          ou
          <div className="w-full h-[0.5px]  bg-neutral-500 dark:bg-neutral-800"></div>
        </div>

    
          <CardContent className=" p-0 w-full flex flex-col gap-3">
            <div className="space-y-1">
              <Label htmlFor="name">Email</Label>
              <Input onChange={(e) => setEmail(e.target.value)} id="name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="current">Senha</Label>
              <Input onChange={(e) => setPassword(e.target.value)} id="current" type="password"  />
            </div>

            <Button onClick={handleLogin} className="text-white w-full dark:text-white"><SignIn size={16}/> Fazer login</Button>
          </CardContent>
    </div>
                
            </div>
        </div>
    )
}