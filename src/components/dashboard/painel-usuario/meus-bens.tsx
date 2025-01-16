import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";

interface Salas {
    bem_cod:string
    bem_dgv:string
    bem_dsc_com:string
    bem_num_atm:string
    bem_serie:string
    bem_sta:string
    bem_val:string
    created_at:string
    csv_cod:string
    ele_cod:string
    grp_cod:string
    ite_mar:string
    ite_mod:string
    loc_cod:string
    loc_nom:string
    mat_cod:string
    mat_nom:string
    org_cod:string
    org_nom:string
    pes_cod:string
    pes_nome:string
    set_cod:string
    set_nom:string
    tgr_cod:string
    uge_nom:string
    uge_siaf:string
}

export function MeusBens() {

    const {urlGeral, user} = useContext(UserContext)
    const [sala, setSala] = useState<Salas[]>([]); 

     const handleGetFavorites = async () => {
      const urlGetFavorites = `${urlGeral}loc/${user?.user_id}`;
    console.log(urlGetFavorites)
      try {
        const response = await fetch(urlGetFavorites, {
          mode: 'cors',
          method: 'GET',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
        });
    
        if (response.ok) {
          const data = await response.json();
          setSala(data);
        } else {
         
        }
      } catch (err) {
       
      }
    };
    
    useEffect(() => {
      handleGetFavorites()
      }, [user?.user_id])

    return(
        <div>

        </div>
    )
}