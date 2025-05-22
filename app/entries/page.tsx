import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEntries, isDatabaseInitialized } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DatabaseInitializer } from "@/components/db-initializer"

export default async function EntriesPage() {
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

  const entries = await getEntries(100)

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Financial Entries</h1>
          <Link href="/entries/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Entries</CardTitle>
            <CardDescription>View and manage all financial entries</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Company</th>
                      <th className="text-right py-3 px-2">Value 1</th>
                      <th className="text-right py-3 px-2">Value 2</th>
                      <th className="text-right py-3 px-2">Value 3</th>
                      <th className="text-right py-3 px-2">Value 4</th>
                      <th className="text-right py-3 px-2">Balance 1</th>
                      <th className="text-right py-3 px-2">Balance 2</th>
                      <th className="text-center py-3 px-2">Photo</th>
                      <th className="text-center py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">{entry.id}</td>
                        <td className="py-3 px-2">{new Date(entry.entry_date).toLocaleDateString("en-GB")}</td>
                        <td className="py-3 px-2">{entry.company}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(entry.value1)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(entry.value2)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(entry.value3)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(entry.value4)}</td>
                        <td
                          className={`text-right py-3 px-2 ${Number(entry.balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(entry.balance1)}
                        </td>
                        <td
                          className={`text-right py-3 px-2 ${Number(entry.balance2) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(entry.balance2)}
                        </td>
                        <td className="text-center py-3 px-2">
                          {entry.photo_url ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <div className="aspect-video overflow-hidden rounded-md">
                                  <img
                                    src={entry.photo_url || "/placeholder.svg"}
                                    alt={`Proof for entry ${entry.id}`}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          <Link href={`/entries/${entry.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No entries yet. Add your first entry to get started.</p>
                <Link href="/entries/new">
                  <Button variant="outline" className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Entry
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
