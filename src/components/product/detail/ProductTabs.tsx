
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, MapPin, MessageSquare } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviews } from "../ProductReviews";
import { Product } from "@/types/product";

interface ProductTabsProps {
  product: Product;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ProductTabs = ({ product, activeTab, onTabChange }: ProductTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full h-full" onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-2 w-full mb-1">
        <TabsTrigger value="details" className="flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Details
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          Reviews
        </TabsTrigger>
      </TabsList>
      
      <div className="h-[calc(100%-40px)] overflow-auto">
        <TabsContent value="details" className="pt-0 h-full m-0">
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-x-1 gap-y-1">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{product.category || 'Other'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground">Availability</p>
                <p className="text-sm font-medium">{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground">Original Price</p>
                <p className="text-sm font-medium">{product.currency} {product.price?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-sm font-medium">{product.average_rating?.toFixed(1) || 'No ratings'}</p>
              </div>
              
              {/* County information - kept in the same style */}
              {product.county && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-muted-foreground">County</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-green-500" />
                    <p className="text-sm font-medium">{product.county}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-muted-foreground">Product Description</p>
              <p className="text-sm">{product.description}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="pt-0 h-full m-0">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <ProductReviews 
              productId={product.id} 
              sellerId={product.seller_id || ''} 
            />
          </Suspense>
        </TabsContent>
      </div>
    </Tabs>
  );
};
