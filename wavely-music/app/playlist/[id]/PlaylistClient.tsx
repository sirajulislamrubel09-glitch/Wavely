"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";

interface Track {
  id: string;
  name: string;
  artist_name: string;
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
  ownerName?: string;
}

const Icons = {
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/></svg>,
  next: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/></svg>,
  heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="16" height="16" viewBox="0 0 24 24" fill="#1db954" stroke="#1db954" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  music: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  wavely: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
};

export default function PlaylistClient({ id }: { id: string }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });

    // Try to load playlist from Supabase first
    const loadFromSupabase = async () => {
      try {
        const { data } = await supabase
          .from("playlists")
          .select("*, users(username)")
          .eq("id", id)
          .single();

        if (data) {
          if (!data.is_public) {
            setIsPrivate(true);
            return;
          }
          setPlaylist({
            id: data.id,
            name: data.name,
            tracks: data.tracks || [],
            isPublic: data.is_public,
            createdAt: new Date(data.created_at).getTime(),
            ownerName: data.users?.username || "Unknown",
          });
          return;
        }
      } catch (e) {
        // Fall through to localStorage
      }

      // Fallback: try localStorage (for playlists stored locally)
      try {
        const stored = localStorage.getItem("wavely_playlists");
        if (stored) {
          const playlists: Playlist[] = JSON.parse(stored);
          const found = playlists.find(p => p.id === id);
          if (found) {
            if (!found.isPublic) {
              setIsPrivate(true);
              return;
            }
            setPlaylist(found);
            return;
          }
        }
      } catch (e) {}

      setNotFound(true);
    };

    loadFromSupabase();
  }, [id]);

  // Audio
  useEffect(() => {
    if (!currentTrack?.audio || !audioRef.current) return;
    audioRef.current.src = currentTrack.audio;
    audioRef.current.load();
    if (playing) audioRef.current.play().catch(() => {});
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => showToast("🔗 Link copied!"));
  };

  const sharePlaylist = () => {
    if (navigator.share) {
      navigator.share({
        title: playlist?.name || "Wavely Playlist",
        text: `Check out this playlist on Wavely Music!`,
        url: window.location.href,
      });
    } else {
      copyLink();
    }
  };

  const progressPct = duration ? (progress / duration) * 100 : 0;
  const imgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23282828'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22'%3E🎵%3C/text%3E%3C/svg%3E";

  return (
    <div style={{
      background: "#121212", minHeight: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#fff",
    }}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #535353; border-radius: 2px; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes waveAnim { 0%,100% { transform:scaleY(0.4); } 50% { transform:scaleY(1); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

        .fade-up { animation: fadeUp 0.4s ease forwards; }

        .track-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; cursor: pointer; transition: background 0.15s;
        }
        .track-row:hover { background: #ffffff0a; }
        .track-row:active { background: #ffffff15; }

        .play-btn {
          border: none; border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .play-btn:hover { transform: scale(1.08); }
        .play-btn:active { transform: scale(0.95); }

        .btn {
          border: none; border-radius: 99px; cursor: pointer;
          font-family: 'DM Sans', system-ui; font-weight: 600;
          transition: all 0.15s; display: flex; align-items: center; gap: 6px;
        }
        .btn:hover { opacity: 0.9; transform: scale(1.02); }
        .btn:active { transform: scale(0.97); }

        input[type='range'] {
          -webkit-appearance: none; appearance: none;
          background: transparent; cursor: pointer;
        }
        input[type='range']::-webkit-slider-track { background: #535353; border-radius: 2px; height: 4px; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; margin-top: -4px; }
      `}</style>

      {/* Not Found */}
      {notFound && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎵</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Playlist not found</h1>
          <p style={{ color: "#b3b3b3", fontSize: 15, marginBottom: 32 }}>This playlist doesn't exist or has been removed.</p>
          <a href="/dashboard" style={{ background: "#1db954", color: "#000", padding: "12px 28px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>Go to Wavely</a>
        </div>
      )}

      {/* Private */}
      {isPrivate && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Private Playlist</h1>
          <p style={{ color: "#b3b3b3", fontSize: 15, marginBottom: 32 }}>This playlist is private. Only the owner can view it.</p>
          <a href="/dashboard" style={{ background: "#1db954", color: "#000", padding: "12px 28px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>Go to Wavely</a>
        </div>
      )}

      {/* Playlist Content */}
      {playlist && !notFound && !isPrivate && (
        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: currentTrack ? 160 : 40 }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(to bottom, #1a1a2e 0%, #121212 100%)",
            padding: "40px 20px 28px",
          }}>
            {/* Wavely branding */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#1db954", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Icons.wavely}
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>Wavely</span>
              </a>
              {!isLoggedIn && (
                <a href="/auth" style={{ background: "#1db954", color: "#000", padding: "8px 18px", borderRadius: 99, fontWeight: 700, fontSize: 13 }}>
                  Sign Up Free
                </a>
              )}
            </div>

            {/* Playlist info */}
            <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
              {/* Cover art */}
              <div style={{
                width: 140, height: 140, borderRadius: 12, flexShrink: 0,
                background: playlist.tracks[0]?.image ? "transparent" : "linear-gradient(135deg, #282828, #1a1a2e)",
                overflow: "hidden", boxShadow: "0 16px 48px #00000088",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {playlist.tracks[0]?.image ? (
                  <img src={playlist.tracks[0].image} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ color: "#535353" }}>{Icons.music}</div>
                )}
              </div>

              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#b3b3b3", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Public Playlist</div>
                <h1 style={{ fontSize: "clamp(20px, 5vw, 32px)", fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, lineHeight: 1.1 }}>{playlist.name}</h1>
                <div style={{ color: "#b3b3b3", fontSize: 13, marginBottom: 4 }}>
                  {playlist.ownerName && <span style={{ color: "#fff", fontWeight: 600 }}>{playlist.ownerName}</span>}
                  {playlist.ownerName && " · "}
                  {playlist.tracks.length} {playlist.tracks.length === 1 ? "song" : "songs"}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
              {playlist.tracks.length > 0 && (
                <button className="play-btn" onClick={() => { setCurrentTrack(playlist.tracks[0]); setPlaying(true); }} style={{
                  width: 56, height: 56, background: "#1db954",
                  fontSize: 22, color: "#000",
                  boxShadow: "0 8px 24px #1db95444",
                }}>
                  {currentTrack && playing ? Icons.pause : Icons.play}
                </button>
              )}
              <button className="btn" onClick={sharePlaylist} style={{ background: "#282828", color: "#fff", padding: "10px 18px", fontSize: 13 }}>
                {Icons.share} Share
              </button>
              <button className="btn" onClick={copyLink} style={{ background: "#282828", color: "#b3b3b3", padding: "10px 16px", fontSize: 13 }}>
                🔗 Copy Link
              </button>
              {!isLoggedIn && (
                <a href="/auth" className="btn" style={{ background: "#282828", color: "#b3b3b3", padding: "10px 16px", fontSize: 13, marginLeft: "auto" }}>
                  Save to Library
                </a>
              )}
            </div>
          </div>

          {/* Track List */}
          {playlist.tracks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#b3b3b3" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: "#fff" }}>No songs yet</p>
              <p style={{ fontSize: 14 }}>This playlist is empty.</p>
            </div>
          ) : (
            <div className="fade-up" style={{ padding: "8px 0" }}>
              {/* Column headers */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px 12px", borderBottom: "1px solid #282828" }}>
                <div style={{ width: 28, color: "#b3b3b3", fontSize: 12, textAlign: "center" }}>#</div>
                <div style={{ flex: 1, color: "#b3b3b3", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Title</div>
                <div style={{ color: "#b3b3b3", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Duration</div>
              </div>

              {playlist.tracks.map((track, i) => (
                <div key={track.id} className="track-row" onClick={() => playTrack(track)} style={{
                  background: currentTrack?.id === track.id ? "#ffffff0f" : "transparent",
                }}>
                  {/* Index / Playing indicator */}
                  <div style={{ width: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {currentTrack?.id === track.id && playing ? (
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{ width: 3, borderRadius: 2, background: "#1db954", height: "100%", animation: `waveAnim ${0.5 + j * 0.15}s ${j * 0.1}s ease-in-out infinite` }} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: currentTrack?.id === track.id ? "#1db954" : "#b3b3b3", fontSize: 14 }}>{i + 1}</span>
                    )}
                  </div>

                  {/* Art + Info */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img src={track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: currentTrack?.id === track.id ? "#1db954" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{track.name}</div>
                    <div style={{ color: "#b3b3b3", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist_name}</div>
                  </div>

                  {/* Like + Duration */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => {
                      setLiked(prev => {
                        const n = new Set(prev);
                        if (n.has(track.id)) n.delete(track.id);
                        else { n.add(track.id); showToast("❤️ Added to liked!"); }
                        return n;
                      });
                    }} style={{ background: "none", border: "none", cursor: "pointer", color: liked.has(track.id) ? "#1db954" : "#b3b3b3", display: "flex", padding: 4 }}>
                      {liked.has(track.id) ? Icons.heartFill : Icons.heart}
                    </button>
                    <span style={{ color: "#b3b3b3", fontSize: 13 }}>{formatTime(track.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA for non-logged users */}
          {!isLoggedIn && (
            <div style={{
              margin: "24px 16px",
              background: "linear-gradient(135deg, #1a3a2a, #1a1a2e)",
              border: "1px solid #1db95433",
              borderRadius: 16, padding: "24px 20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎵</div>
              <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Enjoy this playlist on Wavely</h3>
              <p style={{ color: "#b3b3b3", fontSize: 14, marginBottom: 20 }}>Sign up free to create playlists, like songs, and listen to millions of tracks.</p>
              <a href="/auth" style={{ background: "#1db954", color: "#000", padding: "13px 32px", borderRadius: 99, fontWeight: 700, fontSize: 15, display: "inline-block" }}>
                Sign Up Free
              </a>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "24px 16px", color: "#535353", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, background: "#1db954", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Icons.wavely}
              </div>
              <span style={{ fontWeight: 700, color: "#b3b3b3" }}>Wavely Music</span>
            </div>
            <p>© 2025 Wavely Music · Free music for everyone</p>
          </div>
        </div>
      )}

      {/* Mini Player */}
      {currentTrack && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, #0a0a0a, #181818)",
          borderTop: "1px solid #282828",
          padding: "10px 16px 16px",
          zIndex: 50,
          maxWidth: 680, margin: "0 auto",
        }}>
          {/* Progress */}
          <div onClick={handleSeek} style={{ height: 3, background: "#535353", borderRadius: 2, marginBottom: 12, cursor: "pointer" }}>
            <div style={{ height: "100%", background: "#1db954", borderRadius: 2, width: `${progressPct}%`, transition: "width 0.1s" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={currentTrack.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#1db954" }}>{currentTrack.name}</div>
              <div style={{ color: "#b3b3b3", fontSize: 12 }}>{currentTrack.artist_name} · {formatTime(progress)} / {formatTime(duration)}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="play-btn" onClick={() => skip(-1)} style={{ width: 34, height: 34, background: "#282828", color: "#b3b3b3" }}>{Icons.prev}</button>
              <button className="play-btn" onClick={() => setPlaying(p => !p)} style={{ width: 48, height: 48, background: "#1db954", color: "#000", boxShadow: "0 0 16px #1db95444" }}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="play-btn" onClick={() => skip(1)} style={{ width: 34, height: 34, background: "#282828", color: "#b3b3b3" }}>{Icons.next}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: currentTrack ? 140 : 24, left: "50%", transform: "translateX(-50%)", background: "#282828", border: "1px solid #535353", borderRadius: 99, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: "nowrap", boxShadow: "0 8px 24px #00000088", animation: "toastIn 0.3s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}