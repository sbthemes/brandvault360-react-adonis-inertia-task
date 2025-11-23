import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    lastPage: number
    onPageChange: (page: number) => void
    showPageInfo?: boolean
    className?: string
}

export default function Pagination({
    currentPage,
    lastPage,
    onPageChange,
    showPageInfo = true,
    className = '',
}: PaginationProps) {
    if (lastPage <= 1) {
        return null
    }

    const renderPageButtons = () => {
        const pageButtons: React.ReactNode[] = []

        const ButtonPage = (page: number) => (
            <button
                key={page}
                type="button"
                className={`grid h-9 w-9 place-content-center rounded-md text-sm transition duration-300 ${
                    currentPage === page
                        ? 'bg-indigo-600 font-bold text-white shadow'
                        : 'hover:bg-gray-100 border border-gray-300 bg-white text-gray-800'
                }`}
                onClick={() => onPageChange(page)}
            >
                {page}
            </button>
        )

        if (lastPage <= 5) {
            for (let i = 1; i <= lastPage; i++) {
                pageButtons.push(ButtonPage(i))
            }
        } else {
            const startPage =
                currentPage <= 3 ? 1 : currentPage >= lastPage - 2 ? lastPage - 4 : currentPage - 2

            for (let i = startPage; i <= startPage + 4; i++) {
                pageButtons.push(ButtonPage(i))
            }

            if (startPage > 1) {
                pageButtons.unshift(
                    <span key="start-ellipsis" className="px-2 text-gray-500">
                        ...
                    </span>
                )
            }

            if (startPage + 4 < lastPage) {
                pageButtons.push(
                    <span key="end-ellipsis" className="px-2 text-gray-500">
                        ...
                    </span>
                )
            }
        }

        return pageButtons
    }

    return (
        <div className={`flex items-center justify-between mt-4 pt-4 border-t ${className}`}>
            {showPageInfo && (
                <div className="text-sm text-gray-600">
                    Page {currentPage} of {lastPage}
                </div>
            )}
            <div className={`flex items-center gap-2 ${!showPageInfo ? 'ml-auto' : ''}`}>
                <button
                    type="button"
                    className={`grid h-9 w-9 place-content-center rounded-md border border-gray-300 text-gray-700 transition duration-300 hover:bg-gray-100 ${
                        currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                {renderPageButtons()}
                <button
                    type="button"
                    className={`grid h-9 w-9 place-content-center rounded-md border border-gray-300 text-gray-700 transition duration-300 hover:bg-gray-100 ${
                        currentPage === lastPage ? 'pointer-events-none opacity-50' : ''
                    }`}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    aria-label="next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
