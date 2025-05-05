
import { supabase } from "@/integrations/supabase/client";
import { ProductCategory } from "@/types/product";
import { toast } from "sonner";

interface SampleProduct {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  available_quantity: number;
  county: string;
  mainImage: string;
  additionalImages: string[];
}

const clothingProducts: SampleProduct[] = [
  {
    title: "Premium Denim Jacket",
    description: "Classic denim jacket with modern styling. Features quality stitching, adjustable waist buttons, and deep front pockets. Perfect for casual outings and evening events.",
    price: 89.99,
    category: "Clothing",
    available_quantity: 25,
    county: "Juba",
    mainImage: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1576871337586-9a1db43667a1?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Cotton Summer Dress",
    description: "Lightweight cotton dress perfect for hot summer days. Features a floral pattern with adjustable straps and a comfortable flowing design.",
    price: 45.50,
    category: "Clothing",
    available_quantity: 18,
    county: "Wau",
    mainImage: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1612336307827-0f25db07c4d4?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Men's Formal Shirt",
    description: "Crisp formal shirt made from premium cotton. Features a slim fit design with elegant buttons and reinforced collar. Perfect for office wear.",
    price: 37.99,
    category: "Clothing",
    available_quantity: 30,
    county: "Malakal",
    mainImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1598033129225-43c019679b53?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Wool Winter Sweater",
    description: "Warm wool sweater for cold winter days. Features a comfortable fit, ribbed cuffs and hem, and a classic design that never goes out of style.",
    price: 65.75,
    category: "Clothing",
    available_quantity: 15,
    county: "Juba",
    mainImage: "https://images.unsplash.com/photo-1576871337598-af92c5ce7498?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1576871337586-9a1db43667a1?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Active Wear Set",
    description: "High-performance activewear set designed for comfort during workouts. Features moisture-wicking fabric and flexible material for maximum range of movement.",
    price: 79.99,
    category: "Clothing",
    available_quantity: 22,
    county: "Wau",
    mainImage: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1618354691229-e208507dbfb2?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1618354691438-25bc04584c23?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Running Shoes",
    description: "Lightweight running shoes with responsive cushioning. Features breathable mesh upper, supportive midsole, and durable rubber outsole for traction.",
    price: 95.50,
    category: "Clothing",
    available_quantity: 12,
    county: "Bor",
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Leather Formal Shoes",
    description: "Handcrafted leather formal shoes with a classic design. Features genuine leather upper, comfortable insole, and durable outsole.",
    price: 129.99,
    category: "Clothing",
    available_quantity: 8,
    county: "Juba",
    mainImage: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1614252369746-fb56d0b81a5c?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1614252370313-84cf1bc567ca?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Casual Sneakers",
    description: "Versatile casual sneakers that go with everything. Features canvas upper, cushioned insole, and classic rubber outsole.",
    price: 59.99,
    category: "Clothing",
    available_quantity: 20,
    county: "Wau",
    mainImage: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Designer Handbag",
    description: "Elegant designer handbag with spacious compartments. Features premium synthetic leather, secure zip closure, and stylish gold accents.",
    price: 119.50,
    category: "Clothing",
    available_quantity: 7,
    county: "Malakal",
    mainImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3"
    ]
  },
  {
    title: "Fitness Watch",
    description: "Advanced fitness watch with heart rate monitoring. Features step counter, sleep tracking, and smartphone notifications.",
    price: 87.25,
    category: "Clothing",
    available_quantity: 15,
    county: "Juba",
    mainImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3",
    additionalImages: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3"
    ]
  }
];

export const addSampleProducts = async (userId: string) => {
  if (!userId) {
    toast.error("You must be logged in to add sample products");
    return { success: false, count: 0 };
  }
  
  let successCount = 0;
  
  try {
    for (const product of clothingProducts) {
      // Upload main image to Supabase storage
      const mainImageName = `${crypto.randomUUID()}.jpg`;
      
      // Fetch main image from URL
      const mainImageResponse = await fetch(product.mainImage);
      const mainImageBlob = await mainImageResponse.blob();
      
      // Upload to Supabase
      const { data: mainImageData, error: mainImageError } = await supabase.storage
        .from('images')
        .upload(mainImageName, mainImageBlob);
      
      if (mainImageError) {
        console.error("Error uploading main image:", mainImageError);
        continue;
      }
      
      // Upload additional images
      const additionalImagePaths: string[] = [];
      for (const imageUrl of product.additionalImages) {
        const additionalImageName = `${crypto.randomUUID()}.jpg`;
        
        try {
          const additionalImageResponse = await fetch(imageUrl);
          const additionalImageBlob = await additionalImageResponse.blob();
          
          const { error: additionalImageError } = await supabase.storage
            .from('images')
            .upload(additionalImageName, additionalImageBlob);
          
          if (!additionalImageError) {
            additionalImagePaths.push(additionalImageName);
          }
        } catch (error) {
          console.error("Error processing additional image:", error);
        }
      }
      
      // Add product to database
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          available_quantity: product.available_quantity,
          storage_path: mainImageName,
          county: product.county,
          user_id: userId,
          product_status: "published",
          in_stock: true
        })
        .select()
        .single();
      
      if (productError) {
        console.error("Error adding product:", productError);
        continue;
      }
      
      // Insert main image into product_images table
      const { error: mainImageDbError } = await supabase
        .from("product_images")
        .insert({
          product_id: productData.id,
          storage_path: mainImageName,
          is_main: true,
          display_order: 0
        });
      
      if (mainImageDbError) {
        console.error("Error adding main image to DB:", mainImageDbError);
      }
      
      // Insert additional images into product_images table
      if (additionalImagePaths.length > 0) {
        const additionalImagesData = additionalImagePaths.map((path, index) => ({
          product_id: productData.id,
          storage_path: path,
          is_main: false,
          display_order: index + 1
        }));
        
        const { error: additionalImagesError } = await supabase
          .from("product_images")
          .insert(additionalImagesData);
        
        if (additionalImagesError) {
          console.error("Error adding additional images to DB:", additionalImagesError);
        }
      }
      
      successCount++;
    }
    
    toast.success(`Successfully added ${successCount} sample products!`);
    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Error in adding sample products:", error);
    toast.error(`Failed to add sample products: ${error.message}`);
    return { success: false, count: successCount };
  }
};
