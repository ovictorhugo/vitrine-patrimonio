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


import { Link, useLocation, useNavigate } from "react-router-dom";


import { toast } from "sonner"

import { UserContext } from "../../context/context";


import { GoogleLogo, SignIn } from "phosphor-react";


import { MUfmg } from "../svg/MUfmg";
import { useTheme } from "next-themes";

import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";
import { LogoVitrine } from "../svg/LogoVitrine";
import { SymbolEEWhite } from "../svg/SymbolEEWhite";
import { Eye, EyeOff } from "lucide-react";
export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function SignInContent() {
  

    //firebase
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setLoggedIn,  urlGeral } = useContext(UserContext);
    const history = useNavigate();
    const { setUser } = useContext(UserContext);
    const { theme, setTheme } = useTheme()


   
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

    const navigate = useNavigate();

    function handleClick(): void {
        navigate("/")
    }

    const urlConectee = import.meta.env.VITE_URL_SITE

    const orcidUrl = `http://${urlConectee}/admin/`

      const queryUrl = useQuery();
      const dev = queryUrl.get("dev");

      const UrlAuthentication = import.meta.env.VITE_URL_AUTHENTICATION || ''

    const handleLogin = async () => {
  try {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    // Se o seu backend exigir:
    // form.append('grant_type', 'password'); // alguns /auth/token pedem isso

    const res = await fetch(`${urlGeral}auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    if (!res.ok) {
      // Tenta ler detalhes do erro (ex.: 422 com 'detail')
      let message = 'Credenciais inválidas ou erro no servidor';
      try {
        const err = await res.json();
        if (err?.detail) message = JSON.stringify(err.detail);
      } catch {}
      throw new Error(message);
    }

    const data = await res.json(); // { access_token, token_type }

    if (data?.access_token) {
      localStorage.setItem('jwt_token', data.access_token);
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
      return;
    }

    throw new Error('Token não encontrado na resposta');
  } catch (error) {
    console.error('Erro no login:', error);
    toast('Falha ao efetuar login. Verifique suas credenciais.');
  }
};

 const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="w-full h-screen flex">

            <div
                className="
                    w-1/2 md:hidden h-full p-16 lg:flex justify-between flex-col 
                    hidden bg-cover bg-center bg-no-repeat bg-eng-blue"
             >
              <Link to={'/'} className="w-fit">
                     <div className="flex items-center gap-2">
                     <div className="h-[36px] flex items-center gap-2"><SymbolEEWhite/></div>
                     <div className="h-[24px] flex items-center gap-2"><LogoVitrineWhite /></div>
                     </div>
                    </Link>
                <div>
                <div>
                            <p className="font-medium text-white max-w-[500px]">
                                "{currentQuote.quote}"
                            </p>
                            <p className="text-white mt-2 text-sm">{currentQuote.author}</p>
                        </div>
                </div>
            </div>

            <div className="px-8 md:w-full lg:w-1/2 w-full h-full flex md:px-16 items-center justify-center flex-col">
                <div className="max-w-[400px] w-full">
                    <div className="flex items-center mb-8 lg:hidden">
                    <Link to={'/'} className="w-fit" onClick={() => handleClick()}>
                                <div className="h-[28px]">
                                    {(theme == 'dark') ? (<LogoVitrineWhite />) : (<LogoVitrine />)}
                                </div>
                            </Link>
                    </div>
                    <CardHeader className="p-0 pb-6">
                        <CardTitle>Fazer login</CardTitle>
                        <CardDescription className="pt-2">
    Faça login com sua conta Minha UFMG.
  </CardDescription>

                    </CardHeader>

                    <div className="flex gap-3 flex-col">
                        <div>
                      
                               <a href={UrlAuthentication}><Button className=" w-full" variant={'outline'} ><div className="h-[12px]"><MUfmg /></div>Login com Minha UFMG
                         <div className="relative float-right top-0 right-0">
                             <div className="bg-[#719CB8] w-2 rounded-full h-2 animate-ping float-right flex right-0">
                             </div><div className="bg-[#719CB8] w-2 rounded-full h-2"></div></div></Button></a>

                        </div>

                         <div className="flex items-center gap-3 text-neutral-300 dark:text-neutral-800 my-6">
                        <div className="w-full h-[0.5px] bg-neutral-300 dark:bg-neutral-800"></div>
                        ou
                        <div className="w-full h-[0.5px]  bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                       
              <CardContent className=" p-0 w-full flex flex-col gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="name">Email</Label>
                            <Input onChange={(e) => setEmail(e.target.value)} id="name" />
                        </div>
                        <div className="space-y-1">
      <Label htmlFor="current">Senha</Label>

      <div className="relative">
        <Input
          id="current"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-10"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>

                        <Button onClick={handleLogin} className="text-white mt-2 w-full dark:text-white"><SignIn size={16} /> Fazer login</Button>

                    
                    </CardContent>

                    </div>
{/* 
                    <div className="flex items-center gap-3 text-neutral-200 dark:text-neutral-800 my-6">
                        <div className="w-full h-[0.5px] bg-neutral-200 dark:bg-neutral-800"></div>
                        ou
                        <div className="w-full h-[0.5px]  bg-neutral-200 dark:bg-neutral-800"></div>
                    </div>
*/}
                   {/* <CardContent className=" p-0 w-full flex flex-col gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="name">Email</Label>
                            <Input onChange={(e) => setEmail(e.target.value)} id="name" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="current">Senha</Label>
                            <Input onChange={(e) => setPassword(e.target.value)} id="current" type="password" />
                        </div>

                        <Button onClick={handleLogin} className="text-white mt-2 w-full dark:text-white"><SignIn size={16} /> Fazer login</Button>

                        <Link to={'/recoverPassword'} className="w-fit">   <Button variant={'link'} className="px-0 ml-auto float-left w-fit relative">Esqueci a senha</Button></Link>
                    </CardContent>*/}
                </div>

            </div>
        </div>
    )
}