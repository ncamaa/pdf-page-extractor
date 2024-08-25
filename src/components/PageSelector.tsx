import React from 'react';
import { Input } from '@/components/ui/input';

interface PageSelectorProps {
    onPageNumbersEntered: (pages: number[]) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ onPageNumbersEntered }) => {
    return (
        <div>
            <label htmlFor="page-selector" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Enter page numbers (comma-separated):</label>
            <Input id="page-selector" type="text" placeholder="e.g., 1,5,7" onChange={(e) => {
                const pages = e.target.value.split(',').map(Number).filter(num => !isNaN(num) && num > 0);
                onPageNumbersEntered(pages);
            }} />
        </div>
    );
};

export default PageSelector;