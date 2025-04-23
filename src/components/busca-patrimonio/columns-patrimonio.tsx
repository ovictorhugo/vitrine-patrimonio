
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Alert } from "../ui/alert";
import { Patrimonio } from "./busca-patrimonio";


export const columnsPatrimonio: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "mat_nom",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo de materal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
      accessorKey: "bem_cod",
      header: "Nº de patrimônio",
    },

    {
      accessorKey: "bem_num_atm",
      header: "Código ATM",
    },

    {
        accessorKey: "bem_dsc_com",
        header: "Descrição",
      },
   
    {
      accessorKey: "org_nom",
      header: "Orgão",
    },
    {
        accessorKey: "set_nom",
        header: "Setor",
      },
    {
      accessorKey: "loc_nom",
      header: "Local",
    },
    {
      accessorKey: "pes_nome",
      header: "Responsável",
    }
   
  ];