import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatsByCompany, getStatsByMonth, getEntries, isDatabaseInitialized } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3 } from "lucide-react"
import { DatabaseInitializer } from "@/components/db-initializer"

export default async function Home() {
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

  const companyStats = await getStatsByCompany()
  const monthlyStats = await getStatsByMonth()
  const recentEntries = await getEntries(5)

  // Calculate totals
  const totals = {
    value1: companyStats.reduce((sum, stat) => sum + Number(stat.total_value1), 0),
    value2: companyStats.reduce((sum, stat) => sum + Number(stat.total_value2), 0),
    value3: companyStats.reduce((sum, stat) => sum + Number(stat.total_value3), 0),
    value4: companyStats.reduce((sum, stat) => sum + Number(stat.total_value4), 0),
    balance1: companyStats.reduce((sum, stat) => sum + Number(stat.total_balance1), 0),
    balance2: companyStats.reduce((sum, stat) => sum + Number(stat.total_balance2), 0),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Box Count Dashboard</h1>
          <div className="flex space-x-2">
            <Link href="/entries/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </Link>
            <Link href="/statistics">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View All Statistics
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Value 1</CardTitle>
              <CardDescription>Sum of all Value 1 entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totals.value1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Value 3</CardTitle>
              <CardDescription>Sum of all Value 3 entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totals.value3)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Net Balance 1</CardTitle>
              <CardDescription>Sum of all Balance 1 entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totals.balance1 >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totals.balance1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Statistics</CardTitle>
              <CardDescription>Financial data by company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyStats.map((stat) => (
                  <div key={stat.company} className="flex items-center justify-between">
                    <div className="font-medium">{stat.company}</div>
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Value 1:</span>{" "}
                        <span className="font-medium">{formatCurrency(stat.total_value1)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Balance 1:</span>{" "}
                        <span
                          className={`font-medium ${Number(stat.total_balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(stat.total_balance1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Statistics</CardTitle>
              <CardDescription>Financial data by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.slice(0, 5).map((stat) => (
                  <div key={stat.month} className="flex items-center justify-between">
                    <div className="font-medium">{stat.month}</div>
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Value 1:</span>{" "}
                        <span className="font-medium">{formatCurrency(stat.total_value1)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Balance 1:</span>{" "}
                        <span
                          className={`font-medium ${Number(stat.total_balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(stat.total_balance1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Latest financial entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-right py-3 px-4">Value 1</th>
                      <th className="text-right py-3 px-4">Value 3</th>
                      <th className="text-right py-3 px-4">Balance 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="py-3 px-4">{new Date(entry.entry_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{entry.company}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(entry.value1)}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(entry.value3)}</td>
                        <td
                          className={`text-right py-3 px-4 ${Number(entry.balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(entry.balance1)}
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
            {recentEntries.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Link href="/entries">
                  <Button variant="outline" size="sm">
                    View All Entries
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
