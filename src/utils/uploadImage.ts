
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

export const uploadProductImage = async (file: File, countryId?: number, category?: string) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Determine the appropriate folder path based on country and category
    let folderPath = 'products';
    
    // Get country code based on countryId
    if (countryId) {
      try {
        const { data: countryData, error: countryError } = await supabase
          .from('countries')
          .select('code')
          .eq('id', countryId)
          .single();
        
        if (countryData && countryData.code) {
          folderPath += `/${countryData.code.toLowerCase()}`;
        }
      } catch (error) {
        console.error('Error getting country code:', error);
        // Continue with upload even if country lookup fails
      }
    }
    
    if (category) {
      folderPath += `/${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${uuidv4().substring(0, 8)}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;

    // Upload file to supabase storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    console.log('Image uploaded successfully to:', filePath);
    return filePath;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    throw error;
  }
};
