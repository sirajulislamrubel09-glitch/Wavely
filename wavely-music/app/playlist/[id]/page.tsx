"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";

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
  user_id: string;
}

// SVG Icons (same as dashboard)
const Icons = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="16" height="16" viewBox="0 0 24 24" fill="#ba55d3" stroke="#ba55d3" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  music: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data, error } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', params.id)
          .eq('is_public', true)
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        const pl: Playlist = {
          id: data.id,
          name: data.name,
          tracks: data.tracks,
          isPublic: data.is_public,
          createdAt: new Date(data.created_at).getTime(),
          user_id: data.user_id,
        };
        setPlaylist(pl);
      } catch (error) {
        console.error('Error fetching playlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [params.id]);

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

  const handleEnded = () => {
    if (!playlist) return;
    const idx = playlist.tracks.findIndex(t => t.id === currentTrack?.id);
    if (idx < playlist.tracks.length - 1) {
      setCurrentTrack(playlist.tracks[idx + 1]);
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

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
    if (!playlist) return;
    const idx = playlist.tracks.findIndex(t => t.id === currentTrack?.id);
    const next = playlist.tracks[idx + dir];
    if (next) { setCurrentTrack(next); setPlaying(true); }
  };

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const progressPct = duration ? (progress / duration) * 100 : 0;
  const imgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23282828'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22'%3E🎵%3C/text%3E%3C/svg%3E";

  if (loading) {
    return (
      <div style={{ background: "#121212", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ background: "#121212", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Playlist not found</div>
        <div style={{ color: "#b3b3b3", textAlign: "center" }}>This playlist might be private or doesn't exist.</div>
        <a href="/" style={{ marginTop: 20, color: "#ba55d3", textDecoration: "none" }}>← Back to Wavely</a>
      </div>
    );
  }

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
      `}</style>

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#121212", borderBottom: "1px solid #282828", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "#b3b3b3", textDecoration: "none" }}>
          ← Back
        </a>
        <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>Wavely</span>
        <div style={{ width: 32, height: 32 }} />
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 180px" }}>
        <div className="fade-up">
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 24 }}>
            <div style={{ width: 100, height: 100, borderRadius: 10, background: "#282828", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px #00000066" }}>
              {playlist.tracks[0] ? <img src={playlist.tracks[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} /> : <span style={{ fontSize: 36 }}>🎵</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#b3b3b3", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Shared Playlist</div>
              <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, marginBottom: 6 }}>{playlist.name}</h2>
              <div style={{ color: "#b3b3b3", fontSize: 12 }}>
                {playlist.tracks.length} songs
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {playlist.tracks.length > 0 && (
              <button onClick={() => { setCurrentTrack(playlist.tracks[0]); setPlaying(true); }} style={{ background: "#ba55d3", border: "none", borderRadius: 99, padding: "10px 24px", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                {Icons.play} Play All
              </button>
            )}
          </div>

          {playlist.tracks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#b3b3b3" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
              <div>This playlist is empty</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {playlist.tracks.map(track => (
                <div key={track.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff08"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => playTrack(track)}
                >
                  <img src={track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#ba55d3" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                    <div style={{ color: "#b3b3b3", fontSize: 12 }}>{track.artist_name}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleLike(track.id); }} className="btn-icon" style={{ color: liked.has(track.id) ? "#ba55d3" : "#b3b3b3" }}>
                    {liked.has(track.id) ? Icons.heartFill : Icons.heart}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MINI PLAYER */}
      {currentTrack && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(to right, #181818, #212121)", borderTop: "1px solid #282828", zIndex: 30, cursor: "pointer" }}>
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
              <button onClick={() => setPlaying(p => !p)} style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#000"
              }}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="btn-icon" style={{ color: "#fff" }} onClick={() => skip(1)}>{Icons.play}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}