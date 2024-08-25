import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

interface PDFUploadProps {
  onFileUpload: (file: File) => void
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onFileUpload }) => {
  return (
    <div className="max-w-[400px]">
      <Label htmlFor="pdf-upload" className="flex items-center gap-2 mb-2">
        <Upload size={20} />
        Upload your PDF file:
      </Label>
      <Input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files?.length) {
            onFileUpload(e.target.files[0])
          }
        }}
      />
    </div>
  )
}

export default PDFUpload
