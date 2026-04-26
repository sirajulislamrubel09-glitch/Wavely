import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint") || "tracks";
  const params = searchParams.get("params") || "";
  const clientId = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID;
  const url = `https://api.jamendo.com/v3/${endpoint}/?client_id=${clientId}&format=json&${params}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}