import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PDFUpload from '@/components/PDFUpload';
import PageSelector from '@/components/PageSelector';
import PDFViewerDownloader from '@/components/PDFViewerDownloader';

const App: React.FC = () => {
    const [originalPdf, setOriginalPdf] = useState<File | null>(null);
    const [pagesToExtract, setPagesToExtract] = useState<number[]>([]);
    const [extractedPdfBlob, setExtractedPdfBlob] = useState<Blob | null>(null);

    const handleFileUpload = (file: File) => {
        setOriginalPdf(file);
    };

    const handlePageNumbersEntered = (pages: number[]) => {
        setPagesToExtract(pages);
    };

    const generateExtractedPDF = async () => {
        if (!originalPdf) return;

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const newPdfDoc = await PDFDocument.create();

            // Ensure page numbers are within the document range
            const maxPages = pdfDoc.getPageCount();
            const validPages = pagesToExtract.filter(page => page <= maxPages && page > 0);

            // Copy pages to a new document
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, validPages.map(page => page - 1));
            copiedPages.forEach(page => newPdfDoc.addPage(page));

            const pdfBytes = await newPdfDoc.save();
            setExtractedPdfBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
        };
        fileReader.readAsArrayBuffer(originalPdf);
    };

    return (
        <div className="App">
            <h1>PDF Page Extractor</h1>
            <PDFUpload onFileUpload={handleFileUpload} />
            <PageSelector onPageNumbersEntered={handlePageNumbersEntered} />
            <Button onClick={generateExtractedPDF}>Generate PDF</Button>
            {extractedPdfBlob && <PDFViewerDownloader pdfBlob={extractedPdfBlob} />}
        </div>
    );
};

export default App;