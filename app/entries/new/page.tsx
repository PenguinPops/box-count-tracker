import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompanies, isDatabaseInitialized, getSetting } from "@/lib/db"
import EntryForm from "@/components/entry-form"
import { DatabaseInitializer } from "@/components/db-initializer"
import { Company } from "@/app/types"
import { Lang, t } from "@/lib/i18n"
import { auth } from "@/app/auth"
import NotLoggedIn from "@/components/not-logged-in"

export default async function NewEntryPage() {

  const companies = (await getCompanies()).map((company: Record<string, any>) => ({
    id: company.id,
    name: company.name,
  })) as Company[]

  const languageSetting = await getSetting("language")
  const language: Lang = languageSetting === "pl" ? "pl" : "en"
    const session = await auth()
    if (!session || !session.user || !session.user.is_admin) {
      
      return (
        <NotLoggedIn />
      )
    }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t(language, "newEntry")}</h1>
        <p className="text-muted-foreground">{t(language, "createNewFinancialEntry")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "entryDetails")}</CardTitle>
          <CardDescription>{t(language, "enterFinancialData")}</CardDescription>
        </CardHeader>
        <CardContent>
          <EntryForm companies={companies} lang={language} />
        </CardContent>
      </Card>
    </>
  )
}