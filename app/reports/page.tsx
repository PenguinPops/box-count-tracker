// app/reports/page.tsx

import { getCompanies, getEarliestEntryDate, getLatestEntryDate } from "@/lib/db"
import ReportPageClient from "@/components/report-page-client"
import { getSetting } from "@/lib/db"
import { auth } from "../auth"
import NotLoggedIn from "@/components/not-logged-in"

export default async function ReportPage() {
    const companies = await getCompanies()
    const earliestDate = await getEarliestEntryDate()
    const latestDate = await getLatestEntryDate()

    const firstDayOfLastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1, 1))

    const lastDayOfLastMonth = new Date(new Date().setMonth(new Date().getMonth(), 0))

    const languageSetting = await getSetting("language")
    const language = languageSetting === "pl" ? "pl" : "en"

    const session = await auth()
    if (!session || !session.user) {

        return (
            <NotLoggedIn />
        )
    }

    return (
        <ReportPageClient
            companies={companies.map(company => ({ name: company.name || "Unknown" }))}
            firstDate={firstDayOfLastMonth}
            lastDate={lastDayOfLastMonth}
            earliestDate={typeof earliestDate === "string" ? new Date(earliestDate) : earliestDate || new Date(2000, 0, 1)}
            latestDate={typeof latestDate === "string" ? new Date(latestDate) : latestDate || new Date()}
            language={language}
        />
    )
}
