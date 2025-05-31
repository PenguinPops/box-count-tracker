import {
  getStatsByCompany,
  getStatsByMonth,
  getStatsByQuarter,
  getSetting
} from "@/lib/db";
import StatisticsClient from "@/components/statistics-client";
import NotLoggedIn from "@/components/not-logged-in";
import { auth } from "../auth";
import ErrorComponent from "@/components/error-stats"; // Move your error UI here

// Make the page dynamic
export const dynamic = 'force-dynamic';

export default async function StatisticsPage() {
  try {
    const includeStartingBalancesSetting = await getSetting("includeStartingBalances");
    const includeStartingBalances = includeStartingBalancesSetting !== "false";
    const languageSetting = await getSetting("language");
    const language = languageSetting === "pl" ? "pl" : "en";

    const session = await auth();
    if (!session || !session.user) {
      return <NotLoggedIn />;
    }

    const [companyStats, monthlyStats, quarterlyStats] = await Promise.all([
      getStatsByCompany(includeStartingBalances),
      getStatsByMonth(includeStartingBalances),
      getStatsByQuarter(includeStartingBalances),
    ]);

    return (
      <StatisticsClient
        companyStats={companyStats}
        monthlyStats={monthlyStats}
        quarterlyStats={quarterlyStats}
        languageSetting={language}
      />
    );
  } catch (error) {
    console.error("Error fetching statistics data:", error);
    return <ErrorComponent />;
  }
}