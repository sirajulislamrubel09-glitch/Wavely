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

// Modern SVG Icons with gradient support
const Icons = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 9l10 6 10-6-10-6zM2 15l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  library: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/></svg>,
  next: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/></svg>,
  shuffle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  repeat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="18" height="18" viewBox="0 0 24 24" fill="#c084fc" stroke="#c084fc" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  volume: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  volumeX: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  dots: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  music: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  chevronRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  mic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  trending: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
};

const GENRES = [
  { label: "Trending", tag: "trending hindi 2024", icon: Icons.trending },
  { label: "Bollywood", tag: "bollywood hits", icon: null },
  { label: "Arijit Singh", tag: "arijit singh", icon: null },
  { label: "Lo-Fi", tag: "lofi hindi", icon: null },
  { label: "Romantic", tag: "romantic hindi songs", icon: null },
  { label: "Party", tag: "party songs hindi", icon: null },
  { label: "English", tag: "english pop 2024", icon: null },
  { label: "Bengali", tag: "bengali songs", icon: null },
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
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
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
            if (typeof window !== "undefined") {
              localStorage.setItem("wavely_playlists", JSON.stringify(loaded));
            }
          } else {
            if (typeof window !== "undefined") {
              const saved = localStorage.getItem("wavely_playlists");
              if (saved) setPlaylists(JSON.parse(saved));
            }
          }
        } catch (error) {
          console.error('Error loading playlists:', error);
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
    showToast(`✨ "${newPl.name}" created!`);
  };

  const addToPlaylist = (playlist: Playlist, track: Track) => {
    const exists = playlist.tracks.find(t => t.id === track.id);
    if (exists) { showToast("Already in playlist!"); return; }
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
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
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
      className="track-row group"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "10px 16px", borderRadius: 12,
        cursor: "pointer", transition: "all 0.2s ease",
        background: currentTrack?.id === track.id ? "rgba(192, 132, 252, 0.15)" : "transparent",
        marginBottom: 2,
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
          style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} />
        {currentTrack?.id === track.id && playing && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="wave-animation" style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 16 }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 3, borderRadius: 2, background: "#c084fc", height: "100%",
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
        <button className="icon-btn" onClick={() => toggleLike(track.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", transition: "all 0.2s", color: liked.has(track.id) ? "#c084fc" : "#a1a1aa" }}>
          {liked.has(track.id) ? Icons.heartFill : Icons.heart}
        </button>
        <span style={{ color: "#a1a1aa", fontSize: 12, fontFamily: "monospace" }}>{formatTime(track.duration)}</span>
        {showMenu && (
          <button className="icon-btn" onClick={() => setShowAddToPlaylist(track)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#a1a1aa" }}>
            {Icons.dots}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
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
        @keyframes glow { 0% { box-shadow: 0 0 5px rgba(192,132,252,0.3); } 100% { box-shadow: 0 0 20px rgba(192,132,252,0.6); } }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.4); opacity: 0; } }

        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
        .track-row:hover { background: rgba(255,255,255,0.05) !important; }
        .icon-btn { transition: all 0.2s ease; }
        .icon-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); color: #c084fc !important; }
        .genre-pill { transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
        .genre-pill:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); }
        .gradient-border { position: relative; background: linear-gradient(135deg, #c084fc, #8b5cf6, #a855f7); padding: 1px; border-radius: 16px; }
        .gradient-border > * { background: #0a0a0a; border-radius: 15px; margin: 0; }
        
        input[type='range'] { -webkit-appearance:none; background:transparent; cursor:pointer; }
        input[type='range']::-webkit-slider-track { background:#3f3f3f; border-radius:10px; height:4px; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#c084fc; margin-top:-5px; box-shadow:0 2px 8px rgba(192,132,252,0.5); transition:transform 0.1s; }
        input[type='range']::-webkit-slider-thumb:hover { transform:scale(1.2); }
        input[type='range']::-moz-range-track { background:#3f3f3f; height:4px; border-radius:10px; }
        input[type='range']::-moz-range-thumb { width:14px; height:14px; border:none; border-radius:50%; background:#c084fc; }

        .bottom-nav { position:fixed; bottom:0; left:0; right:0; background:rgba(10,10,10,0.95); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.08); z-index:30; display:flex; justify-content:space-around; padding:8px 0 16px; }
        .nav-btn { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; padding:6px 20px; color:#a1a1aa; transition:all 0.2s; font-family:'Inter',system-ui; border-radius:12px; }
        .nav-btn.active { color:#c084fc; background:rgba(192,132,252,0.1); }
        .nav-btn:hover { color:#fff; background:rgba(255,255,255,0.05); transform:translateY(-2px); }
      `}</style>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar-panel" style={{ position:"fixed", top:0, left:0, bottom:0, width:"300px", background:"#0f0f0f", borderRight:"1px solid rgba(255,255,255,0.08)", zIndex:50, display:"flex", flexDirection:"column", animation:"slideIn 0.25s ease", overflow:"hidden" }}>
            <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div className="gradient-border" style={{ width: 44, height: 44, borderRadius: 14, padding: 1 }}>
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #c084fc, #a855f7)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {Icons.music}
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5, background: "linear-gradient(135deg, #c084fc, #e9d5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wavely</span>
              </div>
              {[
                { icon: Icons.home, label: "Home", tab: "home" },
                { icon: Icons.search, label: "Search", tab: "search" },
                { icon: Icons.library, label: "Library", tab: "library" },
              ].map(item => (
                <div key={item.tab} onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1" style={{
                  background: activeTab === item.tab ? "rgba(192,132,252,0.15)" : "transparent",
                  color: activeTab === item.tab ? "#c084fc" : "#a1a1aa",
                }}>
                  <span style={{ opacity: activeTab === item.tab ? 1 : 0.7 }}>{item.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px" }}>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#a1a1aa", textTransform: "uppercase" }}>Your Library</span>
                <button onClick={() => setShowNewPlaylist(true)} className="icon-btn" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}>{Icons.plus}</button>
              </div>

              <div className="playlist-item" onClick={() => { setActiveTab("liked"); setSidebarOpen(false); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, cursor:"pointer", marginBottom:2 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {Icons.heartFill}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Liked Songs</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa" }}>{liked.size} songs</div>
                </div>
              </div>

              {playlists.map(pl => (
                <div key={pl.id} className="playlist-item group" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); setSidebarOpen(false); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, cursor:"pointer", transition:"background 0.15s" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
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

              {playlists.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "#52525b", fontSize: 13 }}>
                  No playlists yet.<br />Create your first!
                </div>
              )}
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #c084fc, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                  {displayName[0]?.toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{displayName}</span>
              </div>
              <button onClick={handleSignOut} className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 text-sm font-semibold text-gray-400 transition-all hover:border-white/30 hover:text-white">
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* NEW PLAYLIST MODAL */}
      {showNewPlaylist && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setShowNewPlaylist(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1f1f1f] rounded-2xl p-6 z-50 w-[90%] max-w-[360px] shadow-2xl border border-white/10">
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Create Playlist</h3>
            <input value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createPlaylist()}
              placeholder="Playlist name..."
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-c084fc transition-colors mb-5"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNewPlaylist(false)} className="flex-1 bg-white/5 border border-white/10 rounded-full py-2.5 text-sm font-semibold text-white">Cancel</button>
              <button onClick={createPlaylist} className="flex-1 bg-gradient-to-r from-c084fc to-a855f7 rounded-full py-2.5 text-sm font-bold text-black">Create</button>
            </div>
          </div>
        </>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {showAddToPlaylist && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setShowAddToPlaylist(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1f1f1f] rounded-2xl p-6 z-50 w-[90%] max-w-[360px] shadow-2xl border border-white/10">
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Add to Playlist</h3>
            <p className="text-gray-400 text-sm mb-4 truncate">{showAddToPlaylist.name}</p>
            {playlists.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No playlists yet!</p>
                <button onClick={() => { setShowAddToPlaylist(null); setShowNewPlaylist(true); }} className="bg-gradient-to-r from-c084fc to-a855f7 rounded-full px-5 py-2 text-black font-semibold text-sm">Create Playlist</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {playlists.map(pl => (
                  <div key={pl.id} onClick={() => addToPlaylist(pl, showAddToPlaylist)} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <span className="text-xl">🎵</span>
                    <div>
                      <div className="font-semibold text-sm">{pl.name}</div>
                      <div className="text-gray-400 text-xs">{pl.tracks.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddToPlaylist(null)} className="w-full mt-4 bg-white/5 border border-white/10 rounded-full py-2.5 text-sm font-semibold text-white">Cancel</button>
          </div>
        </>
      )}

      {/* FULL PLAYER */}
      {showPlayer && currentTrack && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40" onClick={() => setShowPlayer(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] rounded-t-3xl border-t border-white/10 z-50 animate-slideUp max-h-[90vh] overflow-y-auto" style={{ animation: "slideUp 0.3s ease" }}>
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-6" />

            <div className="px-6 pb-8">
              <div className="flex justify-center mb-6">
                <img src={currentTrack.image || imgFallback} alt="" className="w-64 h-64 rounded-2xl object-cover shadow-2xl" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }} />
              </div>

              <div className="flex items-center justify-between mb-5">
                <div className="flex-1 overflow-hidden">
                  <div className="font-bold text-xl mb-1 truncate">{currentTrack.name}</div>
                  <div className="text-gray-400 text-sm">{currentTrack.artist_name}</div>
                </div>
                <button onClick={() => toggleLike(currentTrack.id)} className="icon-btn p-2 rounded-full">
                  {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
                </button>
              </div>

              <div onClick={handleSeek} className="h-1.5 bg-gray-700 rounded-full mb-2 cursor-pointer relative group">
                <div className="h-full bg-gradient-to-r from-c084fc to-a855f7 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all" style={{ left: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-gray-400 text-xs mb-6">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <button className={`icon-btn p-2 ${shuffle ? "text-c084fc" : ""}`} onClick={() => setShuffle(s => !s)}>{Icons.shuffle}</button>
                <button className="icon-btn p-3" onClick={() => skip(-1)}>{Icons.prev}</button>
                <button onClick={() => setPlaying(p => !p)} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black transition-transform hover:scale-105">
                  <div className="scale-125">{playing ? Icons.pause : Icons.play}</div>
                </button>
                <button className="icon-btn p-3" onClick={() => skip(1)}>{Icons.next}</button>
                <button className={`icon-btn p-2 ${repeat ? "text-c084fc" : ""}`} onClick={() => setRepeat(r => !r)}>{Icons.repeat}</button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setIsMuted(!isMuted)} className="icon-btn p-1.5">
                  {isMuted ? Icons.volumeX : Icons.volume}
                </button>
                <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume}
                  onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (isMuted) setIsMuted(false); }}
                  className="flex-1 h-1.5 rounded-full accent-c084fc"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowAddToPlaylist(currentTrack)} className="flex-1 bg-white/10 rounded-full py-3 text-sm font-semibold hover:bg-white/15 transition">+ Add to Playlist</button>
                <button onClick={() => { if (navigator.share) navigator.share({ title: currentTrack.name, text: `Listening to ${currentTrack.name} on Wavely!` }); }} className="flex-1 bg-white/10 rounded-full py-3 text-sm font-semibold hover:bg-white/15 transition flex items-center justify-center gap-1">
                  {Icons.share} Share
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button className="icon-btn p-2 rounded-full" onClick={() => setSidebarOpen(true)}>{Icons.menu}</button>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-c084fc to-e9d5ff bg-clip-text text-transparent">Wavely</span>
        <a href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-r from-c084fc to-a855f7 flex items-center justify-center text-sm font-bold">
          {displayName[0]?.toUpperCase()}
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px", position: "relative" }}>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="fade-up">
            <div onClick={() => setActiveTab("search")} className="glass-card rounded-xl p-3 flex items-center gap-3 mb-6 cursor-pointer hover:bg-white/5 transition-all">
              <span className="text-gray-400">{Icons.search}</span>
              <span className="text-gray-400 text-sm">Search songs, artists...</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {GENRES.map((g, i) => (
                <button key={i} className="genre-pill px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all" onClick={() => switchGenre(i)} style={{
                  background: activeGenre === i ? "#c084fc" : "#1f1f1f",
                  color: activeGenre === i ? "#000" : "#fff",
                  boxShadow: activeGenre === i ? "0 0 12px rgba(192,132,252,0.4)" : "none",
                }}>{g.label}</button>
              ))}
            </div>

            {loading && (
              <div className="text-center py-16">
                <div className="text-4xl animate-spin inline-block mb-3">🎵</div>
                <div className="text-gray-400">Loading...</div>
              </div>
            )}

            {!loading && featuredTrack && (
              <>
                <div className="gradient-border mb-6" style={{ borderRadius: 20 }}>
                  <div style={{ padding: 1, borderRadius: 19 }}>
                    <div className="rounded-[19px] p-5 flex gap-4" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f0f0f)" }}>
                      <img src={featuredTrack.image || imgFallback} alt="" className="w-20 h-20 rounded-xl object-cover shadow-lg flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-bold text-c084fc uppercase tracking-wider mb-1">Featured Track</div>
                        <div className="font-bold text-lg truncate mb-1">{featuredTrack.name}</div>
                        <div className="text-gray-400 text-sm mb-3">{featuredTrack.artist_name}</div>
                        <button onClick={() => playTrack(featuredTrack)} className="bg-c084fc rounded-full px-5 py-1.5 text-black font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105">
                          {currentTrack?.id === featuredTrack.id && playing ? Icons.pause : Icons.play}
                          {currentTrack?.id === featuredTrack.id && playing ? "Pause" : "Play Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Popular • {GENRES[activeGenre].label}</div>
                <div className="flex flex-col gap-1">
                  {tracks.map(track => <TrackRow key={track.id} track={track} />)}
                </div>
              </>
            )}

            {!loading && !featuredTrack && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">😕</div>
                <div className="font-semibold mb-2">No tracks found</div>
                <button onClick={() => fetchTracks(GENRES[activeGenre].tag)} className="bg-c084fc rounded-full px-6 py-2 text-black font-semibold">Try Again</button>
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold tracking-tight">Your Library</h2>
              <button onClick={() => setShowNewPlaylist(true)} className="bg-c084fc rounded-full px-4 py-2 text-black font-bold text-sm flex items-center gap-1">
                {Icons.plus} New
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <div className="text-5xl mb-3">🎵</div>
                <div className="font-semibold mb-2">No playlists yet</div>
                <div className="text-gray-400 text-sm mb-4">Create your first playlist!</div>
                <button onClick={() => setShowNewPlaylist(true)} className="bg-c084fc rounded-full px-6 py-2 text-black font-semibold">Create Playlist</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {playlists.map(pl => (
                  <div key={pl.id} className="group bg-white/5 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); }}>
                    <div className="w-14 h-14 rounded-xl bg-[#1f1f1f] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {pl.tracks[0] ? <img src={pl.tracks[0].image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🎵</span>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-semibold text-base truncate">{pl.name}</div>
                      <div className="text-gray-400 text-xs flex items-center gap-1">
                        {pl.isPublic ? Icons.unlock : Icons.lock}
                        {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button className="icon-btn p-2 rounded-full" onClick={() => togglePublic(pl.id)}>{pl.isPublic ? Icons.unlock : Icons.lock}</button>
                      {pl.isPublic && <button className="icon-btn p-2 rounded-full" onClick={() => copyPlaylistLink(pl.id)}>{Icons.copy}</button>}
                      <button className="icon-btn p-2 rounded-full text-red-400" onClick={() => deletePlaylist(pl.id)}>{Icons.trash}</button>
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
            <button onClick={() => setActiveTab("library")} className="text-gray-400 text-sm flex items-center gap-1 mb-4 hover:text-white transition">← Back to Library</button>
            <div className="flex gap-5 items-end mb-6">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-c084fc to-a855f7 flex items-center justify-center shadow-xl flex-shrink-0 overflow-hidden">
                {activePlaylist.tracks[0] ? <img src={activePlaylist.tracks[0].image} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">🎵</span>}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Playlist</div>
                <h2 className="text-2xl font-bold mt-1 mb-1">{activePlaylist.name}</h2>
                <div className="text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    {activePlaylist.isPublic ? Icons.unlock : Icons.lock}
                    {activePlaylist.isPublic ? "Public" : "Private"}
                  </span>
                  <span>• {activePlaylist.tracks.length} songs</span>
                  {activePlaylist.isPublic && (
                    <button onClick={() => copyPlaylistLink(activePlaylist.id)} className="text-c084fc text-xs flex items-center gap-1 hover:underline">Copy Link</button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {activePlaylist.tracks.length > 0 && (
                <button onClick={() => { setCurrentTrack(activePlaylist.tracks[0]); setPlaying(true); }} className="bg-c084fc rounded-full px-5 py-2 text-black font-bold text-sm flex items-center gap-2">
                  {Icons.play} Play All
                </button>
              )}
              <button onClick={() => togglePublic(activePlaylist.id)} className="bg-white/10 rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/15 transition flex items-center gap-1">
                {activePlaylist.isPublic ? Icons.lock : Icons.unlock}
                {activePlaylist.isPublic ? "Make Private" : "Make Public"}
              </button>
            </div>

            {activePlaylist.tracks.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <div className="text-4xl mb-3">🎵</div>
                <div className="text-gray-400 mb-3">No songs yet.</div>
                <button onClick={() => setActiveTab("search")} className="bg-c084fc rounded-full px-6 py-2 text-black font-semibold">Find Music</button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {activePlaylist.tracks.map(track => (
                  <div key={track.id} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all" onClick={() => playTrack(track)}>
                    <img src={track.image || imgFallback} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-sm truncate">{track.name}</div>
                      <div className="text-gray-400 text-xs">{track.artist_name}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFromPlaylist(activePlaylist.id, track.id); }} className="icon-btn p-2 rounded-full text-red-400">
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
            <div className="bg-gradient-to-r from-c084fc/20 to-a855f7/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-c084fc to-a855f7 flex items-center justify-center text-3xl">❤️</div>
              <div>
                <div className="font-bold text-2xl">Liked Songs</div>
                <div className="text-gray-300 text-sm">{liked.size} saved songs</div>
              </div>
            </div>
            {liked.size === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🎵</div>
                <div className="text-gray-400">No liked songs yet. Heart a song to save it!</div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {allTracks.filter(track => liked.has(track.id)).map(track => <TrackRow key={track.id} track={track} />)}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="fade-up text-center py-16">
            <div className="text-5xl mb-3">🔔</div>
            <div className="font-semibold text-lg mb-1">No Activity Yet</div>
            <div className="text-gray-400">Join spaces to see what's happening</div>
          </div>
        )}
      </div>

      {/* MINI PLAYER */}
      {currentTrack && (
        <div className="fixed bottom-14 left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-white/10 z-30 cursor-pointer transition-all hover:bg-[#1a1a1a]" onClick={() => setShowPlayer(true)}>
          <div className="h-0.5 bg-gray-800">
            <div className="h-full bg-gradient-to-r from-c084fc to-a855f7 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center gap-3 p-3 px-4">
            <img src={currentTrack.image || imgFallback} alt="" className="w-11 h-11 rounded-lg object-cover" />
            <div className="flex-1 overflow-hidden">
              <div className="font-semibold text-sm truncate">{currentTrack.name}</div>
              <div className="text-gray-400 text-xs">{currentTrack.artist_name}</div>
            </div>
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              <button className="icon-btn p-2 rounded-full" onClick={() => toggleLike(currentTrack.id)}>
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black" onClick={() => setPlaying(p => !p)}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="icon-btn p-2 rounded-full" onClick={() => skip(1)}>{Icons.next}</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1f1f1f] border border-white/10 rounded-full px-5 py-2.5 text-white text-sm font-medium z-50 whitespace-nowrap shadow-xl animate-toastIn">
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
            <span className="text-[10px] font-semibold tracking-wide">{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// MODERN SEARCH COMPONENT
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
      <h2 className="text-2xl font-bold tracking-tight mb-4">Search</h2>
      <div className="flex gap-3 mb-6">
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Artists, songs, albums..."
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-c084fc transition-colors"
        />
        <button onClick={() => search()} className="bg-gradient-to-r from-c084fc to-a855f7 rounded-xl px-5 font-bold text-black">→</button>
      </div>

      {!searched && (
        <>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Search</div>
          <div className="flex flex-wrap gap-2">
            {quickTags.map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); search(tag); }} className="bg-white/10 rounded-full px-4 py-2 text-sm hover:bg-white/20 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </>
      )}

      {searching && (
        <div className="text-center py-12">
          <div className="text-3xl animate-spin inline-block mb-2">🎵</div>
          <div className="text-gray-400">Searching...</div>
        </div>
      )}

      {searched && !searching && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-2">😕</div>
          <div className="text-gray-400">No results for "{query}"</div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{results.length} results</div>
          <div className="flex flex-col gap-1">
            {results.map((track: any) => (
              <div key={track.id} onClick={() => playTrack(track)} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                <div className="relative flex-shrink-0">
                  <img src={track.image || imgFallback} alt="" className="w-11 h-11 rounded-lg object-cover" />
                  {currentTrack?.id === track.id && playing && (
                    <div className="absolute inset-0 rounded-lg bg-black/60 flex items-center justify-center">
                      <div className="flex gap-1.5 items-end h-3">
                        {[0, 1, 2].map((j: number) => <div key={j} className="w-1 bg-c084fc rounded-full animate-wave" style={{ height: "100%", animation: `waveAnim ${0.5 + j * 0.15}s infinite` }} />)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm truncate">{track.name}</div>
                  <div className="text-gray-400 text-xs">{track.artist_name}</div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleLike(track.id)} className="icon-btn p-2 rounded-full">
                    {liked.has(track.id) ? Icons.heartFill : Icons.heart}
                  </button>
                  <span className="text-gray-400 text-xs font-mono">{formatTime(track.duration)}</span>
                  <button onClick={() => setShowAddToPlaylist(track)} className="icon-btn p-2 rounded-full">{Icons.dots}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
