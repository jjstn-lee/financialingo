"use server";

import { auth } from "@clerk/nextjs/server";

import { getUnits, getUserProgress } from "@/db/queries";

export type DashboardLessonItem = {
  id: number;
  title: string;
  percentage: number;
  locked: boolean;
  current: boolean;
};

export type DashboardActiveCourse = {
  id: number;
  title: string;
  description: string;
};

export const getDashboardActiveCourse =
  async (): Promise<DashboardActiveCourse | null> => {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized.");

    const userProgress = await getUserProgress();

    if (!userProgress?.activeCourse) return null;

    return {
      id: userProgress.activeCourse.id,
      title: userProgress.activeCourse.title,
      description: userProgress.activeCourse.description,
    };
  };

export const getDashboardLessons = async (): Promise<DashboardLessonItem[]> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  const units = await getUnits();
  const orderedLessons = units.flatMap((unit) => unit.lessons);

  const lessonsWithProgress = orderedLessons.map((lesson) => {
    const questionCount = lesson.questions.length;
    const completedQuestionCount = lesson.questions.filter((question) => {
      return (
        question.questionProgress &&
        question.questionProgress.length > 0 &&
        question.questionProgress.every((progress) => progress.completed)
      );
    }).length;

    const percentage =
      questionCount === 0
        ? 0
        : Math.round((completedQuestionCount / questionCount) * 100);

    return {
      id: lesson.id,
      title: lesson.title,
      percentage,
    };
  });

  const firstIncompleteIndex = lessonsWithProgress.findIndex(
    (lesson) => lesson.percentage < 100
  );

  return lessonsWithProgress.map((lesson, index) => {
    const current = firstIncompleteIndex >= 0 && index === firstIncompleteIndex;
    const locked = firstIncompleteIndex >= 0 && index > firstIncompleteIndex;

    return {
      ...lesson,
      current,
      locked,
    };
  });
};
