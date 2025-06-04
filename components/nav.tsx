import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Settings, PlusCircle, Database, LucideBoxes } from "lucide-react"
import { t, Lang } from "@/lib/i18n"
import { auth } from "@/app/auth"
import { UserProfile } from "./user-profile"
import { MobileNavToggle } from "./mobile-nav-toggle"

export async function MainNav({ language }: { language?: Lang }) {
    const session = await auth();
    const lang = language || "en";

    return (
        <nav className="border-b">
            {/* Mobile Navigation */}
            <MobileNavToggle session={session} language={lang} />

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center justify-between px-8 h-16">
                <div className="flex items-center space-x-6">
                    <Link href="/" className="text-xl font-bold flex items-center">
                        <LucideBoxes className="h-5 w-5 mr-2" />
                        <span>{t(lang, "navTitle")}</span>
                    </Link>

                    {session && (
                        <div className="flex items-center space-x-2">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
                                    <Home className="h-4 w-4" />
                                    <span className="ml-2">{t(lang, "dashboard")}</span>
                                </Button>
                            </Link>
                            <Link href="/entries">
                                <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
                                    <Database className="h-4 w-4" />
                                    <span className="ml-2">{t(lang, "entries")}</span>
                                </Button>
                            </Link>
                            <Link href="/statistics">
                                <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="ml-2">{t(lang, "statistics")}</span>
                                </Button>
                            </Link>
                            <Link href="/reports">
                                <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="ml-2">{t(lang, "reports")}</span>
                                </Button>
                            </Link>
                            <Link href="/settings">
                                <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
                                    <Settings className="h-4 w-4" />
                                    <span className="ml-2">{t(lang, "settings")}</span>
                                </Button>
                            </Link>
                            {session.user.is_admin && (
                                <Link href="/import">
                                    <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
                                        <Database className="h-4 w-4" />
                                        <span className="ml-2">{t(lang, "import")}</span>
                                    </Button>
                                </Link>
                            )}
                            {session.user.is_admin && (
                                <Link href="/entries/new">
                                    <Button size="sm" className="text-sm px-3 py-2">
                                        <PlusCircle className="h-4 w-4" />
                                        <span className="ml-2">{t(lang, "newEntry")}</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop User Profile */}
                {session?.user && (
                    <UserProfile name={session.user.name || "Guest"} language={lang} />
                )}
            </div>
        </nav>
    )
}