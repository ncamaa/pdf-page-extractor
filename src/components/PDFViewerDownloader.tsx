import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PDFViewerDownloaderProps {
    pdfBlob: Blob;
}

const PDFViewerDownloader: React.FC<PDFViewerDownloaderProps> = ({ pdfBlob }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (pdfBlob) {
            const newUrl = URL.createObjectURL(pdfBlob);
            setUrl(newUrl);
            return () => {
                URL.revokeObjectURL(newUrl); // Clean up the object URL on unmount
            };
        }
    }, [pdfBlob]);

    if (!url) {
        return <div>Loading PDF...</div>;
    }

    return (
        <div>
            <iframe src={url} style={{ width: '100%', height: '500px', border: 'none' }} title="PDF Preview"></iframe>
            <Button as="a" href={url} download="extracted_pages.pdf" style={{ marginTop: '10px' }}>
                Download PDF
            </Button>
            {url && (
                <div>
                    <p>Can't view the PDF? <a href={url} download="extracted_pages.pdf">Click here to download.</a></p>
                </div>
            )}
        </div>
    );
};

export default PDFViewerDownloader;