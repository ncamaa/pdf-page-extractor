import React, { useState, useRef, useEffect, ChangeEvent } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const SHOW_PAGE_ARRANGEMENT_RADIO = false // To be implemented later. Algorithm for booklet arrangement is not yet complete.

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
  const [printOrder, setPrintOrder] = useState<'normal' | 'booklet'>('normal')
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

  const handlePageNumbersEntered = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target as HTMLTextAreaElement
    if (!value) {
      setPagesToExtract([])
      setAmountOfPagesSelected(0)
      setIsPagesInputError(false)
      return
    }
    let pages: number[] = []
    try {
      const sanitizedValue = value.replace(/[^\d,]/g, '')
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
      if (pages.some((page) => page <= 0)) {
        throw new Error('Page numbers must be positive integers.')
      }
      // if (pages.some((page) => page > originalPdfPagesCount)) {
      //   console.log('Page numbers:', pages)
      // }
      pages = Array.from(new Set(pages))
      setAmountOfPagesSelected(pages.length)
      setIsPagesInputError(false)
    } catch (error) {
      console.error('Error parsing page numbers:', error)
      setIsPagesInputError(true)
      let message = 'Invalid page numbers entered.'
      if ((error as Error).message) message = (error as Error).message

      setPagesInputError(message)
    }
    setPagesToExtract(pages)
  }

  const rearrangePagesForBooklet = (
    pages: number[],
    totalPages: number
  ): number[] => {
    // Ensure the total pages is a multiple of 4 by adding blank pages if necessary
    const paddedTotalPages =
      totalPages % 4 === 0 ? totalPages : totalPages + (4 - (totalPages % 4))
    const bookletPages: number[] = []
    const totalPairs = paddedTotalPages / 4

    for (let i = 0; i < totalPairs; i++) {
      const left = paddedTotalPages - (2 * i + 1)
      const right = 2 * i

      if (left < totalPages) bookletPages.push(left + 1)
      if (right < totalPages) bookletPages.push(right + 1)
      if (right + 1 < totalPages) bookletPages.push(right + 2)
      if (left - 1 < totalPages && left - 1 >= 0) bookletPages.push(left)
    }

    return bookletPages.filter((page) => pages.includes(page))
  }

  const generateExtractedPDF = async () => {
    try {
      if (!pdfDocRef.current || !pagesToExtract.length) {
        setGenerationError('No PDF loaded or no pages selected.')
        setIsGenerationError(true)
        return
      }

      setLoading(true)
      const newPdfDoc = await PDFDocument.create()
      let validPages = pagesToExtract.filter(
        (page) => page <= originalPdfPagesCount && page > 0
      )

      if (printOrder === 'booklet') {
        validPages = rearrangePagesForBooklet(validPages, originalPdfPagesCount)
      }

      const copiedPages = await newPdfDoc.copyPages(
        pdfDocRef.current,
        validPages.map((page) => page - 1)
      )
      copiedPages.forEach((page) => newPdfDoc.addPage(page))

      const pdfBytes = await newPdfDoc.save()
      setExtractedPdfBlob(new Blob([pdfBytes], { type: 'application/pdf' }))
      setLoading(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setIsGenerationError(true)
      setGenerationError('Failed to generate PDF. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (extractedPdfBlob) {
      generateExtractedPDF()
    }
  }, [printOrder])

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
                  {amountOfPagesSelected} page{amountOfPagesSelected > 1 && 's'}{' '}
                  selected for extraction.
                </p>
              ) : null}
              {SHOW_PAGE_ARRANGEMENT_RADIO && (
                <RadioGroup
                  value={printOrder}
                  onValueChange={(value: 'normal' | 'booklet') =>
                    setPrintOrder(value)
                  }
                  className="flex items-center gap-4 mt-4"
                >
                  <Label htmlFor="normal">
                    <RadioGroupItem value="normal" id="normal" /> Normal Order
                  </Label>
                  <Label htmlFor="booklet">
                    <RadioGroupItem value="booklet" id="booklet" /> Booklet
                    Order
                  </Label>
                </RadioGroup>
              )}
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
                Generate PDF
              </Button>
              {isGenerationError ? (
                <p className="text-red-500 flex items-center gap-2 my-2">
                  <XCircle />
                  {generationError}
                </p>
              ) : null}
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
              <StoryAndShare />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
