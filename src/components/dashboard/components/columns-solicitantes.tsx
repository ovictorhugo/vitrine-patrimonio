
import { ColumnDef } from "@tanstack/react-table"

interface Patrimonio {

        loc_nom:string
        pes_nome:string
        email:string
        telefone:string
    
}


export const columnsSolicitantes: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "loc_nom",
    header: "Nome da sala",
  },
  {
    accessorKey: "pes_nome",
    header: "Nome",
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
