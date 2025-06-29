import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertGoogleUser } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to check if a user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "plant-care-app-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (
          !user ||
          !user.password ||
          !(await comparePasswords(password, user.password))
        ) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Get the correct callback URL for this Replit environment
    const getCallbackURL = () => {
      // Use the actual Replit domain
      // if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      //   return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/auth/google/callback`;
      // }
      // Fallback for local development
      return "https://planties.replit.app/auth/google/callback";
    };

    const callbackURL = getCallbackURL();
    console.log("Google OAuth callback URL configured as:", callbackURL);

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL,
          scope: ["profile", "email"],
        } as any,
        async (
          accessToken: string,
          refreshToken: string,
          profile: Profile,
          done: any,
        ) => {
          try {
            // Check if user already exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              // Check if user exists with the same email
              const email =
                profile.emails && profile.emails[0]
                  ? profile.emails[0].value
                  : null;
              if (email) {
                user = await storage.getUserByEmail(email);
              }

              if (!user) {
                // Create new user from Google profile
                const username =
                  profile.displayName.toLowerCase().replace(/\s+/g, "_") +
                  "_" +
                  profile.id.substring(0, 5);

                user = await storage.createGoogleUser({
                  username,
                  email: email,
                  googleId: profile.id,
                  displayName: profile.displayName,
                  profilePicture:
                    profile.photos && profile.photos[0]
                      ? profile.photos[0].value
                      : null,
                });
              } else {
                // Update existing user with Google info
                user = await storage.updateUser(user.id, {
                  googleId: profile.id,
                  profilePicture:
                    profile.photos && profile.photos[0]
                      ? profile.photos[0].value
                      : null,
                });
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        },
      ),
    );
  } else {
    console.warn(
      "Google OAuth credentials not configured. Google login will not be available.",
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ message: "An error occurred during registration" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: SelectUser | false,
        info: { message: string },
      ) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);

        req.login(user, (err: Error | null) => {
          if (err) return next(err);
          // Don't send the password back to the client
          const { password, ...userWithoutPassword } = user as SelectUser;
          return res.status(200).json(userWithoutPassword);
        });
      },
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });
    // Don't send the password back to the client
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // Google OAuth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/auth/google", (req, res, next) => {
      console.log(
        `Google OAuth initiated from: ${req.protocol}://${req.get("host")}`,
      );
      passport.authenticate("google")(req, res, next);
    });

    app.get(
      "/auth/google/callback",
      (req: Request, res: Response, next: NextFunction) => {
        console.log(
          `Google OAuth callback received at: ${req.protocol}://${req.get("host")}${req.originalUrl}`,
        );
        console.log("Query params:", req.query);
        console.log("Headers:", {
          "user-agent": req.headers["user-agent"],
          referer: req.headers.referer,
          "x-forwarded-proto": req.headers["x-forwarded-proto"],
          "x-forwarded-host": req.headers["x-forwarded-host"],
        });
        next();
      },
      passport.authenticate("google", {
        failureRedirect: "/auth?error=google-auth-failed",
        successRedirect: "/",
      }),
      (err: any, req: any, res: any, next: any) => {
        console.error("Google OAuth callback error:", err);
        res
          .status(400)
          .json({ error: "OAuth authentication failed", details: err.message });
      },
    );
  }

  // Change password endpoint
  app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // Get the user with their password
      const user = await storage.getUser(userId);

      if (!user || !user.password) {
        return res.status(400).json({
          message: "Cannot change password for accounts without a password",
        });
      }

      // Check if the current password is correct
      const isCurrentPasswordValid = await comparePasswords(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Hash the new password and update the user
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
}
