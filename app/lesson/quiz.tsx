"use client";

import { useState, useTransition } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useAudio, useWindowSize } from "react-use";
import { toast } from "sonner";

import { upsertQuestionProgress } from "@/actions/question-progress";
import { questions } from "@/db/schema";

import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { Header } from "./header";

type QuizProps = {
  initialPercentage: number;
  initialLessonId: number;
  initialLessonQuestions: (typeof questions.$inferSelect & {
    completed: boolean;
  })[];
};

export const Quiz = ({
  initialPercentage,
  initialLessonId,
  initialLessonQuestions,
}: QuizProps) => {
  const parseChoices = (choices: string): string[] => {
    try {
      const parsed = JSON.parse(choices);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((choice): choice is string => typeof choice === "string");
    } catch {
      return [];
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [finishAudio] = useAudio({
    src: "/finish.mp3",
    autoPlay: true,
  });
  const { width, height } = useWindowSize();

  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lessonId] = useState(initialLessonId);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [questionsData] = useState(initialLessonQuestions);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = questionsData.findIndex(
      (question) => !question.completed
    );

    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<string>();
  const [status, setStatus] = useState<"none" | "wrong" | "correct">("none");

  const question = questionsData[activeIndex];
  const options = question ? parseChoices(question.choices) : [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (choice: string) => {
    if (status !== "none") return;

    setSelectedOption(choice);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (question.answer === selectedOption) {
      startTransition(() => {
        upsertQuestionProgress(question.id)
          .then(() => {
            void correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / questionsData.length);
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    } else {
      void incorrectControls.play();
      setStatus("wrong");
    }
  };

  if (!question) {
    return (
      <>
        {finishAudio}
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />

          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={100}
            width={100}
          />

          <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>

        </div>

        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/dashboard")}
        />
      </>
    );
  }

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header percentage={percentage} />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-foreground lg:text-start lg:text-3xl">
              {question.question}
            </h1>

            <div>
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
