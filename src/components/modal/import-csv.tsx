import { ArrowUUpLeft, FileCsv } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import Papa from 'papaparse';
import { useContext, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";

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

export function ImportCsv() {
    const { onClose, isOpen, type: typeModal } = useModal();
    
    const isModalOpen = isOpen && typeModal === 'import-csv';

    const {urlGeral} = useContext(UserContext)

    const [data, setData] = useState<Patrimonio[]>([]);

    const handleFileUpload = (e: any) => {
        const file = e.target.files[0];
      
        if (file) {
          Papa.parse(file, {
            complete: (result: any) => {
              const parsedData = result.data;
      
              // Filtrar cabeçalho e linhas vazias
              const filteredData = parsedData.filter((row: any) => Object.values(row).some((value: any) => value !== ""));
      
              // Transformar os dados filtrados em um array de objetos com a estrutura desejada
              const jsonData = filteredData.map((row: any) => ({
                bem_cod: row.bem_cod || "",
                bem_dgv: row.bem_dgv || "",
                bem_num_atm: row.bem_num_atm || "",
                csv_cod: row.csv_cod || "",
                bem_serie: row.bem_serie || "",
                bem_sta: row.bem_sta || "",
                bem_val: row.bem_val || "",
                tre_cod: row.tre_cod || "",
                bem_dsc_com: row.bem_dsc_com || "",
                uge_cod: row.uge_cod || "",
                uge_nom: row.uge_nom || "",
                org_cod: row.org_cod || "",
                uge_siaf: row.uge_siaf || "",
                org_nom: row.org_nom || "",
                set_cod: row.set_cod || "",
                set_nom: row.set_nom || "",
                loc_cod: row.loc_cod || "",
                loc_nom: row.loc_nom || "",
                ite_mar: row.ite_mar || "",
                ite_mod: row.ite_mod || "",
                tgr_cod: row.tgr_cod || "",
                grp_cod: row.grp_cod || "",
                ele_cod: row.ele_cod || "",
                sbe_cod: row.sbe_cod || "",
                mat_cod: row.mat_cod || "",
                mat_nom: row.mat_nom || "",
                pes_cod: row.pes_cod || "",
                pes_nome: row.pes_nome || ""
              }));
      
              setData(jsonData);
            },
            header: true,
            skipEmptyLines: true,
            delimiter: ",",
            quoteChar: '"',
            encoding: "UTF-8",
          });
        }
      };

      const handleSubmitPatrimonio = async () => {
        try {
            if (data.length == 0) {
                // Caso nenhum arquivo tenha sido selecionado
                toast("Erro: Nenhum arquivo selecionado", {
                  description: "Por favor, selecione um arquivo csv para enviar.",
                  action: {
                    label: "Fechar",
                    onClick: () => console.log("Undo"),
                  },
                });
                return;
              }

          let urlPatrimonioInsert = urlGeral + 'insertPatrimonio';

          const response = await fetch(urlPatrimonioInsert, {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '3600',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(data),
          });

            if (response.ok) {
                toast("Dados enviados com sucesso", {
                  description: "Patrimonios atualizados no banco de dados",
                  action: {
                    label: "Fechar",
                    onClick: () => console.log("Undo"),
                  },
                });
              } else {
                toast("Erro ao enviar os dados ao servidor", {
                  description: "Tente novamente",
                  action: {
                    label: "Fechar",
                    onClick: () => console.log("Undo"),
                  },
                });
              }
        } catch (error) {
            console.error('Erro ao processar a requisição:', error);
          }
    }

    console.log(data)

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6">
                 <DialogTitle className="text-2xl text-center font-medium">
                 Importar arquivo
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500">
                 Adicione as informações básicas do programa de pós-graduação como o nome, classificação e modalidade.
                 </DialogDescription>
               </DialogHeader>

              

               <DialogFooter>
                <Button onClick={() => onClose()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Cancelar</Button>
                <Button  onClick={() => handleSubmitPatrimonio()} >Atualizar dados</Button>

                </DialogFooter>

                <div>
               <label htmlFor="fileInputXls" onChange={handleFileUpload} className="rounded-md bg-blue-700 text-sm font-bold cursor-pointer transition-all gap-3 text-white h-10 w-full flex items-center justify-center hover:bg-blue-800">
    <input onChange={handleFileUpload} id="fileInputXls" type="file" accept=".csv"  hidden />
 
Importar arquivo csv
<FileCsv size={16} className="" />
  </label>
               </div>

               </DialogContent>
               
               </Dialog>
    )
}