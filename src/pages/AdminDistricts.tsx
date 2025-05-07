
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface District {
  id: number;
  name: string;
  country_id: number;
  created_at: string;
  country_name?: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

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
      setNewDistrict("");
      setSelectedCountry("");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setIsDialogOpen(false);
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
      setEditingDistrict(null);
      setNewDistrict("");
      setSelectedCountry("");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setIsDialogOpen(false);
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

  // Handle dialog close
  const handleDialogClose = () => {
    setEditingDistrict(null);
    setNewDistrict("");
    setSelectedCountry("");
    setIsDialogOpen(false);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Districts Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            value={filterCountry}
            onValueChange={setFilterCountry}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries?.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add District
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDistrict ? "Edit District" : "Add New District"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="country" className="text-right">
                      Country
                    </label>
                    <Select
                      value={selectedCountry}
                      onValueChange={setSelectedCountry}
                      required
                    >
                      <SelectTrigger id="country" className="col-span-3">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right">
                      District Name
                    </label>
                    <Input
                      id="name"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={
                      addDistrictMutation.isPending || 
                      editDistrictMutation.isPending || 
                      !newDistrict || 
                      !selectedCountry
                    }
                  >
                    {(addDistrictMutation.isPending || editDistrictMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingDistrict ? "Update District" : "Add District"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoadingDistricts || isLoadingCountries ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districts && districts.length > 0 ? (
                districts.map((district) => (
                  <TableRow key={district.id}>
                    <TableCell>{district.name}</TableCell>
                    <TableCell>{district.country_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDistrict(district)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDistrict(district.id, district.name)}
                          disabled={deleteDistrictMutation.isPending}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No districts found. Add your first district!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminDistricts;
