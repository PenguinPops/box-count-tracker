import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompanies, getEntryById, isDatabaseInitialized, getSetting } from "@/lib/db"
import EntryEditForm from "@/components/entry-edit-form"
import { notFound } from "next/navigation"
import { DatabaseInitializer } from "@/components/db-initializer"
import { Company } from "@/app/types"
import { Lang, t } from "@/lib/i18n"

interface PageProps {
  params: { id: string }
}

interface Entry {
  id: number
  entry_date: string
  company_id: number
  e2in: number
  e1in: number
  e2out: number
  e1out: number
  photo_url: string | null
  is_starting_balance: boolean
}

export default async function EditEntryPage({ params }: PageProps) {
  const id = Number.parseInt(params.id)
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
  console.log("Editing entry:", entry)

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
          <EntryEditForm companies={companies} entry={entry} lang={language} />
        </CardContent>
      </Card>
    </>
  )
}
