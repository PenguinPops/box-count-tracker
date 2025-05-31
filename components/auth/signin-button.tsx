// /components/auth/signin-button.tsx

"use client"
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignIn() {
    return (
        <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("credentials", { redirectTo: "/" })}
        >
        Sign in
        </Button>
    );
}