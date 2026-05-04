const SAAVN_API = "https://jiosaavn-api-qefh.onrender.com";

export interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  duration: number;
  audio: string;
  image: string;
}

export async function searchSongs(query: string, limit = 20): Promise<Track[]> {
  try {
    const res = await fetch(
      `${SAAVN_API}/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
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
    })).filter((s: Track) => s.audio);
  } catch {
    return [];
  }
}

export async function getTrending(limit = 20): Promise<Track[]> {
  return searchSongs("bollywood hits 2024", limit);
}

export async function getByGenre(genre: string, limit = 20): Promise<Track[]> {
  return searchSongs(genre, limit);
}

export const GENRES = [
  { label: "Trending", query: "bollywood hits 2024" },
  { label: "Bollywood", query: "bollywood songs" },
  { label: "Arijit Singh", query: "arijit singh songs" },
  { label: "Lo-Fi", query: "lofi hindi" },
  { label: "Romantic", query: "romantic hindi songs" },
  { label: "Party", query: "party songs hindi" },
  { label: "English", query: "english pop hits" },
  { label: "Bengali", query: "bengali songs" },
];