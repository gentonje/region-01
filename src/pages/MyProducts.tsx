
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { UserProductGroup } from "@/components/UserProductGroup";
import { SampleProductsButton } from "@/components/SampleProductsButton";
import { Plus } from "lucide-react";

const MyProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (
              id,
              storage_path,
              is_main,
              display_order
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Products</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Manage your product listings
            </p>
          </div>
          
          <div className="flex space-x-4">
            <SampleProductsButton />
            <Button
              onClick={() => navigate('/add-product')}
              className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length > 0 ? (
          <UserProductGroup
            title="All Products"
            products={products}
            emptyMessage="No products found"
          >
            <ModifyProductsList products={products} />
          </UserProductGroup>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No products found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by adding your first product or using sample products.</p>
            <div className="mt-6 flex justify-center gap-4">
              <SampleProductsButton />
              <Button
                onClick={() => navigate('/add-product')}
                className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
