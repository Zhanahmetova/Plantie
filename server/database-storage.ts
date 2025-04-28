import { eq, and, gte, lt } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  plants, 
  tasks, 
  weatherPreferences, 
  plantIdentifications,
  type User, 
  type InsertUser, 
  type Plant, 
  type InsertPlant, 
  type Task, 
  type InsertTask, 
  type WeatherPreference, 
  type InsertWeatherPreference, 
  type PlantIdentification, 
  type InsertPlantIdentification 
} from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Plant operations
  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant;
  }

  async getPlantsByUserId(userId: number): Promise<Plant[]> {
    return await db.select().from(plants).where(eq(plants.userId, userId));
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values(plant).returning();
    return newPlant;
  }

  async updatePlant(id: number, plantUpdate: Partial<Plant>): Promise<Plant | undefined> {
    const [updatedPlant] = await db
      .update(plants)
      .set(plantUpdate)
      .where(eq(plants.id, id))
      .returning();
    
    return updatedPlant;
  }

  async deletePlant(id: number): Promise<boolean> {
    const [deletedPlant] = await db
      .delete(plants)
      .where(eq(plants.id, id))
      .returning();
      
    return !!deletedPlant;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTasksByPlantId(plantId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.plantId, plantId));
  }

  async getTasksDueToday(userId: number): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, false),
          gte(tasks.dueDate, today),
          lt(tasks.dueDate, tomorrow)
        )
      );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
      
    return !!deletedTask;
  }

  // Weather preferences operations
  async getWeatherPreferenceByUserId(userId: number): Promise<WeatherPreference | undefined> {
    const [pref] = await db
      .select()
      .from(weatherPreferences)
      .where(eq(weatherPreferences.userId, userId));
      
    return pref;
  }

  async createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference> {
    const [newPref] = await db
      .insert(weatherPreferences)
      .values(preference)
      .returning();
      
    return newPref;
  }

  async updateWeatherPreference(userId: number, update: Partial<WeatherPreference>): Promise<WeatherPreference | undefined> {
    const [updatedPref] = await db
      .update(weatherPreferences)
      .set(update)
      .where(eq(weatherPreferences.userId, userId))
      .returning();
    
    return updatedPref;
  }

  // Plant identification operations
  async createPlantIdentification(identification: InsertPlantIdentification): Promise<PlantIdentification> {
    const [newIdentification] = await db
      .insert(plantIdentifications)
      .values({
        ...identification,
        identifiedName: null,
        identifiedSpecies: null,
        confidenceScore: null,
        createdAt: new Date()
      })
      .returning();
      
    return newIdentification;
  }

  async getPlantIdentificationsByUserId(userId: number): Promise<PlantIdentification[]> {
    return await db
      .select()
      .from(plantIdentifications)
      .where(eq(plantIdentifications.userId, userId));
  }

  async updatePlantIdentification(id: number, update: Partial<PlantIdentification>): Promise<PlantIdentification | undefined> {
    const [updatedIdentification] = await db
      .update(plantIdentifications)
      .set(update)
      .where(eq(plantIdentifications.id, id))
      .returning();
    
    return updatedIdentification;
  }
}