import { supabase } from "@/integrations/supabase/client";

export const getStorageUrl = (path: string): string => {
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
};