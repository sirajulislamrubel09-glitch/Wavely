"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  duration: number;
  audio: string;
  image: string;
  album_image?: string;
  genre?: string;
}

const genres = [
  { label: "🌙 Lo-Fi", tag: "lofi" },
  { label: "⚡ Bollywood", tag: "bollywood" },
  { label: "🎷 Jazz", tag: "jazz" },
  { label: "🌊 Ambient", tag: "ambient" },
  { label: "🔊 Techno", tag: "techno" },
  { label: "☕ Chill", tag: "chillout" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [activeGenre, setActiveGenre] = useState("lofi");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/auth";
      else setUser(data.user);
    });
    fetchTracks("lofi");
  }, []);

  const fetchTracks = async (tag: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/jamendo?endpoint=tracks&params=limit%3D15%26tags%3D${tag}%26audioformat%3Dmp32`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const mapped: Track[] = data.results.map((t: any) => ({
          id: t.id,
          name: t.name,
          artist_name: t.artist_name,
          album_name: t.album_name || "",
          duration: t.duration,
          audio: t.audio,
          image: t.album_image || t.image || "",
          genre: tag,
        }));
        setFeaturedTrack(mapped[0]);
        setTracks(mapped.slice(1));
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const switchGenre = (tag: string) => {
    setActiveGenre(tag);
    fetchTracks(tag);
  };

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = currentTrack.audio;
    audioRef.current.load();
    if (playing) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  const playTrack = (track: Track) => {
  localStorage.setItem("wavely_current_track", JSON.stringify(track));
  window.dispatchEvent(new Event("wavely_track_change"));
  if (currentTrack?.id === track.id) {
    setPlaying(p => !p);
  } else {
    setCurrentTrack(track);
    setPlaying(true);
  }
};

  const skipNext = () => {
    const all = featuredTrack ? [featuredTrack, ...tracks] : tracks;
    const idx = all.findIndex(t => t.id === currentTrack?.id);
    if (idx < all.length - 1) { setCurrentTrack(all[idx + 1]); setPlaying(true); }
  };

  const skipPrev = () => {
    const all = featuredTrack ? [featuredTrack, ...tracks] : tracks;
    const idx = all.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) { setCurrentTrack(all[idx - 1]); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => skipNext();

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const imgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%237c3aed22'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22'%3E🎵%3C/text%3E%3C/svg%3E";

  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "Listener";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div style={{
      background: "#080810", minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      color: "#e8e8f8", display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }
        a { text-decoration: none; color: inherit; }

        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes waveform { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes orb { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(10px,-10px); } }

        .fade-up { animation: fade-up 0.4s ease forwards; }

        .track-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 14px;
          cursor: pointer; transition: all 0.2s;
          border: 1px solid transparent;
        }
        .track-row:hover { background: #12121e; border-color: #7c3aed22; }
        .track-row:active { transform: scale(0.98); }

        .genre-chip {
          border-radius: 99px; padding: 8px 16px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          white-space: nowrap; border: none;
          font-family: 'Sora', system-ui;
        }
        .genre-chip:active { transform: scale(0.95); }

        .play-btn {
          border: none; border-radius: 50%;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .play-btn:hover { transform: scale(1.1); }
        .play-btn:active { transform: scale(0.9); }

        .nav-btn {
          background: none; border: none; cursor: pointer;
          display: flex; flex-direction: column;
          align-items: center; gap: 3px;
          padding: 8px 12px; border-radius: 12px;
          transition: all 0.2s;
        }
        .nav-btn:active { transform: scale(0.9); }

        .sidebar-overlay { position: fixed; inset: 0; background: #00000088; z-index: 40; }
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 280px; background: #0d0d1a;
          border-right: 1px solid #7c3aed22;
          z-index: 50; padding: 48px 20px 20px;
          overflow-y: auto; animation: slide-in 0.3s ease;
        }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "5%", width: 250, height: 250, background: "radial-gradient(circle, #7c3aed22 0%, transparent 70%)", filter: "blur(50px)", animation: "orb 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "5%", width: 200, height: 200, background: "radial-gradient(circle, #00f5d415 0%, transparent 70%)", filter: "blur(40px)", animation: "orb 10s 2s ease-in-out infinite" }} />
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎵</div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>Wavely<span style={{ color: "#7c3aed" }}>.</span></span>
            </div>
            <div style={{ background: "#7c3aed15", border: "1px solid #7c3aed33", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{displayName}</div>
              <div style={{ color: "#6060a0", fontSize: 12 }}>{user?.email}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 12 }}>Music Channels</div>
            {genres.map(g => (
              <div key={g.tag} onClick={() => { switchGenre(g.tag); setSidebarOpen(false); setActiveTab("home"); }} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                cursor: "pointer", transition: "all 0.2s",
                background: activeGenre === g.tag ? "#7c3aed22" : "transparent",
                borderLeft: activeGenre === g.tag ? "3px solid #7c3aed" : "3px solid transparent",
                color: activeGenre === g.tag ? "#a78bfa" : "#8080a0",
                fontSize: 13,
              }}>{g.label}</div>
            ))}
            <a href="/profile" style={{ display: "block", marginTop: 24, marginBottom: 12, color: "#8080a0", fontSize: 13, padding: "10px 12px", borderRadius: 10 }}>👤 My Profile</a>
            <button onClick={handleSignOut} style={{ width: "100%", background: "#ef444415", border: "1px solid #ef444433", borderRadius: 12, padding: "12px", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', system-ui" }}>Sign Out</button>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#08081099", backdropFilter: "blur(20px)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ffffff08" }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#e8e8f8", padding: 4 }}>☰</button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Wavely<span style={{ color: "#7c3aed" }}>.</span></div>
        <a href="/profile" style={{ width: 34, height: 34, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>
          {displayName[0]?.toUpperCase()}
        </a>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 180px", position: "relative", zIndex: 1 }}>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="fade-up">
            {/* Search bar */}
            <div onClick={() => setActiveTab("search")} style={{ background: "#12121e", border: "1px solid #ffffff10", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer" }}>
              <span style={{ color: "#4040a0", fontSize: 16 }}>🔍</span>
              <span style={{ color: "#4040a0", fontSize: 14 }}>Search songs, artists...</span>
            </div>

            {/* Featured */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 40, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 12 }}>🎵</div>
                <div style={{ color: "#6060a0", fontSize: 14 }}>Loading music...</div>
              </div>
            ) : featuredTrack && (
              <>
                <div style={{ background: "linear-gradient(135deg, #1a0a2e, #0a1a2e)", border: "1px solid #7c3aed33", borderRadius: 20, padding: 20, marginBottom: 24, position: "relative", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ background: "#7c3aed", color: "white", fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 4 }}>FEATURED</span>
                    <span style={{ color: "#00f5d4", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                      Live Now
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <img src={featuredTrack.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 70, height: 70, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{featuredTrack.name}</div>
                      <div style={{ color: "#8080a0", fontSize: 13, marginBottom: 14 }}>{featuredTrack.artist_name}</div>
                      <button onClick={() => playTrack(featuredTrack)} style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: 99, padding: "9px 22px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', system-ui", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 16px #7c3aed44" }}>
                        {currentTrack?.id === featuredTrack.id && playing ? "⏸ Pause" : "▶ Play Now"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Genre chips */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>Browse Genre</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                    {genres.map(g => (
                      <button key={g.tag} className="genre-chip" onClick={() => switchGenre(g.tag)} style={{
                        background: activeGenre === g.tag ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "#12121e",
                        color: activeGenre === g.tag ? "white" : "#8080a0",
                        boxShadow: activeGenre === g.tag ? "0 4px 16px #7c3aed44" : "none",
                        border: activeGenre === g.tag ? "none" : "1px solid #ffffff10",
                      }}>{g.label}</button>
                    ))}
                  </div>
                </div>

                {/* Track list */}
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>
                  Tracks — {genres.find(g => g.tag === activeGenre)?.label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {tracks.map(track => (
                    <div key={track.id} className="track-row" onClick={() => playTrack(track)} style={{
                      background: currentTrack?.id === track.id ? "#7c3aed15" : "transparent",
                      borderColor: currentTrack?.id === track.id ? "#7c3aed44" : "transparent",
                    }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img src={track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }} />
                        {currentTrack?.id === track.id && playing && (
                          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#00000077", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
                              {[0, 1, 2].map(j => (
                                <div key={j} style={{ width: 3, borderRadius: 2, background: "#a78bfa", animation: `waveform ${0.5 + j * 0.15}s ${j * 0.1}s ease-in-out infinite`, height: "100%" }} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: currentTrack?.id === track.id ? "#a78bfa" : "#e8e8f8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{track.name}</div>
                        <div style={{ color: "#6060a0", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist_name}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ color: "#4040a0", fontSize: 12 }}>{formatTime(track.duration)}</span>
                        <button className="play-btn" style={{ width: 34, height: 34, background: currentTrack?.id === track.id ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "#1a1a28", boxShadow: currentTrack?.id === track.id ? "0 0 12px #7c3aed66" : "none" }}>
                          <span style={{ color: "white", fontSize: 13 }}>{currentTrack?.id === track.id && playing ? "⏸" : "▶"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <SearchTab
            playTrack={playTrack}
            currentTrack={currentTrack}
            playing={playing}
            formatTime={formatTime}
            imgFallback={imgFallback}
          />
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div className="fade-up" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Your Library</div>
            <div style={{ color: "#6060a0", fontSize: 14, marginBottom: 24 }}>Save tracks to build your collection</div>
            <button onClick={() => setActiveTab("search")} style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: 99, padding: "12px 28px", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', system-ui" }}>🔍 Find Music</button>
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="fade-up" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No Activity Yet</div>
            <div style={{ color: "#6060a0", fontSize: 14 }}>Join spaces to see what's happening</div>
          </div>
        )}
      </div>

{/* Mini Player */}
{currentTrack && (
  <div
    onClick={() => (window.location.href = "/player")}
    style={{
      position: "fixed",
      bottom: 64,
      left: 0,
      right: 0,
      background: "linear-gradient(135deg, #12121e, #1a1a2e)",
      borderTop: "1px solid #7c3aed33",
      padding: "10px 16px 8px",
      zIndex: 30,
      backdropFilter: "blur(20px)",
      cursor: "pointer",
    }}
  >
    {/* Progress Bar */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleSeek(e);
      }}
      style={{
        height: 3,
        background: "#ffffff10",
        borderRadius: 2,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 2,
          background: "linear-gradient(90deg, #7c3aed, #00f5d4)",
          width: duration ? `${(progress / duration) * 100}%` : "0%",
          transition: "width 0.1s linear",
          boxShadow: "0 0 6px #7c3aed",
        }}
      />
    </div>

    {/* Content */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      
      {/* Image */}
      <img
        src={currentTrack.image || imgFallback}
        alt=""
        onError={(e) => {
          e.target.src = imgFallback;
        }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      {/* Track Info */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "#a78bfa",
          }}
        >
          {currentTrack.name}
        </div>
        <div style={{ color: "#6060a0", fontSize: 12 }}>
          {currentTrack.artist_name} · {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        
        {/* Prev */}
        <button
          className="play-btn"
          onClick={(e) => {
            e.stopPropagation();
            skipPrev();
          }}
          style={{ width: 32, height: 32, background: "#1a1a28" }}
        >
          <span style={{ color: "#8080a0", fontSize: 14 }}>⏮</span>
        </button>

        {/* Play / Pause */}
        <button
          className="play-btn"
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
          }}
          style={{
            width: 44,
            height: 44,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: "0 0 20px #7c3aed66",
          }}
        >
          <span style={{ color: "white", fontSize: 18 }}>
            {playing ? "⏸" : "▶"}
          </span>
        </button>

        {/* Next */}
        <button
          className="play-btn"
          onClick={(e) => {
            e.stopPropagation();
            skipNext();
          }}
          style={{ width: 32, height: 32, background: "#1a1a28" }}
        >
          <span style={{ color: "#8080a0", fontSize: 14 }}>⏭</span>
        </button>

      </div>
    </div>
  </div>
)}

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#09090f", borderTop: "1px solid #ffffff08", padding: "8px 0 12px", zIndex: 30, display: "flex", justifyContent: "space-around" }}>
        {[
          { id: "home", icon: "🏠", label: "HOME" },
          { id: "search", icon: "🔍", label: "SEARCH" },
          { id: "library", icon: "🎵", label: "LIBRARY" },
          { id: "activity", icon: "🔔", label: "ACTIVITY" },
        ].map(tab => (
          <button key={tab.id} className="nav-btn" onClick={() => setActiveTab(tab.id)} style={{ color: activeTab === tab.id ? "#a78bfa" : "#4040a0" }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchTab({ playTrack, currentTrack, playing, formatTime, imgFallback }: {
  playTrack: (t: any) => void;
  currentTrack: any;
  playing: boolean;
  formatTime: (s: number) => string;
  imgFallback: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/jamendo?endpoint=tracks&params=limit%3D20%26search%3D${encodeURIComponent(query)}%26audioformat%3Dmp32`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fade-up">
      <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, marginBottom: 20 }}>🔍 Search Music</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search songs, artists..."
          style={{ flex: 1, background: "#12121e", border: "1.5px solid #2a2a3e", borderRadius: 14, padding: "13px 16px", color: "#e8e8f8", fontSize: 15, fontFamily: "'Sora', system-ui", outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#7c3aed"}
          onBlur={e => e.target.style.borderColor = "#2a2a3e"}
        />
        <button onClick={search} style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: 14, padding: "0 20px", color: "white", fontSize: 18, cursor: "pointer", fontFamily: "'Sora', system-ui", boxShadow: "0 4px 16px #7c3aed44" }}>🔍</button>
      </div>

      {!searched && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>Quick Search</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["lofi", "jazz", "electronic", "ambient", "synthwave", "classical", "rock", "chill"].map(tag => (
              <button key={tag} onClick={() => setQuery(tag)} style={{ background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 99, padding: "8px 16px", color: "#8080a0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', system-ui", transition: "all 0.2s", textTransform: "capitalize" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#a78bfa"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = "#8080a0"; }}
              >#{tag}</button>
            ))}
          </div>
        </div>
      )}

      {searching && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#6060a0" }}>
          <div style={{ fontSize: 32, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 12 }}>🎵</div>
          <div>Searching Jamendo...</div>
        </div>
      )}

      {searched && !searching && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
          <div style={{ color: "#6060a0", fontSize: 14 }}>No tracks found for "{query}"</div>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>
            {results.length} results for "{query}"
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {results.map(track => (
              <div key={track.id} className="track-row" onClick={() => playTrack({ ...track, image: track.album_image || track.image })} style={{ background: currentTrack?.id === track.id ? "#7c3aed15" : "transparent", borderColor: currentTrack?.id === track.id ? "#7c3aed44" : "transparent" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={track.album_image || track.image || imgFallback} alt="" onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }} />
                  {currentTrack?.id === track.id && playing && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#00000077", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{ width: 3, borderRadius: 2, background: "#a78bfa", animation: `waveform ${0.5 + j * 0.15}s ${j * 0.1}s ease-in-out infinite`, height: "100%" }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: currentTrack?.id === track.id ? "#a78bfa" : "#e8e8f8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{track.name}</div>
                  <div style={{ color: "#6060a0", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist_name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ color: "#4040a0", fontSize: 12 }}>{formatTime(track.duration)}</span>
                  <button className="play-btn" style={{ width: 34, height: 34, background: currentTrack?.id === track.id ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "#1a1a28", boxShadow: currentTrack?.id === track.id ? "0 0 12px #7c3aed66" : "none" }}>
                    <span style={{ color: "white", fontSize: 13 }}>{currentTrack?.id === track.id && playing ? "⏸" : "▶"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
