"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const spaces = [
  { id: 1, name: "Lo-Fi Study Lounge", genre: "Lo-Fi", listeners: 1204, live: true, color: "#7c3aed", emoji: "📚" },
  { id: 2, name: "Midnight Synthwave Club", genre: "Synthwave", listeners: 876, live: true, color: "#0ea5e9", emoji: "🌙" },
  { id: 3, name: "Berlin Techno Underground", genre: "Techno", listeners: 543, live: true, color: "#10b981", emoji: "⚡" },
  { id: 4, name: "Jazz & Blues Late Night", genre: "Jazz", listeners: 329, live: false, color: "#f59e0b", emoji: "🎷" },
  { id: 5, name: "Chill Hop Café", genre: "Chill", listeners: 892, live: true, color: "#ec4899", emoji: "☕" },
];

const forYou = [
  { title: "Acoustic Resonance", artist: "NeonExplorer", genre: "NEW RELEASE", likes: "4.2k", tracks: 12, color: "#7c3aed" },
  { title: "Night Drive", artist: "RetroWave Collective", genre: "TRENDING", likes: "8.1k", tracks: 8, color: "#0ea5e9" },
  { title: "Deep Focus Vol.3", artist: "LoFi Masters", genre: "FOR YOU", likes: "2.9k", tracks: 15, color: "#10b981" },
];

const recentTracks = [
  { title: "Cybernetic Dawn", artist: "NeonExplorer", duration: "3:45", genre: "Synthwave" },
  { title: "Midnight Rain", artist: "LoFi Collective", duration: "4:12", genre: "Lo-Fi" },
  { title: "Electric Soul", artist: "BassArchitect", duration: "5:01", genre: "Electronic" },
  { title: "Neon Lights", artist: "RetroWave", duration: "3:28", genre: "Chill" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(35);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/auth";
      else setUser(data.user);
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing) {
      interval = setInterval(() => {
        setProgress(p => p >= 100 ? 0 : p + 0.2);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "discovery", label: "Discovery", icon: "🔍" },
    { id: "library", label: "Library", icon: "🎵" },
    { id: "activity", label: "Activity", icon: "🔔" },
  ];

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      color: "#e8e8f8",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }

        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes orb {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(15px, -15px); }
        }

        .fade-up { animation: fade-up 0.5s ease forwards; }

        .space-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .space-card:hover, .space-card:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        .nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 8px 12px;
          border-radius: 12px;
        }
        .nav-btn:active { transform: scale(0.9); }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: #00000088;
          z-index: 40;
          animation: fade-up 0.2s ease;
        }
        .sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 280px;
          background: #0f0f1a;
          border-right: 1px solid #7c3aed33;
          z-index: 50;
          padding: 40px 20px 20px;
          animation: slide-in 0.3s ease;
          overflow-y: auto;
        }

        .track-row {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .track-row:hover {
          background: #ffffff08;
          border-radius: 12px;
        }

        .mini-player {
          position: fixed;
          bottom: 64px;
          left: 0; right: 0;
          background: linear-gradient(135deg, #12121e, #1a1a2e);
          border-top: 1px solid #7c3aed33;
          border-bottom: 1px solid #ffffff08;
          padding: 10px 16px;
          z-index: 30;
          backdrop-filter: blur(20px);
        }

        .bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #0a0a14;
          border-top: 1px solid #ffffff08;
          padding: 8px 0 12px;
          z-index: 30;
          display: flex;
          justify-content: space-around;
        }

        .featured-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .featured-card:active { transform: scale(0.98); }

        .pill {
          border-radius: 99px;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "5%", right: "5%",
          width: 250, height: 250,
          background: "radial-gradient(circle, #7c3aed22 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orb 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", left: "5%",
          width: 200, height: 200,
          background: "radial-gradient(circle, #00f5d415 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "orb 10s 2s ease-in-out infinite",
        }} />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <div style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                borderRadius: 10, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18,
              }}>🎵</div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>Wavely<span style={{ color: "#7c3aed" }}>.</span></span>
            </div>

            {/* User info */}
            <div style={{
              background: "#7c3aed15", border: "1px solid #7c3aed33",
              borderRadius: 14, padding: "14px 16px", marginBottom: 24,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                {user?.user_metadata?.username || user?.email?.split("@")[0] || "Listener"}
              </div>
              <div style={{ color: "#6060a0", fontSize: 12 }}>{user?.email}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{
                  background: "#7c3aed22", color: "#a78bfa",
                  border: "1px solid #7c3aed44",
                }} className="pill">FREE</span>
              </div>
            </div>

            {/* Music Channels */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 12 }}>
              Music Channels
            </div>
            {spaces.map((space) => (
              <div key={space.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                cursor: "pointer", transition: "all 0.2s",
                background: space.id === 1 ? "#7c3aed22" : "transparent",
                borderLeft: space.id === 1 ? "3px solid #7c3aed" : "3px solid transparent",
              }}>
                <span style={{ fontSize: 16 }}>{space.emoji}</span>
                <span style={{ fontSize: 13, color: space.id === 1 ? "#a78bfa" : "#8080a0" }}>
                  #{space.name.toLowerCase().replace(/\s/g, "-")}
                </span>
                {space.live && (
                  <span style={{
                    marginLeft: "auto", width: 6, height: 6,
                    borderRadius: "50%", background: "#10b981",
                    boxShadow: "0 0 6px #10b981",
                  }} />
                )}
              </div>
            ))}

            {/* Sign out */}
            <button onClick={handleSignOut} style={{
              marginTop: 32, width: "100%",
              background: "#ef444415", border: "1px solid #ef444433",
              borderRadius: 12, padding: "12px",
              color: "#ef4444", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Sora', system-ui",
            }}>
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* Top Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "#08081088",
        backdropFilter: "blur(20px)",
        padding: "14px 16px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #ffffff08",
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 20, color: "#e8e8f8", padding: 4,
        }}>☰</button>

        <div style={{ fontWeight: 800, fontSize: 18 }}>
          Wavely<span style={{ color: "#7c3aed" }}>.</span>
        </div>

        <div style={{
          width: 34, height: 34,
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, cursor: "pointer",
        }}>
          {user?.email?.[0]?.toUpperCase() || "W"}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px 16px 160px",
        position: "relative", zIndex: 1,
      }}>

        {activeTab === "home" && (
          <div className="fade-up">
            {/* Search bar */}
            <div style={{
              background: "#12121e",
              border: "1px solid #ffffff10",
              borderRadius: 14,
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 24, cursor: "pointer",
            }}>
              <span style={{ color: "#4040a0", fontSize: 16 }}>🔍</span>
              <span style={{ color: "#4040a0", fontSize: 14 }}>Search music & spaces...</span>
            </div>

            {/* Featured Live */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                background: "linear-gradient(135deg, #1a0a2e, #0a1a2e)",
                border: "1px solid #7c3aed33",
                borderRadius: 20, overflow: "hidden",
                position: "relative",
              }} className="featured-card">
                <div style={{ padding: "20px 20px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      background: "#7c3aed", color: "white",
                      fontSize: 9, fontWeight: 800, letterSpacing: 1,
                      padding: "3px 8px", borderRadius: 4,
                    }}>FEATURED</span>
                    <span style={{ color: "#00f5d4", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#00f5d4", display: "inline-block",
                        animation: "pulse 1.5s infinite",
                      }} />
                      Live Now
                    </span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
                    Neon Lounge Session
                  </div>
                  <div style={{ color: "#8080a0", fontSize: 13, marginBottom: 16 }}>
                    1,204 listeners vibing right now
                  </div>
                  <button style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    border: "none", borderRadius: 99,
                    padding: "10px 24px",
                    color: "white", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Sora', system-ui",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    ▶ Listen Along
                  </button>
                </div>
                {/* Decorative waveform */}
                <div style={{
                  position: "absolute", right: 16, top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex", alignItems: "center", gap: 2, height: 50,
                }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2,
                      background: "#7c3aed66",
                      height: `${15 + Math.sin(i * 0.8) * 15}px`,
                      animation: `waveform ${0.5 + (i % 4) * 0.15}s ${i * 0.08}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* For You */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✨</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>For You</span>
                </div>
                <span style={{ color: "#7c3aed", fontSize: 13, cursor: "pointer" }}>See all →</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {forYou.map((item, i) => (
                  <div key={i} className="featured-card" style={{
                    background: "#12121e",
                    border: "1px solid #ffffff08",
                    borderRadius: 16,
                    padding: "16px",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 60, height: 60,
                      background: `${item.color}22`,
                      border: `1px solid ${item.color}44`,
                      borderRadius: 12,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 24,
                      flexShrink: 0,
                    }}>🎵</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{
                          background: `${item.color}22`,
                          color: item.color,
                          fontSize: 9, fontWeight: 800, letterSpacing: 1,
                          padding: "2px 8px", borderRadius: 4,
                        }}>{item.genre}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: "#6060a0", fontSize: 12 }}>
                        ❤️ {item.likes} · {item.tracks} tracks
                      </div>
                    </div>
                    <div style={{
                      width: 36, height: 36,
                      background: "#7c3aed22",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 14,
                      cursor: "pointer",
                    }}>▶</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Spaces */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>🔴 Live Spaces</span>
                <span style={{ color: "#7c3aed", fontSize: 13, cursor: "pointer" }}>View all →</span>
              </div>

              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
                {spaces.filter(s => s.live).map((space) => (
                  <div key={space.id} className="space-card" style={{
                    background: "#12121e",
                    border: `1px solid ${space.color}33`,
                    borderRadius: 16,
                    padding: "16px 14px",
                    minWidth: 150,
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 44, height: 44,
                      background: `${space.color}22`,
                      borderRadius: 12,
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22, marginBottom: 10,
                    }}>{space.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>
                      {space.name}
                    </div>
                    <div style={{ color: "#6060a0", fontSize: 11, marginBottom: 8 }}>
                      {space.listeners.toLocaleString()} listening
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#10b981",
                        animation: "pulse 1.5s infinite",
                        display: "inline-block",
                      }} />
                      <span style={{ color: "#10b981", fontSize: 10, fontWeight: 700 }}>LIVE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tracks */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>🎵 Recent Tracks</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentTracks.map((track, i) => (
                  <div key={i} className="track-row" style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 8px",
                    borderBottom: i < recentTracks.length - 1 ? "1px solid #ffffff08" : "none",
                  }}
                    onClick={() => { setCurrentTrack(i); setPlaying(true); }}
                  >
                    <div style={{
                      width: 40, height: 40,
                      background: "#7c3aed22",
                      borderRadius: 10,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 16,
                      flexShrink: 0,
                    }}>
                      {currentTrack === i && playing ? "▶" : "🎵"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{track.title}</div>
                      <div style={{ color: "#6060a0", fontSize: 12 }}>{track.artist}</div>
                    </div>
                    <div style={{ color: "#4040a0", fontSize: 12 }}>{track.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "discovery" && (
          <div className="fade-up">
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>🔍 Discovery</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { name: "Electronic", sub: "Tech, Bass, House", color: "#7c3aed", emoji: "⚡" },
                { name: "Synthwave", sub: "Retrowave, Outrun", color: "#0ea5e9", emoji: "🌙" },
                { name: "Lo-Fi", sub: "Study, Chill, Relax", color: "#10b981", emoji: "📚" },
                { name: "Jazz & Blues", sub: "Late night vibes", color: "#f59e0b", emoji: "🎷" },
                { name: "Techno", sub: "Dark, Industrial", color: "#ef4444", emoji: "🔊" },
                { name: "Ambient", sub: "Focus, Sleep, Calm", color: "#8b5cf6", emoji: "🌊" },
              ].map((g, i) => (
                <div key={i} className="space-card" style={{
                  background: `${g.color}15`,
                  border: `1px solid ${g.color}33`,
                  borderRadius: 16, padding: "20px 16px",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{g.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: g.color }}>{g.name}</div>
                  <div style={{ color: "#6060a0", fontSize: 11, marginTop: 2 }}>{g.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div className="fade-up">
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>🎵 Your Library</div>
            <div style={{
              background: "#7c3aed15", border: "1px solid #7c3aed33",
              borderRadius: 16, padding: "20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎧</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No playlists yet</div>
              <div style={{ color: "#6060a0", fontSize: 13, marginBottom: 16 }}>
                Start saving tracks to build your library
              </div>
              <button style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                border: "none", borderRadius: 99,
                padding: "10px 24px",
                color: "white", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Sora', system-ui",
              }}>+ Create Playlist</button>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="fade-up">
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>🔔 Activity</div>
            <div style={{
              background: "#12121e", border: "1px solid #ffffff08",
              borderRadius: 16, padding: "20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No activity yet</div>
              <div style={{ color: "#6060a0", fontSize: 13 }}>
                Join spaces to see what's happening
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mini Player */}
      <div className="mini-player">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            borderRadius: 10,
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18, flexShrink: 0,
          }}>🎵</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {recentTracks[currentTrack].title}
            </div>
            <div style={{ color: "#6060a0", fontSize: 12 }}>
              {recentTracks[currentTrack].artist}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setPlaying(p => !p)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                border: "none", fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              {playing ? "⏸" : "▶"}
            </button>
            <button
              onClick={() => setCurrentTrack(t => (t + 1) % recentTracks.length)}
              style={{ background: "none", border: "none", color: "#6060a0", fontSize: 18, cursor: "pointer" }}>
              ⏭
            </button>
          </div>
        </div>
        {/* Progress */}
        <div style={{ height: 2, background: "#ffffff10", borderRadius: 2 }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "linear-gradient(90deg, #7c3aed, #00f5d4)",
            width: `${progress}%`,
            transition: "width 0.1s linear",
          }} />
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {tabs.map((tab) => (
          <button key={tab.id} className="nav-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{ color: activeTab === tab.id ? "#a78bfa" : "#4040a0" }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: activeTab === tab.id ? "#a78bfa" : "#4040a0",
            }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
