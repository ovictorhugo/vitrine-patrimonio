import { SignIn, UserPlus, Detective, ArrowLeft, ArrowRight, Check } from "phosphor-react";
import { TicketCount } from "../homepage/donation/ticket-count";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ContentFumpistas } from "../homepage/content-fumpistas";
import { useContext, useState } from "react";
import { Input } from "../ui/input";
import { Alert } from "../ui/alert";
import { Label } from "../ui/label";
import axios from 'axios';
import { findAlunoByCpfAndDob } from "../../lib/achar-aluno-cpf-data";
import { Fumpista } from "../../pages/Fumpista";
import { UserContext } from "../../context/context";
import { useLocation, useNavigate } from "react-router-dom";

import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { toast } from "sonner"
interface Aluno {
    mat_aluno:string 
    nom_aluno:string   
    telcel_aluno:string 
    cpf_aluno:string
    datnsc_aluno:Date
    pai_aluno:string
    mae_aluno:string
    cod_curso:string
    ano_sem_ing_aluno:string
    datnsc_pai_aluno:Date
    datnsc_mae_aluno:Date
    email:string
}

function formatarCPF(cpf:any) {
    // Remove caracteres não numéricos e limita a 11 caracteres
    cpf = cpf.replace(/\D/g, '').slice(0, 11);
  
    // Formata o CPF conforme os padrões brasileiros
    return cpf
      .replace(/(\d{3})(\d)/, '$1.$2') // Insere ponto após os 3 primeiros dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Insere ponto após os próximos 3 dígitos
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Insere traço após os últimos 3 dígitos
  }


export function VerificarSituacaoFumpista() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'verificar-situacao-fumpista'
    const {cpf, setCpf, data, setData} = useContext(UserContext)
    const history = useNavigate();

    const [dadosFumpista, setDadosFumpista] = useState<Aluno | null>(null);

    const handleCpfChange = (event:any) => {
        const inputCpf = event.target.value;
        setCpf(formatarCPF(inputCpf));
      };

      const handleDateChange = (e:any) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        if (value.length > 8) value = value.slice(0, 8); // Limit to 8 digits
    
        const day = value.slice(0, 2);
        const month = value.slice(2, 4);
        const year = value.slice(4, 8);
    
        let formattedValue = day;
        if (month) formattedValue += '/' + month;
        if (year) formattedValue += '/' + year;
    
        setData(formattedValue);
      };

      const db = getFirestore();

      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL

      const handleSearch = async () => {

            let url = VITE_BACKEND_URL + `checkoutAlunos?cpf_aluno=${cpf.replace(/\D/g, '')}&datnsc_aluno=${data}`
            console.log(url)
       
            const fetchData = async () => {
                if(cpf.length != 14) {
                    toast.error("Preencha o campo CPF", {
                        description: "Revise os dados e tente novamente",
                        action: {
                          label: "Fechar",
                          onClick: () => console.log("Undo"),
                        }
                    })
                } else if (data.length != 10) {
                    toast.error("Preencha o campo Data de nascimento", {
                        description: "Revise os dados e tente novamente",
                        action: {
                          label: "Fechar",
                          onClick: () => console.log("Undo"),
                        }
                    })
                } else {
                    try {
                
                        const response = await fetch(url, {
                          mode: "cors",
                          headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET",
                            "Access-Control-Allow-Headers": "Content-Type",
                            "Access-Control-Max-Age": "3600",
                            "Content-Type": "text/plain",
                          },
                        });
                        const data = await response.json();
                        if (data.length != 0) {
                          setDadosFumpista(data);
      
                          console.log(dadosFumpista)
      
                          const usersRef = collection(db, 'users');
                          const q = query(usersRef, where('cpf_aluno', '==', cpf));
                      
                          const querySnapshot = await getDocs(q);
      
                          
      
                          if (!querySnapshot.empty) {
                              console.log('tem')
                              
                              setTimeout(() => {
                                  history('/fumpista/signIn');
                                }, 0);
                          } else {
                              setTimeout(() => {
                              history('/fumpista/signUp');
                          }, 0);
                          }
      
      
                       
                        } else {
                          setTimeout(() => {
                              history('/fumpista/nao-encontrado');
                          }, 0);
                        }
                      } catch (err) {
                        console.log(err);
                      }
                }
              };
              fetchData();
           
      };

      console.log(dadosFumpista)
    
    return(
        <>
        {isModalOpen && (
             <div className="h-screen w-full flex items-center mx-16 relative">
                <ContentFumpistas/>
                

                <div className="ml-8 ">
                <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Forneça seu CPF para verificar se está registrado como credor.</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Esta listagem inclui os estudantes que tiveram vínculo com a Fump até 2012 e possuem valores pendentes.</p>

                <div className="flex gap-3 items-center">
                <Label htmlFor="current">CPF</Label>
                    <Input
                     type="text" 
                     value={cpf} 
                     onChange={handleCpfChange} 
                     placeholder="000.000.000-00" 
                     className="flex flex-1"
                    />


<Label htmlFor="current">Data de nascimento</Label>
                    <Input
                     type="text" 
                     value={data} 
                     onChange={handleDateChange}
                     placeholder="00/00/0000" 
                     className="flex flex-1"
                    />
                   
                </div>

               
                    <div className="flex gap-3 mt-8">
                    <Link to={'/'}><Button variant={'outline'}  ><ArrowLeft size={16} />  Voltar</Button></Link>
                    <Button  onClick={() => {
                        handleSearch()
                    }}><ArrowRight size={16} />  Continuar</Button>
                    </div>
                </div>
             </div>
        )}
        </>
    )
}