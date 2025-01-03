import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ProductCard } from "@/components/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get total count
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      // Fetch products with their main images
      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images!inner (
            storage_path,
            is_main
          )
        `)
        .eq('product_images.is_main', true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
        return;
      }

      // Map the products to include the main image storage path
      const productsWithMainImage = productsData?.map(product => ({
        ...product,
        storage_path: product.product_images[0]?.storage_path || 'placeholder.svg'
      })) || [];

      setProducts(productsWithMainImage);
    } catch (error: any) {
      console.error("Error in fetchProducts:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      // First, delete all reviews associated with the product
      const { error: reviewsError } = await supabase
        .from("reviews")
        .delete()
        .eq("product_id", productId);

      if (reviewsError) {
        console.error("Error deleting reviews:", reviewsError);
        throw reviewsError;
      }

      // Then delete all product images
      const { error: imagesError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      if (imagesError) {
        console.error("Error deleting product images:", imagesError);
        throw imagesError;
      }

      // Finally delete the product
      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (productError) {
        console.error("Error deleting product:", productError);
        throw productError;
      }

      toast({
        title: "Success",
        description: "Product and associated data deleted successfully",
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error("Error in handleDelete:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="flex items-center gap-4">
            <CurrencySelector />
            <Button onClick={() => navigate("/add-product")}>Add Product</Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
            <Button className="mt-4" onClick={() => navigate("/add-product")}>
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this product? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {currentPage === 1 ? (
                    <span className="pointer-events-none opacity-50">
                      <PaginationPrevious />
                    </span>
                  ) : (
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    />
                  )}
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
                  {currentPage === totalPages ? (
                    <span className="pointer-events-none opacity-50">
                      <PaginationNext />
                    </span>
                  ) : (
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
