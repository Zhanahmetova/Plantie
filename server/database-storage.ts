import { eq, and, gte, lt, desc } from 'drizzle-orm';
import { db } from './db';
import { pool } from './db';
import session from 'express-session';
import { Store } from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { 
  users, 
  plants, 
  tasks, 
  weatherPreferences, 
  plantIdentifications,
  plantRecords,
  notifications,
  plantHealthScans,
  type User, 
  type InsertUser,
  type InsertGoogleUser,
  type Plant, 
  type InsertPlant, 
  type Task, 
  type InsertTask, 
  type WeatherPreference, 
  type InsertWeatherPreference, 
  type PlantIdentification, 
  type InsertPlantIdentification,
  type PlantRecord,
  type InsertPlantRecord,
  type Notification,
  type InsertNotification,
  type PlantHealthScan,
  type InsertPlantHealthScan
} from '@shared/schema';
import { IStorage } from './storage';

const PostgresSessionStore = connectPgSimple(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async createGoogleUser(insertUser: InsertGoogleUser): Promise<User> {
    // Ensure password is explicitly null for Google users
    const userWithNullPassword = {
      ...insertUser,
      password: null
    };
    const [user] = await db.insert(users).values(userWithNullPassword).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async updateFcmToken(userId: number, token: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ fcmToken: token })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error("Error updating FCM token:", error);
      return false;
    }
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

  // Plant record operations
  async getPlantRecord(id: number): Promise<PlantRecord | undefined> {
    const [record] = await db
      .select()
      .from(plantRecords)
      .where(eq(plantRecords.id, id));
      
    return record;
  }

  async getPlantRecordsByUserId(userId: number): Promise<PlantRecord[]> {
    return await db
      .select()
      .from(plantRecords)
      .where(eq(plantRecords.userId, userId));
  }

  async getPlantRecordsByPlantId(plantId: number): Promise<PlantRecord[]> {
    return await db
      .select()
      .from(plantRecords)
      .where(eq(plantRecords.plantId, plantId));
  }

  async createPlantRecord(record: InsertPlantRecord): Promise<PlantRecord> {
    const [newRecord] = await db
      .insert(plantRecords)
      .values({
        ...record,
        recordDate: record.recordDate || new Date(),
        createdAt: new Date()
      })
      .returning();
      
    return newRecord;
  }

  async updatePlantRecord(id: number, update: Partial<PlantRecord>): Promise<PlantRecord | undefined> {
    const [updatedRecord] = await db
      .update(plantRecords)
      .set(update)
      .where(eq(plantRecords.id, id))
      .returning();
    
    return updatedRecord;
  }

  async deletePlantRecord(id: number): Promise<boolean> {
    const [deletedRecord] = await db
      .delete(plantRecords)
      .where(eq(plantRecords.id, id))
      .returning();
      
    return !!deletedRecord;
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
      
    return !!updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning();
      
    return result.length > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const [deletedNotification] = await db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
      
    return !!deletedNotification;
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
      
    return result.length;
  }

  // Plant health scan operations
  async getPlantHealthScan(id: number): Promise<PlantHealthScan | undefined> {
    const [scan] = await db.select().from(plantHealthScans).where(eq(plantHealthScans.id, id));
    return scan || undefined;
  }

  async getPlantHealthScansByUserId(userId: number): Promise<PlantHealthScan[]> {
    return await db
      .select()
      .from(plantHealthScans)
      .where(eq(plantHealthScans.userId, userId))
      .orderBy(desc(plantHealthScans.createdAt));
  }

  async getPlantHealthScansByPlantId(plantId: number): Promise<PlantHealthScan[]> {
    return await db
      .select()
      .from(plantHealthScans)
      .where(eq(plantHealthScans.plantId, plantId))
      .orderBy(desc(plantHealthScans.createdAt));
  }

  async createPlantHealthScan(scan: InsertPlantHealthScan): Promise<PlantHealthScan> {
    const [newScan] = await db
      .insert(plantHealthScans)
      .values(scan)
      .returning();
    
    return newScan;
  }

  async updatePlantHealthScan(id: number, scanUpdate: Partial<PlantHealthScan>): Promise<PlantHealthScan | undefined> {
    const [updatedScan] = await db
      .update(plantHealthScans)
      .set(scanUpdate)
      .where(eq(plantHealthScans.id, id))
      .returning();
    
    return updatedScan;
  }

  async deletePlantHealthScan(id: number): Promise<boolean> {
    const [deletedScan] = await db
      .delete(plantHealthScans)
      .where(eq(plantHealthScans.id, id))
      .returning();
      
    return !!deletedScan;
  }
}