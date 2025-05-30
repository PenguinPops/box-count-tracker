// app/page.tsx
import { MainNav } from "@/components/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatsByCompany, getStatsByMonth, getEntries, isDatabaseInitialized, getSetting } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3 } from "lucide-react"
import { Capitalise } from "@/lib/utils"
import { t, Lang } from "@/lib/i18n"
import { Suspense } from "react"
import { BalanceCards } from "@/components/dashboard/balance-cards"
import { CompanyStats } from "@/components/dashboard/company-stats"
import { TableSkeleton, CardSkeleton } from "@/components/skeleton"
import { MonthlyStats } from "@/components/dashboard/monthly-stats"
import { RecentEntries } from "@/components/dashboard/recent-entries"

export default function Home() {
  return (
    <DashboardContent />
  )
}

async function DashboardContent() {

  const includeStartingBalancesSetting = await getSetting("includeStartingBalances")
  const languageSetting = await getSetting("language")
  const language: Lang = languageSetting === "pl" ? "pl" : "en"
  
  const includeStartingBalances = includeStartingBalancesSetting !== "false"
  const companyStatsRaw = await getStatsByCompany(includeStartingBalances)
  const companyStats = companyStatsRaw.map(stat => ({
    company: String(stat.company),
    total_e1in: Number(stat.total_e1in ?? 0),
    total_e1out: Number(stat.total_e1out ?? 0),
    total_e2in: Number(stat.total_e2in ?? 0),
    total_e2out: Number(stat.total_e2out ?? 0),
  }))
  const monthlyStatsRaw = await getStatsByMonth(includeStartingBalances)
  const monthlyStats = monthlyStatsRaw.map(stat => ({
    month: String(stat.month),
    total_e1in: Number(stat.total_e1in ?? 0),
    total_e1out: Number(stat.total_e1out ?? 0),
    total_e2in: Number(stat.total_e2in ?? 0),
    total_e2out: Number(stat.total_e2out ?? 0),
  }))
  const recentEntriesRaw = await getEntries(5)
  const recentEntries = recentEntriesRaw.map(entry => ({
    id: String(entry.id),
    entry_date: String(entry.entry_date),
    company: String(entry.company),
    e2in: Number(entry.e2in),
    e1in: Number(entry.e1in),
    e2out: Number(entry.e2out),
    e1out: Number(entry.e1out),
  }))

  const totals = {
    E1in: companyStats.reduce((sum, stat) => sum + Number(stat.total_e1in ?? 0), 0),
    E2in: companyStats.reduce((sum, stat) => sum + Number(stat.total_e2in ?? 0), 0),
    E1out: companyStats.reduce((sum, stat) => sum + Number(stat.total_e1out ?? 0), 0),
    E2out: companyStats.reduce((sum, stat) => sum + Number(stat.total_e2out ?? 0), 0),
  }

  const balances = {
    E1: totals.E1out - totals.E1in,
    E2: totals.E2out - totals.E2in,
    total: totals.E1out + totals.E2out - totals.E1in - totals.E2in,
  }

  return (
    <>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t(language, "dashboardTitle")}</h1>
        <div className="flex space-x-2">
          <Link href="/entries/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t(language, "newEntry")}
            </Button>
          </Link>
          <Link href="/statistics">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t(language, "viewAllStatistics")}
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>}>
        <BalanceCards language={language} balances={balances} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Suspense fallback={<CardSkeleton />}>
          <CompanyStats language={language} companyStats={companyStats} />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <MonthlyStats language={language} monthlyStats={monthlyStats} />
        </Suspense>
      </div>

      <Suspense fallback={<Card><CardContent><TableSkeleton /></CardContent></Card>}>
        <RecentEntries language={language} recentEntries={recentEntries} />
      </Suspense>


    </>
  )
}
