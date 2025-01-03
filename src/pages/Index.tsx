import React, { Suspense, lazy, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

const ITEMS_PER_PAGE = 20;

const ProductCard = lazy(() => import("../components/ProductCard"));

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          product_images(storage_path, is_main)
        `, { count: 'exact' })
        .eq('product_status', 'published')
        .order('created_at', { ascending: false })
        .range(start, end);

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
    <Card className="w-full h-[400px]">
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/4" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <ScrollArea className="max-w-[2000px] mx-auto pt-20 pb-24 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <Suspense fallback={
            Array(ITEMS_PER_PAGE).fill(0).map((_, index) => (
              <div key={index}>
                <ProductSkeleton />
              </div>
            ))
          }>
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.products.map((product) => (
                  <div key={product.id}>
                    <ProductCard 
                      product={product} 
                      getProductImageUrl={getProductImageUrl}
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </Suspense>

          {/* Loading indicator */}
          {(isFetchingNextPage || isLoading) && (
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`}>
                <ProductSkeleton />
              </div>
            ))
          )}

          {/* Intersection observer target */}
          <div ref={ref} style={{ height: '10px' }} />
        </div>
      </ScrollArea>

      <BottomNavigation />
    </div>
  );
};

export default Index;