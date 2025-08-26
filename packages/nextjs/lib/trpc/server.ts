import { TRPCError, initTRPC } from "@trpc/server";
import { eq, exists, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "~~/lib/db";
import { studentCertificate, students } from "~~/lib/schema";

export const createTRPCContext = async () => {
  const session = await getServerSession();

  return {
    db,
    session,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

const protectedProcedure = t.procedure.use(isAuthenticated);

const createStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  phoneNumber: z.string().optional(),
});

const getByStudentIdSchema = z.object({
  studentId: z.string().min(9, "Student ID must be 9 characters").max(9, "Student ID must be 9 characters"),
});

const createCertificateSchema = z.object({
  studentId: z.string(),
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  issueDate: z.string(),
  documentHash: z.string().optional(),
});

export const appRouter = t.router({
  students: t.router({
    checkUser: protectedProcedure.query(async ({ ctx }) => {
      const email = ctx.session.user!.email!;

      const result = await ctx.db.select().from(students).where(eq(students.email, email)).limit(1);

      const userExists = result.length > 0;
      const userData = userExists ? result[0] : null;

      return {
        exists: userExists,
        user: userData,
      };
    }),

    createOrUpdate: protectedProcedure.input(createStudentSchema).mutation(async ({ ctx, input }) => {
      const email = ctx.session.user!.email!;
      const name = ctx.session.user!.name || "";
      const profileImage = ctx.session.user!.image || "";
      const userData = {
        email,
        fullName: name,
        id: crypto.randomUUID(),
        studentId: input.studentId,
        phoneNumber: input.phoneNumber || null,
        profileImage,
        createdAt: String(new Date()),
        updatedAt: String(new Date()),
      };

      try {
        const existing = await ctx.db.select().from(students).where(eq(students.email, email)).limit(1);

        let result;

        if (existing.length > 0) {
          result = await ctx.db
            .update(students)
            .set({
              id: input.studentId,
              updatedAt: String(new Date()),
            })
            .where(eq(students.email, email))
            .returning();
        } else {
          result = await ctx.db.insert(students).values(userData).returning();
        }

        return {
          success: true,
          user: result[0],
        };
      } catch (error) {
        console.error("Database error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save student data",
        });
      }
    }),

    getProfile: protectedProcedure.query(async ({ ctx, input }) => {
      const email = ctx.session.user!.email!;

      const result = await ctx.db.select().from(students).where(eq(students.email, email)).limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student profile not found",
        });
      }

      return result[0];
    }),

    getByStudentId: protectedProcedure.input(getByStudentIdSchema).query(async ({ ctx, input }) => {
      const result = await ctx.db.select().from(students).where(eq(students.studentId, input.studentId)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    }),
  }),

  certificates: t.router({
    create: protectedProcedure.input(createCertificateSchema).mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db
          .insert(studentCertificate)
          .values({
            studentId: input.studentId,
            institution: input.institution,
            degree: input.degree,
            fieldOfStudy: input.fieldOfStudy,
            issueDate: input.issueDate,
            documentHash: input.documentHash || null,
            createdAt: String(new Date()),
            updatedAt: String(new Date()),
          })
          .returning();

        return {
          success: true,
          certificate: result[0],
        };
      } catch (error) {
        console.error("Database error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save certificate data",
        });
      }
    }),

    getCertificateByStudentId: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(studentCertificate)
        .where(eq(studentCertificate.studentId, input.studentId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    }),

    getCertificatesByInstitution: protectedProcedure.input(z.object({ institution: z.string() })).query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(studentCertificate)
        .where(eq(studentCertificate.institution, input.institution));

      return result;
    }),

    getCertificatesByStudent: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(studentCertificate)
        .where(eq(studentCertificate.studentId, input.studentId));

      return result;
    }),
  }),

  institutions: t.router({
    getInstitutionStats: protectedProcedure.input(z.object({ institution: z.string() })).query(async ({ ctx, input }) => {
      const certificateCount = await ctx.db
        .select({ count: sql`count(*)` })
        .from(studentCertificate)
        .where(eq(studentCertificate.institution, input.institution));

      const studentCount = await ctx.db
        .select({ count: sql`count(*)` })
        .from(students);

      return {
        issuedCertificates: certificateCount[0].count,
        activeStudents: studentCount[0].count,
      };
    }),

    getStudents: protectedProcedure.query(async ({ ctx }) => {
      const result = await ctx.db.select().from(students);
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;
