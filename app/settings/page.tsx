import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStartingBalances, getCompanies, isDatabaseInitialized } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { DatabaseInitializer } from "@/components/db-initializer"

export default async function SettingsPage() {
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

  const [startingBalances, companies] = await Promise.all([getStartingBalances(), getCompanies()])

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage application settings and starting balances</p>
          </div>
          <Link href="/entries/new?startingBalance=true">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Starting Balance
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Starting Balances</CardTitle>
              <CardDescription>Initial balances for each company</CardDescription>
            </CardHeader>
            <CardContent>
              {startingBalances.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Company</th>
                        <th className="text-right py-3 px-4">Value 1</th>
                        <th className="text-right py-3 px-4">Value 2</th>
                        <th className="text-right py-3 px-4">Value 3</th>
                        <th className="text-right py-3 px-4">Value 4</th>
                        <th className="text-right py-3 px-4">Balance 1</th>
                        <th className="text-right py-3 px-4">Balance 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {startingBalances.map((balance) => (
                        <tr key={balance.id} className="border-b">
                          <td className="py-3 px-4">{new Date(balance.entry_date).toLocaleDateString("en-GB")}</td>
                          <td className="py-3 px-4">{balance.company}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(balance.value1)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(balance.value2)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(balance.value3)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(balance.value4)}</td>
                          <td
                            className={`text-right py-3 px-4 ${Number(balance.balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(balance.balance1)}
                          </td>
                          <td
                            className={`text-right py-3 px-4 ${Number(balance.balance2) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(balance.balance2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No starting balances defined yet.</p>
                  <Link href="/entries/new?startingBalance=true">
                    <Button variant="outline" className="mt-2">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Starting Balance
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>Manage companies in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.map((company) => (
                    <div key={company.id} className="p-4 border rounded-md">
                      <div className="font-medium">{company.name}</div>
                    </div>
                  ))}
                </div>

                <form action="/api/companies" method="POST" className="flex gap-2 mt-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="New company name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button type="submit">Add</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
