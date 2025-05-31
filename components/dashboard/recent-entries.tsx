// components/dashboard/recent-entries.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t, Lang } from "@/lib/i18n";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capitalise } from "@/lib/utils";
import Link from "next/link";

export const RecentEntries = ({
    language,
    recentEntries
}: {
    language: Lang;
    recentEntries: {
        id: string;
        entry_date: string;
        company: string;
        e2in: number;
        e1in: number;
        e2out: number;
        e1out: number;
    }[];
}) => {
    return (

        <Card>
            <CardHeader>
                <CardTitle>{t(language, "recentEntries")}</CardTitle>
                <CardDescription>{t(language, "recentEntriesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <CardContent>
                    {recentEntries.length > 0 ? (
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
                                        <th className="text-right py-3 px-4">{t(language, "e2Balance")}</th>
                                        <th className="text-right py-3 px-4">{t(language, "e1Balance")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEntries.map((entry) => (
                                        <tr key={entry.id} className="border-b">
                                            <td className="py-3 px-4">{new Date(entry.entry_date).toLocaleDateString("pl-PL")}</td>
                                            <td className="py-3 px-4">{Capitalise(entry.company)}</td>
                                            <td className="text-right py-3 px-4">{Math.floor(entry.e2in)}</td>
                                            <td className="text-right py-3 px-4">{Math.floor(entry.e1in)}</td>
                                            <td className="text-right py-3 px-4">{Math.floor(entry.e2out)}</td>
                                            <td className="text-right py-3 px-4">{Math.floor(entry.e1out)}</td>
                                            <td
                                                className={`text-right py-3 px-4 ${Number(entry.e2out - entry.e2in) >= 0 ? "text-green-600" : "text-red-600"}`}
                                            >
                                                {entry.e2out - entry.e2in}
                                            </td>
                                            <td
                                                className={`text-right py-3 px-4 ${Number(entry.e1out - entry.e1in) >= 0 ? "text-green-600" : "text-red-600"}`}
                                            >
                                                {entry.e1out - entry.e1in}
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
            </CardContent>
        </Card>
    )
}
export default RecentEntries;