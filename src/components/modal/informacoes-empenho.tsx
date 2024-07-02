import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {useDropzone} from 'react-dropzone'
import { toast } from "sonner"
import { ptBR } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../../components/ui/dialog"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "../../components/ui/accordion"
  import axios from 'axios';
  import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, PencilLine } from "lucide-react";
import { FilePdf, MagnifyingGlass } from "phosphor-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "../../components/ui/popover"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "../../components/ui/sheet"
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib";
import { ScrollArea } from "../ui/scroll-area";
import PdfViewer from "../dashboard/components/PdfViewer";
import { UserContext } from "../../context/context";
import { Textarea } from "../ui/textarea";
import { string } from "prop-types";

interface Fornecedores {
    sigla: string;
      nome: string;
      endereco: string;
      cep: string;
      cidade: string;
      cnpj: string;
      telefone: string;
      email: string;
      observacoes: string;
  }

interface loc_nom {
    loc_nom:string
    pes_nome:string
    email:string
    telefone:string
  }

export function InformacoesEmpenhos() {
    const {urlGeral} = useContext(UserContext)
    const { onClose, isOpen, type: typeModal, data } = useModal();
    
    const isModalOpen = (isOpen && typeModal === 'informacoes-empenhos')
    const [nomeEmp, setNomeEmp] = useState('');
    const [desc, setDesc] = useState('');
    const [localEnterga, setLocalEntrega] = useState('');
    const [confEntrega, setConfEntrega] = useState('');
    const [localizacao, setLocalizacao] = useState("")
const [fornecedor, setFornecedor] = useState("")
const [coluna, setColuna] = useState("")

    const [fileInfo, setFileInfo] = useState<{ name: string; size: number }>({
        name: '',
        size: 0
      });
    
      const [fileInfo2, setFileInfo2] = useState<{ name: string; size: number }>({
        name: '',
        size: 0
      });
    
      const [pdfs, setPdfs] = useState<{
        pdf_empenho: File | null;
        pdf_nf: File | null;
        pdf_resumo: File | null;
      }>({
        pdf_empenho: null,
        pdf_nf: null,
        pdf_resumo: null
      });
    
      const handleFileUpload = (files: any) => {
        const uploadedFile = files[0];
        if (uploadedFile) {
          setPdfs((prevState) => ({
            ...prevState,
            pdf_nf: uploadedFile
          }));
          setFileInfo({
            name: uploadedFile.name,
            size: uploadedFile.size
          });
        }
      };
    
      const handleFileUploadResumo = (files: any) => {
        const uploadedFile = files[0];
        if (uploadedFile) {
          setPdfs((prevState) => ({
            ...prevState,
            pdf_resumo: uploadedFile
          }));
          setFileInfo2({
            name: uploadedFile.name,
            size: uploadedFile.size
          });
        }
      };
    
      const onDrop = useCallback((acceptedFiles: any) => {
        handleFileUpload(acceptedFiles);
      }, []);
    
      const onDropResumo = useCallback((acceptedFiles: any) => {
        handleFileUploadResumo(acceptedFiles);
      }, []);
    
      const { getRootProps: getRootPropsNf, getInputProps: getInputPropsNf, isDragActive: isDragActiveNf } = useDropzone({
        onDrop
      });
    
      const { getRootProps: getRootPropsResumo, getInputProps: getInputPropsResumo, isDragActive: isDragActiveResumo } = useDropzone({
        onDrop: onDropResumo
      });
    

      

  const [status, setStatus] = useState('Aguardando entrega')
  const [recebido, setRecebido] = useState('Não')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [prazo, setPrazo] = useState<Date | undefined>(new Date())



  const [openPopo, setOpenPopo] = useState(false)
  const [openPopo2, setOpenPopo2] = useState(false)
  const [openPopo3, setOpenPopo3] = useState(false)
  const [openPopo4, setOpenPopo4] = useState(false)

  //

  useEffect(() => {
    if (data) {
        setNomeEmp(data.emp_nom?.trim() || '');
        setStatus(data.status_tomb?.trim() || '');
        setRecebido(data.status_recebimento?.trim() || '');
        setLocalEntrega(data.loc_entrega?.trim() || '');
        setConfEntrega(data.loc_entrega_confirmado?.trim() || '');
        setLocalizacao(data.loc_nom?.trim() || '');
        setDesc(data.des_nom?.trim() || '');
    }
}, [data]);



  let urlLocNom = `${urlGeral}AllLocNom`;
  const [locNomLista, setLocNomLista] = useState<loc_nom[]>([]);

  useEffect(() => {   
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
          toast("Erro: Nenhum patrimônio encontrado", {
            description: "Revise o número",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchDataLocNom()
  }, []);

 

  const [searchTerm, setSearchTerm] = useState('');

  const [searchTermFornecedores, setSearchTermFornecedores] = useState('');

const normalizeString = (str:any) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const filteredList = locNomLista.filter((framework) =>
  normalizeString(framework.loc_nom).includes(normalizeString(searchTerm))
);
const [fornecedores, setFornecedores] = useState<Fornecedores[]>([]);

const urlPatrimonioInsert = `${urlGeral}getFornecedores`;

const filteredList3 = fornecedores.filter((framework) =>
    normalizeString(framework.nome).includes(normalizeString(searchTermFornecedores))
  );


const filteredList2 = locNomLista.filter((item: loc_nom) => item.loc_nom === localizacao);

const filteredList4 = fornecedores.filter((item: any) => item.nome === fornecedor);
   
    const fetchDataP = async () => {
      try {

        const response = await fetch(urlPatrimonioInsert , {
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
            setFornecedores(data)
        }
      } catch (err) {
        console.log(err);
      }
    };

    useEffect(() => {  
      fetchDataP()
  
     
    }, [urlPatrimonioInsert]);

   //fetch enviar
   const [formData, setFormData] = useState({
    id: '',
    coluna: '',
    emp_nom: '',
    status_tomb: '',
    pdf_empenho:data.pdf_empenho,
    tipo_emp: '',
    data_fornecedor: '',
    prazo_entrega: '',
    status_recebimento: '',
    loc_entrega: '',
    loc_entrega_confirmado: '',
    cnpj: '',
    loc_nom: '',
    des_nom: '',
    status_tombamento: '',
    data_tombamento: '',
    data_aviso: '',
    prazo_teste: '',
    atestado: '',
    loc_tom: '',
    status_nf: '',
    observacoes: '',
    data_agendamento: '',
    n_termo_processo: '',
    origem: '',
    valor_termo: '',
    n_projeto: '',
    data_tomb_sei: '',
    pdf_nf: '',
    pdf_resumo: ''
  });

  useEffect(() => {
    setFormData({
      id: data.id,
      coluna: data.coluna,
      emp_nom: nomeEmp,
      status_tomb: status,
      pdf_empenho:data.pdf_empenho,
      tipo_emp: '',
      data_fornecedor: String(date),
      prazo_entrega: String(prazo),
      status_recebimento: recebido,
      loc_entrega: localEnterga,
      loc_entrega_confirmado: confEntrega,
      cnpj: filteredList4.length > 0 ? filteredList4[0].cnpj.trim() : '',
      loc_nom: filteredList2.length > 0 ? filteredList2[0].loc_nom.trim() : '',
      des_nom: desc,
      status_tombamento: '',
      data_tombamento: '',
      data_aviso: '',
      prazo_teste: '',
      atestado: '',
      loc_tom: '',
      status_nf: '',
      observacoes: '',
      data_agendamento: '',
      n_termo_processo: '',
      origem: '',
      valor_termo: '',
      n_projeto: '',
      data_tomb_sei: '',
      pdf_nf: '',
      pdf_resumo: ''
    });
  }, [data, nomeEmp, status, date, prazo, recebido, localEnterga, confEntrega, filteredList4, filteredList2, desc]);




const handleSubmitPatrimonio = async () => {
    try {
      const urlPatrimonioInsert = `${urlGeral}empenho`; // Atualize a URL conforme necessário

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (pdfs.pdf_nf) {
        formDataToSend.append('pdf_nf', pdfs.pdf_nf);
      }
      if (pdfs.pdf_resumo) {
        formDataToSend.append('pdf_resumo', pdfs.pdf_resumo);
      }

      const response = await axios.post(urlPatrimonioInsert, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast("Dados enviados com sucesso", {
          description: "Todos os dados foram enviados.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

        setFileInfo({ name: '', size: 0 });
        setFileInfo2({ name: '', size: 0 });
        setPdfs({ pdf_empenho: null, pdf_nf: null, pdf_resumo: null });

        onClose();
      }
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      toast("Erro ao processar a requisição", {
        description: "Tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  console.log(formData)


    return(
        <Sheet open={isModalOpen} onOpenChange={onClose}> 
        <SheetContent className="min-w-[60vw] ">
        <SheetHeader className="pt-8 px-6 flex flex-col ">
        <div className={`rounded-md h-1 w-10 ${(data.coluna != undefined && data.coluna.trim()) === 'recebidos' ? 'bg-blue-500' : ''} ${(data.coluna != undefined && data.coluna.trim()) === 'projetos' ? 'bg-pink-500' : ''}`}></div>
                 <DialogTitle className="text-2xl text-left font-medium">
                Atualizar informações do empenho {data.emp_nom}
                 </DialogTitle>
                 <DialogDescription className="text-cente text-zinc-500 ">
                 Atualize os itens do {typeModal == 'import-csv' ? ('patrimônio'):('patrimônio baixado')} na Vitrine com a planilha .xls gerada no SICPAT
                 </DialogDescription>
               </SheetHeader>

               <Tabs defaultValue="account" className="px-6">
  <TabsList className="mt-4" >
    <TabsTrigger  value="account">Controle</TabsTrigger>
    <TabsTrigger value="password">Documentos</TabsTrigger>
    <TabsTrigger value="pdf"><PencilLine size={16}/></TabsTrigger>
  </TabsList>
  <div className="w-full border-b border-neutral-200 my-6 dark:border-neutral-800"></div>
  <TabsContent value="account" className="w-full m-0">
<div className=" h-[calc(100vh-320px)] elementBarra overflow-y-auto overflow-x-hidden">
<Accordion type="single" collapsible className="w-full m-0 ">
  <AccordionItem value="item-1" className="m-0">
    <AccordionTrigger>Informações de controle</AccordionTrigger>
    <AccordionContent className="flex flex-col gap-6">
    <fieldset className="grid xl:col-span-2 gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Dados gerais
                  </legend>
                 
                 <div className="flex flex-col gap-6">

                 <div className="flex w-full gap-6">
                <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Nome do empenho</Label>
                    <Input name="sigla" 
                   id="temperature" type="text" className="flex flex-1" value={nomeEmp} onChange={(e) => setNomeEmp(e.target.value)} />
                  </div>

                  <div className="grid gap-3 ">
                      <Label htmlFor="name">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value)} >
  <SelectTrigger  className="w-[180px]">
    <SelectValue  />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Aguardando entrega">Aguardando entrega</SelectItem>
    <SelectItem value="Entrega em atraso">Entrega em atraso</SelectItem>
    <SelectItem value="Empenho não recebido">Empenho não recebido</SelectItem>
    <SelectItem value="Atesto em atraso">Atesto em atraso</SelectItem>
    <SelectItem value="Aguardando ateste">Aguardando ateste</SelectItem>
    <SelectItem value="Atestado">Atestado</SelectItem>
  </SelectContent>
</Select>
</div>
                </div>
                <div className="flex w-full gap-6">
                <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Envio para o fornecedor</Label>
                    <Select open={openPopo} onOpenChange={setOpenPopo}>
      <SelectTrigger className="pl-0">
        <Button
          variant={"ghost"}
          className={cn(
            "justify-start text-left font-normal w-full hover:bg-transparent",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
        </Button>
      </SelectTrigger>
      <SelectContent className=" p-4 flex h-auto items-center justify-center">
    
        <Calendar
          mode="single"
          className=" "
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
           
          }}
          locale={ptBR}
          initialFocus
        />
    
      </SelectContent>
    </Select>

    
                   
                  </div>

                  <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Prazo de entrega</Label>
                    <Select open={openPopo4} onOpenChange={setOpenPopo4}>
      <SelectTrigger className="pl-0">
        <Button
          variant={"ghost"}
          className={cn(
            "justify-start text-left font-normal w-full hover:bg-transparent",
            !prazo && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {prazo ? format(prazo, "dd/MM/yyyy") : <span>Pick a date</span>}
        </Button>
      </SelectTrigger>
      <SelectContent className=" p-4 flex h-auto items-center justify-center">
    
        <Calendar
          mode="single"
          className=" "
          selected={prazo}
          onSelect={(newDate) => {
            setPrazo(newDate);
           
          }}
          locale={ptBR}
          initialFocus
        />
    
      </SelectContent>
    </Select>
                  </div>

                
                </div>

                <div className="flex w-full gap-6">
                <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Local de entrega</Label>

                        <Select value={localEnterga} onValueChange={(value) => setLocalEntrega(value)} >
  <SelectTrigger  className="w-full">
    <SelectValue  />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1605 SECAO DE PATRIMONIO">1605 SECAO DE PATRIMONIO</SelectItem>
    <SelectItem value="DIRETAMENTE NO SOLICITANTE">DIRETAMENTE NO SOLICITANTE</SelectItem>
   
  </SelectContent>
</Select>
                  </div>

                  <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Confirmação do local de entrega</Label>

                        <Select value={confEntrega} onValueChange={(value) => setConfEntrega(value)} >
  <SelectTrigger  className="">
    <SelectValue  />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Sim">Sim</SelectItem>
    <SelectItem value="Não">Não</SelectItem>
   
  </SelectContent>
</Select>
                  </div>

                  <div className="grid gap-3 ">
                      <Label htmlFor="name">Recebido</Label>
                <Select value={recebido} onValueChange={(value) => setRecebido(value)} >
  <SelectTrigger  className="w-[180px]">
    <SelectValue  />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Sim">Sim</SelectItem>
    <SelectItem value="Não">Não</SelectItem>
   
  </SelectContent>
</Select>
</div>
                </div>

                <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Descrição</Label>

                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)}/>
                  </div>
                 </div>
                
                </fieldset>

             

                <fieldset className="grid xl:col-span-2 gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Dados do solicitante
                  </legend>

                  <div className="flex gap-6  ">
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
                            <div className="text-center w-full text-sm">Nenhuma sala encontrada</div>
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
                  </div>
                  {filteredList2.map((props: loc_nom) => {
                return (
                  <div className="flex gap-6 ">
                  <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Email</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={props.email}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Telefone</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={props.telefone}
                        />
                      </div>
                  </div>
                   );
                })}
                  </fieldset>

                  <fieldset className="grid xl:col-span-2 gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Dados do fornecedor
                  </legend>

                  <div className="flex gap-6  ">
                  <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Nome da empresa</Label>

                        <Dialog open={openPopo3}  onOpenChange={setOpenPopo3}>
                        <DialogTrigger className="w-full">
                        <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPopo3}
                              className="w-full justify-between"
                            >
                              {fornecedor
                                ? fornecedores.find((framework) => framework.nome === fornecedor)?.nome
                                : 'Selecione um fornecedor'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="z-[9999]" >
    <DialogHeader>
      <DialogTitle>Escolher fornecedor</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>

    <div className="border rounded-md px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
                                <MagnifyingGlass size={16} />
                                <Input
                                  className="border-0"
                                  value={searchTermFornecedores}
                                  onChange={(e) => setSearchTermFornecedores(e.target.value)}
                                  placeholder="Buscar localização"
                                />
                              </div>

                              <div className={'max-h-[350px] overflow-y-auto elementBarra'}>
                              
                              <div className="flex flex-col gap-1 p-2">
                                {filteredList3.length > 0 ? (
                                  filteredList3.map((props, index) => (
                                    <Button
                                      variant={'ghost'}
                                      key={index}
                                      className="text-left justify-start"
                                      onClick={() => {
                                        setFornecedor(props.nome);
                                  
                                        setOpenPopo3(false); // Fechar o popover após a seleção
                                      }}
                                    >
                                      {props.nome}
                                    </Button>
                                  ))
                                ) : (
                                  <div className="text-center w-full text-sm">Nenhum fornecedor encontrado</div>
                                )}
                              </div>
                            </div>
  </DialogContent>

                        </Dialog>
                </div>

                {filteredList4.map((props) => {
                return (
                    <div className="grid gap-3 w-full" key={props.email}>
                        <Label htmlFor="name">CNPJ</Label>
                        <Input
                            id="name"
                            type="text"
                            className="w-full"
                            value={props.cnpj}
                            disabled
                        />
                    </div>
                );
            })}
                  </div>
                  {filteredList4.map((props) => {
                return (
                  <div className="flex gap-6 ">
                  <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Email</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={props.email}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Telefone</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled
                          value={props.telefone}
                        />
                      </div>
                  </div>
                   );
                })}
                  </fieldset>

                 
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>Nota fiscal</AccordionTrigger>
    <AccordionContent>
        <div {...getRootPropsNf()} className="border-dashed flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100">
          <input {...getInputPropsNf()} />
          <div className="p-4 border rounded-md">
            <FilePdf size={24} className="whitespace-nowrap" />
          </div>
          {isDragActiveNf ? (
            <p>Solte os arquivos aqui ...</p>
          ) : (
            <p>Arraste e solte o arquivo .pdf aqui ou clique para selecionar o arquivo</p>
          )}
        </div>

        <div>
          {fileInfo.name && (
            <div className="justify-center mt-6 mb-2 flex items-center gap-3">
              <FilePdf size={16} />
              <p className="text-center text-zinc-500 text-sm">
                Arquivo selecionado: <strong>{fileInfo.name}</strong> ({(fileInfo.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-3">
    <AccordionTrigger>Resumo da nota fiscal</AccordionTrigger>
     <AccordionContent>
        <div {...getRootPropsResumo()} className="border-dashed flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100">
          <input {...getInputPropsResumo()} />
          <div className="p-4 border rounded-md">
            <FilePdf size={24} className="whitespace-nowrap" />
          </div>
          {isDragActiveResumo ? (
            <p>Solte os arquivos aqui ...</p>
          ) : (
            <p>Arraste e solte o arquivo .pdf aqui ou clique para selecionar o arquivo</p>
          )}
        </div>

        <div>
          {fileInfo2.name && (
            <div className="justify-center mt-6 mb-2 flex items-center gap-3">
              <FilePdf size={16} />
              <p className="text-center text-zinc-500 text-sm">
                Arquivo selecionado: <strong>{fileInfo2.name}</strong> ({(fileInfo2.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
  </AccordionItem>
 
</Accordion>
</div>

<div className="w-full mt-4 mb-8 flex gap-3 justify-end">
<Button variant={'ghost'} onClick={() => onClose()} className=""><Check size={16}/>Cancelar</Button>
    <Button className="" onClick={() => handleSubmitPatrimonio()}><Check size={16}/>Salvar alterações</Button></div>
  </TabsContent>

  <TabsContent value="password">
    <div className=" h-[calc(100vh-320px)] elementBarra overflow-y-auto overflow-x-hidden">
    <Accordion type="single" collapsible className="w-full m-0 ">
    <AccordionItem value="item-1">
    <AccordionTrigger>Empenho</AccordionTrigger>
    <AccordionContent>
          <div>
          <PdfViewer pdfBase64={data.pdf_empenho ? data.pdf_empenho : ''} />
          </div>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>Nota fiscal</AccordionTrigger>
    <AccordionContent>
          <div>
          <PdfViewer pdfBase64={data.pdf_nf ? data.pdf_nf : ''} />
          </div>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-3">
    <AccordionTrigger>Resumo da nota fiscal</AccordionTrigger>
    <AccordionContent>
          <div>
          <PdfViewer pdfBase64={data.pdf_resumo ? data.pdf_resumo : ''} />
          </div>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-4">
    <AccordionTrigger>Termo de responsabilidade</AccordionTrigger>
    <AccordionContent>
          <div>
          <PdfViewer pdfBase64={data.pdf_nf ? data.pdf_nf : ''} />
          </div>
    </AccordionContent>
  </AccordionItem>
        </Accordion>
    </div>
    <div className="w-full mt-4 mb-8 flex gap-3 justify-end">
<Button variant={'ghost'} className=""><Check size={16}/>Cancelar</Button>
    <Button className=""><Check size={16}/>Salvar alterações</Button></div>
    </TabsContent>
</Tabs>

              
               </SheetContent>
               </Sheet >
    )
}