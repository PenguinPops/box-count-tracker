import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getCompanies } from "@/lib/db"
import { auth } from "@/app/auth"

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    
    if (!name) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }
    
    await sql`INSERT INTO companies (name) VALUES (${name})`
    revalidatePath("/settings")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding company:", error)
    return NextResponse.json({ error: "Failed to add company" }, { status: 500 })
  }
})

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const companies = await getCompanies()
    return NextResponse.json({ success: companies })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
})