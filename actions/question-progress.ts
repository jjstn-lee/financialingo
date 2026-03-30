"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { questionProgress, questions } from "@/db/schema";

export const upsertQuestionProgress = async (questionId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");

  const question = await db.query.questions.findFirst({
    where: eq(questions.id, questionId),
  });

  if (!question) throw new Error("Question not found.");

  const lessonId = question.lessonId;

  const existingQuestionProgress = await db.query.questionProgress.findFirst({
    where: and(
      eq(questionProgress.userId, userId),
      eq(questionProgress.questionId, questionId)
    ),
  });

  if (existingQuestionProgress) {
    await db
      .update(questionProgress)
      .set({
        completed: true,
      })
      .where(
        and(
          eq(questionProgress.userId, userId),
          eq(questionProgress.questionId, questionId)
        )
      );
  } else {
    await db.insert(questionProgress).values({
      questionId,
      userId,
      completed: true,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/lesson");
  revalidatePath(`/lesson/${lessonId}`);
};
