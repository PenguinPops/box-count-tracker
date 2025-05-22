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

interface Company {
  id: number
  name: string
}

interface ProcessedEntry {
  date: string
  companyId: number | null
  companyName: string
  value1: number
  value2: number
  value3: number
  value4: number
  isStartingBalance: boolean
  include: boolean
  originalIndex: number
}

export default function CSVImport({ companies = [] }: { companies?: Company[] }) {
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

  const handlePreview = async () => {
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const data = parseCSV(text)
      
      const mappedData = data.map((row: any, index: number) => {
        const company = companies.find(c => c.name.toLowerCase() === row.firma?.toLowerCase())
        
        return {
          date: row.data,
          companyId: company?.id || null,
          companyName: row.firma || 'Unknown',
          value1: parseInt(row['pojemniki przyjęte E2']) || 0,
          value2: parseInt(row['pojemniki przyjęte E1']) || 0,
          value3: parseInt(row['pojemniki oddane E2']) || 0,
          value4: parseInt(row['pojemniki oddane E1']) || 0,
          isStartingBalance: false,
          include: !!company,
          originalIndex: index
        }
      })

      setProcessedData(mappedData)
    } catch (err) {
      setError("Failed to parse CSV file. Please check the format.")
      console.error(err)
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
        .filter(row => row.include && row.companyId !== null)
        .map(({ originalIndex, include, ...rest }) => rest)

      if (entriesToImport.length === 0) {
        setError("No valid entries to import")
        return
      }

      const result = await importCSVEntries(entriesToImport)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully imported ${result.count} entries`)
        setProcessedData([])
        setFile(null)
      }
    } catch (err) {
      setError("An unexpected error occurred during import")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateRow = (index: number, field: string, value: any) => {
    setProcessedData(prev => {
      const newData = [...prev]
      newData[index] = { ...newData[index], [field]: value }
      return newData
    })
  }

  const toggleAll = (include: boolean) => {
    setProcessedData(prev => prev.map(row => ({ ...row, include })))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Import Entries from CSV</h1>
      
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
        <Label htmlFor="csvFile">CSV File</Label>
        <div className="flex items-center gap-4">
          <Input 
            id="csvFile" 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            disabled={loading}
          />
          {file && (
            <Button 
              type="button" 
              onClick={handlePreview}
              disabled={loading}
            >
              {loading ? "Processing..." : "Preview"}
            </Button>
          )}
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
              <Label htmlFor="select-all">Select/Deselect All</Label>
            </div>
            <div className="text-sm text-gray-500">
              {processedData.filter(row => row.include).length} of {processedData.length} rows selected
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value 1</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value 2</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value 3</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value 4</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starting Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-blue-950 divide-y divide-gray-500">
                {processedData.map((row, index) => (
                  <tr key={row.originalIndex} className={!row.companyId ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={row.include}
                        onCheckedChange={(checked) => updateRow(index, 'include', checked)}
                        disabled={!row.companyId}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.date}
                        onChange={(e) => updateRow(index, 'date', e.target.value)}
                        className="w-28"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{row.companyName}</span>
                        {!row.companyId && (
                          <span className="text-xs text-yellow-600">(Unknown company)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.value1}
                        onChange={(e) => updateRow(index, 'value1', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.value2}
                        onChange={(e) => updateRow(index, 'value2', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.value3}
                        onChange={(e) => updateRow(index, 'value3', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={row.value4}
                        onChange={(e) => updateRow(index, 'value4', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={row.isStartingBalance}
                        onCheckedChange={(checked) => updateRow(index, 'isStartingBalance', checked)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {row.companyId ? (
                        row.include ? (
                          <span className="text-green-600">Will be imported</span>
                        ) : (
                          <span className="text-gray-400">Skipped</span>
                        )
                      ) : (
                        <span className="text-yellow-600">Invalid company</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setProcessedData([])
                setFile(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={loading || processedData.filter(row => row.include && row.companyId).length === 0}
            >
              {loading ? "Importing..." : `Import ${processedData.filter(row => row.include && row.companyId).length} Entries`}
            </Button>
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <h2 className="text-lg font-medium mb-2">CSV Format Requirements</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>CSV should have headers matching your sample data</li>
          <li>Date format should be DD/MM/YYYY (editable in preview)</li>
          <li>Company names must match exactly with your database</li>
          <li>All value columns should contain numbers</li>
          <li>You can edit values and select which rows to import</li>
        </ul>
      </div>
    </div>
  )
}