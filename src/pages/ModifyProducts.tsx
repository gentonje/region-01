import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { ModifyProductsPagination } from "@/components/ModifyProductsPagination";
import { ProductFilters } from "@/components/ProductFilters";
import { Product } from "@/types/product";

const ITEMS_PER_PAGE = 15;

const ModifyProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (isMobile) {
      fetchProducts(true);
    } else {
      fetchProducts(false);
    }
  }, [currentPage, isMobile, searchQuery, selectedCategory]);

  const fetchProducts = async (append = false) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      console.log("Fetching products for user:", user.id);

      let query = supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            storage_path,
            is_main,
            display_order,
            product_id,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // First get the count
      const { count: totalCount } = await supabase
        .from("products")
        .select('*', { count: 'exact', head: true })
        .eq("user_id", user.id);

      const total = totalCount || 0;
      console.log("Total products found:", total);

      const calculatedTotalPages = Math.ceil(total / ITEMS_PER_PAGE);
      
      if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(calculatedTotalPages);
        return;
      }

      setTotalPages(calculatedTotalPages);

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      if (start <= end) {
        const { data, error } = await query.range(start, end);

        if (error) {
          console.error("Error fetching products:", error);
          throw error;
        }

        console.log("Fetched products:", data);

        if (append && data) {
          setProducts(prev => [...prev, ...data as Product[]]);
          setHasMore((currentPage * ITEMS_PER_PAGE) < total);
        } else if (data) {
          setProducts(data as Product[]);
        }
      } else {
        setProducts([]);
        setHasMore(false);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
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
      // First delete associated images from storage
      const { data: productImages } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('product_id', productId);

      if (productImages) {
        const imagePaths = productImages.map(img => img.storage_path);
        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('images')
            .remove(imagePaths);

          if (storageError) {
            console.error("Error deleting images from storage:", storageError);
          }
        }
      }

      // Then delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      if (isMobile) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        fetchProducts(false);
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
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
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Modify Products</h1>
          
          <ProductFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <ModifyProductsList
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={() => setCurrentPage(prev => prev + 1)}
            onDelete={handleDelete}
            isMobile={isMobile}
          />

          <ModifyProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isMobile={isMobile}
          />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModifyProducts;