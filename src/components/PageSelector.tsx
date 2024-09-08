import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileDigit } from 'lucide-react'

interface PageSelectorProps {
  onPageNumbersEntered: (pages: number[]) => void
  disabled?: boolean
}

const PageSelector: React.FC<PageSelectorProps> = ({
  onPageNumbersEntered,
  disabled,
}) => {
  return (
    <div>
      <Label htmlFor="page-selector" className="flex items-center gap-2 mb-2">
        <FileDigit />
        Enter page numbers (comma-separated):
      </Label>
      <small className="text-muted-foreground">
        Separate page numbers with commas. For example: "1, 5, 7". Only positive
        numbers. Only digits and commas. All other characters will be ignored.
      </small>
      <Textarea
        id="page-selector"
        type="text"
        placeholder="e.g., 1, 5, 7"
        disabled={disabled}
        onChange={(e) => {
          onPageNumbersEntered(e)
        }}
      />
    </div>
  )
}

export default PageSelector
