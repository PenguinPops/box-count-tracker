// app/api/settings/starting-balances/route.ts
import { modifySetting } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { include } = await req.json();
    await modifySetting("includeStartingBalances", include ? "true" : "false");
    console.log("Starting balances setting updated:", include);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update starting balances setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});