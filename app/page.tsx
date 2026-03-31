import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-green-600">Financialingo</h1>
        <p className="mt-3 text-muted-foreground">Learn money language, one lesson at a time.</p>
        <Button asChild size="lg" variant="primary" className="mt-8">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
