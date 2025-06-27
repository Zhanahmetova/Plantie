import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateTask } from "@/hooks/use-tasks";
import { usePlants } from "@/hooks/use-plants";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

const EditTaskPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { data: plants = [] } = usePlants();
  const updateTask = useUpdateTask();
  
  // Get task ID from URL
  const taskId = parseInt(window.location.pathname.split('/')[2]);
  
  // Fetch the task data
  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ['/api/tasks', taskId],
    queryFn: () => apiRequest(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  });

  const [formData, setFormData] = useState({
    plantId: '',
    type: '',
    startDate: '',
    repeatType: 'oneTime',
    interval: 3,
    daysOfWeek: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when task is loaded
  useEffect(() => {
    if (task) {
      const repeat = task.repeat as any;
      setFormData({
        plantId: task.plantId.toString(),
        type: task.type,
        startDate: format(new Date(task.startDate), 'yyyy-MM-dd'),
        repeatType: repeat?.type || 'oneTime',
        interval: repeat?.interval || 3,
        daysOfWeek: repeat?.daysOfWeek || [],
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plantId || !formData.type || !taskId) return;

    setIsSubmitting(true);
    try {
      const repeat = {
        type: formData.repeatType as 'oneTime' | 'daily' | 'everyNDays' | 'weekly',
        ...(formData.repeatType === 'everyNDays' && { interval: formData.interval }),
        ...(formData.repeatType === 'weekly' && { daysOfWeek: formData.daysOfWeek }),
      };

      await updateTask.mutateAsync({
        id: taskId,
        plantId: parseInt(formData.plantId),
        type: formData.type as 'watering' | 'misting' | 'fertilizing',
        startDate: formData.startDate, // Send as YYYY-MM-DD format
        repeat,
      });

      navigate('/tasks');
    } catch (error) {
      console.error('Failed to update task:', error);
      setIsSubmitting(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (isLoading) {
    return (
      <MainLayout hideNavigation>
        <div className="p-4">
          <PageHeader title="Edit Task" showBackButton onBackClick={() => navigate('/tasks')} />
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout hideNavigation>
        <div className="p-4">
          <PageHeader title="Edit Task" showBackButton onBackClick={() => navigate('/tasks')} />
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Task not found</p>
            <Button className="mt-4" onClick={() => navigate('/tasks')}>
              Back to Tasks
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideNavigation>
      <div className="p-4 space-y-4">
        <PageHeader 
          title="Edit Task" 
          showBackButton 
          onBackClick={() => navigate('/tasks')}
        />

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plant Selection */}
            <div className="space-y-2">
              <Label htmlFor="plant">Plant *</Label>
              <Select 
                value={formData.plantId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, plantId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plant" />
                </SelectTrigger>
                <SelectContent>
                  {plants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id.toString()}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Task Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="watering">💧 Watering</SelectItem>
                  <SelectItem value="misting">🌫️ Misting</SelectItem>
                  <SelectItem value="fertilizing">🌱 Fertilizing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            {/* Repeat Options */}
            <div className="space-y-4">
              <Label>Repeat</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="oneTime"
                    name="repeatType"
                    value="oneTime"
                    checked={formData.repeatType === 'oneTime'}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatType: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="oneTime" className="font-normal">One time only</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="daily"
                    name="repeatType"
                    value="daily"
                    checked={formData.repeatType === 'daily'}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatType: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="daily" className="font-normal">Daily</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="everyNDays"
                    name="repeatType"
                    value="everyNDays"
                    checked={formData.repeatType === 'everyNDays'}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatType: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="everyNDays" className="font-normal">Every</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.interval}
                    onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                    className="w-16"
                    disabled={formData.repeatType !== 'everyNDays'}
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="weekly"
                      name="repeatType"
                      value="weekly"
                      checked={formData.repeatType === 'weekly'}
                      onChange={(e) => setFormData(prev => ({ ...prev, repeatType: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="weekly" className="font-normal">Weekly on:</Label>
                  </div>
                  
                  {formData.repeatType === 'weekly' && (
                    <div className="flex flex-wrap gap-2 ml-6">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-1">
                          <Checkbox
                            id={day}
                            checked={formData.daysOfWeek.includes(day)}
                            onCheckedChange={() => handleDayToggle(day)}
                          />
                          <Label htmlFor={day} className="text-sm font-normal">{day}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.plantId || !formData.type}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
              >
                {isSubmitting ? 'Updating...' : 'Update Task'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EditTaskPage;