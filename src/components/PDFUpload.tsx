import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PDFUploadProps {
  onFileUpload: (file: File) => void
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onFileUpload }) => {
  return (
    <div className="mb-4">
      <Label htmlFor="pdf-upload" className="">
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
