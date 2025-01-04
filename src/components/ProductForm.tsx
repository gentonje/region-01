import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ProductCategory = Database["public"]["Enums"]["product_category"];

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  available_quantity: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  isLoading: boolean;
  submitButtonText: string;
  onSubmit: (formData: ProductFormData) => Promise<void>;
  initialData?: ProductFormData;
}

export const ProductForm = ({
  formData,
  setFormData,
  isLoading,
  submitButtonText,
  onSubmit,
}: ProductFormProps) => {
  const form = useForm<ProductFormData>({
    defaultValues: formData,
    mode: "onChange",
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      toast.success("Product updated successfully!");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to update product");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ 
            required: "Title is required",
            minLength: { value: 3, message: "Title must be at least 3 characters" },
            maxLength: { value: 100, message: "Title must be less than 100 characters" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-medium">Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="text-gray-900"
                  onChange={(e) => {
                    field.onChange(e);
                    setFormData({ ...formData, title: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          rules={{ 
            required: "Description is required",
            minLength: { value: 10, message: "Description must be at least 10 characters" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-medium">Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="text-gray-900"
                  onChange={(e) => {
                    field.onChange(e);
                    setFormData({ ...formData, description: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          rules={{ 
            required: "Price is required",
            pattern: { 
              value: /^\d*\.?\d*$/,
              message: "Please enter a valid price"
            },
            validate: (value) => Number(value) > 0 || "Price must be greater than 0"
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-medium">Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  className="text-gray-900"
                  onChange={(e) => {
                    field.onChange(e);
                    setFormData({ ...formData, price: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-medium">Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                  onChange={(e) => {
                    field.onChange(e);
                    setFormData({ ...formData, category: e.target.value as ProductCategory });
                  }}
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Books">Books</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Other">Other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available_quantity"
          rules={{ 
            required: "Quantity is required",
            pattern: { 
              value: /^\d+$/,
              message: "Please enter a valid quantity"
            },
            validate: (value) => Number(value) >= 0 || "Quantity cannot be negative"
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-medium">Available Quantity</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="text-gray-900"
                  onChange={(e) => {
                    field.onChange(e);
                    setFormData({ ...formData, available_quantity: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </form>
    </Form>
  );
};