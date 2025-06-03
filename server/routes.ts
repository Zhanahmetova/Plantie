import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlantSchema, 
  insertTaskSchema, 
  insertWeatherPreferenceSchema, 
  insertPlantIdentificationSchema,
  insertPlantRecordSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { Request, Response, NextFunction } from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Serve service worker with correct MIME type
  app.get('/firebase-messaging-sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(process.cwd(), 'public', 'firebase-messaging-sw.js'));
  });

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
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/:id', ensureAuthenticated, async (req, res) => {
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
        return res.status(403).json({ message: 'Not authorized to view this task' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: 'Failed to fetch task' });
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

  // Weather API
  app.get('/api/weather', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const preferences = await storage.getWeatherPreferenceByUserId(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: 'Weather preferences not found' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Weather service not configured' });
      }

      // Call OpenWeather API
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(preferences.location)}&appid=${apiKey}&units=${preferences.unit}`;
      
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        return res.status(400).json({ message: 'Failed to fetch weather data' });
      }
      
      const weatherData = await weatherResponse.json();
      
      // Transform the data to match our interface
      const transformedData = {
        location: weatherData.name,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        high: Math.round(weatherData.main.temp_max),
        low: Math.round(weatherData.main.temp_min),
        humidity: weatherData.main.humidity,
        unit: preferences.unit
      };
      
      res.json(transformedData);
    } catch (error) {
      console.error('Weather API error:', error);
      res.status(500).json({ message: 'Failed to fetch weather data' });
    }
  });

  // Weather by coordinates
  app.post('/api/weather/coordinates', ensureAuthenticated, async (req, res) => {
    try {
      const { lat, lon, unit = 'metric' } = req.body;
      
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Weather service not configured' });
      }

      // Call OpenWeather API with coordinates
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
      
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        return res.status(400).json({ message: 'Failed to fetch weather data' });
      }
      
      const weatherData = await weatherResponse.json();
      
      // Get location name and save preferences
      const locationName = `${weatherData.name}, ${weatherData.sys.country}`;
      const userId = req.user!.id;
      
      // Update or create weather preferences
      const existingPreferences = await storage.getWeatherPreferenceByUserId(userId);
      if (existingPreferences) {
        await storage.updateWeatherPreference(userId, { location: locationName, unit });
      } else {
        await storage.createWeatherPreference({ userId, location: locationName, unit });
      }
      
      // Transform the data to match our interface
      const transformedData = {
        location: locationName,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        high: Math.round(weatherData.main.temp_max),
        low: Math.round(weatherData.main.temp_min),
        humidity: weatherData.main.humidity,
        unit
      };
      
      res.json(transformedData);
    } catch (error) {
      console.error('Weather coordinates API error:', error);
      res.status(500).json({ message: 'Failed to fetch weather data' });
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

  // Notification routes
  app.get("/api/notifications", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId
      });

      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const success = await storage.markNotificationAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ message: success ? "All notifications marked as read" : "No notifications to mark" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const success = await storage.deleteNotification(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.get("/api/notifications/unread-count", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      res.status(500).json({ message: "Failed to fetch unread notifications count" });
    }
  });

  // FCM Token management for push notifications
  app.post("/api/notifications/fcm-token", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      const { token } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!token) {
        return res.status(400).json({ message: "FCM token is required" });
      }

      const success = await storage.updateFcmToken(userId, token);
      if (success) {
        res.json({ message: "Push notifications enabled successfully" });
      } else {
        res.status(500).json({ message: "Failed to enable push notifications" });
      }
    } catch (error) {
      console.error("Error updating FCM token:", error);
      res.status(500).json({ message: "Failed to enable push notifications" });
    }
  });

  // Plant health scan endpoints
  app.get("/api/plant-health-scans", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const scans = await storage.getPlantHealthScansByUserId(userId);
      
      // Map database fields to frontend expected format for all scans
      const mappedScans = scans.map(scan => ({
        id: scan.id,
        userId: scan.userId,
        plantId: scan.plantId,
        image: scan.imageUrl,
        overallHealth: scan.overallHealth,
        healthScore: scan.healthScore,
        issues: scan.issues,
        recommendations: scan.recommendations,
        identifiedName: scan.identifiedName,
        identifiedSpecies: scan.identifiedSpecies,
        identificationConfidence: scan.identificationConfidence,
        allSpeciesSuggestions: scan.allSpeciesSuggestions,
        isPlantProbability: scan.isPlantProbability,
        plantIdRawResponse: scan.plantIdRawResponse,
        createdAt: scan.createdAt,
        updatedAt: scan.updatedAt,
      }));
      
      res.json(mappedScans);
    } catch (error) {
      console.error("Error fetching plant health scans:", error);
      res.status(500).json({ message: "Failed to fetch plant health scans" });
    }
  });

  app.post("/api/plant-health-scans", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { image, plantId } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Debug logging to see what image data we're receiving
      console.log('Received image data length:', image.length);
      console.log('Image data preview:', image.substring(0, 100) + '...');
      console.log('Image starts with data URL:', image.startsWith('data:'));

      // Perform plant identification and health analysis
      const { identifyPlant, analyzePlantHealth } = await import('./plant-analysis');
      
      const identificationResult = await identifyPlant(image);
      console.log('Identification result:', JSON.stringify(identificationResult, null, 2));
      
      // Extract detailed Plant.ID data from the full response BEFORE health analysis
      const plantIdResponse = identificationResult?.fullResponse;
      let allSpeciesSuggestions = null;
      let isPlantProbability = null;

      if (plantIdResponse) {
        console.log('Processing Plant.ID response data...');
        // Extract is_plant probability
        const plantProb = plantIdResponse.is_plant?.probability || 0;
        isPlantProbability = Math.round(plantProb * 100);
        console.log('Plant probability:', plantProb, 'as percentage:', isPlantProbability);
        
        // Check if is_plant probability is too low (90% or less)
        if (plantProb <= 0.9) {
          console.log('Not a plant - probability too low:', plantProb);
          return res.status(400).json({ 
            message: "this is not a plant",
            isPlantProbability: isPlantProbability
          });
        }
        
        // Extract all species suggestions with similar images
        if (plantIdResponse.suggestions && plantIdResponse.suggestions.length > 0) {
          console.log('Processing species suggestions...');
          allSpeciesSuggestions = plantIdResponse.suggestions.map((suggestion: any) => ({
            name: suggestion.plant_name || "Unknown",
            scientificName: suggestion.plant_details?.scientific_name || suggestion.plant_name || "Unknown",
            probability: Math.round((suggestion.probability || 0) * 100),
            similarImages: suggestion.similar_images ? suggestion.similar_images.map((img: any) => img.url) : []
          }));
          console.log('Species suggestions processed:', allSpeciesSuggestions.length);
        }
      }

      const healthResult = await analyzePlantHealth(image, identificationResult);

      // Create plant health scan record
      const scanData = {
        userId,
        plantId: plantId || null,
        imageUrl: image,
        overallHealth: healthResult.overallHealth,
        healthScore: healthResult.healthScore,
        issues: healthResult.issues,
        recommendations: healthResult.recommendations,
        identifiedName: identificationResult?.name || null,
        identifiedSpecies: identificationResult?.species || null,
        identificationConfidence: Math.round((identificationResult?.confidence || 0) * 100),
        allSpeciesSuggestions,
        isPlantProbability,
        plantIdRawResponse: plantIdResponse,
      };

      console.log('Scan data being saved:', {
        identifiedName: scanData.identifiedName,
        identifiedSpecies: scanData.identifiedSpecies,
        identificationConfidence: scanData.identificationConfidence,
        allSpeciesSuggestions: scanData.allSpeciesSuggestions ? scanData.allSpeciesSuggestions.length : 'null',
        isPlantProbability: scanData.isPlantProbability,
        hasRawResponse: !!scanData.plantIdRawResponse
      });

      const scan = await storage.createPlantHealthScan(scanData);
      console.log('Scan saved with ID:', scan.id);
      res.status(201).json(scan);
    } catch (error) {
      console.error("Error creating plant health scan:", error);
      res.status(500).json({ message: "Failed to analyze plant health" });
    }
  });

  app.get("/api/plant-health-scans/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const scanId = parseInt(req.params.id);
      
      const scan = await storage.getPlantHealthScan(scanId);
      if (!scan || scan.userId !== userId) {
        return res.status(404).json({ message: "Plant health scan not found" });
      }
      
      // Map database fields to frontend expected format
      const mappedScan = {
        id: scan.id,
        userId: scan.userId,
        plantId: scan.plantId,
        image: scan.imageUrl,
        overallHealth: scan.overallHealth,
        healthScore: scan.healthScore,
        issues: scan.issues,
        recommendations: scan.recommendations,
        identifiedName: scan.identifiedName,
        identifiedSpecies: scan.identifiedSpecies,
        identificationConfidence: scan.identificationConfidence,
        allSpeciesSuggestions: scan.allSpeciesSuggestions,
        isPlantProbability: scan.isPlantProbability,
        plantIdRawResponse: scan.plantIdRawResponse,
        createdAt: scan.createdAt,
        updatedAt: scan.updatedAt,
      };
      
      res.json(mappedScan);
    } catch (error) {
      console.error("Error fetching plant health scan:", error);
      res.status(500).json({ message: "Failed to fetch plant health scan" });
    }
  });

  app.get("/api/plants/:plantId/health-scans", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const plantId = parseInt(req.params.plantId);
      
      // Verify plant belongs to user
      const plant = await storage.getPlant(plantId);
      if (!plant || plant.userId !== userId) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      const scans = await storage.getPlantHealthScansByPlantId(plantId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching plant health scans:", error);
      res.status(500).json({ message: "Failed to fetch plant health scans" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
