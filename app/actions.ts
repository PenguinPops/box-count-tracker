"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create companies table
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `

    // Create entries table
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        entry_date DATE NOT NULL,
        company_id INTEGER NOT NULL,
        value1 DECIMAL(10, 2) NOT NULL,
        value2 DECIMAL(10, 2) NOT NULL,
        value3 DECIMAL(10, 2) NOT NULL,
        value4 DECIMAL(10, 2) NOT NULL,
        balance1 DECIMAL(10, 2) NOT NULL,
        balance2 DECIMAL(10, 2) NOT NULL,
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_starting_balance BOOLEAN DEFAULT FALSE,
        CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT NOT NULL
      )
    `

    // Insert default companies
    await sql`
      INSERT INTO companies (name) VALUES 
      ('publimar'),
      ('duda'),
      ('indykpol'),
      ('łuków')
      ON CONFLICT (name) DO NOTHING
    `

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { error: "Failed to initialize database" }
  }
}

// Add a new company
export async function addCompany(formData: FormData) {
  const name = formData.get("name") as string

  if (!name) {
    return { error: "Company name is required" }
  }

  try {
    await sql`INSERT INTO companies (name) VALUES (${name})`
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error adding company:", error)
    return { error: "Failed to add company" }
  }
}

// Add a new entry
export async function addEntry(formData: FormData) {
  const entryDate = formData.get("entryDate") as string
  const companyId = Number.parseInt(formData.get("companyId") as string)
  const value1 = Number.parseFloat(formData.get("value1") as string)
  const value2 = Number.parseFloat(formData.get("value2") as string)
  const value3 = Number.parseFloat(formData.get("value3") as string)
  const value4 = Number.parseFloat(formData.get("value4") as string)
  const photoUrl = (formData.get("photoUrl") as string) || null
  const isStartingBalance = formData.get("isStartingBalance") === "true"

  // Calculate balances
  const balance1 = value3 - value1
  const balance2 = value4 - value2

  try {
    await sql`
      INSERT INTO entries (
        entry_date, company_id, value1, value2, value3, value4, 
        balance1, balance2, photo_url, is_starting_balance
      ) 
      VALUES (
        ${entryDate}, ${companyId}, ${value1}, ${value2}, ${value3}, ${value4}, 
        ${balance1}, ${balance2}, ${photoUrl}, ${isStartingBalance}
      )
    `

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error adding entry:", error)
    return { error: "Failed to add entry" }
  }
}

// Update an entry
export async function updateEntry(id: number, formData: FormData) {
  const entryDate = formData.get("entryDate") as string
  const companyId = Number.parseInt(formData.get("companyId") as string)
  const value1 = Number.parseFloat(formData.get("value1") as string)
  const value2 = Number.parseFloat(formData.get("value2") as string)
  const value3 = Number.parseFloat(formData.get("value3") as string)
  const value4 = Number.parseFloat(formData.get("value4") as string)
  const photoUrl = (formData.get("photoUrl") as string) || null
  const isStartingBalance = formData.get("isStartingBalance") === "true"

  // Calculate balances
  const balance1 = value3 - value1
  const balance2 = value4 - value2

  try {
    await sql`
      UPDATE entries 
      SET 
        entry_date = ${entryDate},
        company_id = ${companyId},
        value1 = ${value1},
        value2 = ${value2},
        value3 = ${value3},
        value4 = ${value4},
        balance1 = ${balance1},
        balance2 = ${balance2},
        photo_url = ${photoUrl},
        is_starting_balance = ${isStartingBalance}
      WHERE id = ${id}
    `

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating entry:", error)
    return { error: "Failed to update entry" }
  }
}

// Delete an entry
export async function deleteEntry(id: number) {
  try {
    await sql`DELETE FROM entries WHERE id = ${id}`
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting entry:", error)
    return { error: "Failed to delete entry" }
  }
}

// Upload photo and return URL
export async function handlePhotoUpload(formData: FormData) {
  // In a real app, you would use a service like Vercel Blob or AWS S3
  // For this example, we'll just return a placeholder URL
  return { url: `/placeholder.svg?height=300&width=300` }
}

export async function importCSVEntries(entries: any[]) {
  try {
    let count = 0
    
    for (const entry of entries) {
      if (!entry.companyId) continue
      
      const formData = new FormData()
      formData.append('entryDate', entry.date)
      formData.append('companyId', entry.companyId.toString())
      formData.append('value1', entry.value1.toString())
      formData.append('value2', entry.value2.toString())
      formData.append('value3', entry.value3.toString())
      formData.append('value4', entry.value4.toString())
      formData.append('isStartingBalance', 'false') // Default to false for imports
      
      const result = await addEntry(formData)
      if (!result.error) count++
    }

    return { count, error: null }
  } catch (error) {
    return { count: 0, error: 'Failed to import entries' }
  }
}