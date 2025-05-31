// app/api/entries/delete/route.ts
import { deleteEntries } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids } = body;
    
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "number")) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }
    
    await deleteEntries(ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API delete error:", error);
    return NextResponse.json({ error: "Failed to delete entries" }, { status: 500 });
  }
});