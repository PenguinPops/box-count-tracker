// components/dashboard/balance-cards.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { t, Lang } from "@/lib/i18n"

export const BalanceCards = ({
  language,
  balances
}: {
  language: Lang
  balances: {
    E1: number
    E2: number
    total: number
  }
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t(language, "allBalance")}</CardTitle>
          <CardDescription>{t(language, "allBalanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${balances.total < 0 ? "text-red-600" : "text-green-600"}`}>
            {balances.total}
          </div>
        </CardContent>
      </Card>

      <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t(language, "e2Balance")}</CardTitle>
              <CardDescription>{t(language, "e2BalanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balances.E2 < 0 ? "text-red-600" : "text-green-600"}`}>
                {balances.E2}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t(language, "e1Balance")}</CardTitle>
              <CardDescription>{t(language, "e1BalanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balances.E1 < 0 ? "text-red-600" : "text-green-600"}`}>
                {balances.E1}
              </div>
            </CardContent>
          </Card>
        </div>
  )
}

export default BalanceCards;