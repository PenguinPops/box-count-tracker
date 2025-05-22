import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStatsByCompany, getStatsByMonth, getStatsByQuarter, isDatabaseInitialized } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import { DatabaseInitializer } from "@/components/db-initializer"

export default async function StatisticsPage() {
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

  const [companyStats, monthlyStats, quarterlyStats] = await Promise.all([
    getStatsByCompany(),
    getStatsByMonth(),
    getStatsByQuarter(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Analyze financial data by different dimensions</p>
        </div>

        <Tabs defaultValue="company">
          <TabsList className="mb-6">
            <TabsTrigger value="company">By Company</TabsTrigger>
            <TabsTrigger value="monthly">By Month</TabsTrigger>
            <TabsTrigger value="quarterly">By Quarter</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Statistics</CardTitle>
                <CardDescription>Financial data aggregated by company</CardDescription>
              </CardHeader>
              <CardContent>
                {companyStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Company</th>
                          <th className="text-right py-3 px-4">Value 1</th>
                          <th className="text-right py-3 px-4">Value 2</th>
                          <th className="text-right py-3 px-4">Value 3</th>
                          <th className="text-right py-3 px-4">Value 4</th>
                          <th className="text-right py-3 px-4">Balance 1</th>
                          <th className="text-right py-3 px-4">Balance 2</th>
                          <th className="text-right py-3 px-4">Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyStats.map((stat) => (
                          <tr key={stat.company} className="border-b">
                            <td className="py-3 px-4 font-medium">{stat.company}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value1)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value2)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value3)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value4)}</td>
                            <td
                              className={`text-right py-3 px-4 ${Number(stat.total_balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(stat.total_balance1)}
                            </td>
                            <td
                              className={`text-right py-3 px-4 ${Number(stat.total_balance2) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(stat.total_balance2)}
                            </td>
                            <td className="text-right py-3 px-4">{stat.entry_count}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-muted/50">
                          <td className="py-3 px-4">Total</td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(companyStats.reduce((sum, stat) => sum + Number(stat.total_value1), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(companyStats.reduce((sum, stat) => sum + Number(stat.total_value2), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(companyStats.reduce((sum, stat) => sum + Number(stat.total_value3), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(companyStats.reduce((sum, stat) => sum + Number(stat.total_value4), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(companyStats.reduce((sum, stat) => sum + Number(stat.total_balance1), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(companyStats.reduce((sum, stat) => sum + Number(stat.total_balance2), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {companyStats.reduce((sum, stat) => sum + Number(stat.entry_count), 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No data available. Add some entries to see statistics.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
                <CardDescription>Financial data aggregated by month</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Month</th>
                          <th className="text-right py-3 px-4">Value 1</th>
                          <th className="text-right py-3 px-4">Value 2</th>
                          <th className="text-right py-3 px-4">Value 3</th>
                          <th className="text-right py-3 px-4">Value 4</th>
                          <th className="text-right py-3 px-4">Balance 1</th>
                          <th className="text-right py-3 px-4">Balance 2</th>
                          <th className="text-right py-3 px-4">Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyStats.map((stat) => (
                          <tr key={stat.month} className="border-b">
                            <td className="py-3 px-4 font-medium">{stat.month}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value1)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value2)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value3)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value4)}</td>
                            <td
                              className={`text-right py-3 px-4 ${Number(stat.total_balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(stat.total_balance1)}
                            </td>
                            <td
                              className={`text-right py-3 px-4 ${Number(stat.total_balance2) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(stat.total_balance2)}
                            </td>
                            <td className="text-right py-3 px-4">{stat.entry_count}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-muted/50">
                          <td className="py-3 px-4">Total</td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(monthlyStats.reduce((sum, stat) => sum + Number(stat.total_value1), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(monthlyStats.reduce((sum, stat) => sum + Number(stat.total_value2), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(monthlyStats.reduce((sum, stat) => sum + Number(stat.total_value3), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(monthlyStats.reduce((sum, stat) => sum + Number(stat.total_value4), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(monthlyStats.reduce((sum, stat) => sum + Number(stat.total_balance1), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(monthlyStats.reduce((sum, stat) => sum + Number(stat.total_balance2), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {monthlyStats.reduce((sum, stat) => sum + Number(stat.entry_count), 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No data available. Add some entries to see statistics.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quarterly">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Statistics</CardTitle>
                <CardDescription>Financial data aggregated by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                {quarterlyStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Quarter</th>
                          <th className="text-right py-3 px-4">Value 1</th>
                          <th className="text-right py-3 px-4">Value 2</th>
                          <th className="text-right py-3 px-4">Value 3</th>
                          <th className="text-right py-3 px-4">Value 4</th>
                          <th className="text-right py-3 px-4">Balance 1</th>
                          <th className="text-right py-3 px-4">Balance 2</th>
                          <th className="text-right py-3 px-4">Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quarterlyStats.map((stat) => (
                          <tr key={stat.quarter} className="border-b">
                            <td className="py-3 px-4 font-medium">{stat.quarter}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value1)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value2)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value3)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(stat.total_value4)}</td>
                            <td
                              className={`text-right py-3 px-4 ${Number(stat.total_balance1) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(stat.total_balance1)}
                            </td>
                            <td
                              className={`text-right py-3 px-4 ${Number(stat.total_balance2) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(stat.total_balance2)}
                            </td>
                            <td className="text-right py-3 px-4">{stat.entry_count}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-muted/50">
                          <td className="py-3 px-4">Total</td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(quarterlyStats.reduce((sum, stat) => sum + Number(stat.total_value1), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(quarterlyStats.reduce((sum, stat) => sum + Number(stat.total_value2), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(quarterlyStats.reduce((sum, stat) => sum + Number(stat.total_value3), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(quarterlyStats.reduce((sum, stat) => sum + Number(stat.total_value4), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(quarterlyStats.reduce((sum, stat) => sum + Number(stat.total_balance1), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(quarterlyStats.reduce((sum, stat) => sum + Number(stat.total_balance2), 0))}
                          </td>
                          <td className="text-right py-3 px-4">
                            {quarterlyStats.reduce((sum, stat) => sum + Number(stat.entry_count), 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No data available. Add some entries to see statistics.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
