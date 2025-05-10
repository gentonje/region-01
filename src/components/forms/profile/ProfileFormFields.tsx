
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { profileFormSchema } from "./validation";

type ProfileFormFieldsProps = {
  form: UseFormReturn<z.infer<typeof profileFormSchema>>;
  requiredFields?: boolean;
};

export function ProfileFormFields({ form, requiredFields = false }: ProfileFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>
              Username 
              {requiredFields && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Input {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>
              Full Name
              {requiredFields && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Input {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_email"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>Contact Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input {...field} type="tel" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>Shipping Address</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shop_name"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>Shop Name (Optional)</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shop_description"
        render={({ field }) => (
          <FormItem className="space-y-1 m-1">
            <FormLabel>Shop Description (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
