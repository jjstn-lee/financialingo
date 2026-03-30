import { cache } from "react";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import db from "./drizzle";
import {
  courses,
  lessons,
  units,
  userProgress,
  questionProgress,
} from "./schema";

// const DAY_IN_MS = 86_400_000;

// Server page fetches getCourses() + getUserProgress().
// Clicking a course calls upsertUserProgress(courseId) server action:
// Inserts user_progress if first time, or updates active course if existing user.
// Redirects to /learn.

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany({
    orderBy: (courses, { asc }) => [asc(courses.id)],
  });

  return data;
});

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();
  if (!userId || !userProgress?.activeCourseId) return [];

  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    orderBy: (units, { asc }) => [asc(units.order)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          questions: {                              // was: questions
            orderBy: (questions, { asc }) => [asc(questions.order)],
            with: {
              questionProgress: {                   // was: questionProgress
                where: eq(questionProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.questions.length === 0)            // was: lesson.questions
        return { ...lesson, completed: false };

      const allCompletedquestions = lesson.questions.every((question) => {  // was: question
        return (
          question.questionProgress &&              // was: question.questionProgress
          question.questionProgress.length > 0 &&
          question.questionProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedquestions };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return null;

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          questions: {
            with: {
              questionProgress: {
                where: eq(questionProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.questions.some((question) => {
        return (
          !question.questionProgress ||
          question.questionProgress.length === 0 ||
          question.questionProgress.some((progress) => !progress.completed)
        );
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();

  if (!userId) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      questions: {
        orderBy: (questions, { asc }) => [asc(questions.order)],
        with: {
          questionProgress: {
            where: eq(questionProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.questions) return null;

  const normalizedquestions = data.questions.map((question) => {
    const completed =
      question.questionProgress &&
      question.questionProgress.length > 0 &&
      question.questionProgress.every((progress) => progress.completed);

    return { ...question, completed };
  });

  return { ...data, questions: normalizedquestions };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress?.activeLessonId);

  if (!lesson) return 0;

  const completedquestions = lesson.questions.filter(
    (question) => question.completed
  );

  const percentage = Math.round(
    (completedquestions.length / lesson.questions.length) * 100
  );

  return percentage;
});

// export const getTopTenUsers = cache(async () => {
//   const { userId } = await auth();

//   if (!userId) return [];

//   const data = await db.query.userProgress.findMany({
//     orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
//     limit: 10,
//     columns: {
//       userId: true,
//       userName: true,
//       userImageSrc: true,
//       points: true,
//     },
//   });

//   return data;
// });
