
import { ProductCategory } from "@/types/product";

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  available_quantity: string;
  county?: string;
}

export const productValidationRules = {
  title: { 
    required: "Title is required",
    minLength: { value: 3, message: "Title must be at least 3 characters" },
    maxLength: { value: 100, message: "Title must be less than 100 characters" }
  },
  description: { 
    required: "Description is required",
    minLength: { value: 10, message: "Description must be at least 10 characters" }
  },
  price: { 
    required: "Price is required",
    pattern: { 
      value: /^\d*\.?\d*$/,
      message: "Please enter a valid price"
    },
    validate: (value: string) => Number(value) > 0 || "Price must be greater than 0"
  },
  category: { 
    required: "Category is required" 
  },
  available_quantity: { 
    required: "Quantity is required",
    pattern: { 
      value: /^\d+$/,
      message: "Please enter a valid quantity"
    },
    validate: (value: string) => Number(value) >= 0 || "Quantity cannot be negative"
  },
  county: {
    required: "County is required"
  }
};
