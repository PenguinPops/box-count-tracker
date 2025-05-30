// app/api/settings/starting-balances/route.ts
import { modifySetting} from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { include } = await req.json();

  await modifySetting("includeStartingBalances", include ? "true" : "false");

  console.log("Starting balances setting updated:", include);
  return NextResponse.json({ success: true });
}
