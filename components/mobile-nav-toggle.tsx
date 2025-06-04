// mobile-nav-toggle.tsx - Client Component
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Settings, PlusCircle, Database, LucideBoxes, Menu, X } from "lucide-react"
import { t, Lang } from "@/lib/i18n"
import { UserProfile } from "./user-profile"

interface MobileNavToggleProps {
    session: any
    language: Lang
}

export function MobileNavToggle({ session, language }: MobileNavToggleProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const closeMenu = () => {
        setIsOpen(false)
    }

    return (
        <div className="sm:hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-start px-4 pt-2 h-16">
                <div>
                <button
                    onClick={toggleMenu}
                    className="flex max-w-full items-center justify-center p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? (
                        <>
                            <X className="h-5 w-5" />
                        </>
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
                </div>
                <Link href="/" className="text-xl font-bold flex items-center ml-6">
                        <LucideBoxes className="h-5 w-5 mr-2" />
                        <span>{t(language, "navTitle")}</span>
                </Link>
            </div>

            {/* Mobile Collapsible Menu */}
            {isOpen && (
                <div className="border-t px-4 py-4 mt-4">
                    {session && (
                        <div className="flex flex-col space-y-2">
                            <Link href="/" onClick={closeMenu}>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-sm px-3 py-2">
                                    <Home className="h-4 w-4" />
                                    <span className="ml-2">{t(language, "dashboard")}</span>
                                </Button>
                            </Link>
                            <Link href="/entries" onClick={closeMenu}>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-sm px-3 py-2">
                                    <Database className="h-4 w-4" />
                                    <span className="ml-2">{t(language, "entries")}</span>
                                </Button>
                            </Link>
                            <Link href="/statistics" onClick={closeMenu}>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-sm px-3 py-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="ml-2">{t(language, "statistics")}</span>
                                </Button>
                            </Link>
                            <Link href="/reports" onClick={closeMenu}>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-sm px-3 py-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="ml-2">{t(language, "reports")}</span>
                                </Button>
                            </Link>
                            <Link href="/settings" onClick={closeMenu}>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-sm px-3 py-2">
                                    <Settings className="h-4 w-4" />
                                    <span className="ml-2">{t(language, "settings")}</span>
                                </Button>
                            </Link>
                            {session.user.is_admin && (
                                <Link href="/import" onClick={closeMenu}>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm px-3 py-2">
                                        <Database className="h-4 w-4" />
                                        <span className="ml-2">{t(language, "import")}</span>
                                    </Button>
                                </Link>
                            )}
                            {session.user.is_admin && (
                                <Link href="/entries/new" onClick={closeMenu}>
                                    <Button size="sm" className="w-full justify-start text-sm px-3 py-2">
                                        <PlusCircle className="h-4 w-4" />
                                        <span className="ml-2">{t(language, "newEntry")}</span>
                                    </Button>
                                </Link>
                            )}
                            {session?.user && (
                                <UserProfile
                                    name={session.user.name || "Guest"}
                                    language={language}
                                    isMobileMenuOpen={isOpen}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}