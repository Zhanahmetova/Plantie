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
    mutationFn: async (plant: Omit<Plant, "id">) => {
      const response = await apiRequest("POST", "/api/plants", plant);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
    }
  });
}

export function useUpdatePlant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, plant }: { id: number, plant: Partial<Plant> }) => {
      const response = await apiRequest("PUT", `/api/plants/${id}`, plant);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants", variables.id] });
    }
  });
}

export function useDeletePlant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/plants/${id}`);
      return id;
    },
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
