import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
import { Navigation, BottomNavigation } from "@/components/Navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

const DeleteProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Get total count of user's products
      const { count: totalCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      const total = totalCount || 0;
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

      // Fetch paginated products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setProducts(data || []);
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
      
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
        
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${product.price}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
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
              </div>
            ))}
          </div>
        )}

        {!isLoading && products.length > 0 && (
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
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DeleteProducts;