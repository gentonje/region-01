
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ProductCategory } from "@/types/product";

interface Category {
  id: string;
  name: ProductCategory;
}

interface CategoryPageHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  editingCategory: Category | null;
}

export const CategoryPageHeader = ({
  isDialogOpen,
  setIsDialogOpen,
  editingCategory
}: CategoryPageHeaderProps) => {
  return (
    <>
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { href: "/admin/users", label: "Admin" },
          { label: "Categories Management", isCurrent: true }
        ]}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Categories Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </>
  );
};
