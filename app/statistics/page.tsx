// app/statistics/page.tsx
import {
  getStatsByCompany,
  getStatsByMonth,
  getStatsByQuarter,
  getSetting
} from "@/lib/db";
import StatisticsClient from "@/components/statistics-client";
import NotLoggedIn from "@/components/not-logged-in";
import { auth } from "../auth";

export default async function StatisticsPage() {

  try {
    const includeStartingBalancesSetting = await getSetting("includeStartingBalances");
    const includeStartingBalances = includeStartingBalancesSetting !== "false"; // default to true
    const languageSetting = await getSetting("language");
    const language = languageSetting === "pl" ? "pl" : "en"; // default to "en"

    const session = await auth();
    if (!session || !session.user) {
      return (
        <NotLoggedIn />
      );
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-red-600">
            Error Loading Statistics
          </h2>
          <p className="text-gray-600">
            There was an error loading the statistics data. Please refresh the page to try again.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }
}