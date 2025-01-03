import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProductDetail from "@/components/ProductDetail";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductList } from "@/components/ProductList";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Product } from "@/types/product";
import { SplashScreen } from "@/components/SplashScreen";
import { AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 20;

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    data,
    isLoading: isProductsLoading,
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

      if (selectedCategory && selectedCategory !== 'all') {
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

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  React.useEffect(() => {
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

  // Hide splash screen after initial load with extended duration
  React.useEffect(() => {
    if (!isProductsLoading && data) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 16000); // Extended to 16 seconds to ensure the full 15-second animation plays
      return () => clearTimeout(timer);
    }
  }, [isProductsLoading, data]);

  const getProductImageUrl = (product: Product) => {
    const mainImage = product.product_images?.find(img => img.is_main);
    if (mainImage) {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(mainImage.storage_path);
      return data.publicUrl;
    }
    return '/placeholder.svg';
  };

  const allProducts = data?.pages.flatMap(page => page.products) || [];

  const breadcrumbItems = selectedProduct
    ? [{ label: selectedProduct.category }, { label: selectedProduct.title }]
    : [];

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 px-4">
          <div className="py-2 text-sm text-muted-foreground border-b">
            Logged in as {userName}
          </div>
          <div className="pt-2">
            <BreadcrumbNav items={breadcrumbItems} />
          </div>
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
      <AnimatePresence>
        {isLoading && <SplashScreen />}
      </AnimatePresence>

      <Navigation />
      
      <div className="pt-16 px-4">
        <div className="py-2 text-sm text-muted-foreground border-b">
          Logged in as {userName}
        </div>
        <div className="pt-2">
          <BreadcrumbNav items={[{ label: "Products" }]} />
        </div>
        
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <ScrollArea className="h-[calc(100vh-80px)]">
          <ProductList
            products={allProducts}
            getProductImageUrl={getProductImageUrl}
            onProductClick={setSelectedProduct}
            isLoading={isProductsLoading}
            isFetchingNextPage={isFetchingNextPage}
            observerRef={ref}
          />
        </ScrollArea>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;