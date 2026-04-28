"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  duration: number;
  audio: string;
  image: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  isPublic: boolean;
  createdAt: number;
}

// SVG Icons
const Icons = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  library: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/></svg>,
  next: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/></svg>,
  shuffle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  repeat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="16" height="16" viewBox="0 0 24 24" fill="#ba55d3" stroke="#ba55d3" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  volume: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  dots: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  music: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  chevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
};

const GENRES = [
  { label: "Trending", tag: "trending hindi 2024" },
  { label: "Bollywood", tag: "bollywood hits" },
  { label: "Arijit Singh", tag: "arijit singh" },
  { label: "Lo-Fi", tag: "lofi hindi" },
  { label: "Romantic", tag: "romantic hindi songs" },
  { label: "Party", tag: "party songs hindi" },
  { label: "English", tag: "english pop 2024" },
  { label: "Bengali", tag: "bengali songs" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [activeGenre, setActiveGenre] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) window.location.href = "/auth";
      else {
        setUser(data.user);
        // Load playlists from Supabase
        try {
          const { data: dbPlaylists } = await supabase
            .from('playlists')
            .select('*')
            .eq('user_id', data.user.id);
          if (dbPlaylists && dbPlaylists.length > 0) {
            const loaded = dbPlaylists.map(p => ({
              id: p.id,
              name: p.name,
              tracks: p.tracks,
              isPublic: p.is_public,
              createdAt: new Date(p.created_at).getTime(),
            }));
            setPlaylists(loaded);
            if (typeof window !== "undefined") {
              localStorage.setItem("wavely_playlists", JSON.stringify(loaded));
            }
          } else {
            // Load from localStorage if no DB data
            if (typeof window !== "undefined") {
              const saved = localStorage.getItem("wavely_playlists");
              if (saved) setPlaylists(JSON.parse(saved));
            }
          }
        } catch (error) {
          console.error('Error loading playlists:', error);
          // Fallback to localStorage
          if (typeof window !== "undefined") {
            const saved = localStorage.getItem("wavely_playlists");
            if (saved) setPlaylists(JSON.parse(saved));
          }
        }
      }
    });
  }, []);

  const savePlaylists = useCallback(async (updated: Playlist[]) => {
    setPlaylists(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("wavely_playlists", JSON.stringify(updated));
    }
    // Also save to Supabase for public playlists
    if (user) {
      const publicPlaylists = updated.filter(p => p.isPublic);
      try {
        // Delete existing public playlists for this user
        await supabase.from('playlists').delete().eq('user_id', user.id);
        // Insert new public playlists
        if (publicPlaylists.length > 0) {
          const toInsert = publicPlaylists.map(p => ({
            id: p.id,
            name: p.name,
            tracks: p.tracks,
            is_public: p.isPublic,
            created_at: new Date(p.createdAt).toISOString(),
            user_id: user.id
          }));
          await supabase.from('playlists').insert(toInsert);
        }
      } catch (error) {
        console.error('Error saving playlists to Supabase:', error);
      }
    }
  }, [user]);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      tracks: [],
      isPublic: false,
      createdAt: Date.now(),
    };
    savePlaylists([...playlists, newPl]);
    setNewPlaylistName("");
    setShowNewPlaylist(false);
    showToast(`✅ "${newPl.name}" created!`);
  };

  const addToPlaylist = (playlist: Playlist, track: Track) => {
    const exists = playlist.tracks.find(t => t.id === track.id);
    if (exists) { showToast("Already in playlist!"); return; }
    const updated = playlists.map(p =>
      p.id === playlist.id ? { ...p, tracks: [...p.tracks, track] } : p
    );
    savePlaylists(updated);
    setShowAddToPlaylist(null);
    showToast(`Added to "${playlist.name}"! 🎵`);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
    );
    savePlaylists(updated);
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(updated.find(p => p.id === playlistId) || null);
    }
  };

  const deletePlaylist = (id: string) => {
    savePlaylists(playlists.filter(p => p.id !== id));
    if (activePlaylist?.id === id) setActivePlaylist(null);
    showToast("Playlist deleted");
  };

  const togglePublic = (id: string) => {
    const updated = playlists.map(p =>
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    );
    savePlaylists(updated);
    const pl = updated.find(p => p.id === id);
    if (activePlaylist?.id === id) setActivePlaylist(pl || null);
    showToast(pl?.isPublic ? "🌍 Playlist is now public!" : "🔒 Playlist is now private");
  };

  const copyPlaylistLink = useCallback((id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/playlist/${id}`;
      navigator.clipboard?.writeText(url).then(() => showToast("🔗 Link copied!"));
    }
  }, [showToast]);

  const fetchTracks = useCallback(async (tag: string) => {
    setLoading(true);
    setTracks([]);
    setFeaturedTrack(null);
    try {
      const res = await fetch(
        `https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(tag)}&limit=30`
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

      if (results?.length > 0) {
        setFeaturedTrack(results[0]);
        setTracks(results.slice(1));
      } else {
        showToast("No tracks found 😕");
      }
    } catch {
      showToast("Failed to load. Check internet!");
    } finally {
      setLoading(false);
    }
  }, []);

  const switchGenre = (idx: number) => {
    setActiveGenre(idx);
    fetchTracks(GENRES[idx].tag);
    setActiveTab("home");
  };

  // Audio
  useEffect(() => {
    if (!currentTrack?.audio || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = currentTrack.audio;
    audioRef.current.volume = volume;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  const allTracks = featuredTrack ? [featuredTrack, ...tracks] : tracks;

  const handleEnded = useCallback(() => {
    if (repeat && currentTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    const pool = activePlaylist ? activePlaylist.tracks : allTracks;
    const idx = pool.findIndex(t => t.id === currentTrack?.id);
    if (shuffle) {
      const next = pool[Math.floor(Math.random() * pool.length)];
      setCurrentTrack(next); setPlaying(true);
    } else if (idx < pool.length - 1) {
      setCurrentTrack(pool[idx + 1]); setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [repeat, currentTrack, shuffle, activePlaylist, allTracks]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setPlaying(p => !p);
    } else {
      setCurrentTrack(track);
      setPlaying(true);
    }
  };

  const skip = (dir: 1 | -1) => {
    const pool = activePlaylist ? activePlaylist.tracks : allTracks;
    const idx = pool.findIndex(t => t.id === currentTrack?.id);
    const next = pool[idx + dir];
    if (next) { setCurrentTrack(next); setPlaying(true); }
  };

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); showToast("Removed from liked"); }
      else { n.add(id); showToast("❤️ Added to liked!"); }
      return n;
    });
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "Listener";
  const progressPct = duration ? (progress / duration) * 100 : 0;
  const imgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23282828'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22'%3E🎵%3C/text%3E%3C/svg%3E";

  const TrackRow = ({ track, showMenu = true }: { track: Track; showMenu?: boolean }) => (
    <div
      onClick={() => playTrack(track)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "8px 12px", borderRadius: 8,
        cursor: "pointer", transition: "background 0.15s",
        background: currentTrack?.id === track.id ? "#ffffff12" : "transparent",
      }}
      onMouseEnter={e => { if (currentTrack?.id !== track.id) e.currentTarget.style.background = "#ffffff08"; }}
      onMouseLeave={e => { if (currentTrack?.id !== track.id) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Art */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
          style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover" }} />
        {currentTrack?.id === track.id && playing && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 3, borderRadius: 2, background: "#ba55d3", height: "100%",
                  animation: `waveAnim ${0.5 + j * 0.15}s ${j * 0.1}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#ba55d3" : "#fff",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{track.name}</div>
        <div style={{ color: "#b3b3b3", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {track.artist_name}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => toggleLike(track.id)} style={{ background: "none", border: "none", cursor: "pointer", color: liked.has(track.id) ? "#ba55d3" : "#b3b3b3", display: "flex", padding: 4, transition: "color 0.2s" }}>
          {liked.has(track.id) ? Icons.heartFill : Icons.heart}
        </button>
        <span style={{ color: "#b3b3b3", fontSize: 12 }}>{formatTime(track.duration)}</span>
        {showMenu && (
          <button onClick={() => setShowAddToPlaylist(track)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b3b3b3", display: "flex", padding: 4 }}>
            {Icons.dots}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#121212", minHeight: "100vh", fontFamily: "'Circular', 'DM Sans', system-ui, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #535353; border-radius: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
        a { text-decoration: none; color: inherit; }

        @keyframes waveAnim { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

        .fade-up { animation: fadeUp 0.35s ease forwards; }

        input[type='range'] { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; }
        input[type='range']::-webkit-slider-track { background:#535353; border-radius:2px; height:4px; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#fff; margin-top:-4px; }

        .btn-icon { background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:8px; border-radius:50%; transition:all 0.15s; color:#b3b3b3; }
        .btn-icon:hover { color:#fff; background:#ffffff12; }
        .btn-icon.active { color:#ba55d3; }

        .genre-pill { border:none; border-radius:99px; padding:6px 14px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; white-space:nowrap; font-family:'DM Sans',system-ui; }
        .genre-pill:hover { transform:scale(1.04); }

        .playlist-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:6px; cursor:pointer; transition:background 0.15s; }
        .playlist-item:hover { background:#ffffff10; }

        .overlay { position:fixed; inset:0; background:#00000077; z-index:40; }
        .sidebar-panel { position:fixed; top:0; left:0; bottom:0; width:290px; background:#0a0a0a; border-right:1px solid #282828; z-index:50; display:flex; flex-direction:column; animation:slideIn 0.25s ease; overflow:hidden; }
        .player-panel { position:fixed; bottom:0; left:0; right:0; background:linear-gradient(to top, #0a0a0a, #181818); border-radius:16px 16px 0 0; border-top:1px solid #282828; z-index:50; animation:slideUp 0.3s ease; max-height:90vh; overflow-y:auto; }
        .modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#282828; border-radius:12px; padding:24px; z-index:60; width:90%; max-width:340px; }

        .mini-player { position:fixed; bottom:64px; left:0; right:0; background:linear-gradient(to right, #181818, #212121); border-top:1px solid #282828; z-index:30; cursor:pointer; }
        .bottom-nav { position:fixed; bottom:0; left:0; right:0; background:#0a0a0a; border-top:1px solid #282828; z-index:30; display:flex; justify-content:space-around; padding:10px 0 14px; }
        .nav-btn { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 16px; color:#b3b3b3; transition:color 0.15s; font-family:'DM Sans',system-ui; }
        .nav-btn.active { color:#fff; }
        .nav-btn:hover { color:#fff; }
      `}</style>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div className="overlay" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar-panel">
            {/* Logo */}
            <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #282828" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: "#ba55d3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Icons.music}
                </div>
                <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>Wavely</span>
              </div>
              {/* Nav */}
              {[
                { icon: Icons.home, label: "Home", tab: "home" },
                { icon: Icons.search, label: "Search", tab: "search" },
                { icon: Icons.library, label: "Library", tab: "library" },
              ].map(item => (
                <div key={item.tab} onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 8px", borderRadius: 6, cursor: "pointer",
                  transition: "background 0.15s",
                  background: activeTab === item.tab ? "#ffffff12" : "transparent",
                  color: activeTab === item.tab ? "#fff" : "#b3b3b3",
                  marginBottom: 2,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff10"}
                  onMouseLeave={e => e.currentTarget.style.background = activeTab === item.tab ? "#ffffff12" : "transparent"}
                >
                  {item.icon}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Playlists */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#b3b3b3", textTransform: "uppercase" }}>Your Playlists</span>
                <button onClick={() => setShowNewPlaylist(true)} className="btn-icon" style={{ width: 28, height: 28, padding: 4 }}>{Icons.plus}</button>
              </div>

              {/* Liked Songs */}
              <div className="playlist-item" onClick={() => { setActiveTab("liked"); setSidebarOpen(false); }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: "linear-gradient(135deg, #ba55d3, #6a0dad)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {Icons.heartFill}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Liked Songs</div>
                  <div style={{ fontSize: 11, color: "#b3b3b3" }}>{liked.size} songs</div>
                </div>
              </div>

              {playlists.map(pl => (
                <div key={pl.id} className="playlist-item" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); setSidebarOpen(false); }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: "#282828", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
                    {pl.tracks[0] ? <img src={pl.tracks[0].image || imgFallback} alt="" style={{ width: "100%", height: "100%", borderRadius: 6, objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} /> : "🎵"}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                    <div style={{ fontSize: 11, color: "#b3b3b3", display: "flex", alignItems: "center", gap: 4 }}>
                      {pl.isPublic ? Icons.unlock : Icons.lock}
                      {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                    </div>
                  </div>
                </div>
              ))}

              {playlists.length === 0 && (
                <div style={{ padding: "20px 8px", textAlign: "center", color: "#535353", fontSize: 13 }}>
                  No playlists yet.<br />Create one!
                </div>
              )}
            </div>

            {/* User */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #282828" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#535353", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                  {displayName[0]?.toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{displayName}</span>
              </div>
              <button onClick={handleSignOut} style={{ width: "100%", background: "none", border: "1px solid #535353", borderRadius: 99, padding: "8px", color: "#b3b3b3", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#535353"; e.currentTarget.style.color = "#b3b3b3"; }}
              >Sign Out</button>
            </div>
          </div>
        </>
      )}

      {/* NEW PLAYLIST MODAL */}
      {showNewPlaylist && (
        <>
          <div className="overlay" onClick={() => setShowNewPlaylist(false)} />
          <div className="modal">
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Create Playlist</h3>
            <input value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createPlaylist()}
              placeholder="Playlist name..."
              style={{ width: "100%", background: "#3e3e3e", border: "none", borderRadius: 6, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 14 }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowNewPlaylist(false)} style={{ flex: 1, background: "none", border: "1px solid #535353", borderRadius: 99, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={createPlaylist} style={{ flex: 1, background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Create</button>
            </div>
          </div>
        </>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {showAddToPlaylist && (
        <>
          <div className="overlay" onClick={() => setShowAddToPlaylist(null)} />
          <div className="modal">
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Add to Playlist</h3>
            <p style={{ color: "#b3b3b3", fontSize: 12, marginBottom: 16 }}>{showAddToPlaylist.name}</p>
            {playlists.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#535353" }}>
                <p style={{ marginBottom: 12 }}>No playlists yet!</p>
                <button onClick={() => { setShowAddToPlaylist(null); setShowNewPlaylist(true); }} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px 20px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                {playlists.map(pl => (
                  <div key={pl.id} onClick={() => addToPlaylist(pl, showAddToPlaylist)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8,
                    cursor: "pointer", background: "#3e3e3e", transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#535353"}
                    onMouseLeave={e => e.currentTarget.style.background = "#3e3e3e"}
                  >
                    <span style={{ fontSize: 16 }}>🎵</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{pl.name}</div>
                      <div style={{ color: "#b3b3b3", fontSize: 11 }}>{pl.tracks.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddToPlaylist(null)} style={{ width: "100%", marginTop: 12, background: "none", border: "1px solid #535353", borderRadius: 99, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </>
      )}

      {/* FULL PLAYER */}
      {showPlayer && currentTrack && (
        <>
          <div className="overlay" onClick={() => setShowPlayer(false)} />
          <div className="player-panel" style={{ padding: "12px 20px 32px" }}>
            <div style={{ width: 36, height: 4, background: "#535353", borderRadius: 2, margin: "0 auto 24px" }} />

            {/* Album art */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <img src={currentTrack.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
                style={{ width: 220, height: 220, borderRadius: 12, objectFit: "cover", boxShadow: "0 20px 60px #00000088" }} />
            </div>

            {/* Track info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.name}</div>
                <div style={{ color: "#b3b3b3", fontSize: 14 }}>{currentTrack.artist_name}</div>
              </div>
              <button onClick={() => toggleLike(currentTrack.id)} className="btn-icon" style={{ color: liked.has(currentTrack.id) ? "#ba55d3" : "#b3b3b3" }}>
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
            </div>

            {/* Progress */}
            <div onClick={handleSeek} style={{ height: 4, background: "#535353", borderRadius: 2, marginBottom: 8, cursor: "pointer" }}>
              <div style={{ height: "100%", background: "#ba55d3", borderRadius: 2, width: `${progressPct}%`, transition: "width 0.1s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#b3b3b3", fontSize: 11, marginBottom: 20 }}>
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button className={`btn-icon ${shuffle ? "active" : ""}`} onClick={() => setShuffle(s => !s)}>{Icons.shuffle}</button>
              <button className="btn-icon" style={{ width: 48, height: 48, color: "#fff" }} onClick={() => skip(-1)}>{Icons.prev}</button>
              <button onClick={() => setPlaying(p => !p)} style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#000", transition: "transform 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ transform: "scale(1.3)" }}>{playing ? Icons.pause : Icons.play}</div>
              </button>
              <button className="btn-icon" style={{ width: 48, height: 48, color: "#fff" }} onClick={() => skip(1)}>{Icons.next}</button>
              <button className={`btn-icon ${repeat ? "active" : ""}`} onClick={() => setRepeat(r => !r)}>{Icons.repeat}</button>
            </div>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#b3b3b3" }}>{Icons.volume}</span>
              <input type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
                style={{ flex: 1, accentColor: "#ba55d3" }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAddToPlaylist(currentTrack)} style={{ flex: 1, background: "#282828", border: "none", borderRadius: 99, padding: "11px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                + Add to Playlist
              </button>
              <button onClick={() => { if (navigator.share) navigator.share({ title: currentTrack.name, text: `Listening to ${currentTrack.name} on Wavely!`, url: window.location.href }); }} style={{ flex: 1, background: "#282828", border: "none", borderRadius: 99, padding: "11px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {Icons.share} Share
              </button>
            </div>
          </div>
        </>
      )}

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#121212", borderBottom: "1px solid #282828", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="btn-icon" onClick={() => setSidebarOpen(true)} style={{ color: "#fff" }}>{Icons.menu}</button>
        <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>Wavely</span>
        <a href="/profile" style={{ width: 32, height: 32, borderRadius: "50%", background: "#535353", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
          {displayName[0]?.toUpperCase()}
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 180px", position: "relative" }}>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="fade-up">
            {/* Search bar */}
            <div onClick={() => setActiveTab("search")} style={{ background: "#282828", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#3e3e3e"}
              onMouseLeave={e => e.currentTarget.style.background = "#282828"}
            >
              <span style={{ color: "#b3b3b3" }}>{Icons.search}</span>
              <span style={{ color: "#b3b3b3", fontSize: 14 }}>Search songs, artists...</span>
            </div>

            {/* Genre pills */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20, scrollbarWidth: "none" }}>
              {GENRES.map((g, i) => (
                <button key={i} className="genre-pill" onClick={() => switchGenre(i)} style={{
                  background: activeGenre === i ? "#ba55d3" : "#282828",
                  color: activeGenre === i ? "#000" : "#fff",
                  flexShrink: 0,
                }}>{g.label}</button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#b3b3b3" }}>
                <div style={{ fontSize: 32, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 12 }}>🎵</div>
                <div>Loading...</div>
              </div>
            )}

            {/* Featured */}
            {!loading && featuredTrack && (
              <>
                <div style={{ background: "linear-gradient(135deg, #1a3a2a, #1e1e1e)", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", gap: 14, alignItems: "center" }}>
                  <img src={featuredTrack.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
                    style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", flexShrink: 0, boxShadow: "0 8px 24px #00000066" }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#ba55d3", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Featured Track</div>
                    <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{featuredTrack.name}</div>
                    <div style={{ color: "#b3b3b3", fontSize: 13, marginBottom: 12 }}>{featuredTrack.artist_name}</div>
                    <button onClick={() => playTrack(featuredTrack)} style={{
                      background: "#ba55d3", border: "none", borderRadius: 99,
                      padding: "8px 20px", color: "#000", fontWeight: 700,
                      fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 6, transition: "transform 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {currentTrack?.id === featuredTrack.id && playing ? Icons.pause : Icons.play}
                      {currentTrack?.id === featuredTrack.id && playing ? "Pause" : "Play"}
                    </button>
                  </div>
                </div>

                {/* Track list */}
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#b3b3b3", textTransform: "uppercase", marginBottom: 12 }}>
                  {GENRES[activeGenre].label}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {tracks.map(track => <TrackRow key={track.id} track={track} />)}
                </div>
              </>
            )}

            {!loading && !featuredTrack && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#b3b3b3" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>No tracks found</div>
                <button onClick={() => fetchTracks(GENRES[activeGenre].tag)} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
              </div>
            )}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <SearchTab playTrack={playTrack} currentTrack={currentTrack} playing={playing} formatTime={formatTime} imgFallback={imgFallback} liked={liked} toggleLike={toggleLike} setShowAddToPlaylist={setShowAddToPlaylist} Icons={Icons} />
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: -0.5 }}>Your Library</h2>
              <button onClick={() => setShowNewPlaylist(true)} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "8px 16px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                {Icons.plus} New
              </button>
            </div>

            {playlists.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#1e1e1e", borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>No playlists yet</div>
                <div style={{ color: "#b3b3b3", fontSize: 13, marginBottom: 20 }}>Create your first playlist!</div>
                <button onClick={() => setShowNewPlaylist(true)} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {playlists.map(pl => (
                  <div key={pl.id} style={{ background: "#1e1e1e", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#282828"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1e1e1e"}
                    onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: "#282828", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {pl.tracks[0] ? <img src={pl.tracks[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} /> : <span style={{ fontSize: 22 }}>🎵</span>}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                      <div style={{ color: "#b3b3b3", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ display: "flex" }}>{pl.isPublic ? Icons.unlock : Icons.lock}</span>
                        {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" onClick={() => togglePublic(pl.id)} title={pl.isPublic ? "Make private" : "Make public"} style={{ color: pl.isPublic ? "#ba55d3" : "#b3b3b3" }}>
                        {pl.isPublic ? Icons.unlock : Icons.lock}
                      </button>
                      {pl.isPublic && (
                        <button className="btn-icon" onClick={() => copyPlaylistLink(pl.id)} title="Copy link">
                          {Icons.copy}
                        </button>
                      )}
                      <button className="btn-icon" onClick={() => deletePlaylist(pl.id)} style={{ color: "#ff4444" }}>
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLAYLIST VIEW */}
        {activeTab === "playlist" && activePlaylist && (
          <div className="fade-up">
            <button onClick={() => setActiveTab("library")} style={{ background: "none", border: "none", color: "#b3b3b3", cursor: "pointer", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              ← Back
            </button>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 24 }}>
              <div style={{ width: 100, height: 100, borderRadius: 10, background: "#282828", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px #00000066" }}>
                {activePlaylist.tracks[0] ? <img src={activePlaylist.tracks[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} /> : <span style={{ fontSize: 36 }}>🎵</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#b3b3b3", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Playlist</div>
                <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, marginBottom: 6 }}>{activePlaylist.name}</h2>
                <div style={{ color: "#b3b3b3", fontSize: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {activePlaylist.isPublic ? Icons.unlock : Icons.lock}
                    {activePlaylist.isPublic ? "Public" : "Private"}
                  </span>
                  <span>· {activePlaylist.tracks.length} songs</span>
                  {activePlaylist.isPublic && (
                    <button onClick={() => copyPlaylistLink(activePlaylist.id)} style={{ background: "none", border: "none", color: "#ba55d3", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                      {Icons.copy} Copy Link
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {activePlaylist.tracks.length > 0 && (
                <button onClick={() => { setCurrentTrack(activePlaylist.tracks[0]); setPlaying(true); }} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                  {Icons.play} Play All
                </button>
              )}
              <button onClick={() => togglePublic(activePlaylist.id)} style={{ background: "#282828", border: "none", borderRadius: 99, padding: "10px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                {activePlaylist.isPublic ? Icons.lock : Icons.unlock}
                {activePlaylist.isPublic ? "Make Private" : "Make Public"}
              </button>
            </div>

            {activePlaylist.tracks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#b3b3b3" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                <div>No songs yet. Search and add songs!</div>
                <button onClick={() => setActiveTab("search")} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }}>Find Music</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {activePlaylist.tracks.map(track => (
                  <div key={track.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#ffffff08"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => playTrack(track)}
                  >
                    <img src={track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#4b0082" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                      <div style={{ color: "#b3b3b3", fontSize: 12 }}>{track.artist_name}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFromPlaylist(activePlaylist.id, track.id); }} className="btn-icon" style={{ color: "#ff4444" }}>
                      {Icons.trash}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIKED SONGS */}
        {activeTab === "liked" && (
          <div className="fade-up">
            <div style={{ background: "linear-gradient(135deg, #ba55d3, #6a0dad)", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>❤️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>Liked Songs</div>
                <div style={{ color: "#ffffffbb", fontSize: 13 }}>{liked.size} songs</div>
              </div>
            </div>
            {liked.size === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#b3b3b3" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                <div>No liked songs yet. Heart a song to save it!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {allTracks.filter(track => liked.has(track.id)).map(track => <TrackRow key={track.id} track={track} />)}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="fade-up" style={{ textAlign: "center", padding: "60px 20px", color: "#b3b3b3" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontWeight: 600, fontSize: 18, color: "#fff", marginBottom: 8 }}>No Activity Yet</div>
            <div>Join spaces to see what's happening</div>
          </div>
        )}
      </div>

      {/* MINI PLAYER */}
      {currentTrack && (
        <div className="mini-player" onClick={() => setShowPlayer(true)}>
          <div style={{ height: 2, background: "#282828" }}>
            <div style={{ height: "100%", background: "#ba55d3", width: `${progressPct}%`, transition: "width 0.1s" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
            <img src={currentTrack.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>{currentTrack.name}</div>
              <div style={{ color: "#b3b3b3", fontSize: 11 }}>{currentTrack.artist_name}</div>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }} onClick={e => e.stopPropagation()}>
              <button className="btn-icon" onClick={() => toggleLike(currentTrack.id)} style={{ color: liked.has(currentTrack.id) ? "#ba55d3" : "#b3b3b3" }}>
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
              <button onClick={() => setPlaying(p => !p)} style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="btn-icon" style={{ color: "#fff" }} onClick={() => skip(1)}>{Icons.next}</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#282828", border: "1px solid #535353", borderRadius: 99, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: "nowrap", boxShadow: "0 8px 24px #00000066", animation: "toastIn 0.3s ease" }}>
          {toast}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        {[
          { id: "home", icon: Icons.home, label: "Home" },
          { id: "search", icon: Icons.search, label: "Search" },
          { id: "library", icon: Icons.library, label: "Library" },
          { id: "activity", icon: Icons.bell, label: "Activity" },
        ].map(tab => (
          <button key={tab.id} className={`nav-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.3 }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// SEARCH COMPONENT
function SearchTab({ playTrack, currentTrack, playing, formatTime, imgFallback, liked, toggleLike, setShowAddToPlaylist, Icons }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const search = async (q?: string) => {
    const sq = q || query;
    if (!sq.trim()) return;
    setSearching(true); setSearched(true);
    try {
      const res = await fetch(
        `https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(sq)}&limit=25`
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

      setResults(results);
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const quickTags = ["arijit singh", "shreya ghoshal", "bollywood 2024", "lofi hindi", "punjabi hits", "taylor swift", "the weeknd", "bengali songs", "rahman hits", "romantic songs"];

  return (
    <div className="fade-up">
      <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: -0.5, marginBottom: 16 }}>Search</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Artists, songs, albums..."
          style={{ flex: 1, background: "#282828", border: "2px solid transparent", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#ba55d3"}
          onBlur={e => e.target.style.borderColor = "transparent"}
        />
        <button onClick={() => search()} style={{ background: "#ba55d3", border: "none", borderRadius: 8, padding: "0 18px", color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>→</button>
      </div>

      {!searched && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b3b3b3", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Quick Search</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickTags.map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); search(tag); }} style={{ background: "#282828", border: "none", borderRadius: 99, padding: "8px 14px", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s", textTransform: "capitalize" }}
                onMouseEnter={e => e.currentTarget.style.background = "#3e3e3e"}
                onMouseLeave={e => e.currentTarget.style.background = "#282828"}
              >{tag}</button>
            ))}
          </div>
        </>
      )}

      {searching && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#b3b3b3" }}>
          <div style={{ fontSize: 28, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 10 }}>🎵</div>
          <div>Searching...</div>
        </div>
      )}

      {searched && !searching && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#b3b3b3" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>😕</div>
          <div>No results for "{query}"</div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b3b3b3", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
            {results.length} results
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {results.map((track: any) => (
              <div key={track.id} onClick={() => playTrack(track)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                background: currentTrack?.id === track.id ? "#ffffff12" : "transparent",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => { if (currentTrack?.id !== track.id) e.currentTarget.style.background = "#ffffff08"; }}
                onMouseLeave={e => { if (currentTrack?.id !== track.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={track.image || imgFallback} alt="" onError={(e: any) => { e.target.src = imgFallback; }}
                    style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover" }} />
                  {currentTrack?.id === track.id && playing && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                        {[0, 1, 2].map((j: number) => <div key={j} style={{ width: 3, borderRadius: 2, background: "#4b0082", height: "100%", animation: `waveAnim ${0.5 + j * 0.15}s ${j * 0.1}s ease-in-out infinite` }} />)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#4b0082" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{track.name}</div>
                  <div style={{ color: "#b3b3b3", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist_name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} onClick={(e: any) => e.stopPropagation()}>
                  <button onClick={() => toggleLike(track.id)} style={{ background: "none", border: "none", cursor: "pointer", color: liked.has(track.id) ? "#4b0082" : "#b3b3b3", display: "flex", padding: 4 }}>
                    {liked.has(track.id) ? Icons.heartFill : Icons.heart}
                  </button>
                  <span style={{ color: "#b3b3b3", fontSize: 12 }}>{formatTime(track.duration)}</span>
                  <button onClick={() => setShowAddToPlaylist(track)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b3b3b3", display: "flex", padding: 4 }}>
                    {Icons.dots}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}