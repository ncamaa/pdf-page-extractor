import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PageSelectorProps {
  onPageNumbersEntered: (pages: number[]) => void
}

const PageSelector: React.FC<PageSelectorProps> = ({
  onPageNumbersEntered,
}) => {
  return (
    <div>
      <Label htmlFor="page-selector" className="">
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
