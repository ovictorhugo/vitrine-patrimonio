import React from 'react';
import { useDrop } from 'react-dnd';
import Card from './card';
import { Alert } from '../../ui/alert';
import { CardTitle } from '../../ui/card';

interface ColumnProps {
  column: {
    id: number;
    title: string;
    items: string[];
  };
  columns: any[];
  setColumns: React.Dispatch<React.SetStateAction<any[]>>;
}

const Column: React.FC<ColumnProps> = ({ column, columns, setColumns }) => {
    const moveCard = (dragIndex: number, hoverIndex: number) => {
        const newItems = [...column.items];
        const [movedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, movedItem);
    
        const updatedColumns = columns.map(col => {
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
          const sourceColumn = columns.find(col => col.id === item.columnId);
          const targetColumn = columns.find(col => col.id === column.id);
    
          if (sourceColumn && targetColumn) {
            if (sourceColumn.id === targetColumn.id) return;
    
            const sourceItems = sourceColumn.items.filter((i: string) => i !== item.text);
            const targetItems = [...targetColumn.items, item.text];
    
            const updatedColumns = columns.map(col => {
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
      <div className='flex items-center justify-between'>
      <CardTitle className='text-xl text-medium'>{column.title}</CardTitle>

      </div>
      {column.items.map((item, index) => (
        <Card key={index} text={item} columnId={column.id} index={index} moveCard={moveCard} />
      ))}
    </Alert>
  );
};

export default Column;