
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl backdrop-blur-xl bg-white/30 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{username}</h3>
            <span className="text-sm text-gray-500">{products.length} products</span>
          </div>
        </div>
        <div className="p-2 rounded-full hover:bg-white/20 transition-colors">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="py-4">
            <ProductFilters 
              onSearchChange={handleSearchChange}
              className="bg-white/50 backdrop-blur-sm border-white/30 rounded-lg shadow-sm" 
            />
          </div>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="p-4 rounded-lg backdrop-blur-sm bg-white/50 border border-white/30 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/60"
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
