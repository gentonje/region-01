import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "@/components/ProductGrid";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function Products() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data: products, error, count } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .range(start, end);

      if (error) throw error;
      return { products, count };
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.products) return <div>No products found</div>;

  const totalPages = Math.ceil((data.count || 0) / ITEMS_PER_PAGE);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid products={data.products} />
      
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!canGoPrevious}
                className={!canGoPrevious ? "opacity-50 cursor-not-allowed" : ""}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={!canGoNext}
                className={!canGoNext ? "opacity-50 cursor-not-allowed" : ""}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}