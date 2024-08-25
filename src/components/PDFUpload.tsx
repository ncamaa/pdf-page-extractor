import React from 'react';
import { Input } from '@/components/ui/input';

interface PDFUploadProps {
    onFileUpload: (file: File) => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onFileUpload }) => {
    return (
        <div>
            <label htmlFor="pdf-upload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Upload your PDF file:</label>
            <Input id="pdf-upload" type="file" accept="application/pdf" onChange={(e) => {
                if (e.target.files?.length) {
                    onFileUpload(e.target.files[0]);
                }
            }} />
        </div>
    );
};

export default PDFUpload;