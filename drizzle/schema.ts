import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Students table
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(), // Reference to users (teacher)
  name: varchar("name", { length: 255 }).notNull(),
  age: int("age"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"])
    .default("beginner")
    .notNull(),
  nativeLanguage: mysqlEnum("nativeLanguage", ["en", "ar", "other"])
    .default("other")
    .notNull(),
  pin: varchar("pin", { length: 10 }), // Simple PIN for student login
  totalExercisesCompleted: int("totalExercisesCompleted").default(0).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  lastActiveAt: timestamp("lastActiveAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Exercises table
export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(), // Teacher who created/assigned
  type: mysqlEnum("type", ["quiz", "fillInBlank", "matching"])
    .notNull(),
  language: mysqlEnum("language", ["en", "ar"]).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"])
    .notNull(),
  topic: varchar("topic", { length: 255 }), // e.g., "Animals", "Food", "Numbers"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // Stores exercise data as JSON string
  estimatedTimeSeconds: int("estimatedTimeSeconds").default(300), // 5 minutes default
  isGenerated: int("isGenerated").default(0), // 1 if AI-generated, 0 otherwise
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Exercise assignments (which exercises are assigned to which students)
export const exerciseAssignments = mysqlTable("exerciseAssignments", {
  id: int("id").autoincrement().primaryKey(),
  exerciseId: int("exerciseId").notNull(),
  studentId: int("studentId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  isCompleted: int("isCompleted").default(0).notNull(), // 1 if completed, 0 otherwise
});

// Results table (tracks student performance)
export const results = mysqlTable("results", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  exerciseType: mysqlEnum("exerciseType", ["quiz", "fillInBlank", "matching"])
    .notNull(),
  language: mysqlEnum("language", ["en", "ar"]).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"])
    .notNull(),
  score: int("score").notNull(), // Points earned
  maxScore: int("maxScore").notNull(), // Total possible points
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(), // Percentage (0-100)
  timeSpentSeconds: int("timeSpentSeconds"), // Time taken to complete
  answers: text("answers"), // Student's answers as JSON string
  feedback: text("feedback"), // Personalized feedback
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Student progress tracking (aggregated stats)
export const studentProgress = mysqlTable("studentProgress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().unique(),
  totalExercisesCompleted: int("totalExercisesCompleted").default(0).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  averageAccuracy: decimal("averageAccuracy", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  quizAccuracy: decimal("quizAccuracy", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  fillInBlankAccuracy: decimal("fillInBlankAccuracy", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  matchingAccuracy: decimal("matchingAccuracy", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  englishAccuracy: decimal("englishAccuracy", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  arabicAccuracy: decimal("arabicAccuracy", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Export types
export type Student = typeof students.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type ExerciseAssignment = typeof exerciseAssignments.$inferSelect;
export type Result = typeof results.$inferSelect;
export type StudentProgress = typeof studentProgress.$inferSelect;

export type InsertStudent = typeof students.$inferInsert;
export type InsertExercise = typeof exercises.$inferInsert;
export type InsertExerciseAssignment = typeof exerciseAssignments.$inferInsert;
export type InsertResult = typeof results.$inferInsert;
export type InsertStudentProgress = typeof studentProgress.$inferInsert;
