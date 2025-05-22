"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { addEntry, updateEntry, deleteEntry, handlePhotoUpload } from "@/app/actions"
import { AlertCircle, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

interface Company {
  id: number
  name: string
}

interface Entry {
  id: number
  entry_date: string
  company_id: number
  value1: number
  value2: number
  value3: number
  value4: number
  balance1: number
  balance2: number
  photo_url: string | null
  is_starting_balance: boolean
}

interface EntryFormProps {
  companies: Company[]
  entry?: Entry
}

export default function EntryForm({ companies, entry }: EntryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(entry?.photo_url || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isStartingBalance, setIsStartingBalance] = useState(entry?.is_starting_balance || false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)

      // Handle photo upload if there's a new file
      if (photoFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", photoFile)
        const result = await handlePhotoUpload(uploadFormData)
        if (result.url) {
          formData.set("photoUrl", result.url)
        }
      } else if (photoUrl) {
        formData.set("photoUrl", photoUrl)
      }

      // Add starting balance flag
      formData.set("isStartingBalance", isStartingBalance.toString())

      // Submit the form
      const result = entry ? await updateEntry(entry.id, formData) : await addEntry(formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push("/entries")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!entry) return

    if (confirm("Are you sure you want to delete this entry?")) {
      setLoading(true)
      try {
        await deleteEntry(entry.id)
        router.push("/entries")
      } catch (err) {
        setError("Failed to delete entry")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0])
      // Create a preview URL
      const url = URL.createObjectURL(e.target.files[0])
      setPhotoUrl(url)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="entryDate">Date</Label>
          <Input
            id="entryDate"
            name="entryDate"
            type="date"
            defaultValue={entry ? format(new Date(entry.entry_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <Select name="companyId" defaultValue={entry?.company_id?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value1">Value 1</Label>
          <Input id="value1" name="value1" type="number" step="0.01" defaultValue={entry?.value1 || 0} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value2">Value 2</Label>
          <Input id="value2" name="value2" type="number" step="0.01" defaultValue={entry?.value2 || 0} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value3">Value 3</Label>
          <Input id="value3" name="value3" type="number" step="0.01" defaultValue={entry?.value3 || 0} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value4">Value 4</Label>
          <Input id="value4" name="value4" type="number" step="0.01" defaultValue={entry?.value4 || 0} required />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isStartingBalance"
            checked={isStartingBalance}
            onCheckedChange={(checked) => setIsStartingBalance(checked as boolean)}
          />
          <Label htmlFor="isStartingBalance">This is a starting balance entry</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Photo Proof (Optional)</Label>
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => document.getElementById("photo")?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
          <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {photoUrl && (
            <div className="relative w-20 h-20 rounded-md overflow-hidden">
              <img src={photoUrl || "/placeholder.svg"} alt="Photo preview" className="object-cover w-full h-full" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {entry && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : entry ? "Update Entry" : "Create Entry"}
          </Button>
        </div>
      </div>
    </form>
  )
}
