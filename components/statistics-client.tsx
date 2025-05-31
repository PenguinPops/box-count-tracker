// app/components/statistics-client.tsx
"use client"

import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatsChart from "@/components/stats-chart"
import { Lang, t } from "@/lib/i18n"

export default function StatisticsClient({
  companyStats,
  monthlyStats,
  quarterlyStats,
  languageSetting
}: {
  companyStats: any[],
  monthlyStats: any[],
  quarterlyStats: any[],
  languageSetting: string
}) {

    const language: Lang = languageSetting as Lang;

    const renderStatsTable = (stats: any[], rowKey: string) => {
        const getLabel = (key: string) => {
          switch (key) {
            case "company":
              return t(language, "company")
            case "month":
              return t(language, "month")
            case "quarter":
              return t(language, "quarter")
            default:
              return key.charAt(0).toUpperCase() + key.slice(1)
          }
        }

        return (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">{getLabel(rowKey)}</th>
                    <th className="text-right py-3 px-4">{t(language, "e2Intake")}</th>
                    <th className="text-right py-3 px-4">{t(language, "e1Intake")}</th>
                    <th className="text-right py-3 px-4">{t(language, "e2Output")}</th>
                    <th className="text-right py-3 px-4">{t(language, "e1Output")}</th>
                    <th className="text-right py-3 px-4">{t(language, "balanceE2")}</th>
                    <th className="text-right py-3 px-4">{t(language, "balanceE1")}</th>
                    <th className="text-right py-3 px-4">{t(language, "entries")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat[rowKey]} className="border-b">
                      <td className="py-3 px-4 font-medium">{stat[rowKey]}</td>
                      <td className="text-right py-3 px-4">{Math.floor(stat.total_e2in)}</td>
                      <td className="text-right py-3 px-4">{Math.floor(stat.total_e1in)}</td>
                      <td className="text-right py-3 px-4">{Math.floor(stat.total_e2out)}</td>
                      <td className="text-right py-3 px-4">{Math.floor(stat.total_e1out)}</td>
                      <td className={`text-right py-3 px-4 ${stat.total_e2out - stat.total_e2in >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stat.total_e2out - stat.total_e2in}
                      </td>
                      <td className={`text-right py-3 px-4 ${stat.total_e1out - stat.total_e1in >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stat.total_e1out - stat.total_e1in}
                      </td>
                      <td className="text-right py-3 px-4">{stat.entry_count}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-muted/50">
                    <td className="py-3 px-4">{t(language, "total")}</td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + Number(s.total_e2in), 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + Number(s.total_e1in), 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + Number(s.total_e2out), 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + Number(s.total_e1out), 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + (s.total_e2out - s.total_e2in), 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + (s.total_e1out - s.total_e1in), 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {stats.reduce((sum, s) => sum + Number(s.entry_count), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        }
      
        return (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{t(language, "statistics")}</h1>
                <p className="text-muted-foreground">{t(language, "statisticsDescription")}</p>
              </div>
      
              <Tabs defaultValue="company">
                <TabsList className="mb-6">
                  <TabsTrigger value="company">{t(language, "byCompany")}</TabsTrigger>
                  <TabsTrigger value="monthly">{t(language, "byMonth")}</TabsTrigger>
                  <TabsTrigger value="quarterly">{t(language, "byQuarter")}</TabsTrigger>
                </TabsList>
      
                <TabsContent value="company">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t(language, "companyStats")}</CardTitle>
                      <CardDescription>{t(language, "companyStatsTableDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {companyStats.length > 0
                        ? renderStatsTable(companyStats, "company")
                        : <div className="text-center py-6 text-muted-foreground">{t(language, "noDataAvailable")}</div>}
                    </CardContent>
                  </Card>
                </TabsContent>
      
                <TabsContent value="monthly">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t(language, "monthlyStats")}</CardTitle>
                      <CardDescription>{t(language, "monthlyStatsTableDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {monthlyStats.length > 0 ? (
                        <>
                          <StatsChart stats={monthlyStats} labelKey="month" lang={language}/>
                          {renderStatsTable(monthlyStats, "month")}
                        </>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">{t(language, "noDataAvailable")}</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
      
                <TabsContent value="quarterly">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t(language, "quarterlyStats")}</CardTitle>
                      <CardDescription>{t(language, "quarterlyStatsTableDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quarterlyStats.length > 0 ? (
                        <>
                          <StatsChart stats={quarterlyStats} labelKey="quarter" lang={language} />
                          {renderStatsTable(quarterlyStats, "quarter")}
                        </>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">{t(language, "noDataAvailable")}</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>

        )
      }