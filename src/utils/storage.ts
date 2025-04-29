
import { supabase } from "@/integrations/supabase/client";

export const getStorageUrl = (path: string): string => {
  try {
    if (!path || path.trim() === '') {
      return '/placeholder.svg';
    }
    
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return '/placeholder.svg';
  }
};
