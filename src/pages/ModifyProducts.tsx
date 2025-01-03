import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { ProductModifyCard } from "@/components/ProductModifyCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 15;

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-24" />
      <div className="space-x-2">
        <Skeleton className="h-8 w-8 inline-block" />
        <Skeleton className="h-8 w-8 inline-block" />
      </div>
    </div>
  </div>
);

const ModifyProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const isMobile = useIsMobile();
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (isMobile && inView && hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [inView, hasMore, isMobile, isLoading]);

  useEffect(() => {
    if (isMobile) {
      fetchProducts(true);
    } else {
      fetchProducts(false);
    }
  }, [currentPage, isMobile]);

  const fetchProducts = async (append = false) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { count: totalCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      const total = totalCount || 0;
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (append) {
        setProducts(prev => [...prev, ...(data || [])]);
        setHasMore((currentPage * ITEMS_PER_PAGE) < total);
      } else {
        setProducts(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      // Refresh the current page
      if (isMobile) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        fetchProducts(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(3).fill(null).map((_, index) => (
        <ProductSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Modify Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductModifyCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {isLoading && renderSkeletons()}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found</p>
          </div>
        )}

        {isMobile ? (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {hasMore && <div className="loading">Loading more...</div>}
          </div>
        ) : (
          !isLoading && products.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
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
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModifyProducts;