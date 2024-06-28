import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button } from '../../ui/button';
import { Download } from 'lucide-react';

interface PdfViewerProps {
  pdfBase64: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfBase64 }) => {
  const pdfData = pdfBase64.startsWith('data:application/pdf;base64,') ? pdfBase64 : `data:application/pdf;base64,${pdfBase64}`;

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = 'documento.pdf';
    link.click();
  };

  return (
    <div>
      <div className='mb-6 flex justify-end gap-3'>
      <Button variant={'ghost'}><Download size={16}/>Download PDF</Button>
      <Button onClick={downloadPdf}><Download size={16}/>Download PDF</Button>
      </div>
      <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`}>
        <div >
          <Viewer fileUrl={pdfData} />
        </div>
      </Worker>
    </div>
  );
};

export default PdfViewer;
