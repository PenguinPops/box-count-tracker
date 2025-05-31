import { User } from "@/app/types"
import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Helper function to check if database is initialized
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const entriesExists = await tableExists("entries")
    const companiesExists = await tableExists("companies")
    return entriesExists && companiesExists
  } catch (error) {
    console.error("Error checking if database is initialized:", error)
    return false
  }
}

// Helper function to check if database is connected
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch {
    return false
  }
}

// Helper function to get all companies
export async function getCompanies() {
  try {
    if (!(await tableExists("companies"))) {
      return []
    }
    const companies = await sql`SELECT * FROM companies ORDER BY name`
    return companies
  } catch (error) {
    console.error("Error getting companies:", error)
    return []
  }
}

// Helper function to get all entries
export async function getEntries(limit = 100, offset = 0) {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const entries = await sql`
      SELECT 
        e.id, 
        e.entry_date, 
        c.name as company, 
        e.E2in, 
        e.E1in, 
        e.E2out, 
        e.E1out, 
        e.photo_url,
        e.is_starting_balance
      FROM entries e
      JOIN companies c ON e.company_id = c.id
      ORDER BY e.entry_date DESC, e.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return entries
  } catch (error) {
    console.error("Error getting entries:", error)
    return []
  }
}

// Helper function to get entry by id
export async function getEntryById(id: number) {
  try {
    if (!(await tableExists("entries"))) {
      return null
    }
    const [entry] = await sql`
      SELECT 
        e.id, 
        e.entry_date, 
        c.name as company, 
        c.id as company_id,
        e.E2in, 
        e.E1in, 
        e.E2out, 
        e.E1out, 
        e.photo_url,
        e.is_starting_balance
      FROM entries e
      JOIN companies c ON e.company_id = c.id
      WHERE e.id = ${id}
    `
    return entry
  } catch (error) {
    console.error(`Error getting entry with id ${id}:`, error)
    return null
  }
}

// Helper function to get statistics by company
export async function getStatsByCompany(includeStartingBalance: boolean) {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const stats = await sql`
      SELECT 
        c.name as company,
        SUM(e.E2in) as total_E2in,
        SUM(e.E1in) as total_E1in,
        SUM(e.E2out) as total_E2out,
        SUM(e.E1out) as total_E1out,
        COUNT(*) as entry_count
      FROM entries e
      JOIN companies c ON e.company_id = c.id
      ${includeStartingBalance ? sql`` : sql`WHERE e.is_starting_balance = false`}
      GROUP BY c.name
      ORDER BY c.name
    `
    return stats
  } catch (error) {
    console.error("Error getting stats by company:", error)
    return []
  }
}

// Helper function to get statistics by month
export async function getStatsByMonth(includeStartingBalance: boolean) {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const stats = await sql`
      SELECT 
        TO_CHAR(e.entry_date, 'YYYY-MM') as month,
        SUM(e.E2in) as total_E2in,
        SUM(e.E1in) as total_E1in,
        SUM(e.E2out) as total_E2out,
        SUM(e.E1out) as total_E1out,
        COUNT(*) as entry_count
      FROM entries e
      ${includeStartingBalance ? sql`` : sql`WHERE e.is_starting_balance = false`}
      GROUP BY TO_CHAR(e.entry_date, 'YYYY-MM')
      ORDER BY month DESC
    `
    return stats
  } catch (error) {
    console.error("Error getting stats by month:", error)
    return []
  }
}

// Helper function to get statistics by quarter
export async function getStatsByQuarter(includeStartingBalance: boolean) {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const stats = await sql`
      SELECT 
        TO_CHAR(e.entry_date, 'YYYY') || '-Q' || TO_CHAR(e.entry_date, 'Q') as quarter,
        SUM(e.E2in) as total_E2in,
        SUM(e.E1in) as total_E1in,
        SUM(e.E2out) as total_E2out,
        SUM(e.E1out) as total_E1out,
        COUNT(*) as entry_count
      FROM entries e
      ${includeStartingBalance ? sql`` : sql`WHERE e.is_starting_balance = false`}
      GROUP BY TO_CHAR(e.entry_date, 'YYYY'), TO_CHAR(e.entry_date, 'Q')
      ORDER BY quarter DESC
    `
    return stats
  } catch (error) {
    console.error("Error getting stats by quarter:", error)
    return []
  }
}

// Helper function to get starting balances
export async function getStartingBalances() {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const balances = await sql`
      SELECT 
        e.id, 
        e.entry_date, 
        c.name as company_name, 
        e.E2in, 
        e.E1in, 
        e.E2out, 
        e.E1out
      FROM entries e
      JOIN companies c ON e.company_id = c.id
      WHERE e.is_starting_balance = true
      ORDER BY c.name
    `
    return balances
  } catch (error) {
    console.error("Error getting starting balances:", error)
    return []
  }
}

// Helper function to delete entries by an array of IDs
export async function deleteEntries(ids: number[]) {
  try {
    if (!(await tableExists("entries"))) {
      return
    }

    if (ids.length === 0) return

    await sql`
      DELETE FROM entries
      WHERE id = ANY(${ids})
    `
  } catch (error) {
    console.error("Error deleting entries:", error)
    throw error
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
  const result = await sql`
    SELECT value FROM settings WHERE key = ${key}
  `
  return result.length > 0 ? result[0].value : null
  } catch (error) {
    console.error(`Error getting setting for key ${key}:`, error)
    return null
  }
}

export async function setSetting(key: string, value: string) {
  await sql`
    INSERT INTO settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `
}

export async function modifySetting(key: string, value: string) {
  const currentValue = await getSetting(key)
  if (currentValue === null) {
    await setSetting(key, value)
  } else {
    await sql`
      UPDATE settings
      SET value = ${value}
      WHERE key = ${key}
    `
  }
}

// Helper function to get the earliest entry date
export async function getEarliestEntryDate(): Promise<string | null> {
  try {
    if (!(await tableExists("entries"))) {
      return null
    }
    const [result] = await sql`
      SELECT MIN(entry_date) AS earliest_date FROM entries
    `
    return result?.earliest_date ?? null
  } catch (error) {
    console.error("Error getting earliest entry date:", error)
    return null
  }
}

// Helper function to get the latest entry date
export async function getLatestEntryDate(): Promise<string | null> {
  try {
    if (!(await tableExists("entries"))) {
      return null
    }
    const [result] = await sql`
      SELECT MAX(entry_date) AS latest_date FROM entries
    `
    return result?.latest_date ?? null
  } catch (error) {
    console.error("Error getting latest entry date:", error)
    return null
  }
}

export async function getUserFromDb(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email}
    `
    const user: User | null = result.length > 0 ? result[0] as User : null
    return user
  } catch (error) {
    console.error("Error getting user from database:", error)
    return null
  }
}