
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Loader2 } from "lucide-react";
import { DistrictsList } from "@/components/admin/districts/DistrictsList";
import { DistrictForm } from "@/components/admin/districts/DistrictForm";
import { DistrictFilters } from "@/components/admin/districts/DistrictFilters";
import { District, Country } from "@/types/districts";

const AdminDistricts = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  // State for district form
  const [newDistrict, setNewDistrict] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState<string>("all");

  // Fetch super admin status
  const { data: isSuperAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!session?.user) return false;
      
      const { data, error } = await supabase.rpc('is_super_admin', {
        user_id: session.user.id
      });
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data;
    },
  });

  // Fetch countries
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Country[];
    },
    enabled: !!isSuperAdmin,
  });

  // Fetch districts
  const { data: districts, isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districts", filterCountry],
    queryFn: async () => {
      let query = supabase
        .from("districts")
        .select(`
          *,
          countries (name)
        `)
        .order("name");
      
      if (filterCountry !== "all") {
        query = query.eq("country_id", Number(filterCountry));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(district => ({
        ...district,
        country_name: district.countries?.name
      })) as District[];
    },
    enabled: !!isSuperAdmin,
  });

  // Add district mutation
  const addDistrictMutation = useMutation({
    mutationFn: async (district: { name: string, country_id: number }) => {
      const { data, error } = await supabase
        .from("districts")
        .insert(district)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("District added successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (error) => {
      toast.error(`Failed to add district: ${error.message}`);
    },
  });

  // Edit district mutation
  const editDistrictMutation = useMutation({
    mutationFn: async (district: { id: number, name: string, country_id: number }) => {
      const { data, error } = await supabase
        .from("districts")
        .update({ name: district.name, country_id: district.country_id })
        .eq("id", district.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("District updated successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (error) => {
      toast.error(`Failed to update district: ${error.message}`);
    },
  });

  // Delete district mutation
  const deleteDistrictMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("districts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("District deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete district: ${error.message}`);
    },
  });

  // Reset form and close dialog
  const resetForm = () => {
    setEditingDistrict(null);
    setNewDistrict("");
    setSelectedCountry("");
    setIsDialogOpen(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDistrict.trim() || !selectedCountry) {
      toast.error("Please fill all fields");
      return;
    }
    
    if (editingDistrict) {
      editDistrictMutation.mutate({
        id: editingDistrict.id,
        name: newDistrict,
        country_id: Number(selectedCountry)
      });
    } else {
      addDistrictMutation.mutate({
        name: newDistrict,
        country_id: Number(selectedCountry)
      });
    }
  };

  // Handle edit district
  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
    setNewDistrict(district.name);
    setSelectedCountry(district.country_id.toString());
    setIsDialogOpen(true);
  };

  // Handle delete district
  const handleDeleteDistrict = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the district "${name}"?`)) {
      deleteDistrictMutation.mutate(id);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { href: "/admin/users", label: "Admin" },
          { label: "Districts Management", isCurrent: true }
        ]}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Districts Management</h1>
        
        <DistrictFilters
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          countries={countries}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>

      {isDialogOpen && (
        <DistrictForm
          editingDistrict={editingDistrict}
          countries={countries}
          onSubmit={handleSubmit}
          newDistrict={newDistrict}
          setNewDistrict={setNewDistrict}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          isPending={addDistrictMutation.isPending || editDistrictMutation.isPending}
          onClose={resetForm}
        />
      )}

      <DistrictsList
        districts={districts}
        isLoading={isLoadingDistricts || isLoadingCountries}
        onEdit={handleEditDistrict}
        onDelete={handleDeleteDistrict}
        deleteIsLoading={deleteDistrictMutation.isPending}
      />
    </div>
  );
};

export default AdminDistricts;
