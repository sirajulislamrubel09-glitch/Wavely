import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "lofi";
  const limit = searchParams.get("limit") || "15";

  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();

    const results = data.data
      ?.filter((t: any) => t.preview)
      .map((t: any) => ({
        id: t.id?.toString(),
        name: t.title,
        artist_name: t.artist?.name,
        album_name: t.album?.title,
        duration: t.duration,
        audio: t.preview,
        image: t.album?.cover_big || t.album?.cover_medium,
      })) || [];

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}
