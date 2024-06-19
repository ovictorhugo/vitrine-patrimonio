
import { ColumnDef } from "@tanstack/react-table"

interface Patrimonio {
  bem_cod:string, 
  bem_dgv:string, 
  bem_dsc_com:string, 
  bem_num_atm:string,
  uge_siaf:string, 
  bem_sta:string, 
  uge_cod:string, 
  org_cod:string,
  set_cod:string, 
  loc_cod:string, 
  org_nom:string,
  set_nom:string,
  uge_nom:string,
  loc_nom:string,
  mat_nom:string,
}


export const columnsMorto: ColumnDef<Patrimonio>[] = [
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
