import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompanies, isDatabaseInitialized } from "@/lib/db"
import EntryForm from "@/components/entry-form"
import { DatabaseInitializer } from "@/components/db-initializer"

export default async function NewEntryPage() {
  const dbInitialized = await isDatabaseInitialized()

  if (!dbInitialized) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-8 flex items-center justify-center">
          <DatabaseInitializer />
        </main>
      </div>
    )
  }

  const companies = await getCompanies()

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">New Entry</h1>
          <p className="text-muted-foreground">Create a new financial entry</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>Enter the financial data for this entry</CardDescription>
          </CardHeader>
          <CardContent>
            <EntryForm companies={companies} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
