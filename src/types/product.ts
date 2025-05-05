
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
  is_main?: boolean;
  display_order?: number;
  publicUrl?: string;
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
  seller_id?: string;
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
  average_rating?: number;
  storage_path?: string;
}

// Add ProductFormData interface explicitly since it's imported in productService.ts
export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  available_quantity: string;
  county: string;
  shipping_info?: string;
}
