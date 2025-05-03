
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { ProductFormField } from "./forms/product/ProductFormField";
import { ProductSubmitButton } from "./forms/product/ProductSubmitButton";
import { ProductFormData, productValidationRules } from "./forms/product/validation";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCounties } from "@/data/southSudanCounties";

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  isLoading: boolean;
  submitButtonText: string;
  onSubmit: (formData: ProductFormData) => Promise<void>;
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

  const counties = getAllCounties();

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      toast.success("Product updated successfully!");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleCountyChange = (value: string) => {
    setFormData({ ...formData, county: value });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ProductFormField
          form={form}
          name="title"
          label="Title"
          formData={formData}
          setFormData={setFormData}
        />

        <ProductFormField
          form={form}
          name="description"
          label="Description"
          formData={formData}
          setFormData={setFormData}
        />

        <ProductFormField
          form={form}
          name="price"
          label="Price"
          type="number"
          step="0.01"
          formData={formData}
          setFormData={setFormData}
        />

        <ProductFormField
          form={form}
          name="category"
          label="Category"
          formData={formData}
          setFormData={setFormData}
        />

        <ProductFormField
          form={form}
          name="available_quantity"
          label="Available Quantity"
          type="number"
          formData={formData}
          setFormData={setFormData}
        />

        <FormField
          control={form.control}
          name="county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>County</FormLabel>
              <Select
                value={formData.county || ""}
                onValueChange={handleCountyChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a county" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {counties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name} ({county.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProductSubmitButton
          isLoading={isLoading}
          isValid={form.formState.isValid}
          submitButtonText={submitButtonText}
        />
      </form>
    </Form>
  );
};
