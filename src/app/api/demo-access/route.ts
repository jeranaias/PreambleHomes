import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password, role } = await request.json();
  const demoPassword = process.env.DEMO_PASSWORD;

  if (!demoPassword || password !== demoPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  };

  const response = NextResponse.json({ success: true });
  response.cookies.set("demo_access", "granted", cookieOptions);
  response.cookies.set("demo_role", role || "buyer", cookieOptions);

  return response;
}
