import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Settings, PlusCircle, Database, LucideBoxes } from "lucide-react"
import { t, Lang } from "@/lib/i18n"
import { auth } from "@/app/auth"

export async function MainNav({language}: { language?: Lang }) {
    const session = await auth();
    const lang = language || "en";

    return (
        <nav className="flex items-center space-x-4 lg:space-x-6 px-8 h-16 border-b">
            <Link href="/" className="text-xl font-bold flex items-center">
            <LucideBoxes className="mr-2 h-5 w-5" />
            <span>{t(lang, "navTitle")}</span>
            </Link>
            {session && (
            <div className="ml-auto flex items-center space-x-4">
                <Link href="/">
                <Button variant="ghost" size="sm" className="text-sm">
                    <Home className="mr-2 h-4 w-4" />
                    {t(lang, "dashboard")}
                </Button>
                </Link>
                <Link href="/entries">
                <Button variant="ghost" size="sm" className="text-sm">
                    <Database className="mr-2 h-4 w-4" />
                    {t(lang, "entries")}
                </Button>
                </Link>
                <Link href="/statistics">
                <Button variant="ghost" size="sm" className="text-sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t(lang, "statistics")}
                </Button>
                </Link>
                <Link href="/reports">
                <Button variant="ghost" size="sm" className="text-sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t(lang, "reports")}
                </Button>
                </Link>
                <Link href="/settings">
                <Button variant="ghost" size="sm" className="text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    {t(lang, "settings")}
                </Button>
                </Link>
                {session.user.is_admin && (
                <Link href="/import">
                <Button variant="ghost" size="sm" className="text-sm">
                    <Database className="mr-2 h-4 w-4" />
                    {t(lang, "import")}
                </Button>
                </Link>
                )}
                {session.user.is_admin && (
                <Link href="/entries/new">
                    <Button size="sm" className="text-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t(lang, "newEntry")}
                    </Button>
                </Link>
                )}
            </div>
            )}
        </nav>
    )
}