
import { supabase } from "@/integrations/supabase/client";

export const initializeStorage = async () => {
  try {
    // Check if the 'images' bucket exists
    const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    
    if (getBucketsError) {
      console.error("Error checking storage buckets:", getBucketsError);
      return false;
    }
    
    // If bucket doesn't exist, create it
    const bucketExists = buckets?.some(bucket => bucket.name === 'images');
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createBucketError) {
        console.error("Error creating 'images' bucket:", createBucketError);
        return false;
      }
      
      console.log("'images' bucket created successfully");
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing storage:", error);
    return false;
  }
};
