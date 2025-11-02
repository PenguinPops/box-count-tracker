"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X } from "lucide-react"
import { t, Lang } from "@/lib/i18n"

export default function CompanyCard({ company, language }: { company: { id: number; name: string }, language: Lang }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(company.name)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!editName.trim() || editName === company.name) {
      setIsEditing(false)
      setEditName(company.name)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/companies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: company.id,
          name: editName.trim(),
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const error = await response.json()
        console.error("Failed to update company:", error)
        setEditName(company.name)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating company:", error)
      setEditName(company.name)
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditName(company.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <div className="p-4 border rounded-md flex items-center justify-between">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
            disabled={isLoading}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="font-medium">{company.name}</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}