import React, { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Alert } from '../../ui/alert';
import { Calendar } from 'lucide-react';
import { useModal } from '../../hooks/use-modal-store';

import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { format } from "date-fns"

interface CardProps {
  id: string;
  coluna: string;
  emp_nom: string;
  status_tomb: string;
  tipo_emp: string;
  pdf_empenho: string;
  data_fornecedor: string;
  prazo_entrega: string;
  status_recebimento: string;
  loc_entrega: string;
  loc_entrega_confirmado: string;
  cnpj: string;
  loc_nom: string;
  des_nom: string;
  status_tombamento: string;
  data_tombamento: string;
  data_aviso: string;
  prazo_teste: string;
  atestado: string;
  loc_tom: string;
  status_nf: string;
  observacoes: string;
  data_agendamento: string;
  n_termo_processo: string;
  origem: string;
  valor_termo: string;
  n_projeto: string;
  data_tomb_sei: string;
  pdf_nf: string;
  pdf_resumo: string;
  created_at: string;
  columnId: number;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

const Card: React.FC<CardProps> = ({
  id,
  coluna,
  emp_nom,
  status_tomb,
  tipo_emp,
  pdf_empenho,
  data_fornecedor,
  prazo_entrega,
  status_recebimento,
  loc_entrega,
  loc_entrega_confirmado,
  cnpj,
  loc_nom,
  des_nom,
  status_tombamento,
  data_tombamento,
  data_aviso,
  prazo_teste,
  atestado,
  loc_tom,
  status_nf,
  observacoes,
  data_agendamento,
  n_termo_processo,
  origem,
  valor_termo,
  n_projeto,
  data_tomb_sei,
  pdf_nf,
  pdf_resumo,
  created_at,
  columnId,
  index,
  moveCard,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const renderPage = async () => {
      try {
        const base64String = pdf_empenho.startsWith('data:application/pdf;base64,') 
          ? pdf_empenho.split(',')[1] 
          : pdf_empenho;
        const pdfData = atob(base64String);
        
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setImageSrc(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error("Error rendering PDF page:", error);
      }
    };

    renderPage();
  }, [pdf_empenho]);

  const [, drag] = useDrag({
    type: 'CARD',
    item: { id, columnId, index, id,
      coluna,
      emp_nom,
      status_tomb,
      tipo_emp,
      pdf_empenho,
      data_fornecedor,
      prazo_entrega,
      status_recebimento,
      loc_entrega,
      loc_entrega_confirmado,
      cnpj,
      loc_nom,
      des_nom,
      status_tombamento,
      data_tombamento,
      data_aviso,
      prazo_teste,
      atestado,
      loc_tom,
      status_nf,
      observacoes,
      data_agendamento,
      n_termo_processo,
      origem,
      valor_termo,
      n_projeto,
      data_tomb_sei,
      pdf_nf,
      pdf_resumo,
      created_at},
  });

  const [, drop] = useDrop({
    accept: 'CARD',
    hover: (item: any, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset?.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const { onOpen } = useModal();

  return (
    <div ref={ref} className="card cursor-pointer" onClick={() => onOpen('informacoes-empenhos', {
      id,
      coluna,
      emp_nom,
      status_tomb,
      tipo_emp,
      pdf_empenho,
      data_fornecedor,
      prazo_entrega,
      status_recebimento,
      loc_entrega,
      loc_entrega_confirmado,
      cnpj,
      loc_nom,
      des_nom,
      status_tombamento,
      data_tombamento,
      data_aviso,
      prazo_teste,
      atestado,
      loc_tom,
      status_nf,
      observacoes,
      data_agendamento,
      n_termo_processo,
      origem,
      valor_termo,
      n_projeto,
      data_tomb_sei,
      pdf_nf,
      pdf_resumo,
      created_at
    })}>
      <div className='h-24 w-full rounded-t-md bg-cover bg-top bg-no-repeat border border-b-0  border-neutral-200 dark:border-neutral-800' style={{ backgroundImage: `url(${imageSrc})` }}>
        <div className='bg-black/5 w-full h-full rounded-t-md'></div>
      </div>
      
      <Alert className='rounded-t-none'>
        <div className='mb-2'>
          <div className={`rounded-md h-1 w-10 ${coluna.trim() === 'recebidos' ? 'bg-blue-500' : ''} ${coluna.trim() === 'projetos' ? 'bg-pink-500' : ''}`}></div>
        </div>
        <h2 className='font-medium '>{emp_nom}</h2>
        <div className='flex items-center justify-between'>
          <div className='mt-2'>
            {data_fornecedor.trim() != '' && (
              <div className='flex items-center gap-2 text-sm text-gray-500 '>
                <Calendar size={12} /> {format(data_fornecedor, "dd/MM/yyyy")} 
              </div>
            )}
          </div>
          <div className='flex gap-2'></div>
        </div>
      </Alert>
    </div>
  );
};

export default Card;
