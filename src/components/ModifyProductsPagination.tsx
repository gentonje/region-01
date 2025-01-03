import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

interface ModifyProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile: boolean;
}

export const ModifyProductsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isMobile,
}: ModifyProductsPaginationProps) => {
  if (isMobile) return null;

  return (
    <div className="mt-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};