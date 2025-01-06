import { ProductModifyCard } from "@/components/ProductModifyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModifyProductsListProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (productId: string) => Promise<void>;
  isMobile: boolean;
}

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

export const ModifyProductsList = ({
  products,
  isLoading,
  hasMore,
  onLoadMore,
  onDelete,
  isMobile
}: ModifyProductsListProps) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Check if user is admin or super admin
  const { data: isAdminOrSuper } = useQuery({
    queryKey: ["isAdminOrSuper"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }

      const { data: isSuperAdmin, error: superError } = await supabase.rpc('is_super_admin', {
        user_id: user.id
      });
      
      if (superError) {
        console.error('Error checking super admin status:', superError);
        return false;
      }
      
      return isAdmin || isSuperAdmin;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name");
      
      if (error) throw error;
      return data.map(category => category.name);
    }
  });

  useEffect(() => {
    if (isMobile && inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isMobile, isLoading, onLoadMore]);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = searchQuery.toLowerCase().trim() === "" ||
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort unpublished first
      if (a.product_status === "draft" && b.product_status !== "draft") return -1;
      if (a.product_status !== "draft" && b.product_status === "draft") return 1;
      return 0;
    });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map((product) => (
          <ProductModifyCard
            key={`product-${product.id}`}
            product={product}
            onDelete={onDelete}
            isAdminOrSuper={isAdminOrSuper}
          />
        ))}
      </div>

      {isLoading && renderSkeletons()}

      {!isLoading && filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found</p>
        </div>
      )}

      {isMobile && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {hasMore && <div className="loading">Loading more...</div>}
        </div>
      )}
    </>
  );
};