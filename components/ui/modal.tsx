"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({ open, onOpenChange, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || !contentRef.current) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    contentRef.current.focus();
    return () => {
      if (previouslyFocused) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onOpenChange(false);
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        ref={contentRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 max-h-[80vh] w-[92vw] max-w-md overflow-auto rounded-2xl border-2 border-foreground/10 bg-background p-6 shadow-xl outline-none",
          className
        )}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
