import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProfileFormFields } from "@/components/forms/profile/ProfileFormFields";
import { profileFormSchema, type ProfileFormData } from "@/components/forms/profile/validation";

export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

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
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        contact_email: profile.contact_email || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        shop_name: profile.shop_name || "",
        shop_description: profile.shop_description || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormData) => {
      if (!session?.user?.id) throw new Error("No user ID found");
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const onSubmit = (values: ProfileFormData) => {
    updateProfileMutation.mutate(values);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-20 mt-16">
      <div className="flex items-center gap-2 mb-6">
        <UserCog className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ProfileFormFields form={form} />
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}