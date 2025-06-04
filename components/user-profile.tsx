// user-profile.tsx - Updated Client Component
"use client"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { t, Lang } from "@/lib/i18n"

export function UserProfile({ 
    name, 
    language, 
    isMobileMenuOpen = false 
}: { 
    name: string; 
    language: Lang;
    isMobileMenuOpen?: boolean;
}) {
    return (
        <div className="flex items-center w-max justify-end space-x-2 ml-4">
            <div className="flex items-center space-x-2 group">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center transition-colors">
                    <User className="h-4 w-4 text-gray-600 transition-colors" />
                </div>
                <span className={`text-sm font-medium transition-colors cursor-default ${
                    isMobileMenuOpen ? 'block' : 'hidden sm:block'
                }`}>
                    {name}
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className={`text-sm hover:bg-red-50 hover:text-red-600 transition-colors ${
                    isMobileMenuOpen ? 'block' : 'hidden sm:block'
                }`}
                onClick={() => signOut()}
                title={t(language, "signOut")}
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    )
}