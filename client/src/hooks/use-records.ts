import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PlantRecord } from "@shared/schema";

export function useRecords() {
  return useQuery({
    queryKey: ['/api/records'],
  });
}

export function usePlantRecords(plantId: number | null) {
  return useQuery({
    queryKey: ['/api/plants', plantId, 'records'],
    queryFn: () => 
      plantId 
        ? apiRequest(`/api/plants/${plantId}/records`)
        : Promise.resolve([]),
    enabled: !!plantId,
  });
}

export function useRecord(id: number | null) {
  return useQuery({
    queryKey: ['/api/records', id],
    queryFn: () => 
      id 
        ? apiRequest(`/api/records/${id}`)
        : Promise.resolve(null),
    enabled: !!id,
  });
}

interface AddRecordInput {
  image: string;
  note?: string;
  plantId?: number | null;
  recordDate?: Date;
}

export function useAddRecord() {
  return useMutation({
    mutationFn: (record: AddRecordInput) => 
      apiRequest('/api/records', {
        method: 'POST',
        body: {
          ...record,
          // Convert plantId null to undefined so it's not sent to the API
          plantId: record.plantId || undefined,
        },
      }),
    onSuccess: () => {
      // Invalidate records queries
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/plants'], 
        predicate: (query) => {
          // Only invalidate queries like /api/plants/:id/records
          const queryKey = query.queryKey;
          return queryKey.length > 2 && queryKey[2] === 'records';
        }
      });
    },
  });
}

interface UpdateRecordInput {
  id: number;
  note?: string;
  plantId?: number | null;
}

export function useUpdateRecord() {
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRecordInput) => 
      apiRequest(`/api/records/${id}`, {
        method: 'PUT',
        body: {
          ...data,
          // Convert plantId null to undefined so it's not sent to the API
          plantId: data.plantId || undefined,
        },
      }),
    onSuccess: (_, variables) => {
      // Invalidate specific record and collections
      queryClient.invalidateQueries({ queryKey: ['/api/records', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      
      if (variables.plantId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/plants', variables.plantId, 'records'] 
        });
      }
    },
  });
}

export function useDeleteRecord() {
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/records/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      // Invalidate records queries
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/plants'], 
        predicate: (query) => {
          // Only invalidate queries like /api/plants/:id/records
          const queryKey = query.queryKey;
          return queryKey.length > 2 && queryKey[2] === 'records';
        }
      });
      
      // Remove this specific record from the cache
      queryClient.removeQueries({ queryKey: ['/api/records', id] });
    },
  });
}