"use client"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button";
import { t, Lang } from "@/lib/i18n";
 
export function SignOut({language}: { language: Lang }) {
    return (
        <Button
            variant="destructive"
            className="w-full"
            onClick={() => signOut()}
        >
            {t(language, "signOut")}
        </Button>
    );
}