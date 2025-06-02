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
    mutationFn: async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      return await apiRequest("/api/tasks", { method: "POST", body: task });
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
    mutationFn: async (task: { id: number } & Partial<Task>) => {
      const { id, ...taskData } = task;
      return await apiRequest(`/api/tasks/${id}`, { method: "PUT", body: taskData });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      if (variables.plantId) {
        queryClient.invalidateQueries({ queryKey: ["/api/plants", variables.plantId, "tasks"] });
      }
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/tasks/${id}`, { method: "DELETE" });
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
      completedTasks: [],
      forgottenTasks: [],
      totalTasks: 0,
      isLoading
    };
  }
  
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const isPastDate = selectedDate < today;
  
  // Filter tasks for the selected date based on startDate
  const tasks = allTasks.filter(task => {
    const taskDate = new Date(task.startDate);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  });
  
  // For current/future dates: show only incomplete tasks
  // For past dates: show completed and forgotten (incomplete past due) tasks
  let wateringTasks: Task[], mistingTasks: Task[], fertilizingTasks: Task[], otherTasks: Task[], completedTasks: Task[], forgottenTasks: Task[];
  
  if (isToday || selectedDate > today) {
    // Current or future date - show incomplete tasks only
    wateringTasks = tasks.filter(task => task.type === "watering" && !task.completed);
    mistingTasks = tasks.filter(task => task.type === "misting" && !task.completed);
    fertilizingTasks = tasks.filter(task => task.type === "fertilizing" && !task.completed);
    otherTasks = tasks.filter(task => 
      !["watering", "misting", "fertilizing"].includes(task.type) && !task.completed
    );
    completedTasks = [];
    forgottenTasks = [];
  } else {
    // Past date - show completed and forgotten tasks
    completedTasks = tasks.filter(task => task.completed);
    forgottenTasks = tasks.filter(task => !task.completed); // These are forgotten since they're past due
    
    wateringTasks = completedTasks.filter(task => task.type === "watering");
    mistingTasks = completedTasks.filter(task => task.type === "misting");
    fertilizingTasks = completedTasks.filter(task => task.type === "fertilizing");
    otherTasks = completedTasks.filter(task => 
      !["watering", "misting", "fertilizing"].includes(task.type)
    );
  }
  
  return {
    wateringTasks,
    mistingTasks,
    fertilizingTasks,
    otherTasks,
    completedTasks,
    forgottenTasks,
    totalTasks: tasks.length,
    isToday,
    isPastDate,
    isLoading
  };
}
