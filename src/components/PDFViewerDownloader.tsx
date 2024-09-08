import React, { useEffect, useState } from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface PDFViewerDownloaderProps {
  pdfBlob: Blob
}

const PDFViewerDownloader: React.FC<PDFViewerDownloaderProps> = ({
  pdfBlob,
}) => {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    // This effect handles the creation and cleanup of the URL object
    let objectUrl: string | null = null

    if (pdfBlob) {
      objectUrl = URL.createObjectURL(pdfBlob)
      setUrl(objectUrl)
    }

    // Cleanup function to revoke the URL when the component unmounts or the blob changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [pdfBlob])

  if (!url) {
    return <div>Loading PDF...</div>
  }

  return (
    <div>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div style={{ height: '500px' }}>
          <Viewer fileUrl={url} />
        </div>
      </Worker>
      <Button
        // on click, download the pdf file
        onClick={() => {
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'extracted_pages.pdf')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
        className="mt-4 flex items-center gap-2"
      >
        <Download />
        Download PDF
      </Button>
    </div>
  )
}

export default PDFViewerDownloader
