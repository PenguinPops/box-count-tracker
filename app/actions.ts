"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { Entry } from "@/app/types"
import { isDatabaseConnected } from "@/lib/db";
import { report } from "process";

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create companies table
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        balance DECIMAL(10, 2) DEFAULT 0
      )
    `

    // Create entries table
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        entry_date DATE NOT NULL,
        company_id INTEGER NOT NULL,
        E2in DECIMAL(10, 2) NOT NULL,
        E1in DECIMAL(10, 2) NOT NULL,
        E2out DECIMAL(10, 2) NOT NULL,
        E1out DECIMAL(10, 2) NOT NULL,
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
  const E2in = Number.parseFloat(formData.get("E2in") as string)
  const E1in = Number.parseFloat(formData.get("E1in") as string)
  const E2out = Number.parseFloat(formData.get("E2out") as string)
  const E1out = Number.parseFloat(formData.get("E1out") as string)
  const photoUrl = (formData.get("photoUrl") as string) || null
  const isStartingBalance = formData.get("isStartingBalance") === "true"

  try {
    await sql`
      INSERT INTO entries (
        entry_date, company_id, e2in, e1in, e2out, e1out, photo_url, is_starting_balance
      ) 
      VALUES (
        ${entryDate}, ${companyId}, ${E2in}, ${E1in}, ${E2out}, ${E1out}, ${photoUrl}, ${isStartingBalance}
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
  const E2in = Number.parseFloat(formData.get("E2in") as string)
  const E1in = Number.parseFloat(formData.get("E1in") as string)
  const E2out = Number.parseFloat(formData.get("E2out") as string)
  const E1out = Number.parseFloat(formData.get("E1out") as string)
  const photoUrl = (formData.get("photoUrl") as string) || null
  const isStartingBalance = formData.get("isStartingBalance") === "true"

  try {
    await sql`
      UPDATE entries 
      SET 
        entry_date = ${entryDate},
        company_id = ${companyId},
        e2in = ${E2in},
        e1in = ${E1in},
        e2out = ${E2out},
        e1out = ${E1out},
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

export async function importCSVEntries(entries: Omit<Entry, 'id' | 'photo_url'>[]) {
  try {
    let count = 0

    for (const entry of entries) {
      try {
        // Convert date from DD/MM/YYYY to YYYY-MM-DD format
        const [day, month, year] = entry.entry_date.split('/')
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

        await sql`
          INSERT INTO entries (
            entry_date, company_id, E2in, E1in, E2out, E1out, is_starting_balance
          ) VALUES (
            ${isoDate}, 
            ${entry.company_id}, 
            ${entry.E2in}, 
            ${entry.E1in}, 
            ${entry.E2out}, 
            ${entry.E1out}, 
            ${entry.is_starting_balance}
          )
        `
        count++
      } catch (error) {
        console.error(`Error importing entry for date ${entry.entry_date}:`, error)
        // Continue with next entry even if one fails
      }
    }

    revalidatePath("/")
    return { count, error: count === 0 ? 'No entries were imported' : null }
  } catch (error) {
    console.error("Error in importCSVEntries:", error)
    return { count: 0, error: 'Failed to import entries' }
  }
}

export interface ReportData {
  parameters: {
    startDate: string;
    endDate: string;
    boxTypes: string[];
    companies: string[]; // Names of companies for display
    selectedCompanyIds?: number[] | null; // Actual IDs used for filtering
    includeSummary: boolean;
  };
  entries: Array<{ // Define a more specific type for an entry if possible
    id: number;
    entry_date: string; // Ensure date is string for consistency
    company: string;
    company_id?: number;
    E2in?: number;
    E1in?: number;
    E2out?: number;
    E1out?: number;
    photo_url?: string;
    is_starting_balance?: boolean;
  }>;
  summary?: {
    totalE1in: number;
    totalE1out: number;
    totalE2in: number;
    totalE2out: number;
    byCompany: {
      [companyName: string]: {
        E1in: number;
        E1out: number;
        E2in: number;
        E2out: number;
      };
    };
  };
}

interface GenerateReportParams {
  startDate: string;
  endDate: string;
  selectedCompanyIds: number[] | null; // null or empty array means all companies
  selectedCompanyNames: string[]; // Names for the parameters display
  boxTypes: string[];
  includeSummary: boolean;
}

export async function generateReportDataAction(params: GenerateReportParams): Promise<ReportData> {
  const {
    startDate,
    endDate,
    selectedCompanyIds,
    selectedCompanyNames,
    boxTypes,
    includeSummary
  } = params;

  // --- 1. Fetch Entries ---
  // IMPORTANT: For optimal performance, filtering (dates, company IDs) should ideally happen 
  // in the SQL query. The current `getEntries` in your `lib/db.ts` doesn't support this.
  // The query below demonstrates direct SQL usage for better filtering.

  let queryConditions = [sql`e.entry_date >= ${startDate}`, sql`e.entry_date <= ${endDate}`];
  if (selectedCompanyIds && selectedCompanyIds.length > 0) {
    // Note: Handling arrays with `ANY` in `sql` tagged templates can be tricky.
    // This often looks like `sql`... WHERE id = ANY(${selectedCompanyIds}::integer[])`
    // or by constructing the condition string if the helper allows.
    // For Neon's `sql` helper, you might need to build IN clause carefully or filter post-fetch for simplicity here if complex.
    // Let's assume a dynamic IN clause or filter post-fetch.
    // For demonstration, if selectedCompanyIds is not too large:
    // queryConditions.push(sql`e.company_id IN (${sql.join(selectedCompanyIds, sql`,`)})`);
    // However, the above sql.join might not be standard for all `sql` tag libraries.
    // A common safe approach for `IN` with `sql` tags is `sql`... WHERE column IN (SELECT unnest(${arrayOfIds}::integer[]))`
    // Or, if your `sql` helper directly supports array interpolation for `IN`, use that.
  }

  // Constructing WHERE clause by joining conditions
  const whereClause = sql`WHERE ${queryConditions.map((condition, index) => index === 0 ? condition : sql`AND ${condition}`).join(' ')}`;

  let fetchedDbEntries = await sql`
    SELECT 
      e.id, 
      e.entry_date, 
      c.name as company,
      e.company_id, 
      e.E2in, 
      e.E1in, 
      e.E2out, 
      e.E1out, 
      e.photo_url,
      e.is_starting_balance
    FROM entries e
    JOIN companies c ON e.company_id = c.id
    ${whereClause}
    ORDER BY e.entry_date ASC, c.name ASC, e.id ASC
  `;

  // If company ID filtering in SQL was complex, filter here (less efficient):
  if (selectedCompanyIds && selectedCompanyIds.length > 0) {
    const companyIdSet = new Set(selectedCompanyIds);
    fetchedDbEntries = fetchedDbEntries.filter(entry => companyIdSet.has(entry.company_id));
  }

  const reportEntries = fetchedDbEntries.map(entry => ({
    id: entry.id,
    entry_date: entry.entry_date instanceof Date ? entry.entry_date.toISOString().split('T')[0] : String(entry.entry_date),
    company: entry.company,
    company_id: entry.company_id,
    E1in: Number(entry.E1in || 0),
    E1out: Number(entry.E1out || 0),
    E2in: Number(entry.E2in || 0),
    E2out: Number(entry.E2out || 0),
    photo_url: entry.photo_url || undefined,
    is_starting_balance: entry.is_starting_balance || undefined,
  }));


  // --- 2. Calculate Summary (if includeSummary is true) ---
  let reportSummary: { totalE1in: any; totalE1out: any; totalE2in: any; totalE2out: any; byCompany: any } | undefined = undefined;
  if (includeSummary) {
    reportSummary = {
      totalE1in: 0,
      totalE1out: 0,
      totalE2in: 0,
      totalE2out: 0,
      byCompany: {},
    };

    reportEntries.forEach(entry => {
      if (boxTypes.includes('E1')) {
        if (reportSummary) {
          reportSummary.totalE1in += entry.E1in;
          reportSummary.totalE1out += entry.E1out;
        }
      }
      if (boxTypes.includes('E2')) {
        if (reportSummary) {
          reportSummary.totalE2in += entry.E2in;
          reportSummary.totalE2out += entry.E2out;
        }
      }
      if (reportSummary) {
        if (!reportSummary.byCompany[entry.company]) {
          reportSummary.byCompany[entry.company] = { E1in: 0, E1out: 0, E2in: 0, E2out: 0 };
        }
        const companySummary = reportSummary.byCompany[entry.company];
        if (boxTypes.includes('E1')) {
          companySummary.E1in += entry.E1in;
          companySummary.E1out += entry.E1out;
        }
        if (boxTypes.includes('E2')) {
          companySummary.E2in += entry.E2in;
          companySummary.E2out += entry.E2out;
        }
      }
    });
  }

  return {
    parameters: {
      startDate,
      endDate,
      boxTypes,
      companies: selectedCompanyNames,
      selectedCompanyIds: selectedCompanyIds,
      includeSummary,
    },
    entries: reportEntries,
    summary: reportSummary,
  };
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    return await isDatabaseConnected();
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}