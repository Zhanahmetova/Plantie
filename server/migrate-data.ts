import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { 
  users, 
  plants, 
  tasks, 
  weatherPreferences, 
  plantRecords 
} from "@shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function migrateData() {
  console.log("Starting data migration...");

  try {
    // Add demo user
    const demoUserExists = await db.select().from(users).where(eq(users.username, "demo")).execute();
    
    if (demoUserExists.length === 0) {
      console.log("Creating demo user...");
      const [demoUser] = await db.insert(users).values({
        username: "demo",
        password: await hashPassword("password"),
      }).returning();
      
      // Add demo plants
      console.log("Creating demo plants...");
      const plant1 = await db.insert(plants).values({
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
        userId: demoUser.id
      }).returning();

      await db.insert(plants).values({
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
        userId: demoUser.id
      });

      await db.insert(plants).values({
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
        userId: demoUser.id
      });

      await db.insert(plants).values({
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
        userId: demoUser.id
      });

      // Get all plants for the user to create tasks
      const userPlants = await db.select().from(plants).where(eq(plants.userId, demoUser.id)).execute();
      
      // Add tasks
      console.log("Creating demo tasks...");
      for (const plant of userPlants) {
        // Watering task
        await db.insert(tasks).values({
          type: "watering",
          plantId: plant.id,
          completed: Math.random() > 0.5,
          dueDate: new Date(Date.now() + (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)),
          userId: demoUser.id
        });

        // Misting task for some plants
        if (Math.random() > 0.5) {
          await db.insert(tasks).values({
            type: "misting",
            plantId: plant.id,
            completed: Math.random() > 0.5,
            dueDate: new Date(Date.now() + (Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)),
            userId: demoUser.id
          });
        }
      }

      // Fertilizing task for the first plant
      if (userPlants.length > 0) {
        await db.insert(tasks).values({
          type: "fertilizing",
          plantId: userPlants[0].id,
          completed: false,
          dueDate: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
          userId: demoUser.id
        });
      }

      // Add weather preference
      console.log("Creating demo weather preference...");
      await db.insert(weatherPreferences).values({
        userId: demoUser.id,
        location: "London",
        unit: "metric"
      });

      console.log("Data migration completed successfully!");
    } else {
      console.log("Demo user already exists. Skipping data migration.");
    }

  } catch (error) {
    console.error("Error during data migration:", error);
  }
}

// Run the migration
migrateData();