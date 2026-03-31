"use client";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type LessonPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson:
    | {
        id: number;
        title: string;
        questionCount: number;
        percentage: number;
        locked?: boolean;
        current?: boolean;
        description?: string;
      }
    | null;
};

export default function LessonPreviewDialog({
  open,
  onOpenChange,
  lesson,
}: LessonPreviewDialogProps) {
  const isLocked = !!lesson?.locked;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{lesson?.title ?? "Lesson"}</h2>
          {lesson?.description ? (
            <p className="mt-1 text-sm text-foreground/70">{lesson.description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="rounded-lg border px-3 py-2">
            <div className="font-semibold">{lesson?.questionCount ?? 0}</div>
            <div className="text-foreground/60">Questions</div>
          </div>
          <div className="rounded-lg border px-3 py-2">
            <div className="font-semibold">{lesson?.percentage ?? 0}%</div>
            <div className="text-foreground/60">Progress</div>
          </div>
          {isLocked ? (
            <div className="rounded-lg border px-3 py-2 text-duo-red">
              <div className="font-semibold">Locked</div>
              <div className="text-foreground/60">Complete previous lesson</div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {lesson ? (
            <Link
              href={`/lesson/${lesson.id}`}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                } else {
                  onOpenChange(false);
                }
              }}
            >
              <Button variant="secondary" disabled={isLocked}>
                Start
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" disabled>
              Start
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
