import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  storage_path: string;
  currency: string;
  average_rating: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(storage_path, is_main)
        `)
        .eq('product_status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      return data as (Product & { product_images: { storage_path: string, is_main: boolean }[] })[];
    }
  });

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

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
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

  const ProductCard = ({ product }: { product: Product & { product_images: { storage_path: string, is_main: boolean }[] } }) => (
    <Card className="w-full h-[400px] hover:shadow-lg transition-shadow duration-200">
      <CardContent className="space-y-1">
        <div className="h-60 w-full relative">
          <img
            src={getProductImageUrl(product)}
            alt={product.title}
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute bottom-2 right-2">
            <StarRating rating={product.average_rating || 0} />
          </div>
        </div>
        <div className="h-[28px] overflow-hidden">
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
        <div className="h-[20px] overflow-hidden">
          <CardTitle className="text-sm font-medium truncate">{product.title}</CardTitle>
        </div>
      </CardContent>
      <CardFooter className="h-[28px] pt-0">
        <p className="text-sm font-semibold">
          {product.currency} {product.price?.toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-[2000px] mx-auto px-4 pt-20 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array(12).fill(0).map((_, index) => (
              <div key={index}>
                <ProductSkeleton />
              </div>
            ))
          ) : (
            products?.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
