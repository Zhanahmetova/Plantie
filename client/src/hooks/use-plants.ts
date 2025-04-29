import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function usePlants() {
  return useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
}

export function usePlant(id: number | null) {
  return useQuery<Plant>({
    queryKey: ["/api/plants", id],
    enabled: id !== null,
  });
}

export function useAddPlant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (plant: any) => 
      apiRequest("/api/plants", {
        method: "POST",
        body: {
          ...plant,
          lastWatered: null,
          lastFertilized: null
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
    }
  });
}

export function useUpdatePlant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, plant }: { id: number, plant: Partial<Plant> }) => 
      apiRequest(`/api/plants/${id}`, {
        method: "PUT",
        body: plant
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants", variables.id] });
    }
  });
}

export function useDeletePlant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/plants/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
    }
  });
}

export function usePlantCategories() {
  const { data: plants, isLoading } = usePlants();
  
  const categories = plants ? Array.from(new Set(plants.map(plant => plant.category))) : [];
  
  return {
    categories,
    isLoading
  };
}
