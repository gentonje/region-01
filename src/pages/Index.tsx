import React, { Suspense, lazy, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductDetail from "@/components/ProductDetail";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  storage_path: string;
  currency: string;
  average_rating: number;
  category: string;
  in_stock: boolean;
  product_images: { storage_path: string; is_main: boolean }[];
}

const ITEMS_PER_PAGE = 20;

const ProductCard = lazy(() => import("../components/ProductCard"));

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(storage_path, is_main)
        `, { count: 'exact' })
        .eq('product_status', 'published')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return {
        products: data as (Product & { product_images: { storage_path: string, is_main: boolean }[] })[],
        count,
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setUserName(profile?.full_name || user.email || "");
    };

    getUser();
  }, [navigate]);

  const getProductImageUrl = (product: Product & { product_images: { storage_path: string, is_main: boolean }[] }) => {
    const mainImage = product.product_images?.find(img => img.is_main);
    if (mainImage) {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(mainImage.storage_path);
      return data.publicUrl;
    }
    return '/placeholder.svg';
  };

  const ProductSkeleton = () => (
    <Card className="w-full h-[400px] m-1">
      <Skeleton className="h-60 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  );

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4">
          <ProductDetail
            product={selectedProduct}
            getProductImageUrl={getProductImageUrl}
            onBack={() => setSelectedProduct(null)}
          />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 px-4 space-y-4">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Home & Garden">Home & Garden</SelectItem>
              <SelectItem value="Books">Books</SelectItem>
              <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
              <SelectItem value="Toys & Games">Toys & Games</SelectItem>
              <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0.5">
            <Suspense fallback={
              Array(ITEMS_PER_PAGE).fill(0).map((_, index) => (
                <div key={index} className="m-1">
                  <ProductSkeleton />
                </div>
              ))
            }>
              {data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page.products.map((product) => (
                    <div key={product.id} className="m-1">
                      <ProductCard 
                        product={product} 
                        getProductImageUrl={getProductImageUrl}
                        onClick={() => setSelectedProduct(product)}
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </Suspense>

            {(isFetchingNextPage || isLoading) && (
              Array(4).fill(0).map((_, index) => (
                <div key={`skeleton-${index}`} className="m-1">
                  <ProductSkeleton />
                </div>
              ))
            )}

            <div ref={ref} style={{ height: '10px' }} />
          </div>
        </ScrollArea>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;