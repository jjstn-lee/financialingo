import { getDashboardLessons } from "@/actions/dashboard";
import { getUnits, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";

import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const userProgress = await getUserProgress();

  if (!userProgress?.activeCourseId) {
    redirect("/courses");
  }

  const lessons = await getDashboardLessons();
  const activeCourseTitle = userProgress.activeCourse?.title || "My Site";

  const units = await getUnits();
  const currentUnit = units.find((unit) =>
    unit.lessons.some((lesson) => {
      if (lesson.questions.length === 0) return true;

      return lesson.questions.some((question) => {
        return (
          !question.questionProgress ||
          question.questionProgress.length === 0 ||
          question.questionProgress.some((progress) => !progress.completed)
        );
      });
    })
  );
  // current course, unit, and lesson on nav bar
  const currentUnitOrder = currentUnit?.order;
  const activeUnitTitle = currentUnit
    ? `Unit ${currentUnitOrder}: ${currentUnit.title}`
    : units[0]
      ? `Unit ${units[0].order}: ${units[0].title}`
      : "Unit";
  const activeLessonTitle =
    lessons.find((lesson) => lesson.current)?.title ?? lessons[0]?.title ?? "Unknown Lesson";

  return (
    <DashboardClient
      lessons={lessons}
      activeCourseTitle={activeCourseTitle}
      activeUnitTitle={activeUnitTitle}
      activeLessonTitle={activeLessonTitle}
    />
  );
}