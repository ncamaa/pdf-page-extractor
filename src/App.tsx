import React, { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
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
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const pdfDocRef = useRef<PDFDocument | null>(null)

  const handleFileUpload = (file: File) => {
    setOriginalPdf(file)
    setLoading(true)
    setError('')

    const fileReader = new FileReader()
    fileReader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        pdfDocRef.current = pdfDoc // Store reference to loaded PDF
        const numberOfPages = pdfDoc.getPageCount()
        setOriginalPdfPagesCount(numberOfPages)
      } catch (error) {
        console.error('Error loading PDF:', error)
        setError('Failed to load PDF. Please try a different file.')
        setOriginalPdfPagesCount(0)
      } finally {
        setLoading(false)
      }
    }
    fileReader.readAsArrayBuffer(file)
  }

  const handlePageNumbersEntered = (pages: number[]) => {
    setPagesToExtract(pages)
  }

  const generateExtractedPDF = async () => {
    if (!pdfDocRef.current || !pagesToExtract.length) return

    setLoading(true)
    const newPdfDoc = await PDFDocument.create()
    const validPages = pagesToExtract.filter(
      (page) => page <= originalPdfPagesCount && page > 0
    )

    const copiedPages = await newPdfDoc.copyPages(
      pdfDocRef.current,
      validPages.map((page) => page - 1)
    )
    copiedPages.forEach((page) => newPdfDoc.addPage(page))

    const pdfBytes = await newPdfDoc.save()
    setExtractedPdfBlob(new Blob([pdfBytes], { type: 'application/pdf' }))
    setLoading(false)
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
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <CardDescription className="mb-4 mt-2">
                {originalPdfPagesCount
                  ? `This PDF has ${originalPdfPagesCount} pages.`
                  : 'Please upload a PDF to get started.'}
              </CardDescription>
            )}
            <PageSelector
              onPageNumbersEntered={handlePageNumbersEntered}
              disabled={!originalPdfPagesCount}
            />
            <Button
              className="mt-4"
              onClick={generateExtractedPDF}
              disabled={
                !originalPdfPagesCount || !pagesToExtract.length || loading
              }
            >
              {loading && <Loader2 className="animate-spin mr-2" />}
              Generate PDF
            </Button>
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
            <p>Like it? Share it! </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App
