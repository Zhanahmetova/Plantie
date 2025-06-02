import { pgTable, serial, varchar, text, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }),
  email: varchar("email", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  profilePicture: varchar("profile_picture", { length: 500 }),
  fcmToken: varchar("fcm_token", { length: 255 }),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertGoogleUserSchema = createInsertSchema(users).pick({
  email: true,
  googleId: true,
  displayName: true,
  profilePicture: true,
}).extend({
  username: z.string().min(1),
});

// Plants table
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 255 }).notNull(),
  family: varchar("family", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  image: varchar("image", { length: 500 }).notNull(),
  wateringFrequency: integer("watering_frequency").notNull(),
  lastWatered: timestamp("last_watered"),
  lastFertilized: timestamp("last_fertilized"),
  light: varchar("light", { length: 50 }).notNull(),
  temperature: json("temperature").$type<{ min: number; max: number }>().notNull(),
  humidity: varchar("humidity", { length: 50 }).notNull(),
  notes: text("notes"),
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  plantId: integer("plant_id").notNull().references(() => plants.id),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  repeat: json("repeat").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Weather preferences table
export const weatherPreferences = pgTable("weather_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  location: varchar("location", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 10 }).notNull().default("celsius"),
});

export const insertWeatherPreferenceSchema = createInsertSchema(weatherPreferences).omit({
  id: true,
});

// Plant identifications table
export const plantIdentifications = pgTable("plant_identifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  image: text("image").notNull(),
  identifiedName: varchar("identified_name", { length: 255 }),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlantIdentificationSchema = createInsertSchema(plantIdentifications).omit({
  id: true,
  createdAt: true,
});

// Plant records table
export const plantRecords = pgTable("plant_records", {
  id: serial("id").primaryKey(),
  image: text("image").notNull(),
  note: text("note"),
  plantId: integer("plant_id"),
  userId: integer("user_id").notNull(),
  recordDate: timestamp("record_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  plantId: integer("plant_id").references(() => plants.id),
  taskId: integer("task_id").references(() => tasks.id),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Plant health scans table
export const plantHealthScans = pgTable("plant_health_scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  plantId: integer("plant_id").references(() => plants.id),
  imageUrl: varchar("image_url").notNull(),
  overallHealth: varchar("overall_health").notNull(),
  healthScore: integer("health_score").notNull(),
  identifiedPlantName: varchar("identified_plant_name"),
  identifiedPlantSpecies: varchar("identified_plant_species"),
  identificationConfidence: integer("identification_confidence"),
  issues: json("issues").notNull().$type<{
    type: "disease" | "pest" | "nutrient" | "watering" | "light";
    severity: "low" | "medium" | "high";
    name: string;
    description: string;
    treatment: string;
    confidence: number;
  }[]>(),
  recommendations: json("recommendations").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlantHealthScanSchema = createInsertSchema(plantHealthScans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Custom date validation schema
const dateSchema = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof String) {
    return new Date(val as string);
  }
  return val;
}, z.date());

// Replace the standard date schema in the record schema
export const insertPlantRecordSchema = createInsertSchema(plantRecords, {
  recordDate: () => dateSchema.optional().default(() => new Date())
}).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGoogleUser = z.infer<typeof insertGoogleUserSchema>;

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

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PlantHealthScan = typeof plantHealthScans.$inferSelect;
export type InsertPlantHealthScan = z.infer<typeof insertPlantHealthScanSchema>;

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
  notifications: many(notifications),
  plantHealthScans: many(plantHealthScans),
}));

// Plant relations
export const plantsRelations = relations(plants, ({ many, one }) => ({
  user: one(users, {
    fields: [plants.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  records: many(plantRecords, { relationName: "plantRecords" }),
  healthScans: many(plantHealthScans),
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

// Weather preference relations
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

// Plant record relations
export const plantRecordsRelations = relations(plantRecords, ({ one }) => ({
  user: one(users, {
    fields: [plantRecords.userId],
    references: [users.id],
  }),
  plant: one(plants, {
    fields: [plantRecords.plantId],
    references: [plants.id],
    relationName: "plantRecords",
  }),
}));

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [notifications.taskId],
    references: [tasks.id],
  }),
  plant: one(plants, {
    fields: [notifications.plantId],
    references: [plants.id],
  }),
}));

// Plant health scan relations
export const plantHealthScansRelations = relations(plantHealthScans, ({ one }) => ({
  user: one(users, {
    fields: [plantHealthScans.userId],
    references: [users.id],
  }),
  plant: one(plants, {
    fields: [plantHealthScans.plantId],
    references: [plants.id],
  }),
}));