/**
 * Pagination Component
 * 分页组件
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 5,
}: PaginationProps) {
  // 计算显示的页码范围
  const getPageNumbers = () => {
    const pages: number[] = [];
    const halfRange = Math.floor(maxPageNumbers / 2);
    
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, currentPage + halfRange);
    
    // 调整范围以确保显示足够的页码
    if (end - start + 1 < maxPageNumbers) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxPageNumbers - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxPageNumbers + 1);
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-sm text-gray-600">
        第 {currentPage} 页 / 共 {totalPages} 页
      </div>
      
      <div className="flex items-center gap-1">
        {/* 首页 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="首页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        
        {/* 上一页 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {/* 页码 */}
        {showPageNumbers && (
          <>
            {pageNumbers[0] > 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}
        
        {/* 下一页 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        
        {/* 末页 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="末页"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
