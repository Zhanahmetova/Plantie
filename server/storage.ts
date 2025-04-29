import { 
  users, type User, type InsertUser,
  plants, type Plant, type InsertPlant,
  tasks, type Task, type InsertTask,
  weatherPreferences, type WeatherPreference, type InsertWeatherPreference,
  plantIdentifications, type PlantIdentification, type InsertPlantIdentification,
  plantRecords, type PlantRecord, type InsertPlantRecord
} from "@shared/schema";

import session from "express-session";
import { Store } from "express-session";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Plant operations
  getPlant(id: number): Promise<Plant | undefined>;
  getPlantsByUserId(userId: number): Promise<Plant[]>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<Plant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTasksByPlantId(plantId: number): Promise<Task[]>;
  getTasksDueToday(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Weather preferences operations
  getWeatherPreferenceByUserId(userId: number): Promise<WeatherPreference | undefined>;
  createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference>;
  updateWeatherPreference(userId: number, preference: Partial<WeatherPreference>): Promise<WeatherPreference | undefined>;

  // Plant identification operations
  createPlantIdentification(identification: InsertPlantIdentification): Promise<PlantIdentification>;
  getPlantIdentificationsByUserId(userId: number): Promise<PlantIdentification[]>;
  updatePlantIdentification(id: number, data: Partial<PlantIdentification>): Promise<PlantIdentification | undefined>;
  
  // Plant record operations
  getPlantRecord(id: number): Promise<PlantRecord | undefined>;
  getPlantRecordsByUserId(userId: number): Promise<PlantRecord[]>;
  getPlantRecordsByPlantId(plantId: number): Promise<PlantRecord[]>;
  createPlantRecord(record: InsertPlantRecord): Promise<PlantRecord>;
  updatePlantRecord(id: number, record: Partial<PlantRecord>): Promise<PlantRecord | undefined>;
  deletePlantRecord(id: number): Promise<boolean>;

  // Session management
  sessionStore: Store;
}

import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plants: Map<number, Plant>;
  private tasks: Map<number, Task>;
  private weatherPreferences: Map<number, WeatherPreference>;
  private plantIdentifications: Map<number, PlantIdentification>;
  private plantRecords: Map<number, PlantRecord>;
  public sessionStore: Store;
  
  private currentUserId: number;
  private currentPlantId: number;
  private currentTaskId: number;
  private currentWeatherPreferenceId: number;
  private currentPlantIdentificationId: number;
  private currentPlantRecordId: number;

  constructor() {
    this.users = new Map();
    this.plants = new Map();
    this.tasks = new Map();
    this.weatherPreferences = new Map();
    this.plantIdentifications = new Map();
    this.plantRecords = new Map();
    
    this.currentUserId = 1;
    this.currentPlantId = 1;
    this.currentTaskId = 1;
    this.currentWeatherPreferenceId = 1;
    this.currentPlantIdentificationId = 1;
    this.currentPlantRecordId = 1;

    // Initialize session store (memory store)
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }) as Store;

    // Add sample user
    this.createUser({ 
      username: "demo", 
      password: "password" 
    });

    // Add some default plants and tasks for demo user
    this.seedDemoData(1);
  }

  private seedDemoData(userId: number): void {
    // Add sample plants for demo
    const plant1 = this.createPlant({
      name: "Monstera",
      species: "Monstera deliciosa",
      family: "Araceae",
      category: "indoor",
      image: "/images/monstera.svg", 
      wateringFrequency: 7,
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastFertilized: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      light: "medium",
      temperature: { min: 18, max: 27 },
      humidity: "medium",
      notes: "Beautiful monstera plant",
      userId: userId
    });

    const plant2 = this.createPlant({
      name: "Ferns",
      species: "Nephrolepis exaltata",
      family: "Nephrolepidaceae",
      category: "indoor",
      image: "/images/fern.svg",
      wateringFrequency: 5,
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastFertilized: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      light: "low",
      temperature: { min: 18, max: 24 },
      humidity: "high",
      notes: "Requires high humidity",
      userId: userId
    });

    const plant3 = this.createPlant({
      name: "Snake plant",
      species: "Sansevieria trifasciata",
      family: "Asparagaceae",
      category: "indoor",
      image: "/images/snake-plant.svg",
      wateringFrequency: 14,
      lastWatered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastFertilized: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      light: "low",
      temperature: { min: 18, max: 27 },
      humidity: "low",
      notes: "Very low maintenance plant",
      userId: userId
    });

    const plant4 = this.createPlant({
      name: "Coin Plant",
      species: "Pilea peperomioides",
      family: "Urticaceae",
      category: "indoor",
      image: "/images/coin-plant.svg",
      wateringFrequency: 7,
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastFertilized: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      light: "medium",
      temperature: { min: 18, max: 25 },
      humidity: "medium",
      notes: "Also known as Chinese money plant",
      userId: userId
    });

    // Create watering tasks
    for (let i = 1; i <= 4; i++) {
      this.createTask({
        type: "watering",
        plantId: i,
        completed: Math.random() > 0.5,
        dueDate: new Date(Date.now() + (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)),
        userId: userId
      });
    }

    // Create misting tasks
    for (let i = 1; i <= 3; i++) {
      this.createTask({
        type: "misting",
        plantId: i,
        completed: Math.random() > 0.5,
        dueDate: new Date(Date.now() + (Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)),
        userId: userId
      });
    }

    // Create fertilizing task
    this.createTask({
      type: "fertilizing",
      plantId: 1,
      completed: false,
      dueDate: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
      userId: userId
    });

    // Set default weather preference
    this.createWeatherPreference({
      userId: userId,
      location: "London",
      unit: "metric"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Plant operations
  async getPlant(id: number): Promise<Plant | undefined> {
    return this.plants.get(id);
  }

  async getPlantsByUserId(userId: number): Promise<Plant[]> {
    return Array.from(this.plants.values()).filter(
      (plant) => plant.userId === userId
    );
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const id = this.currentPlantId++;
    const newPlant: Plant = { ...plant, id };
    this.plants.set(id, newPlant);
    return newPlant;
  }

  async updatePlant(id: number, plantUpdate: Partial<Plant>): Promise<Plant | undefined> {
    const plant = this.plants.get(id);
    if (!plant) return undefined;
    
    const updatedPlant = { ...plant, ...plantUpdate };
    this.plants.set(id, updatedPlant);
    return updatedPlant;
  }

  async deletePlant(id: number): Promise<boolean> {
    return this.plants.delete(id);
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTasksByPlantId(plantId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.plantId === plantId
    );
  }

  async getTasksDueToday(userId: number): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.tasks.values()).filter(
      (task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return task.userId === userId && 
               taskDate >= today && 
               taskDate < tomorrow &&
               !task.completed;
      }
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Weather preferences operations
  async getWeatherPreferenceByUserId(userId: number): Promise<WeatherPreference | undefined> {
    return Array.from(this.weatherPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }

  async createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference> {
    const id = this.currentWeatherPreferenceId++;
    const newPreference: WeatherPreference = { ...preference, id };
    this.weatherPreferences.set(id, newPreference);
    return newPreference;
  }

  async updateWeatherPreference(userId: number, update: Partial<WeatherPreference>): Promise<WeatherPreference | undefined> {
    const preference = Array.from(this.weatherPreferences.values()).find(
      (pref) => pref.userId === userId
    );
    
    if (!preference) return undefined;
    
    const updatedPreference = { ...preference, ...update };
    this.weatherPreferences.set(preference.id, updatedPreference);
    return updatedPreference;
  }

  // Plant identification operations
  async createPlantIdentification(identification: InsertPlantIdentification): Promise<PlantIdentification> {
    const id = this.currentPlantIdentificationId++;
    const newIdentification: PlantIdentification = { 
      ...identification, 
      id, 
      identifiedName: null,
      identifiedSpecies: null,
      confidenceScore: null,
      createdAt: new Date()
    };
    this.plantIdentifications.set(id, newIdentification);
    return newIdentification;
  }

  async getPlantIdentificationsByUserId(userId: number): Promise<PlantIdentification[]> {
    return Array.from(this.plantIdentifications.values()).filter(
      (identification) => identification.userId === userId
    );
  }

  async updatePlantIdentification(id: number, update: Partial<PlantIdentification>): Promise<PlantIdentification | undefined> {
    const identification = this.plantIdentifications.get(id);
    if (!identification) return undefined;
    
    const updatedIdentification = { ...identification, ...update };
    this.plantIdentifications.set(id, updatedIdentification);
    return updatedIdentification;
  }
  
  // Plant record operations
  async getPlantRecord(id: number): Promise<PlantRecord | undefined> {
    return this.plantRecords.get(id);
  }

  async getPlantRecordsByUserId(userId: number): Promise<PlantRecord[]> {
    return Array.from(this.plantRecords.values()).filter(
      (record) => record.userId === userId
    );
  }

  async getPlantRecordsByPlantId(plantId: number): Promise<PlantRecord[]> {
    return Array.from(this.plantRecords.values()).filter(
      (record) => record.plantId === plantId
    );
  }

  async createPlantRecord(record: InsertPlantRecord): Promise<PlantRecord> {
    const id = this.currentPlantRecordId++;
    const newRecord: PlantRecord = { 
      ...record, 
      id,
      recordDate: record.recordDate || new Date(),
      createdAt: new Date()
    };
    this.plantRecords.set(id, newRecord);
    return newRecord;
  }

  async updatePlantRecord(id: number, recordUpdate: Partial<PlantRecord>): Promise<PlantRecord | undefined> {
    const record = this.plantRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { ...record, ...recordUpdate };
    this.plantRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deletePlantRecord(id: number): Promise<boolean> {
    return this.plantRecords.delete(id);
  }
}

// Import the database storage
import { DatabaseStorage } from './database-storage';

// Export database storage instance
export const storage = new DatabaseStorage();
