import { redirect } from "next/navigation";

import { getLesson } from "@/db/queries";

import { Quiz } from "./quiz";

const LessonPage = async () => {
  const lessonData = getLesson();
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

export default LessonPage;
