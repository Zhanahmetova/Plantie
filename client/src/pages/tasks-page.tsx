import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Plus, Edit, Trash2, CheckCircle, Circle } from "lucide-react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { usePlants } from "@/hooks/use-plants";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

const TasksPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: plants = [] } = usePlants();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const getPlantName = (plantId: number) => {
    const plant = plants.find(p => p.id === plantId);
    return plant?.name || 'Unknown Plant';
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return '💧';
      case 'misting':
        return '🌫️';
      case 'fertilizing':
        return '🌱';
      default:
        return '📋';
    }
  };

  const getTaskTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'watering':
        return 'bg-blue-100 text-blue-800';
      case 'misting':
        return 'bg-cyan-100 text-cyan-800';
      case 'fertilizing':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRepeatText = (repeat: any) => {
    if (!repeat) return 'One time';
    
    switch (repeat.type) {
      case 'oneTime':
        return 'One time';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly (${repeat.daysOfWeek?.join(', ') || 'No days set'})`;
      case 'everyNDays':
        return `Every ${repeat.interval || 1} days`;
      default:
        return 'Unknown';
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        completed: !task.completed,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <PageHeader 
          title="Tasks"
        />
        <p className="text-sm text-muted-foreground mb-4">{filteredTasks.length} tasks</p>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({tasks.filter(t => !t.completed).length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({tasks.filter(t => t.completed).length})
          </Button>
        </div>

        {/* Add Task Button */}
        <Button 
          onClick={() => navigate('/tasks/new')}
          className="w-full mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
        >
          <Plus className="mr-2" size={18} />
          Add New Task
        </Button>

        {/* Tasks List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate('/tasks/new')}
            >
              <Plus className="mr-2" size={16} />
              Add First Task
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className={`p-4 ${task.completed ? 'opacity-75' : ''}`}>
                <div className="flex items-start gap-3">
                  {/* Completion checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 flex-shrink-0"
                    disabled={updateTask.isPending}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-green-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Task header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTaskTypeIcon(task.type)}</span>
                      <Badge className={getTaskTypeBadgeColor(task.type)}>
                        {task.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        for {getPlantName(task.plantId)}
                      </span>
                    </div>

                    {/* Task details */}
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Start Date:</span>{' '}
                        {format(new Date(task.startDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Repeat:</span>{' '}
                        {getRepeatText(task.repeat)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deleteTask.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TasksPage;