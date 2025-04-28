import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

// PlantRecord table
export const plantRecords = pgTable("plant_records", {
  id: serial("id").primaryKey(),
  image: text("image").notNull(),
  note: text("note"),
  plantId: integer("plant_id"),
  userId: integer("user_id").notNull(),
  recordDate: timestamp("record_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlantRecordSchema = createInsertSchema(plantRecords).omit({
  id: true,
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

export type PlantRecord = typeof plantRecords.$inferSelect;
export type InsertPlantRecord = z.infer<typeof insertPlantRecordSchema>;

// Relations

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  plants: many(plants),
  tasks: many(tasks),
  weatherPreference: one(weatherPreferences, {
    fields: [users.id],
    references: [weatherPreferences.userId],
  }),
  plantIdentifications: many(plantIdentifications),
  plantRecords: many(plantRecords),
}));

// Plant relations
export const plantsRelations = relations(plants, ({ many, one }) => ({
  user: one(users, {
    fields: [plants.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  records: many(plantRecords, { relationName: "plantRecords" }),
}));

// Task relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  plant: one(plants, {
    fields: [tasks.plantId],
    references: [plants.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

// Weather preferences relations
export const weatherPreferencesRelations = relations(weatherPreferences, ({ one }) => ({
  user: one(users, {
    fields: [weatherPreferences.userId],
    references: [users.id],
  }),
}));

// Plant identification relations
export const plantIdentificationsRelations = relations(plantIdentifications, ({ one }) => ({
  user: one(users, {
    fields: [plantIdentifications.userId],
    references: [users.id],
  }),
}));
