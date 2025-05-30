import { NextRequest, NextResponse } from "next/server";
import { getSetting, modifySetting } from "@/lib/db";

export async function POST(req: NextRequest) {
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
}

// fetch("/api/settings/language")
export async function GET() {
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
}   