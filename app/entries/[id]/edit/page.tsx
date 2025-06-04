import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompanies, getEntryById, isDatabaseInitialized, getSetting } from "@/lib/db"
import EntryForm from "@/components/entry-form"
import { notFound } from "next/navigation"
import { DatabaseInitializer } from "@/components/db-initializer"
import { Company } from "@/app/types"
import { Lang, t } from "@/lib/i18n"
import { auth } from "@/app/auth"
import NotLoggedIn from "@/components/not-logged-in"

interface Entry {
  id: number
  entry_date: string
  company_id: number
  e2in: number
  e1in: number
  e2out: number
  e1out: number
  photo_url?: string | null
  is_starting_balance?: boolean
}

interface PageProps {
  params: { id: string }
}

export default async function EditEntryPage({ params }: PageProps) {
  const paramsId = await params;
  const id = parseInt(paramsId.id, 10)
  if (isNaN(id) || id <= 0) {
    notFound()
  }

  const [entryData, rawCompanies, languageSetting]: [Record<string, any> | null, Record<string, any>[], string | null] = await Promise.all([
    getEntryById(id),
    getCompanies(),
    getSetting("language")
  ])
  const language: Lang = languageSetting === "pl" ? "pl" : "en"

  const companies: Company[] = rawCompanies.map((company) => ({
    id: company.id,
    name: company.name,
  }))

  if (!entryData) {
    notFound()
  }

  const entry: Entry = entryData as Entry

  const session = await auth()
  if (!session || !session.user || !session.user.is_admin) {

    return (
      <NotLoggedIn />
    )
  }
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{`${t(language, "editEntryNum")}${id}`}</h1>
        <p className="text-muted-foreground">{t(language, "updateEntryData")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(language, "entryDetails")}</CardTitle>
          <CardDescription>{t(language, "enterFinancialData")}</CardDescription>
        </CardHeader>
        <CardContent>
          <EntryForm companies={companies} entry={entry} lang={language} isNew={false} />
        </CardContent>
      </Card>
    </>
  )
}
