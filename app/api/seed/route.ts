import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/app/actions"

export async function GET() {
  try {
    // Initialize database tables
    const initResult = await initializeDatabase()
    if (!initResult.success) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    // Insert sample starting balances
    await sql`
      INSERT INTO entries (entry_date, company_id, value1, value2, value3, value4, balance1, balance2, is_starting_balance)
      VALUES 
      ('2023-12-31', (SELECT id FROM companies WHERE name = 'publimar'), 4322, 0, 0, 0, -4322, 0, true),
      ('2024-12-31', (SELECT id FROM companies WHERE name = 'publimar'), 1547, 0, 0, 0, -1547, 0, true),
      ('2024-12-31', (SELECT id FROM companies WHERE name = 'duda'), 116, 0, 0, 0, -116, 0, true),
      ('2024-12-31', (SELECT id FROM companies WHERE name = 'indykpol'), 321, 17, 0, 0, -321, -17, true),
      ('2024-12-31', (SELECT id FROM companies WHERE name = 'łuków'), 352, 59, 0, 0, -352, -59, true)
      ON CONFLICT DO NOTHING
    `

    // Insert sample entries
    await sql`
      INSERT INTO entries (entry_date, company_id, value1, value2, value3, value4, balance1, balance2, is_starting_balance)
      VALUES 
      ('2025-01-01', (SELECT id FROM companies WHERE name = 'publimar'), 114, 0, 160, 0, 46, 0, false),
      ('2025-01-02', (SELECT id FROM companies WHERE name = 'publimar'), 119, 0, 120, 0, 1, 0, false),
      ('2025-01-02', (SELECT id FROM companies WHERE name = 'indykpol'), 40, 7, 21, 2, -19, -5, false),
      ('2025-01-03', (SELECT id FROM companies WHERE name = 'publimar'), 151, 0, 81, 0, -70, 0, false),
      ('2025-01-03', (SELECT id FROM companies WHERE name = 'łuków'), 9, 0, 9, 0, 0, 0, false)
      ON CONFLICT DO NOTHING
    `

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
