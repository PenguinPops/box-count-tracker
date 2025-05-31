// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const result = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const currentLine = lines[i].split(',')
    const obj: any = {}

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : ''
    }

    result.push(obj)
  }

  return result
}

export async function deleteEntriesClient(ids: number[]) {
  const response = await fetch("/api/entries/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error || "Failed to delete entries")
  }

  return await response.json()
}


export async function Capitalise(str: string) {
  const str1 = str.charAt(0).toUpperCase();
  const str2 = str.slice(1);
  return str1 + str2;
}

export const formatInputDate = (date: Date | string | null | undefined) => {
  if (!date) return undefined
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().slice(0, 10) 
}

// Updated utility function
export async function saltAndHashPassword(password: string): Promise<string> {
  const response = await fetch('/api/auth/hash-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to hash password')
  }
  
  const { hashedPassword } = await response.json()
  console.log("Hashed password:", hashedPassword)
  return hashedPassword
}