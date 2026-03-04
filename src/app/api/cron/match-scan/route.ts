import { NextResponse } from "next/server";

/**
 * Vercel Cron Job — runs daily match scan.
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/match-scan",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Call the matches API to run the scan
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/matches`, {
    method: "POST",
  });

  const result = await res.json();
  return NextResponse.json(result);
}
