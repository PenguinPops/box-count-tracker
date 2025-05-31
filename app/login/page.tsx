// app/login/page.tsx (Server Component)
import { getSetting } from "@/lib/db"
import { Lang } from "@/lib/i18n"
import SignInForm from "@/components/sign-in-form"

export default async function LoginPage() {
  const languageSetting = await getSetting("language")
  const language: Lang = languageSetting === "pl" ? "pl" : "en"
  
  return <SignInForm language={language} />
}