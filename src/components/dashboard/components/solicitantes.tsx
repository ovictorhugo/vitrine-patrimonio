
import { Input } from "../../ui/input";
import { useContext, useEffect, useState } from "react";
import { Label } from "../../ui/label";
import { UserContext } from "../../../context/context";
import { Button } from "../../ui/button";
import { toast } from "sonner"

interface loc_nom {
    loc_nom:string
    pes_nome:string
    email:string
    telefone:string
  }

  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../../../components/ui/dialog"
import { ChevronsUpDown, RefreshCcw } from "lucide-react";
import { MagnifyingGlass } from "phosphor-react";

import { columnsSolicitantes } from "./columns-solicitantes";
import { DataTable } from "./data-table-solicitantes";


export function Solicitantes() {

    const [telefone, setTelefone] = useState('')
    const [email, setEmail] = useState('')

    const {urlGeral} = useContext(UserContext)

    const formatPhone = (value:any) => {
        value = value.replace(/\D/g, ''); // Remove todos os caracteres que não são dígitos
        value = value.replace(/^(\d{2})(\d)/, '($1) $2'); // Adiciona parênteses em torno dos dois primeiros dígitos
        value = value.replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2-$3'); // Formata o restante como x xxxx-xxxx
        return value.slice(0, 16); // Limita a 15 caracteres
      };
      
      const handlePhoneChange = (index:any) => {
        const formattedPhone = formatPhone(index);
        setTelefone(formattedPhone);
      };

      let urlLocNom = `${urlGeral}AllLocNom`;
  const [locNomLista, setLocNomLista] = useState<loc_nom[]>([]);

  const fetchDataLocNom = async () => {
    try {
     
      const response = await fetch( urlLocNom, {
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
      if (data) {
        setLocNomLista(data);
     
      } else {
       
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {   
    

    fetchDataLocNom()
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [localizacao, setLocalizacao] = useState("")
  const [openPopo2, setOpenPopo2] = useState(false)




  const normalizeString = (str:any) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };
  
  const filteredList = locNomLista.filter((framework) =>
    normalizeString(framework.loc_nom).includes(normalizeString(searchTerm))
  );

  const handleSubmitPatrimonio = async () => {
    if(localizacao.length == 0) {
        toast("Revise os dados", {
            description: "Selecione a localização",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
        })
            return
    }

    else if(telefone.length == 0 && email.length ==0) {
        toast("Revise os dados", {
            description: "Prrencha pelo menos o telefone ou email",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
        })
            return
    }

   
    try {

        const formData = [{
            pes_nome:filteredList2[0].pes_nome,
            telefone:telefone,
            email:email
        }]
        let urlPatrimonioInsert = `${urlGeral}solicitante`;

        const response = await fetch(urlPatrimonioInsert, {
            mode: 'cors',
            method: 'POST',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            toast("Dados enviados com sucesso", {
              description: "Todos os dados foram enviados.",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });

            setLocalizacao('')
            setTelefone('')
            setEmail('')
            setFilteredList2([])

            fetchDataLocNom()
          }

    } catch (error) {
        toast("Erro ao processar a requisição", {
            description: "Tente novamente mais tarde.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
    }
 }

 const [filteredList2, setFilteredList2] = useState<loc_nom[]>([]);
 console.log(filteredList2)
 const [initialized, setInitialized] = useState(false);

 useEffect(() => {
    if (localizacao) {
      const filtered = locNomLista.filter((item) => item.loc_nom === localizacao);
      setFilteredList2(filtered);
      if (filtered.length > 0) {
        setTelefone(filtered[0].telefone);
        setEmail(filtered[0].email);
      }
    }
  }, [localizacao]);

  const handleClickFornecedor = (props:any) => {
    setLocalizacao(props);
    setOpenPopo2(false);
  };


    return(
        <div className="flex flex-col gap-6">
            <fieldset className="grid gap-6 rounded-lg  p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
        <legend className="-ml-1 px-1 text-sm font-medium">
          Adicionar informações de contato do solicitante
        </legend>

       

        <div className="flex  gap-6 items-end">
        <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Localização</Label>

                        <Dialog open={openPopo2}  onOpenChange={setOpenPopo2}>
                        <DialogTrigger className="w-full">
                        <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPopo2}
                              className="w-full justify-between"
                            >
                              {localizacao
                                ? locNomLista.find((framework) => framework.loc_nom === localizacao)?.loc_nom
                                : 'Selecione um local'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="z-[9999]" >
    <DialogHeader>
      <DialogTitle>Escolher localização</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>

    <div className="border rounded-md px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
                                <MagnifyingGlass size={16} />
                                <Input
                                  className="border-0"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  placeholder="Buscar localização"
                                />
                              </div>

                              <div className={'max-h-[350px] overflow-y-auto elementBarra'}>
                              
                              <div className="flex flex-col gap-1 p-2">
                                {filteredList.length > 0 ? (
                                  filteredList.map((props, index) => (
                                    <Button
                                      variant={'ghost'}
                                      key={index}
                                      className="text-left justify-start"
                                      onClick={() => {
                                        handleClickFornecedor(props.loc_nom)
                                      }}
                                    >
                                      {props.loc_nom}
                                    </Button>
                                  ))
                                ) : (
                                  <div>Nenhuma sala encontrada</div>
                                )}
                              </div>
                            </div>
  </DialogContent>

                        </Dialog>
                </div>

        {filteredList2.map((props: loc_nom) => {
                return (
                    <div className="grid gap-3 w-full" key={props.email}>
                        <Label htmlFor="name">Responsável</Label>
                        <Input
                            id="name"
                            type="text"
                            className="w-full"
                            value={props.pes_nome}
                            disabled
                        />
                    </div>
                );
            })}

        <div className="grid gap-3 w-full">
                    <Label >Telefone</Label>
                    <Input name="nome" value={telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                  <div className="grid gap-3 w-full">
                    <Label >Email</Label>
                    <Input name="nome" value={email}
                    onChange={(e) => setEmail(e.target.value)} id="temperature" type="email" className="flex flex-1" />
                  </div>

                  <Button onClick={() => handleSubmitPatrimonio()}><RefreshCcw size={16}/> Atualizar contato</Button>
        </div>
        </fieldset>

        <fieldset className="grid gap-6 rounded-lg  p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
        <legend className="-ml-1 px-1 text-sm font-medium">
          Todos os solicitantes
        </legend>

        <DataTable columns={columnsSolicitantes} data={locNomLista}></DataTable>
        </fieldset>
        </div>
    )
}