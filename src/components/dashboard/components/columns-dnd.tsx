import React from 'react';
import { useDrop } from 'react-dnd';
import Card from './card';
import { Alert } from '../../ui/alert';
import { CardTitle } from '../../ui/card';

interface ColumnProps {
  column: {
    id: number;
    title: string;
    items: Empenho[];
  };
  columns: any[];
  setColumns: React.Dispatch<React.SetStateAction<any[]>>;
}

interface Empenho {
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
}

const Column: React.FC<ColumnProps> = ({ column, columns, setColumns }) => {
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...column.items];
    const [movedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, movedItem);

    const updatedColumns = columns.map((col) => {
      if (col.id === column.id) {
        return { ...col, items: newItems };
      }
      return col;
    });

    setColumns(updatedColumns);
  };

  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => {
      const sourceColumn = columns.find((col) => col.id === item.columnId);
      const targetColumn = columns.find((col) => col.id === column.id);

      if (sourceColumn && targetColumn) {
        if (sourceColumn.id === targetColumn.id) return;

        const sourceItems = sourceColumn.items.filter((i: Empenho) => i.id !== item.id);
        const updatedItem = { ...item, coluna: column.title.toLowerCase() }; // Atualiza o campo coluna
        const targetItems = [...targetColumn.items, updatedItem];

        const updatedColumns = columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, items: sourceItems };
          }
          if (col.id === targetColumn.id) {
            return { ...col, items: targetItems };
          }
          return col;
        });

        setColumns(updatedColumns);
      }
    },
  });


  return (
    <Alert ref={drop} className="column h-fit min-w-[310px]">
      <div className='flex items-center mb-4 justify-between'>
        <CardTitle className='text-xl text-medium'>{column.title}</CardTitle>
      </div>
      {column.items.map((item, index) => (
  <Card
    key={index}
    id={item.id}
    coluna={item.coluna}
    emp_nom={item.emp_nom}
    status_tomb={item.status_tomb}
    tipo_emp={item.tipo_emp}
    pdf_empenho={item.pdf_empenho}
    data_fornecedor={item.data_fornecedor}
    prazo_entrega={item.prazo_entrega}
    status_recebimento={item.status_recebimento}
    loc_entrega={item.loc_entrega}
    loc_entrega_confirmado={item.loc_entrega_confirmado}
    cnpj={item.cnpj}
    loc_nom={item.loc_nom}
    des_nom={item.des_nom}
    status_tombamento={item.status_tombamento}
    data_tombamento={item.data_tombamento}
    data_aviso={item.data_aviso}
    prazo_teste={item.prazo_teste}
    atestado={item.atestado}
    loc_tom={item.loc_tom}
    status_nf={item.status_nf}
    observacoes={item.observacoes}
    data_agendamento={item.data_agendamento}
    n_termo_processo={item.n_termo_processo}
    origem={item.origem}
    valor_termo={item.valor_termo}
    n_projeto={item.n_projeto}
    data_tomb_sei={item.data_tomb_sei}
    pdf_nf={item.pdf_nf}
    pdf_resumo={item.pdf_resumo}
    created_at={item.created_at}
    columnId={column.id}
    index={index}
    moveCard={moveCard}
  />
))}
    </Alert>
  );
};

export default Column;
