"use client";
import { useState, useEffect, useRef } from "react";

export default function PlayerPage() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [liked, setLiked] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [repeated, setRepeated] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isApp, setIsApp] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<any>(null);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);

  // Load playlists from localStorage (same as dashboard)
  useEffect(() => {
    const stored = localStorage.getItem("wavely_playlists");
    if (stored) setPlaylists(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const isPWA = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsApp(isPWA);
    const stored = localStorage.getItem("wavely_current_track");
    if (stored) {
      try {
        setTrack(JSON.parse(stored));
      } catch (e) {}
    }
    const handler = () => {
      const t = localStorage.getItem("wavely_current_track");
      if (t) setTrack(JSON.parse(t));
    };
    window.addEventListener("wavely_track_change", handler);
    return () => window.removeEventListener("wavely_track_change", handler);
  }, []);

  useEffect(() => {
    if (!track?.audio || !audioRef.current) return;
    audioRef.current.src = track.audio;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    setPlaying(true);
    setProgress(0);
  }, [track]);

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = val;
    setProgress(val);
  };

  const handleDownload = async () => {
    if (!isApp) {
      alert("📱 Please install Wavely as an app to download songs!\n\nTap the menu (⋮) in your browser and select 'Add to Home Screen'");
      return;
    }
    if (!track?.audio) return;
    setDownloading(true);
    try {
      const res = await fetch(track.audio);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${track.name} - ${track.artist_name}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (e) {
      alert("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const addToPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    const exists = playlist.tracks.some((t: any) => t.id === track.id);
    if (exists) {
      alert("Already in this playlist!");
      return;
    }
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p
    );
    setPlaylists(updated);
    localStorage.setItem("wavely_playlists", JSON.stringify(updated));
    setShowAddPlaylist(false);
    alert(`✅ Added to "${playlist.name}"!`);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const imgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%237c3aed22'/%3E%3Ctext x='150' y='160' text-anchor='middle' font-size='80'%3E🎵%3C/text%3E%3C/svg%3E";

  if (!track) {
    return (
      <div style={{
        background: "#080810", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Sora', system-ui", color: "#e8e8f8",
        padding: 24,
      }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🎵</div>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>No track playing</div>
        <div style={{ color: "#6060a0", fontSize: 14, marginBottom: 32, textAlign: "center" }}>
          Go back to the dashboard and play a song
        </div>
        <a href="/dashboard" style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "white", borderRadius: 99, padding: "12px 28px",
          fontSize: 14, fontWeight: 700, textDecoration: "none",
        }}>← Back to Dashboard</a>
      </div>
    );
  }

  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <div style={{
      background: "#0a0a12",
      minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      maxWidth: 480,
      margin: "0 auto",
      boxShadow: "0 0 40px rgba(0,0,0,0.5)",
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float-gentle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes waveform { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        .float-anim { animation: float-gentle 3s ease-in-out infinite; }
        .wave-bar { animation: waveform 0.6s ease-in-out infinite; }
        .slide-up { animation: slide-up 0.3s ease-out; }

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 4px;
          background: #2a2a3a;
          outline: none;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #c084fc;
          box-shadow: 0 0 8px #c084fc;
          cursor: pointer;
        }

        .icon-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          backdrop-filter: blur(8px);
        }
        .icon-btn:hover { transform: scale(1.08); background: rgba(192,132,252,0.2); }
        .icon-btn:active { transform: scale(0.95); }

        .play-btn {
          background: linear-gradient(135deg, #c084fc, #a855f7);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(192,132,252,0.4);
        }
        .play-btn:hover { transform: scale(1.05); box-shadow: 0 12px 28px rgba(192,132,252,0.5); }
        .play-btn:active { transform: scale(0.98); }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 99px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', system-ui;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
        }
        .download-btn:hover { background: rgba(192,132,252,0.2); border-color: rgba(192,132,252,0.4); }

        /* Modals - always on top */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: #12121e;
          border-radius: 28px;
          padding: 24px;
          width: 85%;
          max-width: 340px;
          border: 1px solid rgba(192,132,252,0.3);
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
          animation: fade-in 0.2s ease;
        }
        .queue-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(18,18,30,0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px 24px 0 0;
          border-top: 1px solid rgba(192,132,252,0.3);
          padding: 20px 16px 32px;
          z-index: 1000;
          max-height: 70vh;
          overflow-y: auto;
          max-width: 480px;
          margin: 0 auto;
          animation: slide-up 0.3s ease;
        }
      `}</style>

      {/* Blurred background overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundImage: `url(${track.image || imgFallback})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(60px) brightness(0.2)",
        transform: "scale(1.2)",
      }} />
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "linear-gradient(135deg, rgba(10,10,18,0.7), rgba(10,10,18,0.95))",
      }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", padding: "20px 20px 30px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <a href="/dashboard" className="icon-btn" style={{ width: 40, height: 40, fontSize: 20, textDecoration: "none", color: "#fff" }}>←</a>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#c084fc", textTransform: "uppercase" }}>NOW PLAYING</div>
          <button className="icon-btn" onClick={() => setShowQueue(true)} style={{ width: 40, height: 40, fontSize: 20, color: "#fff" }}>⋯</button>
        </div>

        {/* Album Art */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div className={playing ? "float-anim" : ""} style={{
            width: "min(280px, 70vw)",
            aspectRatio: "1",
            borderRadius: 28,
            background: "linear-gradient(135deg, #2a1a4a, #1a1a2e)",
            boxShadow: playing
              ? "0 30px 60px rgba(192,132,252,0.3), 0 0 0 4px rgba(192,132,252,0.2)"
              : "0 20px 40px rgba(0,0,0,0.5)",
            transition: "box-shadow 0.3s",
            overflow: "hidden",
          }}>
            <img
              src={track.image || imgFallback}
              alt={track.name}
              onError={e => (e.target as HTMLImageElement).src = imgFallback}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                animation: playing ? "spin-slow 20s linear infinite" : "none",
              }}
            />
          </div>
        </div>

        {/* Track Info & Like */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: "clamp(20px, 6vw, 26px)",
              fontWeight: 800,
              letterSpacing: -0.5,
              marginBottom: 6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>{track.name}</h1>
            <p style={{
              fontSize: 15,
              color: "#b0b0d0",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>{track.artist_name}</p>
            {track.album_name && (
              <p style={{ fontSize: 12, color: "#7070a0", marginTop: 4 }}>{track.album_name}</p>
            )}
          </div>
          <button
            className="icon-btn"
            onClick={() => setLiked(l => !l)}
            style={{
              width: 48,
              height: 48,
              fontSize: 22,
              background: liked ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${liked ? "#c084fc" : "rgba(255,255,255,0.1)"}`,
              color: liked ? "#c084fc" : "#fff",
            }}
          >
            {liked ? "❤️" : "♡"}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="range"
            min={0}
            max={duration || 30}
            value={progress}
            onChange={handleSeek}
            style={{ background: `linear-gradient(to right, #c084fc ${progressPct}%, #2a2a3a ${progressPct}%)` }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#9090b0" }}>
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Waveform Visualizer (only when playing) */}
        {playing && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: 4,
            height: 40,
            marginBottom: 20,
          }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{
                  width: 4,
                  borderRadius: 2,
                  background: `hsl(${260 + i * 2}, 70%, 65%)`,
                  animationDelay: `${i * 0.05}s`,
                  height: `${20 + Math.sin(i * 0.6) * 18}px`,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        )}

        {/* Main Controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          marginBottom: 20,
        }}>
          <button className="icon-btn" onClick={() => setShuffled(s => !s)} style={{
            width: 44, height: 44, fontSize: 18,
            color: shuffled ? "#c084fc" : "#9090b0",
          }}>🔀</button>

          <button className="icon-btn" onClick={() => {
            // previous track logic - can be extended
          }} style={{
            width: 52, height: 52, fontSize: 24,
            color: "#fff",
          }}>⏮</button>

          <button className="play-btn" onClick={() => setPlaying(p => !p)} style={{
            width: 70, height: 70, fontSize: 30,
            borderRadius: "50%",
            color: "#fff",
          }}>
            {playing ? "⏸" : "▶"}
          </button>

          <button className="icon-btn" onClick={() => {
            // next track logic
          }} style={{
            width: 52, height: 52, fontSize: 24,
            color: "#fff",
          }}>⏭</button>

          <button className="icon-btn" onClick={() => setRepeated(r => !r)} style={{
            width: 44, height: 44, fontSize: 18,
            color: repeated ? "#c084fc" : "#9090b0",
          }}>🔁</button>
        </div>

        {/* Extra Actions: Download & Share */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
          <button className="download-btn" onClick={handleDownload}>
            {downloading ? (
              <span style={{ animation: "spin-slow 1s linear infinite", display: "inline-block" }}>⟳</span>
            ) : downloaded ? "✅" : "⬇️"}
            {downloading ? "Downloading..." : downloaded ? "Downloaded" : (isApp ? "Download" : "Install app")}
          </button>
          <button className="download-btn" onClick={() => {
            if (navigator.share) navigator.share({ title: track.name, text: `Listening to ${track.name} on Wavely!`, url: window.location.href });
          }}>
            🔗 Share
          </button>
        </div>

        {/* Volume Control - FIXED */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <span style={{ fontSize: 16, color: "#9090b0" }}>🔈</span>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              style={{
                width: "100%",
                background: `linear-gradient(to right, #c084fc ${volume * 100}%, #2a2a3a ${volume * 100}%)`,
              }}
            />
          </div>
          <span style={{ fontSize: 16, color: "#9090b0" }}>🔊</span>
        </div>
      </div>

      {/* ADD TO PLAYLIST MODAL - Fixed z-index & style */}
      {showAddPlaylist && (
        <div className="modal-overlay" onClick={() => setShowAddPlaylist(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add to Playlist</h3>
            {playlists.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#a0a0c0", marginBottom: 12 }}>No playlists yet.</p>
                <button onClick={() => { setShowAddPlaylist(false); window.location.href = "/dashboard?tab=library"; }} style={{
                  background: "#c084fc", border: "none", borderRadius: 99, padding: "8px 20px",
                  color: "#000", fontWeight: 700, cursor: "pointer"
                }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                {playlists.map(pl => (
                  <div key={pl.id} onClick={() => addToPlaylist(pl.id)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 14,
                    background: "rgba(255,255,255,0.06)", cursor: "pointer",
                    transition: "background 0.2s",
                  }}>
                    <span style={{ fontSize: 24 }}>🎵</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{pl.name}</div>
                      <div style={{ fontSize: 11, color: "#a0a0c0" }}>{pl.tracks.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddPlaylist(false)} style={{
              width: "100%", marginTop: 16,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 99, padding: "10px", color: "#fff", fontWeight: 600, cursor: "pointer"
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* QUEUE SHEET - Fixed z-index */}
      {showQueue && (
        <>
          <div onClick={() => setShowQueue(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)", zIndex: 999
          }} />
          <div className="queue-sheet">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>Options</div>
              <button onClick={() => setShowQueue(false)} style={{ background: "none", border: "none", color: "#a0a0c0", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            {[
              { icon: liked ? "❤️" : "♡", label: liked ? "Unlike" : "Like this track", action: () => { setLiked(l => !l); setShowQueue(false); } },
              { icon: "➕", label: "Add to playlist", action: () => { setShowQueue(false); setShowAddPlaylist(true); } },
              { icon: "🔗", label: "Share track", action: () => { if (navigator.share) navigator.share({ title: track.name, text: `Listening to ${track.name} on Wavely!`, url: window.location.href }); setShowQueue(false); } },
              { icon: "👤", label: "View artist", action: () => setShowQueue(false) },
              { icon: "💿", label: "View album", action: () => setShowQueue(false) },
              { icon: "⬇️", label: "Download (app only)", action: () => { setShowQueue(false); handleDownload(); } },
            ].map((item, i) => (
              <div key={i} onClick={item.action} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 4px", cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "background 0.2s",
                color: "#e0e0f0",
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
