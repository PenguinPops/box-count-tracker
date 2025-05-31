'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from './ui/button'
import { useReactToPrint } from 'react-to-print'
import { Download, Printer } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { t, Lang } from '@/lib/i18n'

export function ReportViewer({
    reportData,
    includeParameters,
    includeEntries,
    includeSummary,
    displayMode,
    language,
    onClose
}: {
    reportData: any,
    includeParameters: boolean,
    includeEntries: boolean,
    includeSummary: boolean,
    displayMode: 'raw' | 'balance',
    language: Lang,
    onClose: () => void
}) {
    const reportRef = useRef<HTMLDivElement | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // const handlePrint = useReactToPrint({
    //     content: () => reportRef.current,
    //     pageStyle: `
    //         @page {
    //             size: A4;
    //             margin: 15mm;
    //         }
    //         @media print {
    //             body {
    //                 -webkit-print-color-adjust: exact;
    //                 margin: 0;
    //                 padding: 0;
    //             }
    //             .report-content {
    //                 padding: 15mm;
    //             }
    //         }
    //     `
    // })

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return language === 'pl' ? `${day}.${month}.${year}` : `${month}/${day}/${year}`;
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return

        const canvas = await html2canvas(reportRef.current, {
            // scale: 2,
            useCORS: true,
            logging: true,
            // windowWidth: reportRef.current.scrollWidth,
            // windowHeight: reportRef.current.scrollHeight
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgWidth = 190 // A4 width in mm (210 - 20mm margins)
        const pageHeight = 277 // A4 height in mm (297 - 20mm margins)
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 10 // top margin


        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        const formattedStartDate = new Date(reportData.parameters.startDate).toISOString().split('T')[0]
        const formattedEndDate = new Date(reportData.parameters.endDate).toISOString().split('T')[0]
        pdf.save(`raport_stanu_pojemnikow_${formatDate(formattedStartDate)}_${formatDate(formattedEndDate)}.pdf`)
    }

    if (!isClient || !reportData) return null

    return (
        <div className="fixed text-black inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t(language, 'reportViewer')}</h2>
                    <div className="flex gap-2 text-white">
                        <Button variant="outline" onClick={handleDownloadPDF}>
                            <Download className="w-4 h-4 mr-2" />
                            {t(language, 'downloadPDF')}
                        </Button>
                        <Button onClick={handleDownloadPDF}>
                            <Printer className="w-4 h-4 mr-2" />
                            {t(language, 'print')}
                        </Button>
                        <Button variant="ghost" className="text-black" onClick={onClose}>
                            {t(language, 'close')}
                        </Button>
                    </div>
                </div>
                <div className="overflow-auto p-4">
                    <div
                        ref={(el) => { reportRef.current = el; }}
                        className="bg-white p-6 mx-auto shadow-none print:shadow-none report-content"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            margin: '0 auto'
                        }}
                    >
                        <ReportContent
                            reportData={reportData}
                            includeParameters={includeParameters}
                            includeEntries={includeEntries}
                            includeSummary={includeSummary}
                            displayMode={displayMode}
                            language={language}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ReportContent({
    reportData,
    includeParameters,
    includeEntries,
    includeSummary,
    displayMode,
    language
}: {
    reportData: any,
    includeParameters: boolean,
    includeEntries: boolean,
    includeSummary: boolean,
    displayMode: 'raw' | 'balance',
    language: Lang
}) {
    const { parameters, entries, summary } = reportData

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return language === 'pl' ? `${day}.${month}.${year}` : `${month}/${day}/${year}`;
    };

    const renderEntryCells = (entry: any) => {
        if (displayMode === 'raw') {
            return (
                <>
                    {parameters.boxTypes.includes('E1') && (
                        <>
                            <td className="border p-2 text-right">{entry.E1in || 0}</td>
                            <td className="border p-2 text-right">{entry.E1out || 0}</td>
                        </>
                    )}
                    {parameters.boxTypes.includes('E2') && (
                        <>
                            <td className="border p-2 text-right">{entry.E2in || 0}</td>
                            <td className="border p-2 text-right">{entry.E2out || 0}</td>
                        </>
                    )}
                </>
            )
        } else {
            return (
                <>
                    {parameters.boxTypes.includes('E1') && (
                        <td className="border p-2 text-right">
                            {(entry.E1out || 0) - (entry.E1in || 0)}
                        </td>
                    )}
                    {parameters.boxTypes.includes('E2') && (
                        <td className="border p-2 text-right">
                            {(entry.E2out || 0) - (entry.E2in || 0)}
                        </td>
                    )}
                </>
            )
        }
    }

    const renderSummaryTotals = () => {
        if (displayMode === 'raw') {
            return (
                <>
                    {parameters.boxTypes.includes('E1') && (
                        <>
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="text-sm text-blue-600">{t(language, 'e1Intake')}</div>
                                <div className="text-xl font-bold">{summary.totalE1in}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="text-sm text-blue-600">{t(language, 'e1Output')}</div>
                                <div className="text-xl font-bold">{summary.totalE1out}</div>
                            </div>
                        </>
                    )}
                    {parameters.boxTypes.includes('E2') && (
                        <>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="text-sm text-green-600">{t(language, 'e2Intake')}</div>
                                <div className="text-xl font-bold">{summary.totalE2in}</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="text-sm text-green-600">{t(language, 'e2Output')}</div>
                                <div className="text-xl font-bold">{summary.totalE2out}</div>
                            </div>
                        </>
                    )}
                </>
            )
        } else {
            return (
                <>
                    {parameters.boxTypes.includes('E1') && (
                        <div className="bg-blue-50 p-3 rounded">
                            <div className="text-sm text-blue-600">{t(language, 'e1Balance')}</div>
                            <div className="text-xl font-bold">
                                {summary.totalE1out - summary.totalE1in}
                            </div>
                        </div>
                    )}
                    {parameters.boxTypes.includes('E2') && (
                        <div className="bg-green-50 p-3 rounded">
                            <div className="text-sm text-green-600">{t(language, 'e2Balance')}</div>
                            <div className="text-xl font-bold">
                                {summary.totalE2out - summary.totalE2in}
                            </div>
                        </div>
                    )}
                </>
            )
        }
    }

    const renderCompanySummaryCells = (totals: any) => {
        if (displayMode === 'raw') {
            return (
                <>
                    {parameters.boxTypes.includes('E1') && (
                        <>
                            <td className="border p-2 text-right">{totals.E1in}</td>
                            <td className="border p-2 text-right">{totals.E1out}</td>
                        </>
                    )}
                    {parameters.boxTypes.includes('E2') && (
                        <>
                            <td className="border p-2 text-right">{totals.E2in}</td>
                            <td className="border p-2 text-right">{totals.E2out}</td>
                        </>
                    )}
                </>
            )
        } else {
            return (
                <>
                    {parameters.boxTypes.includes('E1') && (
                        <td className="border p-2 text-right">
                            {totals.E1out - totals.E1in}
                        </td>
                    )}
                    {parameters.boxTypes.includes('E2') && (
                        <td className="border p-2 text-right">
                            {totals.E2out - totals.E2in}
                        </td>
                    )}
                </>
            )
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">{t(language, 'boxBalanceReport')}</h1>
                <p className="text-gray-600">
                    {formatDate(parameters.startDate)} {t(language, 'to')} {formatDate(parameters.endDate)}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                    {t(language, 'displaying')}: {displayMode === 'raw' ? t(language, 'rawValues') : t(language, 'balances')}
                </p>
            </div>

            {/* Parameters */}
            {includeParameters && (
                <div className="mb-6 p-4 border rounded">
                    <h2 className="text-lg font-semibold mb-2">{t(language, 'reportParameters')}</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="font-medium">{t(language, 'dateRange')}:</span>{' '}
                            {formatDate(parameters.startDate)} {t(language, 'to')} {formatDate(parameters.endDate)}
                        </div>
                        <div>
                            <span className="font-medium">{t(language, 'boxTypes')}:</span>{' '}
                            {parameters.boxTypes.join(', ')}
                        </div>
                        <div>
                            <span className="font-medium">{t(language, 'companies')}:</span>{' '}
                            {parameters.companies.length > 0
                                ? parameters.companies.join(', ')
                                : t(language, 'all')}
                        </div>
                        <div>
                            <span className="font-medium">{t(language, 'entriesIncluded')}:</span>{' '}
                            {parameters.includeEntries ? t(language, 'yes') : t(language, 'no')}
                        </div>
                        <div>
                            <span className="font-medium">{t(language, 'summaryIncluded')}:</span>{' '}
                            {parameters.includeSummary ? t(language, 'yes') : t(language, 'no')}
                        </div>
                        <div>
                            <span className="font-medium">{t(language, 'displayMode')}:</span>{' '}
                            {displayMode === 'raw' ? t(language, 'rawValues') : t(language, 'balances')}
                        </div>
                    </div>
                </div>
            )}

            {/* Entries Table */}
            {includeEntries && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">{t(language, 'entries')}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">{t(language, 'date')}</th>
                                    <th className="border p-2">{t(language, 'company')}</th>
                                    {displayMode === 'raw' ? (
                                        <>
                                            {parameters.boxTypes.includes('E2') && (
                                                <>
                                                    <th className="border p-2">{t(language, 'e2Intake')}</th>
                                                    <th className="border p-2">{t(language, 'e2Output')}</th>
                                                </>
                                            )}
                                            {parameters.boxTypes.includes('E1') && (
                                                <>
                                                    <th className="border p-2">{t(language, 'e1Intake')}</th>
                                                    <th className="border p-2">{t(language, 'e1Output')}</th>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {parameters.boxTypes.includes('E2') && (
                                                <th className="border p-2">{t(language, 'e2Balance')}</th>
                                            )}
                                            {parameters.boxTypes.includes('E1') && (
                                                <th className="border p-2">{t(language, 'e1Balance')}</th>
                                            )}
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry: any, index: number) => {
                                    const rows = [];
                                    rows.push(
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border p-2">
                                                {formatDate(entry.entry_date)}
                                            </td>
                                            <td className="border p-2">{entry.company}</td>
                                            {renderEntryCells(entry)}
                                        </tr>
                                    );
                                    if (!includeParameters) {
                                        if (index === 21 || (index > 22 && (index - 21) % 26 === 0 && index <= 47) || (index > 47 && (index - 20) % 26 === 0 && index < 96) || (index >= 96 && (index - 19) % 26 === 0 && index < 120) || (index > 120 && (index - 18) % 26 === 0 && index < 141) || (index > 140 && (index - 17) % 26 === 0 && index < 170) || (index > 169 && (index - 16) % 26 === 0 && index < 195) || (index > 195 && (index - 15) % 26 === 0)) {
                                            rows.push(
                                                <tr key={`empty-${index}`} className="h-8">
                                                    <td></td>
                                                </tr>
                                            );
                                            rows.push(
                                                <tr key={`empty-${index + 1}`} className="h-8">
                                                    <td></td>
                                                </tr>
                                            );
                                            if (index > 16) {
                                                rows.push(
                                                    <tr key={`empty-${index + 2}`} className="h-8">
                                                        <td></td>
                                                    </tr>
                                                );
                                            }
                                            if (index === 47 || index === 72 || index === 97 || index === 122 || index === 147 || index === 172 || index === 197 || index === 222) {
                                                rows.push(
                                                    <tr key={`empty-${index + 3}`} className="h-8">
                                                        <td></td>
                                                    </tr>
                                                );
                                            }
                                        }
                                    } else {
                                        if (index === 16 || (index > 17 && (index - 17) % 26 === 0 && index < 100) || (index > 100 && (index - 16) % 26 === 0 && index < 165) || (index > 165 && (index - 15) % 26 === 0 && index < 220) || (index > 220 && (index - 14) % 26 === 0)) {
                                            rows.push(
                                                <tr key={`empty-${index}`} className="h-8">
                                                    <td></td>
                                                </tr>
                                            );
                                            rows.push(
                                                <tr key={`empty-${index + 1}`} className="h-8">
                                                    <td></td>
                                                </tr>
                                            );
                                            if (index >= 16) {
                                                rows.push(
                                                    <tr key={`empty-${index + 2}`} className="h-8">
                                                        <td></td>
                                                    </tr>
                                                );
                                            }
                                            if (index === 120 || index === 171 || index === 222) {
                                                rows.push(
                                                    <tr key={`empty-${index + 3}`} className="h-8">
                                                        <td></td>
                                                    </tr>
                                                );
                                            }
                                        }
                                    }

                                    return rows;
                                }).flat()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Summary Section */}
            {includeSummary && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">{t(language, 'summary')}</h2>

                    {/* Totals */}
                    <div className="mb-4 p-4 border rounded">
                        <h3 className="font-medium mb-2">
                            {t(language, 'total')} {displayMode === 'raw' ? t(language, 'values') : t(language, 'balances')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {renderSummaryTotals()}
                        </div>
                    </div>

                    {/* By Company */}
                    <div>
                        <h3 className="font-medium mb-2">{t(language, 'byCompany')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2">{t(language, 'company')}</th>
                                        {displayMode === 'raw' ? (
                                            <>
                                                {parameters.boxTypes.includes('E2') && (
                                                    <>
                                                        <th className="border p-2">{t(language, 'e2Intake')}</th>
                                                        <th className="border p-2">{t(language, 'e2Output')}</th>
                                                    </>
                                                )}
                                                {parameters.boxTypes.includes('E1') && (
                                                    <>
                                                        <th className="border p-2">{t(language, 'e1Intake')}</th>
                                                        <th className="border p-2">{t(language, 'e1Output')}</th>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {parameters.boxTypes.includes('E2') && (
                                                    <th className="border p-2">{t(language, 'e2Balance')}</th>
                                                )}
                                                {parameters.boxTypes.includes('E1') && (
                                                    <th className="border p-2">{t(language, 'e1Balance')}</th>
                                                )}

                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.byCompany).map(([company, totals]: [string, any], index) => (
                                        <tr key={company} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border p-2">{company}</td>
                                            {renderCompanySummaryCells(totals)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-sm text-gray-500">
                <p>
                    {t(language, 'generatedOn')} {formatDate(new Date())} {t(language, 'at')} {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    )
}