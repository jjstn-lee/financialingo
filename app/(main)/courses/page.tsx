import { upsertUserProgress } from "@/actions/user-progress";
import { Button } from "@/components/ui/button";
import { getCourses, getUserProgress } from "@/db/queries";
import { Link } from "lucide-react";
import SignOutButton from "@/components/sign-out-button"; // 👈 import this

export default async function CoursesPage() {
  const [courses, userProgress] = await Promise.all([
    getCourses(),
    getUserProgress(),
  ]);

  return (
    <div className="min-h-screen w-full bg-background px-6 py-10 pt-24">
      <nav className="fixed top-0 left-0 w-full h-16 bg-black text-white flex items-center px-6 z-40">
        <div className="text-2xl font-extrabold tracking-wide text-duo-green-dark flex items-center min-w-0">Financialingo</div>
        <div className="ml-auto flex items-center gap-3">
          <SignOutButton /> {/* 👈 replace the old button */}
        </div>
      </nav>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Choose a course</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Select a course to continue your lessons.
        </p>

        {courses.length === 0 ? (
          <div className="mt-8 rounded-lg border border-foreground/10 bg-foreground/5 p-4 text-sm text-foreground/60">
            No courses are available yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {courses.map((course) => {
              const isActive = userProgress?.activeCourseId === course.id;

              return (
                <form
                  key={course.id}
                  action={upsertUserProgress.bind(null, course.id)}
                  className="rounded-lg border border-foreground/10 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {course.title}
                      </h2>
                      <p className="mt-1 text-sm text-foreground/60">
                        {course.description}
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="rounded-md bg-duo-green px-4 py-2 text-sm font-semibold text-white hover:bg-duo-green-dark"
                    >
                      {isActive ? "Continue" : "Select"}
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}