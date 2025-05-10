
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMyProducts } from "@/hooks/useMyProducts";
import { MyProductsHeader } from "@/components/my-products/MyProductsHeader";
import { ProfileCompleteAlert } from "@/components/my-products/ProfileCompleteAlert";
import { ProductsDisplay } from "@/components/my-products/ProductsDisplay";
import { useEffect } from "react";

const MyProducts = () => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    handleDelete,
    isProfileComplete
  } = useMyProducts();

  // Show notification if profile is incomplete
  useEffect(() => {
    if (!isProfileComplete) {
      toast.warning("Please complete your profile before adding products", {
        action: {
          label: "Edit Profile",
          onClick: () => navigate("/edit-profile")
        }
      });
    }
  }, [isProfileComplete, navigate]);

  return (
    <div className="space-y-1 m-1 p-1 mx-auto max-w-6xl">
      <MyProductsHeader isProfileComplete={isProfileComplete} />
      <ProfileCompleteAlert isProfileComplete={isProfileComplete} />
      
      <ProductsDisplay
        products={products}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onDelete={handleDelete}
        isProfileComplete={isProfileComplete}
      />
    </div>
  );
};

export default MyProducts;
