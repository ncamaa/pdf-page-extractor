import React, { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Button } from '@/components/ui/button'
import {
  BrainCog,
  FileText,
  Loader2,
  CheckCircleIcon,
  XCircle,
} from 'lucide-react'
import PDFUpload from '@/components/PDFUpload'
import PageSelector from '@/components/PageSelector'
import PDFViewerDownloader from '@/components/PDFViewerDownloader'
import StoryAndShare from '@/components/StoryAndShare'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const App: React.FC = () => {
  const [pagesToExtract, setPagesToExtract] = useState<number[]>([])
  const [extractedPdfBlob, setExtractedPdfBlob] = useState<Blob | null>(null)
  const [originalPdfPagesCount, setOriginalPdfPagesCount] = useState<number>(0)
  const [amountOfPagesSelected, setAmountOfPagesSelected] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('Unknown error')
  const [isError, setIsError] = useState<boolean>(false)
  const [generationError, setGenerationError] =
    useState<string>('Unknown error')
  const [isGenerationError, setIsGenerationError] = useState<boolean>(false)
  const [pagesInputError, setPagesInputError] = useState<string>('')
  const [isPagesInputError, setIsPagesInputError] = useState<boolean>(false)
  const pdfDocRef = useRef<PDFDocument | null>(null)

  const handleFileUpload = (file: File) => {
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
        setIsError(true)
        setError('Failed to load PDF. Please try a different file.')
        setOriginalPdfPagesCount(0)
      } finally {
        setLoading(false)
      }
    }
    fileReader.readAsArrayBuffer(file)
  }

  const handlePageNumbersEntered = (e: InputEvent) => {
    const { value } = e.target as HTMLInputElement
    if (!value) {
      setPagesToExtract([])
      setAmountOfPagesSelected(0)
      setIsPagesInputError(false)
      return
    }
    let pages: number[] = []
    try {
      // remove spaces and all non-digit characters besides commas
      const sanitizedValue = value.replace(/[^\d,]/g, '')
      // split by commas and convert to numbers
      pages = sanitizedValue
        .split(',')
        .map((page) => parseInt(page, 10))
        .filter((page) => !isNaN(page))

      if (pages.length === 0) {
        throw new Error(
          'No valid page numbers entered, you must enter at least one.'
        )
      }
      if (pages.length > originalPdfPagesCount) {
        throw new Error(
          'You cannot extract more pages than the original PDF has.'
        )
      }
      // ensure that none of the numbers are negative
      if (pages.some((page) => page <= 0)) {
        throw new Error('Page numbers must be positive integers.')
      }
      // ensure that none of the numbers is greater than the total number of pages
      if (pages.some((page) => page > originalPdfPagesCount)) {
        throw new Error(
          'Page numbers must not exceed the total number of pages in the PDF.'
        )
      }
      // array unique
      pages = Array.from(new Set(pages))
      console.log(pages)
      setAmountOfPagesSelected(pages.length)
      setIsPagesInputError(false)
    } catch (error) {
      console.error('Error parsing page numbers:', error)
      setIsPagesInputError(true)
      setPagesInputError('Invalid page numbers entered.')
    }
    setPagesToExtract(pages)
  }

  const generateExtractedPDF = async () => {
    try {
      console.log({ pdfDocRef, pagesToExtract })
      if (!pdfDocRef.current || !pagesToExtract.length) {
        console.log({ pdfDocRef, pagesToExtract })
        setGenerationError('No PDF loaded or no pages selected.')
        setIsGenerationError(true)
        return
      }

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
    } catch (error) {
      console.error('Error generating PDF 123:', error)
      setIsGenerationError(true)
      setGenerationError('Failed to generate PDF. Please try again.')
      console.log(generationError)
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <div className="p-2">
        <div className="mx-auto py-6 max-w-full" style={{ width: '1200px' }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCog />
                PDF Page Extractor
              </CardTitle>
              <CardDescription className="flex item-center gap-2">
                Upload a PDF to extract specific pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFUpload onFileUpload={handleFileUpload} />
              {loading ? (
                <Loader2 className="animate-spin my-4" />
              ) : isError ? (
                <p className="text-red-500 flex items-center gap-2 my-4">
                  <XCircle />
                  {error}
                </p>
              ) : (
                <CardDescription className="mb-6 mt-2 flex items-center gap-2">
                  {originalPdfPagesCount ? (
                    <div className="text-green-500 flex gap-2 items-center">
                      <CheckCircleIcon />
                      PDF loaded successfully. This PDF has{' '}
                      {originalPdfPagesCount} pages.
                    </div>
                  ) : (
                    <div>Please upload a PDF to get started.</div>
                  )}
                </CardDescription>
              )}
              <PageSelector
                onPageNumbersEntered={handlePageNumbersEntered}
                disabled={!originalPdfPagesCount}
              />
              {isPagesInputError ? (
                <p className="text-red-500 flex items-center gap-2 my-2">
                  <XCircle />
                  {pagesInputError}
                </p>
              ) : amountOfPagesSelected ? (
                <p className="text-green-500 flex items-center gap-2 my-2">
                  <CheckCircleIcon />
                  {amountOfPagesSelected} page(s) selected for extraction.
                </p>
              ) : null}
              <Button
                className="mt-6"
                onClick={generateExtractedPDF}
                disabled={
                  !originalPdfPagesCount || !pagesToExtract.length || loading
                }
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <FileText className="mr-2" />
                )}
                Generate PDF 1
              </Button>
              {isGenerationError ? (
                <p className="text-red-500 flex items-center gap-2 my-2">
                  <XCircle />
                  ?!@?!@#
                  {generationError}
                </p>
              ) : null}
            </CardContent>
            {extractedPdfBlob && (
              <div>
                <CardHeader>
                  <CardTitle>Extracted PDF Preview {page}</CardTitle>
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
              <StoryAndShare />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
