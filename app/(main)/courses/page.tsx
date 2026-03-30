import { upsertUserProgress } from "@/actions/user-progress";
import { getCourses, getUserProgress } from "@/db/queries";

export default async function CoursesPage() {
  const [courses, userProgress] = await Promise.all([
    getCourses(),
    getUserProgress(),
  ]);

  return (
    <div className="min-h-screen w-full bg-background px-6 py-10">
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