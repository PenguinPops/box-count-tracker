import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompanies, getEntryById, isDatabaseInitialized } from "@/lib/db"
import EntryForm from "@/components/entry-form"
import { notFound } from "next/navigation"
import { DatabaseInitializer } from "@/components/db-initializer"

export default async function EditEntryPage({ params }: { params: { id: string } }) {
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

  const id = Number.parseInt(params.id)
  const [entry, companies] = await Promise.all([getEntryById(id), getCompanies()])

  if (!entry) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Entry #{id}</h1>
          <p className="text-muted-foreground">Update the financial data for this entry</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>Edit the financial data for this entry</CardDescription>
          </CardHeader>
          <CardContent>
            <EntryForm companies={companies} entry={entry} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
