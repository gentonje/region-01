import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from '@/components/Navigation';
import { useInView } from "react-intersection-observer";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { ProductFilters } from "@/components/ProductFilters";
import ProductDetail from "@/components/ProductDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Home() {
  const { ref, inView } = useInView();
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = React.useState<SupportedCurrency>("SSP");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const PRODUCTS_PER_PAGE = 8; // Limit for non-authenticated users

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["home-products", searchQuery, selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * (session ? 10 : PRODUCTS_PER_PAGE);
      const endRange = startRange + (session ? 9 : PRODUCTS_PER_PAGE - 1);

      let query = supabase
        .from("products")
        .select("*, product_images(*), profiles(*)")
        .eq('product_status', 'published')
        .range(startRange, endRange)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data: products, error } = await query;

      if (error) throw error;
      return products as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < (session ? 10 : PRODUCTS_PER_PAGE)) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      if (!session && data?.pages.flat().length === PRODUCTS_PER_PAGE) {
        setShowLoginPrompt(true);
      } else {
        fetchNextPage();
      }
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, session, data]);

  const allProducts = data?.pages.flat() || [];

  const getProductImageUrl = (product: Product) => {
    if (!product.product_images?.length) return "/placeholder.svg";
    
    const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
    if (!mainImage) return "/placeholder.svg";

    return supabase.storage
      .from("images")
      .getPublicUrl(mainImage.storage_path).data.publicUrl;
  };

  const handleProductClick = (product: Product) => {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const handleLoginPromptAction = () => {
    navigate('/login');
    setShowLoginPrompt(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onCurrencyChange={handleCurrencyChange} />
        <div className="container mx-auto px-4 mt-20">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCurrencyChange={handleCurrencyChange} />
      <div className="container mx-auto px-4">
        <div className="mt-20">
          {selectedProduct ? (
            <ProductDetail 
              product={selectedProduct}
              getProductImageUrl={getProductImageUrl}
              onBack={handleBack}
              selectedCurrency={selectedCurrency}
            />
          ) : (
            <>
              <ProductFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <ProductList
                products={allProducts}
                getProductImageUrl={getProductImageUrl}
                onProductClick={handleProductClick}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                observerRef={ref}
                selectedCurrency={selectedCurrency}
              />
            </>
          )}
        </div>
      </div>
      <BottomNavigation />

      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in to continue</AlertDialogTitle>
            <AlertDialogDescription>
              Create an account or sign in to view more products and interact with our marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginPrompt(false)}>
              Maybe later
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginPromptAction}>
              Sign in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}