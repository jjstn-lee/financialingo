import { redirect } from "next/navigation";

import { getLesson } from "@/db/queries";

import { Quiz } from "../quiz";

type LessonIdPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

const LessonIdPage = async ({ params }: LessonIdPageProps) => {
  const { lessonId } = await params;

  const lessonData = getLesson(Number(lessonId));
  const [lesson] = await Promise.all([lessonData]);

  if (!lesson) return redirect("/dashboard");

  const initialPercentage =
    (lesson.questions.filter((question) => question.completed).length /
      lesson.questions.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonQuestions={lesson.questions}
      initialPercentage={initialPercentage}
    />
  );
};

export default LessonIdPage;
