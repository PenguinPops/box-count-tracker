"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import EntryForm from "@/components/entry-form"
import type { EntryFormProps } from "@/components/entry-form"

interface CollapsibleEntryFormProps extends EntryFormProps {
  index: number
  isOpen: boolean
  onToggle: () => void
  onRemove?: () => void
}

export function CollapsibleEntryForm({
  index,
  isOpen,
  onToggle,
  onRemove,
  ...entryFormProps
}: CollapsibleEntryFormProps) {
  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <h3 className="font-medium">
            Entry #{index + 1}
          </h3>
          {entryFormProps.entry && (
            <span className="ml-2 text-sm text-muted-foreground">
              {entryFormProps.entry.entry_date}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          )}
          <Button variant="ghost" size="sm">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {/* Always render the form, but hide it with CSS when collapsed */}
      <div 
        className={`p-4 transition-all duration-200 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <EntryForm {...entryFormProps} />
      </div>
    </div>
  )
}