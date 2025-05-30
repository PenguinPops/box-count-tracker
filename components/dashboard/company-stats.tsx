// components/dashboard/company-stats.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t, Lang } from "@/lib/i18n";
import { Capitalise } from "@/lib/utils";

export const CompanyStats = ({
    language,
    companyStats
}: {
    language: Lang;
    companyStats: {
        company: string;
        total_e1in: number;
        total_e1out: number;
        total_e2in: number;
        total_e2out: number;
    }[];
}) => {
    return (

        <Card>
            <CardHeader>
                <CardTitle>{t(language, "companyStats")}</CardTitle>
                <CardDescription>{t(language, "companyStatsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {companyStats.map((stat) => (
                        <div key={stat.company} className="flex items-center justify-between">
                            <div className="font-medium">{Capitalise(stat.company)}</div>
                            <div className="flex space-x-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">{t(language, "e2Balance")}:</span>{" "}
                                    <span className={`font-medium ${Number(stat.total_e2out - stat.total_e2in) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {stat.total_e2out - stat.total_e2in}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">{t(language, "e1Balance")}:</span>{" "}
                                    <span className={`font-medium ${Number(stat.total_e1out - stat.total_e1in) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {stat.total_e1out - stat.total_e1in}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
export default CompanyStats;