"use client";

import React, { useEffect, useRef, useState } from "react";

import { type DashboardLessonItem } from "@/actions/dashboard";
import { LessonButton } from "@/components/lesson-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

type DashboardClientProps = {
  lessons: DashboardLessonItem[];
  activeCourseTitle: string;
  activeUnitTitle: string;
  activeLessonTitle: string;
};

export default function DashboardClient({
  lessons,
  activeCourseTitle,
  activeUnitTitle,
  activeLessonTitle,
}: DashboardClientProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const { signOut } = useClerk();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const animate = () => {
      velocityRef.current *= 0.85;
      if (Math.abs(velocityRef.current) > 0.5) {
        el.scrollLeft += velocityRef.current;
        rafRef.current = requestAnimationFrame(animate);
      } else {
        velocityRef.current = 0;
        rafRef.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = e.deltaY + e.deltaX;
      const delta = Math.sign(raw) * Math.min(Math.abs(raw), 50);
      velocityRef.current = delta;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-dvh w-screen overflow-hidden">
      <div
        className="fixed top-0 left-0 h-1 bg-blue-500 z-50"
        style={{ width: `${progress * 100}%` }}
      />

      <nav className="fixed top-0 left-0 w-full h-16 bg-black text-white flex items-center px-6 z-40">
        <div className="flex items-center min-w-0">
          <h1 className="text-lg font-bold">{activeCourseTitle}</h1>
          <span className="mx-2 text-neutral-400">/</span>
          <p className="text-sm text-neutral-300">{activeUnitTitle}</p>
          <span className="mx-2 text-neutral-500">/</span>
          <p className="truncate text-sm text-neutral-400">{activeLessonTitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/courses">
            <Button size="sm" variant="secondary">
              Back to Courses
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // Use Clerk signOut then navigate back to home
              void signOut({ redirectUrl: "/" });
            }}
          >
            Log out
          </Button>
        </div>
      </nav>

      <div
        ref={scrollRef}
        className="mt-16 flex items-center h-[calc(100dvh-4rem)] px-16 gap-6 overflow-x-auto overflow-y-hidden"
      >
        {lessons.length === 0 ? (
          <div className="mt-32 text-sm text-neutral-500">
            No lessons found for your active course yet.
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              percentage={lesson.percentage}
              current={lesson.current}
              locked={lesson.locked}
            />
          ))
        )}
      </div>
    </div>
  );
}
