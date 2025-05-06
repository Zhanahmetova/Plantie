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
    mutationFn: (record: AddRecordInput) => {
      // Create a clean object without undefined or null values
      const cleanRecord: Record<string, any> = {
        image: record.image,
      };
      
      // Only add optional fields if they have values
      if (record.note) {
        cleanRecord.note = record.note;
      }
      
      if (record.plantId && record.plantId > 0) {
        cleanRecord.plantId = record.plantId;
      }
      
      // Ensure recordDate is sent as a Date object, not a string
      if (record.recordDate) {
        // If it's already a Date, use it; otherwise create a new Date object
        cleanRecord.recordDate = record.recordDate instanceof Date
          ? record.recordDate
          : new Date(record.recordDate);
      }
      
      return apiRequest('/api/records', {
        method: 'POST',
        body: cleanRecord,
      });
    },
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
    mutationFn: ({ id, ...data }: UpdateRecordInput) => {
      // Create a clean object without undefined or null values
      const cleanData: Record<string, any> = {};
      
      // Only add optional fields if they have values
      if (data.note) {
        cleanData.note = data.note;
      }
      
      if (data.plantId && data.plantId > 0) {
        cleanData.plantId = data.plantId;
      }
      
      return apiRequest(`/api/records/${id}`, {
        method: 'PUT',
        body: cleanData,
      });
    },
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