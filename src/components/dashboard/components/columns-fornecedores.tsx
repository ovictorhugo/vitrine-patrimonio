
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, PencilLine } from "lucide-react"
import {Copy, Trash} from "phosphor-react"
import { toast } from "sonner"
import { useModal } from "../../hooks/use-modal-store"
import { useContext } from "react"
import { UserContext } from "../../../context/context"


interface Patrimonio {
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


export const columnsFornecedores: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "sigla",
    header: "Sigla",
  },
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }) => {

      const {urlGeral} = useContext(UserContext)
      
      const deletarCondicaoBem = () => {
        let urlPatrimonio = `${urlGeral}clearCondicaoBem`;

      const fetchDataP = async () => {
        try {
         
          const response = await fetch( urlPatrimonio, {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Max-Age": "3600",
              "Content-Type": "text/plain",
            },
          });
        
          if (response.ok) {
            toast("Dados excluidos da tabela", {
              description: "",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
         
          } else {
            toast("Erro: Não foi possível resetar a tabela", {
              description: "Tente novamente",
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

        fetchDataP()
 
      }

      return (
      <div className="flex gap-3 justify-end">
        <Button size={'icon'} className="h-8 w-8"  variant={'outline'}><PencilLine size={16}/></Button>
        <Button size={'icon'} className="h-8 w-8" variant={'destructive'}><Trash size={16}/></Button>
        
        </div>
      )
    }
  },
  
]
