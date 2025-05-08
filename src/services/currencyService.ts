
import { supabase } from "@/integrations/supabase/client";
import { countryToCurrency } from "@/utils/countryToCurrency";
import { toast } from "sonner";

/**
 * Update currencies for existing products based on their country_id
 * @returns A promise that resolves to the updated products count
 */
export const updateProductCurrencies = async (): Promise<number> => {
  try {
    // Get all products that need currency updates
    const { data: products, error } = await supabase
      .from("products")
      .select("id, country_id, currency")
      .not("country_id", "is", null);
    
    if (error) {
      console.error("Error fetching products for currency update:", error);
      throw error;
    }
    
    // No products to update
    if (!products || products.length === 0) {
      return 0;
    }
    
    // Track updated count
    let updatedCount = 0;
    
    // Update each product with incorrect currency
    for (const product of products) {
      const countryId = product.country_id?.toString();
      if (!countryId) continue;
      
      const correctCurrency = countryToCurrency[countryId] || "SSP";
      
      // Skip if currency is already correct
      if (product.currency === correctCurrency) continue;
      
      // Update the product currency
      const { error: updateError } = await supabase
        .from("products")
        .update({ currency: correctCurrency })
        .eq("id", product.id);
      
      if (updateError) {
        console.error(`Error updating currency for product ${product.id}:`, updateError);
        continue;
      }
      
      updatedCount++;
    }
    
    return updatedCount;
  } catch (error) {
    console.error("Error updating product currencies:", error);
    throw error;
  }
};

/**
 * Initialize currencies for all products without a currency value
 * @returns A promise that resolves to the number of products updated
 */
export const initializeProductCurrencies = async (): Promise<number> => {
  try {
    // Find all products without a currency
    const { data: products, error } = await supabase
      .from("products")
      .select("id, country_id")
      .is("currency", null);
      
    if (error) throw error;
    
    if (!products || products.length === 0) {
      return 0;
    }
    
    let updatedCount = 0;
    
    // Set currency for each product based on country_id
    for (const product of products) {
      const countryId = product.country_id?.toString() || "3"; // Default to South Sudan if no country
      const currency = countryToCurrency[countryId] || "SSP";
      
      const { error: updateError } = await supabase
        .from("products")
        .update({ currency })
        .eq("id", product.id);
        
      if (updateError) {
        console.error(`Error initializing currency for product ${product.id}:`, updateError);
        continue;
      }
      
      updatedCount++;
    }
    
    return updatedCount;
  } catch (error) {
    console.error("Error initializing product currencies:", error);
    throw error;
  }
};

/**
 * Fix all product currencies in the database
 */
export const fixAllProductCurrencies = async (): Promise<void> => {
  try {
    const initializedCount = await initializeProductCurrencies();
    const updatedCount = await updateProductCurrencies();
    
    console.log(`Currency fix: initialized ${initializedCount} products, updated ${updatedCount} products`);
    
    // Only show toast if changes were made
    if (initializedCount > 0 || updatedCount > 0) {
      toast.success(`Fixed currencies for ${initializedCount + updatedCount} products`);
    }
  } catch (error) {
    console.error("Failed to fix product currencies:", error);
    toast.error("Failed to fix product currencies");
  }
};
