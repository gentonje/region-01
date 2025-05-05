
import { useState } from "react";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { ProductModifyCard } from "@/components/ProductModifyCard";
import { Product } from "@/types/product";
import { ProductFilters } from "@/components/ProductFilters";

interface UserProductGroupProps {
  username: string;
  products: Product[];
  onDelete: (productId: string) => Promise<void>;
}

export const UserProductGroup = ({ username, products, onDelete }: UserProductGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Check and log products data for debugging
  console.log(`UserProductGroup for ${username}:`, products);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm dark:shadow-none border border-border m-1">
      <div 
        className="p-1 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-all duration-300 space-x-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-1">
          <div className="p-1 rounded-full bg-primary/10 m-1">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm md:text-lg font-semibold">{username}</h3>
            <span className="text-xs md:text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>
        <div className="p-1 rounded-full hover:bg-muted transition-colors m-1">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 md:h-5 md:w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 md:h-5 md:w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-1 pb-1 space-y-1">
          <div className="py-1 m-1">
            <ProductFilters 
              onSearchChange={handleSearchChange}
              className="bg-background/50 backdrop-blur-sm border-border rounded-lg shadow-sm text-sm md:text-base" 
            />
          </div>
          <div className="grid gap-1 space-y-1">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="p-1 rounded-lg bg-background/50 backdrop-blur-sm border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:bg-background m-1"
              >
                <ProductModifyCard
                  product={product}
                  onDelete={onDelete}
                  isAdmin={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
