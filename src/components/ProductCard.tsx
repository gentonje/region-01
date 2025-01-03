import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    description: string;
    storage_path: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { convertPrice, currency } = useCurrency();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images/${product.storage_path}`}
        alt={product.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 truncate">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            {currency} {convertPrice(product.price).toFixed(2)}
          </span>
          <Button onClick={() => navigate(`/product/${product.id}`)}>
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}