import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  price: number;
  storage_path: string;
  description: string;
}

export const ProductGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {products.map((product) => (
        <Link to={`/product/${product.id}`} key={product.id}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={`https://izolcgjxobgendljwoan.supabase.co/storage/v1/object/public/images/${product.storage_path}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold truncate">{product.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <span className="font-bold">{formatCurrency(product.price)}</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};