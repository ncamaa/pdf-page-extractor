import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PDFUpload from '@/components/PDFUpload'
import PageSelector from '@/components/PageSelector'
import PDFViewerDownloader from '@/components/PDFViewerDownloader'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const App: React.FC = () => {
  const [originalPdf, setOriginalPdf] = useState<File | null>(null)
  const [pagesToExtract, setPagesToExtract] = useState<number[]>([])
  const [extractedPdfBlob, setExtractedPdfBlob] = useState<Blob | null>(null)
  const [originalPdfPagesCount, setOriginalPdfPagesCount] = useState<number>(0)

  const handleFileUpload = (file: File) => {
    setOriginalPdf(file)

    const fileReader = new FileReader()
    fileReader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const numberOfPages = pdfDoc.getPageCount()
        setOriginalPdfPagesCount(numberOfPages) // Set the number of pages in state
      } catch (error) {
        console.error('Error loading PDF:', error)
        setOriginalPdfPagesCount(0) // Reset the page count on error
      }
    }
    fileReader.readAsArrayBuffer(file)
  }

  const handlePageNumbersEntered = (pages: number[]) => {
    setPagesToExtract(pages)
  }

  const generateExtractedPDF = async () => {
    if (!originalPdf) return

    const fileReader = new FileReader()
    fileReader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const newPdfDoc = await PDFDocument.create()

      // Ensure page numbers are within the document range
      const maxPages = pdfDoc.getPageCount()
      const validPages = pagesToExtract.filter(
        (page) => page <= maxPages && page > 0
      )

      // Copy pages to a new document
      const copiedPages = await newPdfDoc.copyPages(
        pdfDoc,
        validPages.map((page) => page - 1)
      )
      copiedPages.forEach((page) => newPdfDoc.addPage(page))

      const pdfBytes = await newPdfDoc.save()
      setExtractedPdfBlob(new Blob([pdfBytes], { type: 'application/pdf' }))
    }
    fileReader.readAsArrayBuffer(originalPdf)
  }

  return (
    <div className="App">
      <div className="mx-auto py-6 max-w-full" style={{ width: '1200px' }}>
        <Card>
          <CardHeader>
            <CardTitle>PDF Page Extractor</CardTitle>
            <CardDescription>
              Upload a PDF to extract specific pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PDFUpload onFileUpload={handleFileUpload} />
            <CardDescription>
              {originalPdfPagesCount
                ? `This PDF has ${originalPdfPagesCount} pages.`
                : 'Please upload a PDF to get started.'}
            </CardDescription>
            <PageSelector onPageNumbersEntered={handlePageNumbersEntered} />
            <Button onClick={generateExtractedPDF}>Generate PDF</Button>
          </CardContent>
          {extractedPdfBlob && (
            <div>
              <CardHeader>
                <CardTitle>Extracted PDF Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PDFViewerDownloader pdfBlob={extractedPdfBlob} />
              </CardContent>
              <CardFooter>
                <p>
                  Download your extracted PDF or use the preview window to
                  review it before saving.
                </p>
              </CardFooter>
            </div>
          )}
          <CardFooter>
            <p>
              Ensure your PDFs are exactly as needed with our extraction tool.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App
