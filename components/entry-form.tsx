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
import { Company } from "@/app/types"
import { Lang, t } from "@/lib/i18n"

export interface EntryFormProps {
  companies: Company[]
  entry?: Entry
  lang: Lang
  isNew: boolean
  formRef?: React.RefObject<HTMLFormElement>
  onSubmit?: (data: FormData) => Promise<void>
}

interface Entry {
  id: number
  entry_date: string
  company_id: number
  e2in: number
  e1in: number
  e2out: number
  e1out: number
  photo_url?: string | null
  is_starting_balance?: boolean
}

export default function EntryForm({ companies, entry, lang, isNew, formRef, onSubmit }: EntryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(entry?.photo_url || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isStartingBalance, setIsStartingBalance] = useState(entry?.is_starting_balance || false)
  const language = lang || "en"

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
      const result = isNew ? await addEntry(formData) : await updateEntry(entry!.id, formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push("/entries")
      }
    } catch (err) {
      setError(t(language, "unexpectedErrorDuringImport"))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (isNew || !entry) return

    if (confirm(t(language, "confirmDeleteEntry"))) {
      setLoading(true)
      try {
        await deleteEntry(entry.id)
        router.push("/entries")
      } catch (err) {
        setError(t(language, "failedToDeleteEntry"))
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0])
      const url = URL.createObjectURL(e.target.files[0])
      setPhotoUrl(url)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault()
        if (onSubmit) {
          await onSubmit(new FormData(e.currentTarget))
        } else {
          await handleSubmit(e)
        }
      }}
      className="space-y-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="entryDate" className="text-xl sm:text-2xl">{t(language, "date")}</Label>
          <Input
            id="entryDate"
            name="entryDate"
            type="date"
            className=""
            defaultValue={!isNew && entry ? format(new Date(entry.entry_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyId" className="text-xl sm:text-2xl">{t(language, "company")}</Label>
          <Select name="companyId" defaultValue={!isNew ? entry?.company_id?.toString() : undefined}>
            <SelectTrigger>
              <SelectValue placeholder={t(language, "selectCompany")} />
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

        {/* E2 Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">E2</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="E2in">{t(language, "e2Intake")}</Label>
              <Input
                id="E2in"
                name="E2in"
                type="number"
                step="1"
                defaultValue={!isNew ? Math.floor(entry!.e2in) || 0 : 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="E2out">{t(language, "e2Output")}</Label>
              <Input
                id="E2out"
                name="E2out"
                type="number"
                step="1"
                defaultValue={!isNew ? Math.floor(entry!.e2out) || 0 : 0}
                required
              />
            </div>
          </div>
        </div>

        {/* E1 Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">E1</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="E1in">{t(language, "e1Intake")}</Label>
              <Input
                id="E1in"
                name="E1in"
                type="number"
                step="1"
                defaultValue={!isNew ? Math.floor(entry!.e1in) || 0 : 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="E1out">{t(language, "e1Output")}</Label>
              <Input
                id="E1out"
                name="E1out"
                type="number"
                step="1"
                defaultValue={!isNew ? Math.floor(entry!.e1out) || 0 : 0}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isStartingBalance"
            checked={isStartingBalance}
            onCheckedChange={(checked) => setIsStartingBalance(checked as boolean)}
          />
          <Label htmlFor="isStartingBalance">{t(language, "startingBalanceEntry")}</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">{t(language, "photoProofOptional")}</Label>
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => document.getElementById("photo")?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            {t(language, "uploadPhoto")}
          </Button>
          <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {photoUrl && (
            <div className="relative w-20 h-20 rounded-md overflow-hidden">
              <img src={photoUrl || "/placeholder.svg"} alt={t(language, "photoPreview")} className="object-cover w-full h-full" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          {t(language, "cancel")}
        </Button>
        <div className="flex gap-2">
          {!isNew && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              {t(language, "delete")}
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? t(language, "saving") : isNew ? t(language, "createEntry") : t(language, "updateEntry")}
          </Button>
        </div>
      </div>
    </form>
  )
}