import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../components/ui/breadcrumb"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, FileCsv, FilePdf, FileXls, Package, Check, Trash, Info, ArrowUUpLeft, MapPin, User, CursorText, Calendar } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, DollarSign, ChevronLeft } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { TabelaPatrimonio } from "./components/tabela-patrimonios";
import { ScrollArea } from "../ui/scroll-area";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/ui/toggle-group"

import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Badge } from "../ui/badge";

import { useLocation, useNavigate } from 'react-router-dom';
import { ItensOciosos } from "../modal/itens-ociosos";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

interface Patrimonio {
  bem_cod:string
  bem_dgv:string
  bem_num_atm:string
  csv_cod:string
  bem_serie:string
  bem_sta:string
  bem_val:string
  tre_cod:string
  bem_dsc_com:string
  uge_cod:string
  uge_nom:string
  org_cod:string
  uge_siaf:string
  org_nom:string
  set_cod:string
  set_nom:string
  loc_cod:string
  loc_nom:string
  ite_mar:string
  ite_mod:string
  tgr_cod:string
  grp_cod:string
  ele_cod:string
  sbe_cod:string
  mat_cod:string
  mat_nom:string
  pes_cod:string
  pes_nome:string
  toggleGroupValue?: string
}

interface TotalPatrimonios {
  total_patrimonio:string
  total_patrimonio_morto:string
  unique_values:unique_values
}

interface unique_values {
  loc_cod:string
  loc_nom:string
  org_nom:string
  org_cod:string
  pes_cod:string
  pes_nome:string
  set_cod:string
  set_nom:string
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import logo_eng from '../../assets/logo_eng.png';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

export function VisaoSala() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral} = useContext(UserContext)
    const {onOpen} = useModal();

    const { onClose, isOpen:isOpenModal, type: typeModal } = useModal();
    
    const isModalOpenItensOciosos = (isOpenModal && typeModal === 'itens-ociosos')

    const query = useQuery();
  const sala = query.get('sala');


    const isModalOpen = isOpen && type === "visao-sala";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=${(sala != null || sala != "" || sala != undefined) && sala}`;
console.log(urlPatrimonioInsert)

    useEffect(() => {
      const fetchData = async () => {
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
              setTotal(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonioInsert]);

    const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([]);

    const urlPatrimonio = `${urlGeral}allPatrimonio?loc_nom=${sala !== null ? sala: ''}`;

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(urlPatrimonio  , {
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
              setPatrimonio(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonio ]);

    const handleToggleChange = (value: string, index: number) => {
      setPatrimonio((prevPatrimonio) => {
        const updatedPatrimonio = [...prevPatrimonio];
        updatedPatrimonio[index].toggleGroupValue = value;
        return updatedPatrimonio;
      });
      
    };

    const isValidCsvCod = (value:any) => ["OC", "QB", "NE", "SP"].includes(value);

    const data = patrimonio.map((item) => ({
      bem_cod: item.bem_cod,
      bem_dgv: item.bem_dgv,
      bem_num_atm: item.bem_num_atm,
      bem_dsc_com: item.bem_dsc_com,
      tre_cod: item.tre_cod,
      bem_val: item.bem_val,
      csv_cod: isValidCsvCod(item.csv_cod.trim()) ? item.csv_cod.trim() : item.toggleGroupValue, // Verificação de csv_cod

    }));

    console.log(patrimonio)
    console.log(data)

    let validData = []

    const handleButtonClick = async () => {
      const validValues = ["OC", "QB", "NE", "SP"];
      const invalidItems = patrimonio.filter(item => !validValues.includes(item.toggleGroupValue!));
    
      if (invalidItems.length > 0) {
        toast("Revise antes de enviar", {
          description: "Verifique se todos os bens constam com a condição",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      } else {
         validData = patrimonio.filter(item => item.toggleGroupValue === "OC");
    
        if (validData.length > 0) {
          onOpen('itens-ociosos');
        } else {
          try {

            let urlPatrimonioInsert = urlGeral + `insertCondicaoBem`
            const response = await fetch(urlPatrimonioInsert, {
              mode: 'cors',
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '3600',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
    
            if (response.ok) {
              toast("Dados enviados com sucesso", {
                description: "Todos os dados foram enviados.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar"),
                },
              });
            } else {
              throw new Error('Network response was not ok');
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
      }
    };
    

    return(
        <>
        {isModalOpen && (
            <main className="flex flex-1 flex-col p-8 bg-white">
             <div className="h-32 border w-full border-black flex justify-between">
              <div className="border-r border-black h-full w-32 flex items-center justify-center"> <img src={logo_eng} alt="" className="h-20" /></div>
              <div className="py-1 w-full flex flex-col flex-1 items-center justify-center">
                <p className="font-bold">UNIVERSIDADE FEDERAL DE MINAS GERAIS</p>
                <p className="font-bold">SICTPAT - Sistema de Controle Patrimonial</p>
                <p className="font-bold">153280 - ESCOLA DE ENGENHARIA</p>
                <p className="font-bold">Relação de Bens para Inventário do Exercício de </p>
              </div>
              <div className="border-l border-black h-full w-32 flex items-center justify-center"> </div>
             </div>

            <div className="flex h-32 items-end w-full gap-4">
            {total.map((props, index) => {
            return (
              <div key={index} className="w-full flex flex-1">
                {props.unique_values.map((item, subIndex) => {
                  return (
                    <div key={subIndex} className="flex flex-col gap-1 p-2 w-full flex-1">
                      <p className="text-sm"><strong>Órgão:</strong> {item.org_cod} - {item.org_nom}</p>
                      <p  className="text-sm"><strong>Setor:</strong> {item.set_cod} - {item.set_nom}</p>
                      <p  className="text-sm"><strong>Local:</strong> {item.loc_cod} - {item.loc_nom}</p>
                      <p  className="text-sm"><strong>Pessoa:</strong> {item.pes_cod} - {item.pes_nome}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="border  border-black p-2 ">
          <p className="text-sm"><strong>Verificado em:</strong> </p>
          <p className="text-sm"><strong>Nome:</strong> </p>
          <p className="text-sm"><strong>Assinatura:</strong> </p>
          </div>

          <div  className="flex flex-col  px-2">
          <p className="text-xs">Legenda:</p>
                      <p className="text-xs">OC - Ocioso</p>
                      <p  className="text-xs"> QB - Quebrado</p>
                      <p  className="text-xs"> NE - Não encontrado</p>
                      <p  className="text-xs">SP - Sem plaqueta</p>
                    </div>
            </div>

            <div className="w-full">
            <table className="w-full mt-2">
            <tr className="border border-black px-2">
              <th className="w-fit text-xs">N° Patrim.</th>
              <th className="text-xs">Número ATM</th>
              <th className="w-full flex flex-1 text-xs">Descrição do Item</th>
              <th className="text-xs">TR</th>
              <th className="text-xs">Conservação</th>
              <th className="text-xs">Valor do bem</th>
              <th className="text-xs">OC</th>
              <th className="text-xs">QB</th>
              <th className="text-xs">NE</th>
              <th className="text-xs">SP</th>
            </tr>
           {patrimonio.map((props) => {
            return(
              <tr>
              <td className="text-xs">{props.bem_cod}-{props.bem_dgv}</td>
              <td className="text-xs">{props.bem_num_atm}</td>
              <td className="text-xs">{props.bem_dsc_com}</td> 
              <td className="text-xs">{props.tre_cod}</td>
              <td className="text-xs">{props.csv_cod.trim() == "BM" ? 'Bom': props.csv_cod.trim() == 'AE' ? 'Anti-Econômico': props.csv_cod.trim() == 'IR' ? 'Irrecuperável': props.csv_cod.trim() == 'OC' ? 'Ocioso': props.csv_cod.trim() == 'BX' ? 'Baixado': props.csv_cod.trim() == 'RE' ? 'Recuperável': ''}</td>
            </tr>
            )
           })}
           
          </table>
            </div>

            </main>
        )}
        </>
    )
}