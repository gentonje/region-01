
export type ProductStatus = "draft" | "published" | "archived";

export type ProductCategory = 
  | "Electronics" 
  | "Clothing" 
  | "Home & Garden" 
  | "Books" 
  | "Sports & Outdoors" 
  | "Toys & Games" 
  | "Health & Beauty" 
  | "Automotive" 
  | "Food & Beverages" 
  | "Other";

export interface ProductImage {
  id: string;
  storage_path: string;
  product_id: string;
  created_at: string;
}

export interface Product {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: ProductCategory;
  in_stock?: boolean;
  available_quantity?: number;
  county?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  product_status?: ProductStatus;
  product_images?: ProductImage[];
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
  };
  view_count?: number;
}
