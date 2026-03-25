import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

function buildExercisePrompt(input: any): string {
  const langName = input.language === "en" ? "English" : "Arabic";
  const levelDesc =
    input.level === "beginner"
      ? "very simple, using common words"
      : input.level === "intermediate"
        ? "moderate difficulty, using everyday vocabulary"
        : "challenging, using more advanced vocabulary";

  let typeDescription = "";
  if (input.type === "quiz") {
    typeDescription = `Create ${input.count} multiple-choice quiz questions about ${input.topic}. Each question should have 4 options (A, B, C, D) with one correct answer.`;
  } else if (input.type === "fillInBlank") {
    typeDescription = `Create ${input.count} fill-in-the-blank exercises about ${input.topic}. Each should have a sentence with one blank and a list of word options.`;
  } else if (input.type === "matching") {
    typeDescription = `Create ${input.count} matching exercises about ${input.topic}. Each should have a list of words/phrases and their definitions/translations to match.`;
  }

  return `Generate ${input.count} ${input.type} exercises for young language learners (ages 5-10) learning ${langName}. Topic: ${input.topic}. Difficulty: ${levelDesc}. ${typeDescription}. Return as JSON with exercises array.`;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Student management
  students: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getStudentsByTeacher(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getStudent(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          age: z.number().optional(),
          level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
          nativeLanguage: z.enum(["en", "ar", "other"]).default("other"),
          pin: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createStudent({
          teacherId: ctx.user.id,
          ...input,
        })
      ),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        })
      )
      .mutation(({ input }) =>
        db.updateStudent(input.id, input)
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStudent(input.id)),
  }),

  // Exercise management
  exercises: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getExercisesByTeacher(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getExercise(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["quiz", "fillInBlank", "matching"]),
          language: z.enum(["en", "ar"]),
          level: z.enum(["beginner", "intermediate", "advanced"]),
          topic: z.string().optional(),
          title: z.string().min(1),
          description: z.string().optional(),
          content: z.string(),
          estimatedTimeSeconds: z.number().optional(),
          isGenerated: z.number().default(0),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createExercise({
          teacherId: ctx.user.id,
          ...input,
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteExercise(input.id)),
  }),

  // Exercise generation using AI
  generation: router({
    generateExercises: protectedProcedure
      .input(
        z.object({
          type: z.enum(["quiz", "fillInBlank", "matching"]),
          language: z.enum(["en", "ar"]),
          level: z.enum(["beginner", "intermediate", "advanced"]),
          topic: z.string(),
          count: z.number().min(1).max(10).default(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = buildExercisePrompt(input);

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert language teacher creating practice exercises for young learners (ages 5-10). Generate exercises in valid JSON format only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        });

        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        const exercises = JSON.parse(content);

        // Save generated exercises to database
        const savedExercises = [];
        for (const exercise of exercises.exercises || []) {
          const id = await db.createExercise({
            teacherId: ctx.user.id,
            type: input.type as any,
            language: input.language as any,
            level: input.level as any,
            topic: input.topic,
            title: exercise.title || `${input.topic} - ${input.type}`,
            description: exercise.description,
            content: JSON.stringify(exercise),
            isGenerated: 1,
          });
          savedExercises.push({ id, ...exercise });
        }

        return savedExercises;
      }),
  }),

  // Results and progress tracking
  results: router({
    submit: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          exerciseId: z.number(),
          exerciseType: z.enum(["quiz", "fillInBlank", "matching"]),
          language: z.enum(["en", "ar"]),
          level: z.enum(["beginner", "intermediate", "advanced"]),
          score: z.number(),
          maxScore: z.number(),
          accuracy: z.string(),
          timeSpentSeconds: z.number().optional(),
          answers: z.string().optional(),
          feedback: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const resultId = await db.createResult(input);

        // Update student progress
        const progress = await db.getStudentProgress(input.studentId);
        if (progress) {
          const newAccuracy = parseFloat(input.accuracy);
          const totalExercises = progress.totalExercisesCompleted + 1;
          const newAverageAccuracy =
            (parseFloat(progress.averageAccuracy.toString()) * progress.totalExercisesCompleted +
              newAccuracy) /
            totalExercises;

          await db.updateStudentProgress(input.studentId, {
            totalExercisesCompleted: totalExercises,
            totalPoints: progress.totalPoints + input.score,
            averageAccuracy: newAverageAccuracy.toString(),
          });
        }

        return resultId;
      }),
    getStudentResults: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getResultsByStudent(input.studentId)),
  }),

  // Analytics
  analytics: router({
    getTeacherAnalytics: protectedProcedure.query(({ ctx }) =>
      db.getTeacherAnalytics(ctx.user.id)
    ),
  }),
});

export type AppRouter = typeof appRouter;
