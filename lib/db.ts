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
        e.value1, 
        e.value2, 
        e.value3, 
        e.value4, 
        e.balance1, 
        e.balance2, 
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
        e.value1, 
        e.value2, 
        e.value3, 
        e.value4, 
        e.balance1, 
        e.balance2, 
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
export async function getStatsByCompany() {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const stats = await sql`
      SELECT 
        c.name as company,
        SUM(e.value1) as total_value1,
        SUM(e.value2) as total_value2,
        SUM(e.value3) as total_value3,
        SUM(e.value4) as total_value4,
        SUM(e.balance1) as total_balance1,
        SUM(e.balance2) as total_balance2,
        COUNT(*) as entry_count
      FROM entries e
      JOIN companies c ON e.company_id = c.id
      WHERE e.is_starting_balance = false
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
export async function getStatsByMonth() {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const stats = await sql`
      SELECT 
        TO_CHAR(e.entry_date, 'YYYY-MM') as month,
        SUM(e.value1) as total_value1,
        SUM(e.value2) as total_value2,
        SUM(e.value3) as total_value3,
        SUM(e.value4) as total_value4,
        SUM(e.balance1) as total_balance1,
        SUM(e.balance2) as total_balance2,
        COUNT(*) as entry_count
      FROM entries e
      WHERE e.is_starting_balance = false
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
export async function getStatsByQuarter() {
  try {
    if (!(await tableExists("entries"))) {
      return []
    }
    const stats = await sql`
      SELECT 
        TO_CHAR(e.entry_date, 'YYYY') || '-Q' || TO_CHAR(e.entry_date, 'Q') as quarter,
        SUM(e.value1) as total_value1,
        SUM(e.value2) as total_value2,
        SUM(e.value3) as total_value3,
        SUM(e.value4) as total_value4,
        SUM(e.balance1) as total_balance1,
        SUM(e.balance2) as total_balance2,
        COUNT(*) as entry_count
      FROM entries e
      WHERE e.is_starting_balance = false
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
        c.name as company, 
        e.value1, 
        e.value2, 
        e.value3, 
        e.value4, 
        e.balance1, 
        e.balance2
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
