export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const SAAVN = "https://jiosaavn-api-qefh.onrender.com";

async function fetchSaavn(query: string, limit: number) {
  const res = await fetch(
    `${SAAVN}/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`,
    { signal: AbortSignal.timeout(8000) }
  );
  const data = await res.json();
  const songs = data?.data?.results || [];
  return songs.map((s: any) => ({
    id: s.id,
    name: s.name,
    artist_name: s.artists?.primary?.[0]?.name || "Unknown",
    album_name: s.album?.name || "",
    duration: s.duration,
    audio: s.downloadUrl?.[4]?.url || s.downloadUrl?.[3]?.url || s.downloadUrl?.[2]?.url || "",
    image: s.image?.[2]?.url || s.image?.[1]?.url || "",
  })).filter((s: any) => s.audio);
}

async function fetchDeezer(query: string, limit: number) {
  const res = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    { signal: AbortSignal.timeout(8000) }
  );
  const data = await res.json();
  return (data.data || [])
    .filter((t: any) => t.preview)
    .map((t: any) => ({
      id: t.id?.toString(),
      name: t.title,
      artist_name: t.artist?.name,
      album_name: t.album?.title,
      duration: t.duration,
      audio: t.preview,
      image: t.album?.cover_big || t.album?.cover_medium,
    }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "bollywood hits";
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // Try JioSaavn first
    const saavnResults = await fetchSaavn(query, limit);
    if (saavnResults.length > 0) {
      return NextResponse.json({ results: saavnResults, source: "jiosaavn" });
    }
    throw new Error("No results from JioSaavn");
  } catch {
    try {
      // Fallback to Deezer
      const deezerResults = await fetchDeezer(query, limit);
      return NextResponse.json({ results: deezerResults, source: "deezer" });
    } catch {
      return NextResponse.json({ results: [], source: "none" });
    }
  }
}