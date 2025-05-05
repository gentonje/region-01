
import { supabase } from "@/integrations/supabase/client";

export const getStorageUrl = (path: string): string => {
  try {
    if (!path || path.trim() === '') {
      console.log('Empty path provided to getStorageUrl, returning placeholder');
      return '/placeholder.svg';
    }
    
    // Enhanced debug logging
    console.log('Getting storage URL for path:', path);
    
    // Fix potential URL encoding issues with spaces or special characters
    const cleanPath = path.trim();
    
    // Get the public URL directly 
    const { data } = supabase.storage.from('images').getPublicUrl(cleanPath);
    
    if (!data || !data.publicUrl) {
      console.error('Failed to get public URL from Supabase');
      return '/placeholder.svg';
    }
    
    console.log('Generated public URL:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return '/placeholder.svg';
  }
};

// This utility helps to pre-load images and check if they're valid
export const validateImageUrl = async (url: string): Promise<boolean> => {
  if (!url || url.includes('placeholder.svg')) {
    return false;
  }
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('Content-Type')?.startsWith('image/');
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
};
