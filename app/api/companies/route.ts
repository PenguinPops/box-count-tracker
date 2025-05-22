import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
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
}
