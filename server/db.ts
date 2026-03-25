import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, students, exercises, exerciseAssignments, results, studentProgress } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ STUDENT QUERIES ============

export async function createStudent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(students).values(data);
  const studentId = (result as any).insertId;

  // Create initial progress record
  if (studentId) {
    await db.insert(studentProgress).values({
      studentId: studentId as number,
      totalExercisesCompleted: 0,
      totalPoints: 0,
    });
  }

  return studentId;
}

export async function getStudent(studentId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId));

  return result[0] || null;
}

export async function getStudentsByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(students)
    .where(eq(students.teacherId, teacherId));
}

export async function updateStudent(studentId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(students).set(data).where(eq(students.id, studentId));
}

export async function deleteStudent(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related data
  await db.delete(exerciseAssignments).where(eq(exerciseAssignments.studentId, studentId));
  await db.delete(results).where(eq(results.studentId, studentId));
  await db.delete(studentProgress).where(eq(studentProgress.studentId, studentId));
  await db.delete(students).where(eq(students.id, studentId));
}

// ============ EXERCISE QUERIES ============

export async function createExercise(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(exercises).values(data);
  return (result as any).insertId;
}

export async function getExercise(exerciseId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId));

  return result[0] || null;
}

export async function getExercisesByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(exercises)
    .where(eq(exercises.teacherId, teacherId));
}

export async function getExercisesByFilters(filters: any) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(exercises.teacherId, filters.teacherId)];

  if (filters.type) {
    conditions.push(eq(exercises.type, filters.type as any));
  }
  if (filters.language) {
    conditions.push(eq(exercises.language, filters.language as any));
  }
  if (filters.level) {
    conditions.push(eq(exercises.level, filters.level as any));
  }

  return db
    .select()
    .from(exercises)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0]);
}

export async function updateExercise(exerciseId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(exercises).set(data).where(eq(exercises.id, exerciseId));
}

export async function deleteExercise(exerciseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related data
  await db.delete(exerciseAssignments).where(eq(exerciseAssignments.exerciseId, exerciseId));
  await db.delete(results).where(eq(results.exerciseId, exerciseId));
  await db.delete(exercises).where(eq(exercises.id, exerciseId));
}

// ============ EXERCISE ASSIGNMENT QUERIES ============

export async function assignExerciseToStudent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(exerciseAssignments).values(data);
  return (result as any).insertId;
}

export async function getAssignedExercisesForStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(exerciseAssignments)
    .where(eq(exerciseAssignments.studentId, studentId));
}

export async function completeExerciseAssignment(assignmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(exerciseAssignments)
    .set({ isCompleted: 1, completedAt: new Date() })
    .where(eq(exerciseAssignments.id, assignmentId));
}

// ============ RESULT QUERIES ============

export async function createResult(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(results).values(data);
  return (result as any).insertId;
}

export async function getResultsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(results)
    .where(eq(results.studentId, studentId))
    .orderBy(desc(results.createdAt));
}

export async function getResultsByExercise(exerciseId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(results)
    .where(eq(results.exerciseId, exerciseId));
}

// ============ STUDENT PROGRESS QUERIES ============

export async function getStudentProgress(studentId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(studentProgress)
    .where(eq(studentProgress.studentId, studentId));

  return result[0] || null;
}

export async function updateStudentProgress(studentId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(studentProgress)
    .set(data)
    .where(eq(studentProgress.studentId, studentId));
}

export async function getTeacherAnalytics(teacherId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get all students for this teacher
  const teacherStudents = await db
    .select()
    .from(students)
    .where(eq(students.teacherId, teacherId));

  // Get all results for these students
  const allResults = await db.select().from(results);
  const studentIds = teacherStudents.map((s) => s.id);
  const filteredResults = allResults.filter((r) => studentIds.includes(r.studentId));

  // Calculate aggregates
  const totalExercisesCompleted = filteredResults.length;
  const averageAccuracy =
    filteredResults.length > 0
      ? filteredResults.reduce((sum, r) => sum + parseFloat(r.accuracy.toString()), 0) /
        filteredResults.length
      : 0;

  const exerciseTypeStats = {
    quiz: filteredResults.filter((r) => r.exerciseType === "quiz"),
    fillInBlank: filteredResults.filter((r) => r.exerciseType === "fillInBlank"),
    matching: filteredResults.filter((r) => r.exerciseType === "matching"),
  };

  const languageStats = {
    english: filteredResults.filter((r) => r.language === "en"),
    arabic: filteredResults.filter((r) => r.language === "ar"),
  };

  return {
    totalStudents: teacherStudents.length,
    totalExercisesCompleted,
    averageAccuracy: Math.round(averageAccuracy * 100) / 100,
    exerciseTypeStats: {
      quiz: {
        count: exerciseTypeStats.quiz.length,
        avgAccuracy:
          exerciseTypeStats.quiz.length > 0
            ? Math.round(
                (exerciseTypeStats.quiz.reduce((sum, r) => sum + parseFloat(r.accuracy.toString()), 0) /
                  exerciseTypeStats.quiz.length) * 100
              ) / 100
            : 0,
      },
      fillInBlank: {
        count: exerciseTypeStats.fillInBlank.length,
        avgAccuracy:
          exerciseTypeStats.fillInBlank.length > 0
            ? Math.round(
                (exerciseTypeStats.fillInBlank.reduce((sum, r) => sum + parseFloat(r.accuracy.toString()), 0) /
                  exerciseTypeStats.fillInBlank.length) * 100
              ) / 100
            : 0,
      },
      matching: {
        count: exerciseTypeStats.matching.length,
        avgAccuracy:
          exerciseTypeStats.matching.length > 0
            ? Math.round(
                (exerciseTypeStats.matching.reduce((sum, r) => sum + parseFloat(r.accuracy.toString()), 0) /
                  exerciseTypeStats.matching.length) * 100
              ) / 100
            : 0,
      },
    },
    languageStats: {
      english: {
        count: languageStats.english.length,
        avgAccuracy:
          languageStats.english.length > 0
            ? Math.round(
                (languageStats.english.reduce((sum, r) => sum + parseFloat(r.accuracy.toString()), 0) /
                  languageStats.english.length) * 100
              ) / 100
            : 0,
      },
      arabic: {
        count: languageStats.arabic.length,
        avgAccuracy:
          languageStats.arabic.length > 0
            ? Math.round(
                (languageStats.arabic.reduce((sum, r) => sum + parseFloat(r.accuracy.toString()), 0) /
                  languageStats.arabic.length) * 100
              ) / 100
            : 0,
      },
    },
  };
}
