
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
}

const ProductSkeleton = () => (
  <div className="flex items-center gap-4 py-4">
    <Skeleton className="h-20 w-20 rounded" />
    <div className="flex-1">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

export const ModifyProductsList = ({
  products,
  isLoading,
  hasMore,
  onLoadMore,
  onDelete,
}: ModifyProductsListProps) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("none");
  
  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: isAdmin } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      return isAdmin;
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
    if (inView && hasMore) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore]);

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
      if (sortOrder === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortOrder === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
        <Select
          value={sortOrder}
          onValueChange={setSortOrder}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Default</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
        {filteredAndSortedProducts.map((product) => (
          <div key={`product-${product.id}`} className="p-4">
            <ProductModifyCard
              product={product}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="divide-y divide-gray-200 bg-white rounded-lg shadow mt-4">
          {[1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="p-4">
              <ProductSkeleton />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found</p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {hasMore && <div className="loading">Loading more...</div>}
      </div>
    </>
  );
};
