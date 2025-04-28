import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Plant table
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  family: text("family").notNull(),
  category: text("category").notNull(), // indoor, outdoor
  image: text("image").notNull(),
  wateringFrequency: integer("watering_frequency").notNull(), // days between watering
  lastWatered: timestamp("last_watered"), 
  lastFertilized: timestamp("last_fertilized"),
  light: text("light").notNull(), // low, medium, high
  temperature: json("temperature").$type<{min: number, max: number}>().notNull(),
  humidity: text("humidity").notNull(), // low, medium, high
  notes: text("notes"),
  userId: integer("user_id").notNull(),
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
});

// Task table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // watering, misting, fertilizing, etc.
  plantId: integer("plant_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Weather Preference table
export const weatherPreferences = pgTable("weather_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  location: text("location").notNull(),
  unit: text("unit").notNull().default("metric"), // metric or imperial
});

export const insertWeatherPreferenceSchema = createInsertSchema(weatherPreferences).omit({
  id: true,
});

// PlantIdentification table
export const plantIdentifications = pgTable("plant_identifications", {
  id: serial("id").primaryKey(),
  image: text("image").notNull(),
  identifiedName: text("identified_name"),
  identifiedSpecies: text("identified_species"),
  confidenceScore: integer("confidence_score"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlantIdentificationSchema = createInsertSchema(plantIdentifications).omit({
  id: true,
  identifiedName: true,
  identifiedSpecies: true,
  confidenceScore: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type WeatherPreference = typeof weatherPreferences.$inferSelect;
export type InsertWeatherPreference = z.infer<typeof insertWeatherPreferenceSchema>;

export type PlantIdentification = typeof plantIdentifications.$inferSelect;
export type InsertPlantIdentification = z.infer<typeof insertPlantIdentificationSchema>;
