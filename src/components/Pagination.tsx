import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 0) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            onPageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        if (totalPages <= maxPagesToShow) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            let startPage = Math.max(0, currentPage - 2);
            let endPage = Math.min(totalPages - 1, currentPage + 2);
            if (currentPage < 3) {
                endPage = maxPagesToShow - 1;
            }
            if (currentPage > totalPages - 4) {
                startPage = totalPages - maxPagesToShow;
            }
            if (startPage > 0) {
                pages.push(0, -1);
            }
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            if (endPage < totalPages - 1) {
                pages.push(-1, totalPages - 1);
            }
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    // --- MISE À JOUR DU STYLE ---
    const baseClasses = "relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors";
    const ringClasses = "ring-1 ring-inset ring-stone-300";

    return (
        <nav className="mt-12 flex items-center justify-center" aria-label="Pagination">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-stone-400 ${ringClasses} hover:bg-stone-100 focus:z-20 disabled:opacity-50`}
            >
                <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {pageNumbers.map((page, index) =>
                page === -1 ? (
                    <span key={`ellipsis-${index}`} className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-stone-700 ${ringClasses}`}>
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`${baseClasses} 
                            ${currentPage === page
                            ? 'z-10 bg-orange-600 text-white focus-visible:outline-orange-600'
                            : `text-stone-900 ${ringClasses} hover:bg-orange-50`
                        }`}
                    >
                        {page + 1}
                    </button>
                )
            )}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-stone-400 ${ringClasses} hover:bg-stone-100 focus:z-20 disabled:opacity-50`}
            >
                <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
        </nav>
        // --- FIN MISE À JOUR ---
    );
}
