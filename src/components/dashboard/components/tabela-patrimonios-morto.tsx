import { useContext, useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { UserContext } from "../../../context/context";
import { columns } from "./columns";
import { columnsMorto } from "./columns-morto";

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

export function TabelaPatrimonioMorto() {
    const [total, setTotal] = useState<Patrimonio[]>([]);
    const {urlGeral} = useContext(UserContext)
    

    const urlPatrimonioInsert = `${urlGeral}allPatrimonioMorto`;

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

    return(
        <DataTable columns={columnsMorto} data={total}></DataTable>
    )
}