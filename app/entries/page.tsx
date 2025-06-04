// app/entries/page.tsx
import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEntries, isDatabaseInitialized, getCompanies } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { DatabaseInitializer } from "@/components/db-initializer"
import EntriesTable from "@/components/entries-table"
import { t, Lang } from "@/lib/i18n"
import { getSetting } from "@/lib/db"
import { auth } from "../auth"
import NotLoggedIn from "@/components/not-logged-in"


export default async function EntriesPage() {
  const entries = await getEntries(1000);
  const companies = (await getCompanies()).map((company) => company.name);

  const languageSetting = await getSetting("language");
  const language: Lang = languageSetting === "pl" ? "pl" : "en";
  const session = await auth()
  if (!session || !session.user) {

    return (
      <NotLoggedIn />
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="sm:text-3xl text-xl font-bold">{t(language, "boxCountEntries")}</h1>
        {session.user.is_admin && (
        <Link href="/entries/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t(language, "addNewEntry")}
          </Button>
        </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(language, "allEntries")}</CardTitle>
          <CardDescription>{t(language, "viewAndManageAllEntries")}</CardDescription>
        </CardHeader>
        <CardContent>
          <EntriesTable initialEntries={entries} companyNames={companies} lang={language} showActions={session.user.is_admin} />
        </CardContent>
      </Card>
    </>
  )
}
