import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { UserProductGroup } from "@/components/UserProductGroup";

interface GroupedProducts {
  [key: string]: {
    username: string;
    products: Product[];
  };
}

const ModifyProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [usernameSearch, setUsernameSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
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
          ),
          profiles (
            username,
            full_name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data as Product[]);
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
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Group products by user
  const groupedProducts = products.reduce((acc: GroupedProducts, product) => {
    const userId = product.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        username: product.profiles?.username || product.profiles?.full_name || 'Unknown User',
        products: []
      };
    }
    acc[userId].products.push(product);
    return acc;
  }, {});

  // Filter groups based on username search
  const filteredGroups = Object.entries(groupedProducts).filter(([_, { username }]) =>
    username.toLowerCase().includes(usernameSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 pt-20">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Modify Products</h1>
          
          <Input
            placeholder="Search by username..."
            value={usernameSearch}
            onChange={(e) => setUsernameSearch(e.target.value)}
            className="max-w-sm"
          />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map(([userId, { username, products }]) => (
                <UserProductGroup
                  key={userId}
                  username={username}
                  products={products}
                  onDelete={handleDelete}
                />
              ))}
              
              {products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModifyProducts;