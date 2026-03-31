"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
    const { signOut } = useClerk();

    return (
        <Button
            size="sm"
            variant="tertiary"
            onClick={() => void signOut({ redirectUrl: "/sign-in" })}
        >
            Log out
        </Button>
    );
}