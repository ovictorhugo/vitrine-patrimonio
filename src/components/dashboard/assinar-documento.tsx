import React, { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Draggable from 'react-draggable';
import { PDFDocument, rgb } from 'pdf-lib';
import PdfViewer from './components/PdfViewer'; // Certifique-se de que o caminho está correto

export function AssinarDocumentos() {
    const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });
    const [pdfBase64, setPdfBase64] = useState('');
    const [formData, setFormData] = useState({ name: '', cpf: '', matricula: '' });
    const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
    const [signatureSize, setSignatureSize] = useState(24);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setPdfBase64(reader.result.toString());
                setFileInfo({
                    name: file.name,
                    size: file.size,
                });
            };
        }
    };

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
        setPdfBase64(`data:application/pdf;base64,${pdfBase64String}`);
    };

    const downloadPdf = () => {
        const link = document.createElement('a');
        link.href = pdfBase64;
        link.download = 'documento_assinado.pdf';
        link.click();
    };

    const handleDragStop = (e, data) => {
        setSignaturePosition({ x: data.x, y: data.y });
    };

    const memoizedPdfBase64 = useMemo(() => pdfBase64, [pdfBase64]);

    return (
        <>
            <main className="flex flex-1 flex-col gap-4 md:gap-8 w-full">
                <main className="grid flex-1 w-full gap-4 overflow-auto md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 h-full">
                        <fieldset className="grid gap-6 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium">Configurações</legend>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nome"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="border rounded p-2"
                            />
                            <input
                                type="text"
                                name="cpf"
                                placeholder="CPF"
                                value={formData.cpf}
                                onChange={handleInputChange}
                                className="border rounded p-2"
                            />
                            <input
                                type="text"
                                name="matricula"
                                placeholder="Matrícula"
                                value={formData.matricula}
                                onChange={handleInputChange}
                                className="border rounded p-2"
                            />
                            <input
                                type="number"
                                name="signatureSize"
                                placeholder="Tamanho da Assinatura"
                                value={signatureSize}
                                onChange={handleSizeChange}
                                className="border rounded p-2"
                            />
                            <button onClick={addSignatureToPdf} className="p-2 bg-blue-500 text-white rounded">Assinar PDF</button>
                            <button onClick={downloadPdf} className="p-2 bg-green-500 text-white rounded">Baixar PDF</button>
                        </fieldset>

                        <fieldset className="grid gap-6 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium">Documentos</legend>
                            <div {...getRootProps()} className="border-dashed flex-col p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 mt-4">
                                <input {...getInputProps()} />
                                <div className="p-4 border rounded-md">
                                    <Upload size={24} className="whitespace-nowrap" />
                                </div>
                                {isDragActive ? (
                                    <p>Solte os arquivos aqui ...</p>
                                ) : (
                                    <p>Arraste e solte o arquivo .pdf aqui ou clique para selecionar o arquivo</p>
                                )}
                            </div>
                        </fieldset>
                    </div>

                    <fieldset className="grid gap-6 rounded-lg border p-4 lg:col-span-2">
                        <legend className="-ml-1 px-1 text-sm font-medium">Visualização PDF</legend>
                        {memoizedPdfBase64 && (
                            <div className="relative">
                                <PdfViewer pdfBase64={memoizedPdfBase64} />
                                <Draggable
                                    onStop={handleDragStop}
                                    defaultPosition={signaturePosition}
                                >
                                    <div className="absolute cursor-pointer p-2 bg-blue-500 text-white rounded">
                                        {`${formData.name} - CPF: ${formData.cpf} - Matrícula: ${formData.matricula}`}
                                    </div>
                                </Draggable>
                            </div>
                        )}
                    </fieldset>
                </main>
            </main>
        </>
    );
}
