import * as z from "zod";

export const profileFormSchema = z.object({
  username: z.string().min(2).max(50),
  full_name: z.string().min(2).max(100),
  contact_email: z.string().email().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  address: z.string().min(5).max(200),
  shop_name: z.string().optional().nullable(),
  shop_description: z.string().optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;