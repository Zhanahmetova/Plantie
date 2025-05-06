import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
}

export function useTodayTasks() {
  return useQuery<Task[]>({
    queryKey: ["/api/tasks/today"],
  });
}

export function useTasksByPlant(plantId: number | null) {
  return useQuery<Task[]>({
    queryKey: ["/api/plants", plantId, "tasks"],
    enabled: plantId !== null,
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: Omit<Task, "id">) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants", variables.plantId, "tasks"] });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, task }: { id: number, task: Partial<Task> }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, task);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      if (variables.task.plantId) {
        queryClient.invalidateQueries({ queryKey: ["/api/plants", variables.task.plantId, "tasks"] });
      }
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
    }
  });
}

export function useTasksByType(selectedDate: Date = new Date()) {
  const { data: allTasks, isLoading } = useTasks();
  
  if (!allTasks) {
    return {
      wateringTasks: [],
      mistingTasks: [],
      fertilizingTasks: [],
      otherTasks: [],
      totalTasks: 0,
      isLoading
    };
  }
  
  // Filter tasks for the selected date
  const tasks = allTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  });
  
  const wateringTasks = tasks.filter(task => task.type === "watering" && !task.completed);
  const mistingTasks = tasks.filter(task => task.type === "misting" && !task.completed);
  const fertilizingTasks = tasks.filter(task => task.type === "fertilizing" && !task.completed);
  const otherTasks = tasks.filter(task => 
    !["watering", "misting", "fertilizing"].includes(task.type) && !task.completed
  );
  
  return {
    wateringTasks,
    mistingTasks,
    fertilizingTasks,
    otherTasks,
    totalTasks: [
      ...wateringTasks,
      ...mistingTasks,
      ...fertilizingTasks,
      ...otherTasks
    ].length,
    isLoading
  };
}
