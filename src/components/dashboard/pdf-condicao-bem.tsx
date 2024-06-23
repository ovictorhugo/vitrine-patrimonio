import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { FilePdf } from "phosphor-react";
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

interface Patrimonio {
  bem_cod: string;
  bem_dgv: string;
  bem_num_atm: string;
  csv_cod: string;
  bem_serie: string;
  bem_sta: string;
  bem_val: string;
  tre_cod: string;
  bem_dsc_com: string;
  uge_cod: string;
  uge_nom: string;
  org_cod: string;
  uge_siaf: string;
  org_nom: string;
  set_cod: string;
  set_nom: string;
  loc_cod: string;
  loc_nom: string;
  ite_mar: string;
  ite_mod: string;
  tgr_cod: string;
  grp_cod: string;
  ele_cod: string;
  sbe_cod: string;
  mat_cod: string;
  mat_nom: string;
  pes_cod: string;
  pes_nome: string;
  toggleGroupValue?: string;
}

interface TotalPatrimonios {
  total_patrimonio: string;
  total_patrimonio_morto: string;
  unique_values: unique_values;
}

interface unique_values {
  loc_cod: string;
  loc_nom: string;
  org_nom: string;
  org_cod: string;
  pes_cod: string;
  pes_nome: string;
  set_cod: string;
  set_nom: string;
}

const DownloadButton = () => {
  const { urlGeral } = useContext(UserContext);
  const query = useQuery();
  const sala = query.get('sala');

  const [total, setTotal] = useState<TotalPatrimonios[]>([]);
  const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([]);

  const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=${sala != null || sala !== "" || sala !== undefined ? sala : ''}`;
  const urlPatrimonio = `${urlGeral}allPatrimonio?loc_nom=${sala !== null ? sala : ''}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlPatrimonioInsert, {
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
          setTotal(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlPatrimonioInsert]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlPatrimonio, {
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
          setPatrimonio(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlPatrimonio]);

  const isValidCsvCod = (value: any) => ["OC", "QB", "NE", "SP"].includes(value);

  const data = patrimonio.map((item) => ({
    bem_cod: item.bem_cod,
    bem_dgv: item.bem_dgv,
    bem_num_atm: item.bem_num_atm,
    bem_dsc_com: item.bem_dsc_com,
    tre_cod: item.tre_cod,
    bem_val: item.bem_val,
    csv_cod: isValidCsvCod(item.csv_cod.trim()) ? item.csv_cod.trim() : item.toggleGroupValue,
  }));

  const now: Date = new Date();
  const formattedDate: string = format(now, 'dd/MM/yyyy');
  const formattedTime: string = format(now, 'HH:mm:ss');

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const headerContent = `
      <div style="display: flex; width: 100%; justify-content: space-between; align-items: center; border-bottom: 1px solid black; padding-bottom: 10px; margin-bottom: 10px;">
        <div style="flex: 1; text-align: center;">
          <img src="logo.png" style="height: 50px;" />
        </div>
        <div style="flex: 4; text-align: center;">
          <p style="font-size: 10px; font-weight: bold; margin: 0;">UNIVERSIDADE FEDERAL DE MINAS GERAIS</p>
          <p style="font-size: 10px; font-weight: bold; margin: 0;">SICTPAT - Sistema de Controle Patrimonial</p>
          <p style="font-size: 10px; font-weight: bold; margin: 0;">153280 - ESCOLA DE ENGENHARIA</p>
          <p style="font-size: 10px; font-weight: bold; margin: 0;">Relação de Bens para Inventário do Exercício de </p>
        </div>
        <div style="flex: 1; text-align: center;">
          <p style="font-size: 8px; margin: 0;">${formattedDate}</p>
          <p style="font-size: 8px; margin: 0;">${formattedTime}</p>
        </div>
      </div>
    `;

    doc.html(headerContent, {
      callback: (doc) => {
        autoTable(doc, {
          head: [['N° Patrim.', 'Número ATM', 'Descrição do Item', 'TR', 'Conservação', 'Valor bem', 'OC', 'QB', 'NE', 'SP']],
          body: patrimonio.map((props) => [
            `${props.bem_cod}-${props.bem_dgv}`,
            props.bem_num_atm,
            props.bem_dsc_com,
            props.tre_cod,
            getConditionLabel(props.csv_cod),
            props.bem_val.trim() === '' ? '0.00' : parseFloat(props.bem_val).toFixed(2),
            props.csv_cod.trim() === 'OC' ? 'X' : '',
            props.csv_cod.trim() === 'QB' ? 'X' : '',
            props.csv_cod.trim() === 'NE' ? 'X' : '',
            props.csv_cod.trim() === 'SP' ? 'X' : '',
          ]),
          startY: 120, // Adjust startY based on your header height
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
          bodyStyles: { minCellHeight: 10 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          theme: 'grid',
          showHead: 'firstPage',
          margin: { top: 100 }, // Adjust top margin accordingly
        });
        doc.save('relatorio.pdf');
      },
      x: 10,
      y: 10
    });
  };

  const getConditionLabel = (conditionCode: any) => {
    switch (conditionCode.trim()) {
      case 'BM': return 'Bom';
      case 'AE': return 'Anti-Econômico';
      case 'IR': return 'Irrecuperável';
      case 'OC': return 'Ocioso';
      case 'BX': return 'Baixado';
      case 'RE': return 'Recuperável';
      default: return '';
    }
  };

  return (
    <Button size="sm" variant="ghost" className="ml-auto gap-1" onClick={handleDownloadPdf}>
      <FilePdf className="h-4 w-4" />
      Baixar arquivo .pdf
    </Button>
  );
};

export default DownloadButton;
