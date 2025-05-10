
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, User, AlertCircle } from "lucide-react";
import { ProfileFormFields } from "@/components/forms/profile/ProfileFormFields";
import { profileFormSchema, ProfileFormData } from "@/components/forms/profile/validation";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";

const EditProfile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { isProfileComplete, requiredFields } = useProfileCompleteness();
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      contact_email: "",
      phone_number: "",
      address: "",
      shop_name: "",
      shop_description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            form.reset({
              username: data.username || "",
              full_name: data.full_name || "",
              contact_email: data.contact_email || user.email || "",
              phone_number: data.phone_number || "",
              address: data.address || "",
              shop_name: data.shop_name || "",
              shop_description: data.shop_description || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }
      
      // Check if username is already taken (only if username has changed)
      if (data.username) {
        const { data: existingUser, error: usernameError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", data.username)
          .neq("id", user.id)
          .maybeSingle();
        
        if (usernameError) throw usernameError;
        
        if (existingUser) {
          form.setError("username", { 
            type: "manual", 
            message: "This username is already taken" 
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Clean up data before submitting to ensure valid values
      const profileData = {
        username: data.username,
        full_name: data.full_name,
        contact_email: data.contact_email || null,
        phone_number: data.phone_number || null,
        address: data.address,
        shop_name: data.shop_name || null,
        shop_description: data.shop_description || null,
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-1 space-y-1 p-1">
      <div className="space-y-1">
        <BreadcrumbNav
          items={[
            { href: "/products", label: "Home" },
            { href: "/products", label: "Profile" },
            { label: "Edit Profile", isCurrent: true }
          ]}
        />
      
        <div className="flex items-center gap-1">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>
        
        {!isProfileComplete && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete your profile. Required fields are marked with an asterisk (*).
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {isLoading && !form.formState.isSubmitting ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
              <ProfileFormFields 
                form={form} 
                requiredFields={!requiredFields.username || !requiredFields.fullName}
              />
              
              <div className="pt-1 border-t flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!form.formState.isValid || form.formState.isSubmitting}
                  className="w-full sm:w-auto mt-1"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
