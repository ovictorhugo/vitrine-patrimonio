
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
import { ChevronsUpDown } from "lucide-react";
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


  const filteredList2 = locNomLista.filter((item: loc_nom) => item.loc_nom === localizacao);

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

 console.log(filteredList2)

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
                                        setLocalizacao(props.loc_nom);
                                  
                                        setOpenPopo2(false); // Fechar o popover após a seleção
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
                    <Input name="nome" defaultValue={filteredList2.length > 0 ? filteredList2[0].telefone.trim() : telefone}
                    onChange={(e) => handlePhoneChange( e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>

                  <div className="grid gap-3 w-full">
                    <Label >Email</Label>
                    <Input name="nome" defaultValue={filteredList2.length > 0 ? filteredList2[0].email.trim() : email}
                    onChange={(e) => setEmail( e.target.value)} id="temperature" type="email" className="flex flex-1" />
                  </div>

                  <Button onClick={() => handleSubmitPatrimonio()}>Adicionar contato</Button>
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