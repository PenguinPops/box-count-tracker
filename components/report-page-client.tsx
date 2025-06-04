'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { ReportViewer } from "@/components/report-viewer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { t, Lang } from "@/lib/i18n"
import { Switch } from "@/components/ui/switch"

interface ReportPageClientProps {
    companies: { name: string }[]
    firstDate: Date
    lastDate: Date
    earliestDate: Date
    latestDate: Date
    language: Lang
}

export default function ReportPageClient({
    companies,
    firstDate,
    lastDate,
    earliestDate,
    latestDate,
    language
}: ReportPageClientProps) {
    const [reportData, setReportData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [includeParameters, setIncludeParameters] = useState(false)
    const [includeEntries, setIncludeEntries] = useState(false)
    const [includeSummary, setIncludeSummary] = useState(true)
    const [displayMode, setDisplayMode] = useState<'raw' | 'balance'>('balance')
    const [entriesDir, setEntriesDir] = useState<'asc' | 'desc'>('asc')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.target as HTMLFormElement)
        const params = new URLSearchParams()

        formData.forEach((value, key) => {
            if (key === 'boxTypes' || key === 'companies') {
                formData.getAll(key).forEach(val => params.append(key, val.toString()))
            } else {
                params.append(key, value.toString())
            }
        })

        // Add display mode and include options to params
        params.append('displayMode', displayMode)
        params.append('includeParameters', includeParameters.toString())
        params.append('includeEntries', includeEntries.toString())
        params.append('includeSummary', includeSummary.toString())

        try {
            console.log("Generating report with params:", params.toString())
            const response = await fetch(`/api/reports?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to generate report')
            }
            const data = await response.json()
            setReportData(data)
        } catch (err) {
            console.error(err)
            setError('Failed to generate report. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Format date for display in input field
    const formatDateForInput = (date: Date) => {
        if (language === 'pl') {
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            return `${year}-${month}-${day}` // Still maintains HTML date input format
        }
        return date.toISOString().split('T')[0]
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t(language, "reportTitle")}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t(language, "reportFilters")}</CardTitle>
                    <CardDescription>{t(language, "reportFiltersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label className="sm:text-lg"htmlFor="startDate">{t(language, "startDate")}</Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    required
                                    defaultValue={formatDateForInput(firstDate)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 sm:mt-7">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const startDateInput = document.getElementById("startDate") as HTMLInputElement;
                                        if (startDateInput) {
                                            startDateInput.value = formatDateForInput(earliestDate);
                                        }
                                    }}
                                >
                                    {t(language, "setEarliestDate")}
                                </Button>
                            </div>
                            <div>
                                <Label className="sm:text-lg"htmlFor="endDate">{t(language, "endDate")}</Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    required
                                    defaultValue={formatDateForInput(lastDate)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 sm:mt-7">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const startDateInput = document.getElementById("endDate") as HTMLInputElement;
                                        if (startDateInput) {
                                            startDateInput.value = formatDateForInput(latestDate);
                                        }
                                    }}
                                >
                                    {t(language, "setLatestDate")}
                                </Button>
                            </div>
                        </div>

                        {/* Box Types */}
                        <div>
                            <Label className="mb-2 block text-xl">{t(language, "boxTypes")}</Label>
                            <div className="flex gap-6">
                                {['E2', 'E1'].map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Switch
                                            id={type}
                                            name="boxTypes"
                                            value={type}
                                            defaultChecked={type === 'E2'}
                                        />
                                        <Label className="sm:text-lg"htmlFor={type}>{type}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Companies */}
                        <div>
                            <Label className="mb-2 block sm:text-lg">{t(language, "companies")}</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {companies.map(({ name }) => (
                                    <div key={name} className="flex items-center space-x-2">
                                        <Switch
                                            id={name}
                                            name="companies"
                                            value={name}
                                            defaultChecked={name.toLowerCase() === 'publimar'}
                                        />
                                        <Label className="sm:text-lg"htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Display Mode */}
                        <div>
                            <Label className="mb-2 block sm:text-lg">{t(language, "displayMode")}</Label>
                            <Select value={displayMode} onValueChange={(value: 'balance' | 'raw') => setDisplayMode(value)}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder={t(language, "selectDisplayMode")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="balance">{t(language, "showBalances")}</SelectItem>
                                    <SelectItem value="raw">{t(language, "showRawValues")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includeParameters"
                                    checked={includeParameters}
                                    onCheckedChange={(checked) => setIncludeParameters(checked)}
                                />
                                <Label className="sm:text-lg" htmlFor="includeParameters">{t(language, "includeParameters")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includeEntries"
                                    checked={includeEntries}
                                    onCheckedChange={(checked) => setIncludeEntries(checked)}
                                />
                                <Label className="sm:text-lg" htmlFor="includeEntries">{t(language, "includeEntries")}</Label>
                            </div>
                            {includeEntries && (
                                <div className="flex items-center pl-6 space-x-4">
                                    <Label className="sm:text-lg"htmlFor="entriesDir">{t(language, "entriesOrder")}</Label>
                                    <Select value={entriesDir} onValueChange={(value: 'asc' | 'desc') => setEntriesDir(value)}>
                                        <SelectTrigger className="w-[240px]">
                                            <SelectValue placeholder={t(language, "selectOrder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">{t(language, "oldestFirst")}</SelectItem>
                                            <SelectItem value="desc">{t(language, "newestFirst")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includeSummary"
                                    checked={includeSummary}
                                    onCheckedChange={(checked) => setIncludeSummary(checked)}
                                />
                                <Label className="sm:text-lg"htmlFor="includeSummary">{t(language, "includeBalanceSummary")}</Label>
                            </div>
                        </div>

                        <Button type="submit" className="mt-4" disabled={isLoading}>
                            {isLoading ? t(language, "generating") : t(language, "generateReport")}
                        </Button>
                        {error && <div className="text-red-500 mt-2">{t(language, "failedToGenerateReport")}</div>}
                    </form>
                </CardContent>
            </Card>

            {reportData && (
                <ReportViewer
                    reportData={reportData}
                    includeParameters={includeParameters}
                    includeEntries={includeEntries}
                    includeSummary={includeSummary}
                    entriesDir={entriesDir}
                    displayMode={displayMode}
                    language={language}
                    onClose={() => setReportData(null)}
                />
            )}
        </>
    )
}