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

const Icons = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 9l10 6 10-6-10-6zM2 15l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  library: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/></svg>,
  next: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/></svg>,
  shuffle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  repeat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="18" height="18" viewBox="0 0 24 24" fill="#c084fc" stroke="#c084fc" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  volume: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  volumeX: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  dots: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  music: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  chevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
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
  const [isMuted, setIsMuted] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) window.location.href = "/auth";
      else {
        setUser(data.user);
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
            localStorage.setItem("wavely_playlists", JSON.stringify(loaded));
          } else {
            const saved = localStorage.getItem("wavely_playlists");
            if (saved) setPlaylists(JSON.parse(saved));
          }
        } catch (error) {
          const saved = localStorage.getItem("wavely_playlists");
          if (saved) setPlaylists(JSON.parse(saved));
        }
      }
    });
  }, []);

  useEffect(() => {
    fetchTracks(GENRES[0].tag);
  }, []);

  const savePlaylists = useCallback(async (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem("wavely_playlists", JSON.stringify(updated));
    if (user) {
      const publicPlaylists = updated.filter(p => p.isPublic);
      try {
        await supabase.from('playlists').delete().eq('user_id', user.id);
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
        console.error(error);
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
    showToast(`✨ "${newPl.name}" created!`);
  };

  const addToPlaylist = (playlist: Playlist, track: Track) => {
    if (playlist.tracks.find(t => t.id === track.id)) {
      showToast("Already in playlist!");
      return;
    }
    const updated = playlists.map(p =>
      p.id === playlist.id ? { ...p, tracks: [...p.tracks, track] } : p
    );
    savePlaylists(updated);
    setShowAddToPlaylist(null);
    showToast(`🎵 Added to "${playlist.name}"!`);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
    );
    savePlaylists(updated);
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(updated.find(p => p.id === playlistId) || null);
    }
    showToast("🗑️ Removed from playlist");
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
    const url = `${window.location.origin}/playlist/${id}`;
    navigator.clipboard?.writeText(url).then(() => showToast("🔗 Link copied!"));
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
      if (results.length > 0) {
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

  useEffect(() => {
    if (!currentTrack?.audio || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = currentTrack.audio;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

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
  const imgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23181818'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22' fill='%23535353'%3E🎵%3C/text%3E%3C/svg%3E";

  const TrackRow = ({ track, showMenu = true }: { track: Track; showMenu?: boolean }) => (
    <div
      onClick={() => playTrack(track)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "10px 16px", borderRadius: 12,
        cursor: "pointer", transition: "all 0.2s",
        backgroundColor: currentTrack?.id === track.id ? "rgba(192, 132, 252, 0.15)" : "transparent",
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (currentTrack?.id !== track.id) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { if (currentTrack?.id !== track.id) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={track.image || imgFallback} alt="" onError={e => (e.target as HTMLImageElement).src = imgFallback}
          style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }} />
        {currentTrack?.id === track.id && playing && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 16 }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 3, borderRadius: 2, backgroundColor: "#c084fc", height: "100%",
                  animation: `waveAnim ${0.5 + j * 0.15}s ${j * 0.1}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: currentTrack?.id === track.id ? "#c084fc" : "#fff",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>
          {track.name}
        </div>
        <div style={{ color: "#a1a1aa", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {track.artist_name}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => toggleLike(track.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: liked.has(track.id) ? "#c084fc" : "#a1a1aa", transition: "all 0.2s" }}>
          {liked.has(track.id) ? Icons.heartFill : Icons.heart}
        </button>
        <span style={{ color: "#a1a1aa", fontSize: 12, fontFamily: "monospace" }}>{formatTime(track.duration)}</span>
        {showMenu && (
          <button onClick={() => setShowAddToPlaylist(track)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#a1a1aa", transition: "all 0.2s" }}>
            {Icons.dots}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1f1f1f; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #3f3f3f; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #c084fc; }

        @keyframes waveAnim { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes glowPulse { 0% { box-shadow: 0 0 0 0 rgba(192,132,252,0.4); } 70% { box-shadow: 0 0 0 6px rgba(192,132,252,0); } 100% { box-shadow: 0 0 0 0 rgba(192,132,252,0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-4px); } 100% { transform: translateY(0px); } }

        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
        .icon-btn { transition: all 0.2s ease; }
        .icon-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); color: #c084fc !important; }
        .nav-item { transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
        .nav-item:hover { transform: translateY(-3px) scale(1.05); color: #c084fc !important; }
        .nav-item.active { color: #c084fc; background: rgba(192,132,252,0.1); border-radius: 12px; }
        .floating-player { transition: all 0.3s ease; backdrop-filter: blur(20px); }
        .floating-player:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 30px rgba(0,0,0,0.5); }
        
        input[type='range'] { -webkit-appearance:none; background:transparent; cursor:pointer; }
        input[type='range']::-webkit-slider-track { background:#3f3f3f; border-radius:10px; height:4px; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#c084fc; margin-top:-5px; box-shadow:0 2px 8px rgba(192,132,252,0.5); transition:transform 0.1s; }
        input[type='range']::-webkit-slider-thumb:hover { transform:scale(1.2); }
      `}</style>

      {/* SIDEBAR (same as before, omitted for brevity - keep your existing sidebar code) */}
      {sidebarOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 40 }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 300, backgroundColor: "#0f0f0f", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 50, display: "flex", flexDirection: "column", animation: "slideIn 0.25s ease", overflow: "hidden" }}>
            <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Icons.music}
                </div>
                <span style={{ fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg, #c084fc, #e9d5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wavely</span>
              </div>
              {[
                { icon: Icons.home, label: "Home", tab: "home" },
                { icon: Icons.search, label: "Search", tab: "search" },
                { icon: Icons.library, label: "Library", tab: "library" },
              ].map(item => (
                <div key={item.tab} onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12,
                    cursor: "pointer", marginBottom: 4,
                    backgroundColor: activeTab === item.tab ? "rgba(192,132,252,0.15)" : "transparent",
                    color: activeTab === item.tab ? "#c084fc" : "#a1a1aa",
                  }}>
                  {item.icon}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#a1a1aa", textTransform: "uppercase" }}>Your Library</span>
                <button onClick={() => setShowNewPlaylist(true)} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#fff" }}>{Icons.plus}</button>
              </div>
              <div onClick={() => { setActiveTab("liked"); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Icons.heartFill}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Liked Songs</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa" }}>{liked.size} songs</div>
                </div>
              </div>
              {playlists.map(pl => (
                <div key={pl.id} onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {pl.tracks[0] ? <img src={pl.tracks[0].image || imgFallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 18 }}>🎵</span>}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                    <div style={{ fontSize: 11, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 4 }}>
                      {pl.isPublic ? Icons.unlock : Icons.lock}
                      {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                    </div>
                  </div>
                </div>
              ))}
              {playlists.length === 0 && <div style={{ padding: "32px 16px", textAlign: "center", color: "#52525b", fontSize: 13 }}>No playlists yet.<br />Create your first!</div>}
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{displayName[0]?.toUpperCase()}</div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{displayName}</span>
              </div>
              <button onClick={handleSignOut} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "10px", color: "#a1a1aa", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>Sign Out</button>
            </div>
          </div>
        </>
      )}

      {/* NEW PLAYLIST MODAL */}
      {showNewPlaylist && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 40 }} onClick={() => setShowNewPlaylist(false)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#1f1f1f", borderRadius: 20, padding: 24, zIndex: 50, width: "90%", maxWidth: 360, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Create Playlist</h3>
            <input value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} onKeyDown={e => e.key === "Enter" && createPlaylist()} placeholder="Playlist name..." autoFocus
              style={{ width: "100%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowNewPlaylist(false)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "10px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={createPlaylist} style={{ flex: 1, background: "#c084fc", border: "none", borderRadius: 99, padding: "10px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Create</button>
            </div>
          </div>
        </>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {showAddToPlaylist && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 40 }} onClick={() => setShowAddToPlaylist(null)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#1f1f1f", borderRadius: 20, padding: 24, zIndex: 50, width: "90%", maxWidth: 360 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Add to Playlist</h3>
            <p style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{showAddToPlaylist.name}</p>
            {playlists.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#a1a1aa", marginBottom: 12 }}>No playlists yet!</p>
                <button onClick={() => { setShowAddToPlaylist(null); setShowNewPlaylist(true); }} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "8px 20px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                {playlists.map(pl => (
                  <div key={pl.id} onClick={() => addToPlaylist(pl, showAddToPlaylist)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", cursor: "pointer", transition: "background 0.15s" }}>
                    <span style={{ fontSize: 20 }}>🎵</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{pl.name}</div>
                      <div style={{ color: "#a1a1aa", fontSize: 12 }}>{pl.tracks.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddToPlaylist(null)} style={{ width: "100%", marginTop: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "10px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </>
      )}

      {/* FULL PLAYER MODAL (same as before - kept functional) */}
      {showPlayer && currentTrack && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", zIndex: 40 }} onClick={() => setShowPlayer(false)} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#0f0f0f", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: "1px solid rgba(255,255,255,0.1)", zIndex: 50, animation: "slideUp 0.3s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ width: 48, height: 4, backgroundColor: "#3f3f3f", borderRadius: 2, margin: "12px auto 20px" }} />
            <div style={{ padding: "0 20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <img src={currentTrack.image || imgFallback} alt="" style={{ width: 240, height: 240, borderRadius: 20, objectFit: "cover", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.name}</div>
                  <div style={{ color: "#a1a1aa", fontSize: 14 }}>{currentTrack.artist_name}</div>
                </div>
                <button onClick={() => toggleLike(currentTrack.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", color: liked.has(currentTrack.id) ? "#c084fc" : "#a1a1aa" }}>
                  {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
                </button>
              </div>
              <div onClick={handleSeek} style={{ height: 4, background: "#3f3f3f", borderRadius: 2, marginBottom: 8, cursor: "pointer", position: "relative" }}>
                <div style={{ height: "100%", background: "#c084fc", borderRadius: 2, width: `${progressPct}%`, transition: "width 0.1s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", fontSize: 11, marginBottom: 24 }}>
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <button onClick={() => setShuffle(s => !s)} style={{ color: shuffle ? "#c084fc" : "#a1a1aa", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%" }}>{Icons.shuffle}</button>
                <button onClick={() => skip(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 12, borderRadius: "50%", color: "#fff" }}>{Icons.prev}</button>
                <button onClick={() => setPlaying(p => !p)} style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", transition: "transform 0.15s" }}>
                  <div style={{ transform: "scale(1.3)" }}>{playing ? Icons.pause : Icons.play}</div>
                </button>
                <button onClick={() => skip(1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 12, borderRadius: "50%", color: "#fff" }}>{Icons.next}</button>
                <button onClick={() => setRepeat(r => !r)} style={{ color: repeat ? "#c084fc" : "#a1a1aa", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%" }}>{Icons.repeat}</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button onClick={() => setIsMuted(!isMuted)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa" }}>{isMuted ? Icons.volumeX : Icons.volume}</button>
                <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (isMuted) setIsMuted(false); }} style={{ flex: 1, accentColor: "#c084fc" }} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowAddToPlaylist(currentTrack)} style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 99, padding: "12px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>+ Add to Playlist</button>
                <button onClick={() => { if (navigator.share) navigator.share({ title: currentTrack.name, text: `Listening to ${currentTrack.name} on Wavely!` }); }} style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 99, padding: "12px", color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{Icons.share} Share</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, borderRadius: "50%", color: "#fff" }}>{Icons.menu}</button>
        <span style={{ fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg, #c084fc, #e9d5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wavely</span>
        <a href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, textDecoration: "none", color: "#fff" }}>{displayName[0]?.toUpperCase()}</a>
      </div>

      {/* MAIN CONTENT (trimmed for brevity, but includes all tabs - keep your existing content) */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
        {/* HOME */}
        {activeTab === "home" && (
          <div className="fade-up">
            <div onClick={() => setActiveTab("search")} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 24, cursor: "pointer", transition: "background 0.15s" }}>
              <span style={{ color: "#a1a1aa" }}>{Icons.search}</span>
              <span style={{ color: "#a1a1aa", fontSize: 14 }}>Search songs, artists...</span>
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 24, scrollbarWidth: "thin" }}>
              {GENRES.map((g, i) => (
                <button key={i} onClick={() => switchGenre(i)} style={{
                  background: activeGenre === i ? "#c084fc" : "#1f1f1f",
                  color: activeGenre === i ? "#000" : "#fff",
                  border: "none", borderRadius: 99, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}>{g.label}</button>
              ))}
            </div>
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#a1a1aa" }}>
                <div style={{ fontSize: 32, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 12 }}>🎵</div>
                <div>Loading...</div>
              </div>
            )}
            {!loading && featuredTrack && (
              <>
                <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f0f0f)", borderRadius: 20, padding: 16, marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
                  <img src={featuredTrack.image || imgFallback} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#c084fc", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Featured Track</div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{featuredTrack.name}</div>
                    <div style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 12 }}>{featuredTrack.artist_name}</div>
                    <button onClick={() => playTrack(featuredTrack)} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "8px 20px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "transform 0.15s" }}>
                      {currentTrack?.id === featuredTrack.id && playing ? Icons.pause : Icons.play}
                      {currentTrack?.id === featuredTrack.id && playing ? "Pause" : "Play Now"}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#a1a1aa", textTransform: "uppercase", marginBottom: 12 }}>Popular • {GENRES[activeGenre].label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {tracks.map(track => <TrackRow key={track.id} track={track} />)}
                </div>
              </>
            )}
            {!loading && !featuredTrack && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#a1a1aa" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>No tracks found</div>
                <button onClick={() => fetchTracks(GENRES[activeGenre].tag)} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Try Again</button>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: -0.5 }}>Your Library</h2>
              <button onClick={() => setShowNewPlaylist(true)} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "8px 16px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{Icons.plus} New</button>
            </div>
            {playlists.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>No playlists yet</div>
                <div style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 20 }}>Create your first playlist!</div>
                <button onClick={() => setShowNewPlaylist(true)} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {playlists.map(pl => (
                  <div key={pl.id} onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); }} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "background 0.15s" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {pl.tracks[0] ? <img src={pl.tracks[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🎵</span>}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                      <div style={{ color: "#a1a1aa", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        {pl.isPublic ? Icons.unlock : Icons.lock}
                        {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                      </div>
                    </div>
                    <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => togglePublic(pl.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: pl.isPublic ? "#c084fc" : "#a1a1aa" }}>{pl.isPublic ? Icons.unlock : Icons.lock}</button>
                      {pl.isPublic && <button onClick={() => copyPlaylistLink(pl.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#a1a1aa" }}>{Icons.copy}</button>}
                      <button onClick={() => deletePlaylist(pl.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#ff4444" }}>{Icons.trash}</button>
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
            <button onClick={() => setActiveTab("library")} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>← Back to Library</button>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-end", marginBottom: 28 }}>
              <div style={{ width: 104, height: 104, borderRadius: 16, background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
                {activePlaylist.tracks[0] ? <img src={activePlaylist.tracks[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 36 }}>🎵</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Playlist</div>
                <h2 style={{ fontWeight: 800, fontSize: 24, letterSpacing: -0.5, marginBottom: 6 }}>{activePlaylist.name}</h2>
                <div style={{ color: "#a1a1aa", fontSize: 13, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{activePlaylist.isPublic ? Icons.unlock : Icons.lock}{activePlaylist.isPublic ? "Public" : "Private"}</span>
                  <span>· {activePlaylist.tracks.length} songs</span>
                  {activePlaylist.isPublic && <button onClick={() => copyPlaylistLink(activePlaylist.id)} style={{ background: "none", border: "none", color: "#c084fc", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>{Icons.copy} Copy Link</button>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              {activePlaylist.tracks.length > 0 && (
                <button onClick={() => { setCurrentTrack(activePlaylist.tracks[0]); setPlaying(true); }} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>{Icons.play} Play All</button>
              )}
              <button onClick={() => togglePublic(activePlaylist.id)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 99, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{activePlaylist.isPublic ? Icons.lock : Icons.unlock}{activePlaylist.isPublic ? "Make Private" : "Make Public"}</button>
            </div>
            {activePlaylist.tracks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                <div style={{ color: "#a1a1aa", marginBottom: 12 }}>No songs yet. Search and add songs!</div>
                <button onClick={() => setActiveTab("search")} style={{ background: "#c084fc", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Find Music</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {activePlaylist.tracks.map(track => (
                  <div key={track.id} onClick={() => playTrack(track)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}>
                    <img src={track.image || imgFallback} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#c084fc" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                      <div style={{ color: "#a1a1aa", fontSize: 12 }}>{track.artist_name}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFromPlaylist(activePlaylist.id, track.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#ff4444" }}>{Icons.trash}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIKED SONGS */}
        {activeTab === "liked" && (
          <div className="fade-up">
            <div style={{ background: "linear-gradient(135deg, #c084fc20, #8b5cf620)", borderRadius: 20, padding: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>❤️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>Liked Songs</div>
                <div style={{ color: "#a1a1aa", fontSize: 13 }}>{liked.size} songs</div>
              </div>
            </div>
            {liked.size === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#a1a1aa" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
                <div>No liked songs yet. Heart a song to save it!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {allTracks.filter(track => liked.has(track.id)).map(track => <TrackRow key={track.id} track={track} />)}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="fade-up" style={{ textAlign: "center", padding: "80px 20px", color: "#a1a1aa" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
            <div style={{ fontWeight: 600, fontSize: 18, color: "#fff", marginBottom: 8 }}>No Activity Yet</div>
            <div>Join spaces to see what's happening</div>
          </div>
        )}
      </div>

      {/* FLOATING MINI PLAYER - NEW DESIGN */}
      {currentTrack && (
        <div 
          className="floating-player"
          onClick={() => setShowPlayer(true)}
          style={{
            position: "fixed",
            bottom: "80px", // sits above bottom nav
            left: "12px",
            right: "12px",
            backgroundColor: "rgba(20, 20, 30, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.4), 0 0 0 1px rgba(192,132,252,0.1)",
            cursor: "pointer",
            zIndex: 35,
            transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
          }}
        >
          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#c084fc", width: `${progressPct}%`, transition: "width 0.15s linear" }} />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
            <img 
              src={currentTrack.image || imgFallback} 
              alt="" 
              style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} 
            />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>
                {currentTrack.name}
              </div>
              <div style={{ color: "#a1a1aa", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentTrack.artist_name}
              </div>
            </div>
            <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button 
                onClick={() => toggleLike(currentTrack.id)} 
                style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", color: liked.has(currentTrack.id) ? "#c084fc" : "#a1a1aa", transition: "all 0.2s" }}
              >
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
              <button 
                onClick={() => setPlaying(p => !p)} 
                style={{ width: 40, height: 40, borderRadius: "50%", background: "#c084fc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", transition: "transform 0.15s, background 0.2s" }}
              >
                {playing ? Icons.pause : Icons.play}
              </button>
              <button 
                onClick={() => skip(1)} 
                style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", color: "#fff", transition: "all 0.2s" }}
              >
                {Icons.next}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 140, left: "50%", transform: "translateX(-50%)", backgroundColor: "#1f1f1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: "nowrap", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", animation: "toastIn 0.3s ease" }}>
          {toast}
        </div>
      )}

      {/* BOTTOM NAVIGATION - ENHANCED WITH ANIMATIONS */}
      <div style={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: "rgba(10,10,12,0.96)", 
        backdropFilter: "blur(20px)", 
        borderTop: "1px solid rgba(255,255,255,0.08)", 
        zIndex: 30, 
        display: "flex", 
        justifyContent: "space-around", 
        padding: "8px 0 18px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)"
      }}>
        {[
          { id: "home", icon: Icons.home, label: "Home" },
          { id: "search", icon: Icons.search, label: "Search" },
          { id: "library", icon: Icons.library, label: "Library" },
          { id: "activity", icon: Icons.bell, label: "Activity" },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className="nav-item"
              style={{
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: 6, 
                padding: "6px 16px",
                color: isActive ? "#c084fc" : "#a1a1aa",
                transition: "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                borderRadius: "20px",
                position: "relative",
              }}
            >
              <div style={{
                transform: isActive ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.2s ease",
              }}>
                {tab.icon}
              </div>
              <span style={{ 
                fontSize: 10, 
                fontWeight: 700, 
                letterSpacing: 0.5,
                background: isActive ? "linear-gradient(135deg, #c084fc, #e9d5ff)" : "none",
                WebkitBackgroundClip: isActive ? "text" : "unset",
                WebkitTextFillColor: isActive ? "transparent" : "inherit",
              }}>
                {tab.label.toUpperCase()}
              </span>
              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 24,
                  height: 3,
                  background: "#c084fc",
                  borderRadius: 2,
                  animation: "glowPulse 1.5s infinite",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// SEARCH COMPONENT (unchanged, fully functional)
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

  const quickTags = ["arijit singh", "shreya ghoshal", "bollywood 2024", "lofi hindi", "punjabi hits", "taylor swift", "the weeknd", "bengali songs"];

  return (
    <div className="fade-up">
      <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: -0.5, marginBottom: 16 }}>Search</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="Artists, songs, albums..."
          style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", transition: "border-color 0.2s" }} />
        <button onClick={() => search()} style={{ background: "#c084fc", border: "none", borderRadius: 12, padding: "0 20px", color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>→</button>
      </div>

      {!searched && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Quick Search</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickTags.map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); search(tag); }} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 99, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }}>{tag}</button>
            ))}
          </div>
        </>
      )}

      {searching && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#a1a1aa" }}>
          <div style={{ fontSize: 28, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 10 }}>🎵</div>
          <div>Searching...</div>
        </div>
      )}

      {searched && !searching && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#a1a1aa" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>😕</div>
          <div>No results for "{query}"</div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>{results.length} results</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {results.map((track: any) => (
              <div key={track.id} onClick={() => playTrack(track)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                backgroundColor: currentTrack?.id === track.id ? "rgba(192,132,252,0.15)" : "transparent", transition: "background 0.15s",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={track.image || imgFallback} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                  {currentTrack?.id === track.id && playing && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                        {[0, 1, 2].map(j => <div key={j} style={{ width: 3, borderRadius: 2, background: "#c084fc", height: "100%", animation: `waveAnim ${0.5 + j * 0.15}s infinite` }} />)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#c084fc" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{track.name}</div>
                  <div style={{ color: "#a1a1aa", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist_name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleLike(track.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: liked.has(track.id) ? "#c084fc" : "#a1a1aa" }}>{liked.has(track.id) ? Icons.heartFill : Icons.heart}</button>
                  <span style={{ color: "#a1a1aa", fontSize: 12, fontFamily: "monospace" }}>{formatTime(track.duration)}</span>
                  <button onClick={() => setShowAddToPlaylist(track)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#a1a1aa" }}>{Icons.dots}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
