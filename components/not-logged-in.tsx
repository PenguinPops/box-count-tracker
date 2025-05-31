import Link from "next/link"
import { Button } from "@/components/ui/button"
import { t, Lang } from "@/lib/i18n"
import { getSetting } from "@/lib/db"

export default async function NotLoggedIn() {
  const languageSetting = await getSetting("language")
  const language: Lang = languageSetting === "pl" ? "pl" : "en"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-2">🔒</h1>
      <h2 className="text-2xl font-semibold mb-4">{t(language, "notLoggedInTitle")}</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        {t(language, "notLoggedInDescription")}
      </p>
      <Link href="/login">
        <Button>{t(language, "signInButton")}</Button>
      </Link>
    </div>
  )
}