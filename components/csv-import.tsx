"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseCSV } from "@/lib/utils"
import { importCSVEntries } from "@/app/actions"
import { Company, Entry } from "@/app/types"
import { t, Lang } from "@/lib/i18n"

interface ProcessedEntry {
  entry: Omit<Entry, 'id' | 'photo_url'> & { companyName: string }
  include: boolean
}

// Column mapping for different CSV formats
const COLUMN_MAPPINGS = {
  date: ['data'],
  company: ['firma'],
  e2intake: ['E2 box intake', 'pojemniki przyjęte E2'],
  e1intake: ['E1 box intake', 'pojemniki przyjęte E1'],
  e2return: ['E2 box return', 'pojemniki oddane E2'],
  e1return: ['E1 box return', 'pojemniki oddane E1']
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return dateStr
  
  // Handle both DD/MM/YYYY and DD.MM.YYYY formats
  const normalizedDate = dateStr.replace(/\./g, '/')
  
  // If it's already in a standard format, return as is
  if (normalizedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return normalizedDate
  }
  
  // Convert DD/MM/YYYY to YYYY-MM-DD for consistency
  const parts = normalizedDate.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    if (day.length <= 2 && month.length <= 2 && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }
  
  return dateStr
}

function findColumnValue(row: any, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    if (row.hasOwnProperty(key) && row[key] !== undefined && row[key] !== null) {
      return row[key]
    }
  }
  return null
}

// Custom CSV parser to handle semicolon-delimited files
function parseCSVWithSemicolon(csvText: string): any[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  // Get headers from first line
  const headers = lines[0].split(';').map(h => h.trim())
  
  // Parse data rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

export default function CSVImport({ companies = [], lang }: { companies?: Company[], lang?: Lang }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedEntry[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setProcessedData([])
      setError(null)
      setSuccess(null)
    }
  }

  const language = lang || 'en';

  const updateRow = (index: number, field: keyof ProcessedEntry['entry'], value: any) => {
    setProcessedData(prev => {
      const newData = [...prev]
      newData[index] = {
        ...newData[index],
        entry: {
          ...newData[index].entry,
          [field]: value
        }
      }
      return newData
    })
  }

  const handlePreview = async () => {
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      
      console.log("Raw CSV text:", text.substring(0, 200) + "...")
      
      let data: any[]
      
      // Check if the CSV uses semicolons as delimiters
      const firstLine = text.split('\n')[0]
      if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
        console.log("Detected semicolon-delimited CSV")
        data = parseCSVWithSemicolon(text)
      } else {
        console.log("Using standard CSV parser")
        data = parseCSV(text)
      }

      const mappedData = data.map((row: any) => {
        const dateValue = findColumnValue(row, COLUMN_MAPPINGS.date)
        const companyValue = findColumnValue(row, COLUMN_MAPPINGS.company)
        const e2IntakeValue = findColumnValue(row, COLUMN_MAPPINGS.e2intake)
        const e1IntakeValue = findColumnValue(row, COLUMN_MAPPINGS.e1intake)
        const e2ReturnValue = findColumnValue(row, COLUMN_MAPPINGS.e2return)
        const e1ReturnValue = findColumnValue(row, COLUMN_MAPPINGS.e1return)


        const company = companies.find(c => 
          c.name.toLowerCase() === companyValue?.toLowerCase()
        )

        return {
          entry: {
            entry_date: normalizeDate(dateValue || ''),
            company_id: company?.id || 0,
            companyName: companyValue || 'Unknown',
            E2in: parseInt(e2IntakeValue) || 0,
            E1in: parseInt(e1IntakeValue) || 0,
            E2out: parseInt(e2ReturnValue) || 0,
            E1out: parseInt(e1ReturnValue) || 0,
            is_starting_balance: false,
          },
          include: !!company
        }
      })

      console.log("Mapped data:", mappedData)
      setProcessedData(mappedData)
    } catch (err) {
      setError(t(language, "failedToParseCsv"))
      console.error("CSV parsing error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!processedData.length) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const entriesToImport = processedData
        .filter(row => row.include && row.entry.company_id !== 0)
        .map(({ entry }) => ({
          entry_date: entry.entry_date,
          company_id: entry.company_id,
          E2in: entry.E2in,
          E1in: entry.E1in,
          E2out: entry.E2out,
          E1out: entry.E1out,
          is_starting_balance: entry.is_starting_balance
        }))

      if (entriesToImport.length === 0) {
        setError(t(language, "noValidEntriesToImport"))
        return
      }

      const result = await importCSVEntries(entriesToImport)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(t(language, "successfullyImported").replace("{count}", result.count.toString()))
        setProcessedData([])
        setFile(null)
        router.refresh()
      }
    } catch (err) {
      console.error("Import error:", err)
      setError(t(language, "unexpectedErrorDuringImport"))
    } finally {
      setLoading(false)
    }
  }

  const toggleAll = (include: boolean) => {
    setProcessedData(prev => prev.map(row => ({ ...row, include })))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t(language, "importEntriesFromCSV")}</h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="csvFile">{t(language, "csvFile")}</Label>
        <div className="flex items-center gap-4">
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && (
            <Button type="button" onClick={handlePreview} disabled={loading}>
              {loading ? t(language, "processing") : t(language, "preview")}
            </Button>
          )}

          <div className="flex justify-end gap-2">

            <Button type="button" variant="outline" onClick={() => { setProcessedData([]); setFile(null) }} disabled={loading}>
              {t(language, "cancel")}
            </Button>

            <Button type="button" onClick={handleImport} disabled={loading || processedData.filter(row => row.include && row.entry.company_id).length === 0}>
              {loading ? t(language, "importing") : t(language, "importEntries").replace("{count}", processedData.filter(row => row.include && row.entry.company_id).length.toString())}
            </Button>
          </div>
        </div>
      </div>

      {processedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={processedData.every(row => row.include)}
                onCheckedChange={(checked) => toggleAll(checked as boolean)}
              />

              <Label htmlFor="select-all">{t(language, "selectDeselectAll")}</Label>
            </div>
            <div className="text-sm text-gray-500">
              {t(language, "rowsSelected").replace("{selected}", processedData.filter(row => row.include).length.toString()).replace("{total}", processedData.length.toString())}
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "include")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "date")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "company")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "e2Intake")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "e1Intake")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "e2Return")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "e1Return")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "startingBalance")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(language, "status")}</th>
                </tr>
              </thead>
              <tbody className="bg-blue-950 divide-y divide-gray-500">
                {processedData.map((row, index) => (
                  <tr key={index} className={!row.entry.company_id ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={row.include}
                        onCheckedChange={(checked) => {
                          setProcessedData(prev => {
                            const newData = [...prev]
                            newData[index] = {
                              ...newData[index],
                              include: checked as boolean
                            }
                            return newData
                          })
                        }}
                        disabled={!row.entry.company_id}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.entry.entry_date}
                        onChange={(e) => updateRow(index, 'entry_date', e.target.value)}
                        className="w-28"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{row.entry.companyName}</span>
                        {!row.entry.company_id && (
                          <span className="text-xs text-yellow-600">({t(language, "unknownCompany")})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.entry.E2in}
                        onChange={(e) => updateRow(index, 'E2in', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.entry.E1in}
                        onChange={(e) => updateRow(index, 'E1in', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.entry.E2out}
                        onChange={(e) => updateRow(index, 'E2out', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.entry.E1out}
                        onChange={(e) => updateRow(index, 'E1out', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={row.entry.is_starting_balance}
                        onCheckedChange={(checked) => updateRow(index, 'is_starting_balance', checked)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {row.entry.company_id ? (
                        row.include ? (
                          <span className="text-green-600">{t(language, "willBeImported")}</span>
                        ) : (
                          <span className="text-gray-400">{t(language, "skipped")}</span>
                        )
                      ) : (
                        <span className="text-yellow-600">{t(language, "invalidCompany")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <h2 className="text-lg font-medium mb-2">{t(language, "csvFormatRequirements")}</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>{t(language, "csvRequirement1")}</li>
          <li>{t(language, "csvRequirement2")}</li>
          <li>{t(language, "csvRequirement3")}</li>
          <li>{t(language, "csvRequirement4")}</li>
          <li>{t(language, "csvRequirement5")}</li>
          <li>{t(language, "csvRequirement6")}</li>
        </ul>
      </div>
    </div>
  )
}