import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/Confetti";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type ProductCategory = Database["public"]["Enums"]["product_category"];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Electronics" as ProductCategory,
    available_quantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) {
        toast({
          title: "Error",
          description: "Failed to fetch product",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const { data: imagesData } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order");

      setExistingImages(imagesData || []);
      setFormData({
        title: productData.title || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        category: productData.category || "Electronics",
        available_quantity: productData.available_quantity?.toString() || "",
      });
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files) return;

    if (isMain) {
      setMainImage(files[0]);
    } else {
      const newFiles = Array.from(files);
      setAdditionalImages(prev => [...prev, ...newFiles].slice(0, 4));
    }
  };

  const uploadImage = async (file: File, productId: string, isMain: boolean, order: number) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${productId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    await supabase.from('product_images').insert({
      product_id: productId,
      storage_path: filePath,
      is_main: isMain,
      display_order: order
    });

    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update product details
      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          available_quantity: parseInt(formData.available_quantity),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Handle new main image if provided
      if (mainImage) {
        const mainImagePath = await uploadImage(mainImage, id!, true, 0);
        await supabase
          .from("products")
          .update({ storage_path: mainImagePath })
          .eq("id", id);
      }

      // Handle new additional images
      for (let i = 0; i < additionalImages.length; i++) {
        await uploadImage(additionalImages[i], id!, false, existingImages.length + i + 1);
      }

      setShowConfetti(true);
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mainImage">Update Main Product Image</Label>
            <Input
              id="mainImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, true)}
            />
            {existingImages.find(img => img.is_main) && (
              <div className="text-sm text-gray-500">
                Current main image exists
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalImages">Add More Images (Up to 4 total)</Label>
            <Input
              id="additionalImages"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, false)}
            />
            <div className="text-sm text-gray-500">
              Current additional images: {existingImages.filter(img => !img.is_main).length}
              <br />
              New images selected: {additionalImages.length}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as ProductCategory })
              }
              required
            >
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Available Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.available_quantity}
              onChange={(e) =>
                setFormData({ ...formData, available_quantity: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Product...
              </>
            ) : (
              'Update Product'
            )}
          </Button>
        </form>
      </div>
      <Confetti isActive={showConfetti} />
    </div>
  );
};

export default EditProduct;