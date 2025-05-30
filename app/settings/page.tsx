// app/settings/page.tsx
import { getStartingBalances, getCompanies, isDatabaseInitialized, getSetting } from "@/lib/db";
import { MainNav } from "@/components/nav";
import { DatabaseInitializer } from "@/components/db-initializer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Capitalise } from "@/lib/utils";
import IncludeStartingBalanceToggle from "@/components/include-starting-balance-toggle";
import LanguageDropdown from "@/components/language-dropdown";
import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";

export default async function SettingsPage() {

  const [startingBalances, companies, includeSetting, languageSetting] = await Promise.all([
    getStartingBalances(),
    getCompanies(),
    getSetting("includeStartingBalances"),
    getSetting("language")
  ]);

  const initialIncludeValue = includeSetting === "true";
  const language: Lang = languageSetting === "pl" ? "pl" : "en";

  const totalE1In = startingBalances.reduce((sum, b) => sum + Number(b.e1in), 0);
  const totalE2In = startingBalances.reduce((sum, b) => sum + Number(b.e2in), 0);
  const totalE1Out = startingBalances.reduce((sum, b) => sum + Number(b.e1out), 0);
  const totalE2Out = startingBalances.reduce((sum, b) => sum + Number(b.e2out), 0);
  const totalBalanceE1 = totalE1Out - totalE1In;
  const totalBalanceE2 = totalE2Out - totalE2In;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t(language, "settings")}</h1>
          <p className="text-muted-foreground">
            {t(language, "settingsDescription")}
          </p>
        </div>
        <Link href="/entries/new?startingBalance=true">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t(language, "addStartingBalance")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t(language, "preferences")}</CardTitle>
            <CardDescription>{t(language, "customize")}</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex items-center space-x-2">
            <IncludeStartingBalanceToggle initialValue={initialIncludeValue} />
            <Label htmlFor="include-starting-balances">{t(language, "includeStartingBalancesToggle")}</Label>
          </div>
          </CardContent>
          <CardContent>
            <LanguageDropdown initialValue={language} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(language, "startingBalances")}</CardTitle>
            <CardDescription>{t(language, "initialBalances")}</CardDescription>
          </CardHeader>
          <CardContent>
            {startingBalances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">{t(language, "date")}</th>
                      <th className="text-left py-3 px-4">{t(language, "company")}</th>
                      <th className="text-right py-3 px-4">{t(language, "e2Intake")}</th>
                      <th className="text-right py-3 px-4">{t(language, "e1Intake")}</th>
                      <th className="text-right py-3 px-4">{t(language, "e2Output")}</th>
                      <th className="text-right py-3 px-4">{t(language, "e1Output")}</th>
                      <th className="text-right py-3 px-4">{t(language, "balanceE2")}</th>
                      <th className="text-right py-3 px-4">{t(language, "balanceE1")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startingBalances.map((balance) => {
                      const balanceE1 = balance.e1out - balance.e1in;
                      const balanceE2 = balance.e2out - balance.e2in;

                      return (
                        <tr key={balance.id} className="border-b">
                          <td className="py-3 px-4">
                            {new Date(balance.entry_date).toLocaleDateString("pl-PL")}
                          </td>
                          <td className="py-3 px-4">{Capitalise(balance.company_name)}</td>
                          <td className="text-right py-3 px-4">{balance.e2in}</td>
                          <td className="text-right py-3 px-4">{balance.e1in}</td>
                          <td className="text-right py-3 px-4">{balance.e2out}</td>
                          <td className="text-right py-3 px-4">{balance.e1out}</td>
                          <td
                            className={`text-right py-3 px-4 ${balanceE2 >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {balanceE2}
                          </td>
                          <td
                            className={`text-right py-3 px-4 ${balanceE1 >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {balanceE1}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold bg-muted/50">
                      <td className="py-3 px-4">{t(language, "total")}</td>
                      <td className="py-3 px-4"></td>
                      <td className="text-right py-3 px-4">{totalE1In}</td>
                      <td className="text-right py-3 px-4">{totalE2In}</td>
                      <td className="text-right py-3 px-4">{totalE1Out}</td>
                      <td className="text-right py-3 px-4">{totalE2Out}</td>
                      <td className="text-right py-3 px-4">{totalBalanceE2}</td>
                      <td className="text-right py-3 px-4">{totalBalanceE1}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">{t(language, "noBalances")}</p>
                <Link href="/entries/new?startingBalance=true">
                  <Button variant="outline" className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t(language, "addStartingBalance")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(language, "companies")}</CardTitle>
            <CardDescription>{t(language, "manageCompanies")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((company) => (
                  <div key={company.id} className="p-4 border rounded-md">
                    <div className="font-medium">{Capitalise(company.name)}</div>
                  </div>
                ))}
              </div>

              <form
                action="/api/companies"
                method="POST"
                className="flex gap-2 mt-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder={t(language, "newCompanyPlaceholder")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button type="submit">{t(language, "add")}</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
