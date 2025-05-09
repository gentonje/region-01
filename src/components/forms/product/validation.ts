
import { z } from "zod";
import { ProductCategory } from "@/types/product";

// Define the shape of our product form data with Zod
export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.union([
    z.string().min(1, "Price is required"), 
    z.number().positive("Price must be positive")
  ]),
  category: z.union([
    z.string(),
    z.nativeEnum(ProductCategory)
  ]),
  available_quantity: z.union([
    z.string().min(1, "Quantity is required"),
    z.number().int().nonnegative("Quantity must be 0 or positive")
  ]),
  county: z.string().min(1, "County is required"),
  country: z.string().min(1, "Country is required"),
  shipping_info: z.string().optional(),
  validity_period: z.enum(["day", "week", "month"]).default("day"),
});

// Export the inferred types from our schema
export type ProductFormData = z.infer<typeof productSchema>;

// Export validation rules for react-hook-form resolver
export const productValidationRules = {
  title: {
    required: "Title is required",
    minLength: { value: 3, message: "Title must be at least 3 characters" }
  },
  description: {
    required: "Description is required",
    minLength: { value: 10, message: "Description must be at least 10 characters" }
  },
  price: {
    required: "Price is required",
    min: { value: 0, message: "Price must be positive" }
  },
  category: {
    required: "Category is required"
  },
  available_quantity: {
    required: "Available quantity is required",
    min: { value: 0, message: "Quantity must be 0 or positive" }
  },
  county: {
    required: "County is required"
  },
  country: {
    required: "Country is required"
  },
  validity_period: {
    required: "Validity period is required"
  }
};
