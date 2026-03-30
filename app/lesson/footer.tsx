import { CheckCircle, XCircle } from "lucide-react";
import { useKey, useMedia } from "react-use";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterProps = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    footer.classList.remove("animate-pulse-once");
    void footer.offsetHeight;
    footer.classList.add("animate-pulse-once");
  }, [status]);

  return (
    <>
      <style>{`
        @keyframes pulseOnce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.012); }
          60%  { transform: scale(0.996); }
          100% { transform: scale(1); }
        }

        .animate-pulse-once {
          animation: pulseOnce 0.35s ease-out forwards;
        }
      `}</style>

      <footer
        ref={footerRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 h-[100px] border-t-2 lg:h-[140px]",
          status === "none" && "border-transparent bg-background",
          status === "correct" && "border-transparent bg-green-100",
          status === "wrong" && "border-transparent bg-rose-100"
        )}
      >
        <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
          {status === "correct" && (
            <div className="flex items-center text-base font-bold text-green-500 lg:text-2xl">
              <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
              Nicely done!
            </div>
          )}

          {status === "wrong" && (
            <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
              <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
              Try again.
            </div>
          )}

          {status === "completed" && (
            <Button
              variant="default"
              size={isMobile ? "sm" : "lg"}
              onClick={() => (window.location.href = `/lesson/${lessonId}`)}
            >
              Practice again
            </Button>
          )}

          <Button
            disabled={disabled}
            aria-disabled={disabled}
            className="ml-auto"
            onClick={onCheck}
            size={isMobile ? "sm" : "lg"}
            variant={status === "wrong" ? "danger" : "secondary"}
          >
            {status === "none" && "Check"}
            {status === "correct" && "Next"}
            {status === "wrong" && "Retry"}
            {status === "completed" && "Continue"}
          </Button>
        </div>
      </footer>
    </>
  );
};