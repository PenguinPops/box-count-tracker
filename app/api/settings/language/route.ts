// app/api/settings/language/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSetting, modifySetting } from "@/lib/db";
import { auth } from "@/app/auth";

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { lang } = await req.json();
    
    if (typeof lang !== "string" || !["en", "pl"].includes(lang)) {
      return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
    }
    
    await modifySetting("language", lang);
    return NextResponse.json({ success: true, language: lang });
  } catch (error) {
    console.error("Failed to update language setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const lang = await getSetting("language");
    
    if (!lang) {
      return NextResponse.json({ language: "en" }, { status: 200 }); // Default to English if not set
    }
    
    return NextResponse.json({ language: lang }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve language setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});