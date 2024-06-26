
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
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {Copy, Trash} from "phosphor-react"
import { useModal } from "../../hooks/use-modal-store"


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
  
]
