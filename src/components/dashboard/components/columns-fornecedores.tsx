
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
      const { onOpen } = useModal();
      const name = row.original.nome;
      const id_pesquisador = row.original.cnpj;
      
      return (
      <div className="flex gap-3 justify-end">
        <Button size={'icon'} className="h-8 w-8"  variant={'outline'}><PencilLine size={16}/></Button>
        <Button onClick={() => onOpen('confirm-delete-fornecedor', {cnpj:id_pesquisador, name:name})} size={'icon'} className="h-8 w-8" variant={'destructive'}><Trash size={16}/></Button>
        
        </div>
      )
    }
  },
  
]
