import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileDigit } from 'lucide-react'

interface PageSelectorProps {
  onPageNumbersEntered: (pages: number[]) => void
}

const PageSelector: React.FC<PageSelectorProps> = ({
  onPageNumbersEntered,
}) => {
  return (
    <div>
      <Label htmlFor="page-selector" className="flex items-center gap-2 mb-2">
        <FileDigit />
        Enter page numbers (comma-separated):
      </Label>

      <Input
        id="page-selector"
        type="text"
        placeholder="e.g., 1,5,7"
        onChange={(e) => {
          const pages = e.target.value
            .split(',')
            .map(Number)
            .filter((num) => !isNaN(num) && num > 0)
          onPageNumbersEntered(pages)
        }}
      />
    </div>
  )
}

export default PageSelector
