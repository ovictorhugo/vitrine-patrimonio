import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb } from 'pdf-lib';
import PdfViewer2 from './components/pdf-viewer';



export function AssinarDocumentos(){
    const [pdfBase64, setPdfBase64] = useState('');
    const [signedPdfBase64, setSignedPdfBase64] = useState('');
    const [formData, setFormData] = useState({ name: '', cpf: '', matricula: '' });
    const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
    const [signatureSize, setSignatureSize] = useState(24);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setPdfBase64(reader.result.toString());
            };
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSizeChange = (e) => {
        setSignatureSize(Number(e.target.value));
    };

    const addSignatureToPdf = async () => {
        const pdfDataUri = pdfBase64.split(',')[1]; // Remove the Data URI scheme prefix
        const existingPdfBytes = Uint8Array.from(atob(pdfDataUri), c => c.charCodeAt(0));
        
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const { width, height } = firstPage.getSize();

        const signatureText = `${formData.name} - CPF: ${formData.cpf} - Matrícula: ${formData.matricula}`;

        firstPage.drawText(signatureText, {
            x: signaturePosition.x,
            y: height - signaturePosition.y,
            size: signatureSize,
            color: rgb(0, 0, 1),
        });

        const pdfBytes = await pdfDoc.save();
        const pdfBase64String = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
        setSignedPdfBase64(`data:application/pdf;base64,${pdfBase64String}`);
    };

    const downloadPdf = () => {
        const link = document.createElement('a');
        link.href = signedPdfBase64;
        link.download = 'documento_assinado.pdf';
        link.click();
    };

    return (
        <div>
            <div {...getRootProps()} className="border-dashed p-6 text-center rounded-md text-neutral-400 cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? <p>Solte os arquivos aqui ...</p> : <p>Arraste e solte o arquivo .pdf aqui ou clique para selecionar o arquivo</p>}
            </div>
            <div>
                <input type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleInputChange} />
                <input type="text" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleInputChange} />
                <input type="text" name="matricula" placeholder="Matrícula" value={formData.matricula} onChange={handleInputChange} />
                <input type="number" name="signatureSize" placeholder="Tamanho da Assinatura" value={signatureSize} onChange={handleSizeChange} />
                <button onClick={addSignatureToPdf}>Assinar PDF</button>
                {signedPdfBase64 && <button onClick={downloadPdf}>Baixar PDF</button>}
            </div>
            {pdfBase64 && !signedPdfBase64 && <PdfViewer2 pdfBase64={pdfBase64} />}
            {signedPdfBase64 && <PdfViewer2 pdfBase64={signedPdfBase64} />}
        </div>
    );
};


