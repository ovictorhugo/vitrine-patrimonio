
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
}


export const columns: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "bem_cod",
    header: "Código",
    cell: ({ row }) => {

      return <div>{row.getValue("bem_cod")} - {row.getValue("bem_dgv")}</div>
    }
  },
  {
    accessorKey: "mat_nom",
    header: "Material",
  },
  {
    accessorKey: "bem_dsc_com",
    header: "Descrição",
  },
  {
    accessorKey: "loc_nom",
    header: "Local da guarda",
  },
  {
    accessorKey: "pes_nome",
    header: "Responsável",
  },
  
]
