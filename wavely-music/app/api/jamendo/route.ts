import { NextRequest, NextResponse } from "next/server";

const SAAVN_API = "https://jiosaavn-api-qefh.onrender.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "arijit singh";
  const limit = searchParams.get("limit") || "20";

  try {
    const res = await fetch(
      `${SAAVN_API}/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    const data = await res.json();

    const songs = data?.data?.results || [];
    const results = songs.map((s: any) => ({
      id: s.id,
      name: s.name,
      artist_name: s.artists?.primary?.[0]?.name || "Unknown",
      album_name: s.album?.name || "",
      duration: s.duration,
      audio: s.downloadUrl?.[2]?.url || s.downloadUrl?.[1]?.url || s.downloadUrl?.[0]?.url || "",
      image: s.image?.[2]?.url || s.image?.[1]?.url || s.image?.[0]?.url || "",
    })).filter((s: any) => s.audio);

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}