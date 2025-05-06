import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlantSchema, 
  insertTaskSchema, 
  insertWeatherPreferenceSchema, 
  insertPlantIdentificationSchema,
  insertPlantRecordSchema
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { Request, Response, NextFunction } from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Set up API routes
  
  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Auth check for ${req.method} ${req.url}, authenticated: ${req.isAuthenticated()}`);
    console.log(`User: ${req.user ? JSON.stringify(req.user) : 'None'}`);
    
    if (req.isAuthenticated()) {
      return next();
    }
    
    console.log('Authentication failed, returning 401');
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  // Plants API
  app.get('/api/plants', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plants = await storage.getPlantsByUserId(userId);
      res.json(plants);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch plants' });
    }
  });

  app.get('/api/plants/:id', ensureAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: 'Invalid plant ID' });
      }

      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }
      
      // Verify the plant belongs to the authenticated user
      if (plant.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to view this plant' });
      }
      
      res.json(plant);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch plant' });
    }
  });

  app.post('/api/plants', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsedData = insertPlantSchema.parse({
        ...req.body,
        userId
      });
      
      const plant = await storage.createPlant(parsedData);
      res.status(201).json(plant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid plant data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create plant' });
    }
  });

  app.put('/api/plants/:id', ensureAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: 'Invalid plant ID' });
      }

      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this plant' });
      }

      const updatedPlant = await storage.updatePlant(plantId, req.body);
      res.json(updatedPlant);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update plant' });
    }
  });

  app.delete('/api/plants/:id', ensureAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: 'Invalid plant ID' });
      }

      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this plant' });
      }

      await storage.deletePlant(plantId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete plant' });
    }
  });

  // Tasks API
  app.get('/api/tasks', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/today', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getTasksDueToday(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch today\'s tasks' });
    }
  });

  app.get('/api/plants/:id/tasks', ensureAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: 'Invalid plant ID' });
      }

      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view tasks for this plant' });
      }

      const tasks = await storage.getTasksByPlantId(plantId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks for plant' });
    }
  });

  app.post('/api/tasks', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsedData = insertTaskSchema.parse({
        ...req.body,
        userId
      });
      
      // Verify the plant exists and belongs to the user
      const plant = await storage.getPlant(parsedData.plantId);
      if (!plant || plant.userId !== userId) {
        return res.status(404).json({ message: 'Plant not found or not owned by user' });
      }

      const task = await storage.createTask(parsedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', ensureAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID' });
      }

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const userId = req.user!.id;
      if (task.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', ensureAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID' });
      }

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const userId = req.user!.id;
      if (task.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this task' });
      }

      await storage.deleteTask(taskId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // Weather preferences API
  app.get('/api/weather-preferences', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const preferences = await storage.getWeatherPreferenceByUserId(userId);
      if (!preferences) {
        return res.status(404).json({ message: 'Weather preferences not found' });
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weather preferences' });
    }
  });

  app.post('/api/weather-preferences', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      // Check if preferences already exist
      const existingPreferences = await storage.getWeatherPreferenceByUserId(userId);
      if (existingPreferences) {
        return res.status(409).json({ message: 'Weather preferences already exist. Use PUT to update.' });
      }
      
      const parsedData = insertWeatherPreferenceSchema.parse({
        ...req.body,
        userId
      });
      
      const preferences = await storage.createWeatherPreference(parsedData);
      res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid weather preference data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create weather preferences' });
    }
  });

  app.put('/api/weather-preferences', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const updatedPreferences = await storage.updateWeatherPreference(userId, req.body);
      
      if (!updatedPreferences) {
        return res.status(404).json({ message: 'Weather preferences not found' });
      }
      
      res.json(updatedPreferences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update weather preferences' });
    }
  });

  // Plant identification API
  app.post('/api/plant-identification', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsedData = insertPlantIdentificationSchema.parse({
        ...req.body,
        userId
      });
      
      const identification = await storage.createPlantIdentification(parsedData);
      
      // Simulate plant identification results
      // In a real app, this would call an external API
      setTimeout(async () => {
        const results = {
          identifiedName: "Snake Plant",
          identifiedSpecies: "Sansevieria trifasciata",
          confidenceScore: 92
        };
        
        await storage.updatePlantIdentification(identification.id, results);
      }, 2000);
      
      res.status(201).json(identification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid plant identification data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to submit plant for identification' });
    }
  });

  app.get('/api/plant-identification/:id', ensureAuthenticated, async (req, res) => {
    try {
      // Here you would have an endpoint to get the status/results of an identification
      res.json({ message: "Not implemented" });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get plant identification' });
    }
  });

  // Plant records API
  app.get('/api/records', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const records = await storage.getPlantRecordsByUserId(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch records' });
    }
  });

  app.get('/api/plants/:id/records', ensureAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: 'Invalid plant ID' });
      }

      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      // Log debugging information
      console.log(`Getting records for plant ID: ${plantId}, requested by user ID: ${req.user?.id}`);
      console.log(`Plant belongs to user ID: ${plant.userId}`);

      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view records for this plant' });
      }

      // Get all records for this plant
      const records = await storage.getPlantRecordsByPlantId(plantId);
      console.log(`Found ${records.length} records for plant ID ${plantId}`);
      
      res.json(records);
    } catch (error) {
      console.error('Error fetching plant records:', error);
      res.status(500).json({ message: 'Failed to fetch records for plant' });
    }
  });

  app.get('/api/records/:id', ensureAuthenticated, async (req, res) => {
    try {
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ message: 'Invalid record ID' });
      }

      const record = await storage.getPlantRecord(recordId);
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      const userId = req.user!.id;
      if (record.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this record' });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch record' });
    }
  });

  app.post('/api/records', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Log received data for debugging
      console.log('Record creation - received data:', JSON.stringify(req.body));
      
      // Prepare the data with special handling for dates
      const cleanedData = { ...req.body, userId };
      
      // Add default recordDate if not provided
      if (!cleanedData.recordDate) {
        cleanedData.recordDate = new Date();
      }
      
      // Special handling for recordDate if it's a string
      if (cleanedData.recordDate && typeof cleanedData.recordDate === 'string') {
        try {
          console.log('Converting string date to Date object:', cleanedData.recordDate);
          cleanedData.recordDate = new Date(cleanedData.recordDate);
          // Check if we got a valid date
          if (isNaN(cleanedData.recordDate.getTime())) {
            throw new Error('Invalid date format');
          }
          console.log('Converted date:', cleanedData.recordDate);
        } catch (err) {
          console.error('Date conversion error:', err);
          return res.status(400).json({ 
            message: 'Invalid date format', 
            errors: [{ path: ['recordDate'], message: 'Invalid date format' }] 
          });
        }
      }
      
      const parsedData = insertPlantRecordSchema.parse(cleanedData);
      
      // If plantId is provided, verify it exists and belongs to user
      if (parsedData.plantId) {
        const plant = await storage.getPlant(parsedData.plantId);
        if (!plant || plant.userId !== userId) {
          return res.status(404).json({ message: 'Plant not found or not owned by user' });
        }
      }

      const record = await storage.createPlantRecord(parsedData);
      res.status(201).json(record);
    } catch (error) {
      console.error('Record creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid record data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create record' });
    }
  });

  app.put('/api/records/:id', ensureAuthenticated, async (req, res) => {
    try {
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ message: 'Invalid record ID' });
      }

      const record = await storage.getPlantRecord(recordId);
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      const userId = req.user!.id;
      if (record.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this record' });
      }

      // If plantId is provided, verify it exists and belongs to user
      if (req.body.plantId) {
        const plant = await storage.getPlant(req.body.plantId);
        if (!plant || plant.userId !== userId) {
          return res.status(404).json({ message: 'Plant not found or not owned by user' });
        }
      }

      const updatedRecord = await storage.updatePlantRecord(recordId, req.body);
      res.json(updatedRecord);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update record' });
    }
  });

  app.delete('/api/records/:id', ensureAuthenticated, async (req, res) => {
    try {
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ message: 'Invalid record ID' });
      }

      const record = await storage.getPlantRecord(recordId);
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      const userId = req.user!.id;
      if (record.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this record' });
      }

      await storage.deletePlantRecord(recordId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete record' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
