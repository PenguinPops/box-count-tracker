"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CollapsibleEntryForm } from "@/components/collapsible-entry-form"
import { addEntry } from "@/app/actions"
import { Company } from "@/app/types"
import { Lang, t } from "@/lib/i18n"
import { createRef, useEffect } from "react"

interface MultiEntryFormProps {
  companies: Company[]
  lang: Lang
}

export default function MultiEntryForm({ companies, lang }: MultiEntryFormProps) {
  const router = useRouter()
  const [entries, setEntries] = useState([{ id: 0, isOpen: true }])
  const [isSubmittingAll, setIsSubmittingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState(0)
  
  // Create refs for each form
  const formRefs = useRef<{ [key: number]: React.RefObject<HTMLFormElement | null> }>({})

  // Initialize refs for existing entries
  useEffect(() => {
    entries.forEach(entry => {
      if (!formRefs.current[entry.id]) {
        formRefs.current[entry.id] = createRef<HTMLFormElement>()
      }
    })
  }, [])

  const addEntryForm = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 0
    setEntries([...entries, { id: newId, isOpen: false }])
    // Create ref for new entry
    formRefs.current[newId] = createRef<HTMLFormElement>()
  }

  const toggleEntry = (id: number) => {
    setEntries(entries.map(entry => ({
      ...entry,
      isOpen: entry.id === id ? !entry.isOpen : false
    })))
  }

  const removeEntry = (id: number) => {
    if (entries.length <= 1) return
    setEntries(entries.filter(entry => entry.id !== id))
    // Clean up ref
    delete formRefs.current[id]
  }

  const validateForm = (formData: FormData): string | null => {
    const requiredFields = ['entryDate', 'companyId', 'E2in', 'E2out', 'E1in', 'E1out']
    
    for (const field of requiredFields) {
      const value = formData.get(field)
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `Missing required field: ${field}`
      }
    }
    
    // Validate company selection
    const companyId = formData.get('companyId')
    if (!companyId || companyId === '') {
      return 'Please select a company'
    }
    
    return null
  }

  const handleSubmitAll = async () => {
    setIsSubmittingAll(true)
    setError(null)
    setSuccessCount(0)

    try {
      const results = []
      let successfulSubmissions = 0

      // Process each form
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const formRef = formRefs.current[entry.id]
        
        if (!formRef?.current) {
          throw new Error(`Form ${i + 1} is not available`)
        }

        const formData = new FormData(formRef.current)
        
        // Validate the form data
        const validationError = validateForm(formData)
        if (validationError) {
          throw new Error(`Entry ${i + 1}: ${validationError}`)
        }

        try {
          // Submit individual entry
          const result = await addEntry(formData)
          
          if (result.error) {
            throw new Error(`Entry ${i + 1}: ${result.error}`)
          }
          
          results.push({ success: true, entryIndex: i + 1 })
          successfulSubmissions++
          setSuccessCount(successfulSubmissions)
        } catch (entryError) {
          throw new Error(`Entry ${i + 1}: ${entryError instanceof Error ? entryError.message : 'Unknown error'}`)
        }
      }

      // If we get here, all submissions were successful
      router.push("/entries")
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error submitting entries:', err)
    } finally {
      setIsSubmittingAll(false)
    }
  }

  // Create refs for new entries when entries array changes
  useEffect(() => {
    entries.forEach(entry => {
      if (!formRefs.current[entry.id]) {
        formRefs.current[entry.id] = createRef<HTMLFormElement>()
      }
    })
  }, [entries])

  return (
    <>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSubmittingAll && successCount > 0 && (
        <Alert className="mb-6">
          <AlertDescription>
            Successfully submitted {successCount} of {entries.length} entries...
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "entryDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.map((entry) => (
            <CollapsibleEntryForm
              key={entry.id}
              index={entry.id}
              isOpen={entry.isOpen}
              onToggle={() => toggleEntry(entry.id)}
              onRemove={entries.length > 1 ? () => removeEntry(entry.id) : undefined}
              companies={companies}
              lang={lang}
              isNew={true}
              formRef={formRefs.current[entry.id] as React.RefObject<HTMLFormElement>}
            />
          ))}
          
          <div className="flex justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={addEntryForm}
              disabled={isSubmittingAll}
            >
              Add Another Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={handleSubmitAll}
          disabled={isSubmittingAll}
        >
          {isSubmittingAll ? (
            successCount > 0 
              ? `${t(lang, "savingAll")} (${successCount}/${entries.length})`
              : t(lang, "savingAll")
          ) : (
            t(lang, "createAllEntries")
          )}
        </Button>
      </div>
    </>
  )
}