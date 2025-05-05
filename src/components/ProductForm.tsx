
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { ProductFormField } from "./forms/product/ProductFormField";
import { ProductSubmitButton } from "./forms/product/ProductSubmitButton";
import { ProductFormData, productValidationRules } from "./forms/product/validation";
import { useEffect } from "react";

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
    resolver: undefined,
  });
  
  // Log the form data to debug
  useEffect(() => {
    console.log("ProductForm formData:", formData);
  }, [formData]);

  // Update form values when formData changes from parent
  useEffect(() => {
    form.reset(formData);
  }, [form, formData]);

  const handleSubmit = async (data: ProductFormData) => {
    // Debug validation before submission
    console.log("Form submission data:", data);
    console.log("County value:", data.county);
    
    // Don't show toast error if county exists, even if empty string
    if (formData.county === undefined || formData.county === null) {
      toast.error("Please select a county");
      return;
    }
    
    try {
      await onSubmit(data);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to update product");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-1">
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

        <ProductFormField
          form={form}
          name="county"
          label="County"
          formData={formData}
          setFormData={setFormData}
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
