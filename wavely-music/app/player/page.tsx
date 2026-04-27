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

  // Get track from URL params or localStorage
  const [track, setTrack] = useState<any>(null);

  useEffect(() => {
    // Check if running as PWA app
    const isPWA = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    setIsApp(isPWA);

    // Get current track from localStorage
    const stored = localStorage.getItem("wavely_current_track");
    if (stored) {
      try {
        setTrack(JSON.parse(stored));
      } catch (e) {}
    }

    // Listen for track changes
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
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      color: "#e8e8f8",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      maxWidth: 480,
      margin: "0 auto",
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes waveform { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .fade-up { animation: fade-up 0.5s ease forwards; }
        .float-anim { animation: float 3s ease-in-out infinite; }

        .icon-btn {
          background: none; border: none;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }
        .icon-btn:hover { transform: scale(1.1); }
        .icon-btn:active { transform: scale(0.9); }

        .play-btn {
          border: none; border-radius: 50%;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .play-btn:hover { transform: scale(1.05); }
        .play-btn:active { transform: scale(0.95); }

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%; height: 4px;
          border-radius: 2px; outline: none;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 8px #7c3aed88;
          cursor: pointer;
        }

        .queue-sheet {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #12121e; border-radius: 24px 24px 0 0;
          border-top: 1px solid #7c3aed33;
          padding: 20px 16px 40px;
          z-index: 50; max-height: 70vh;
          overflow-y: auto;
          animation: slide-up 0.3s ease;
          max-width: 480px; margin: 0 auto;
        }

        .download-btn {
          display: flex; align-items: center; gap: 8px;
          border-radius: 99px; padding: 10px 20px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Sora', system-ui;
          border: none;
        }
      `}</style>

      {/* Dynamic background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        {/* Blurred album art background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${track.image || imgFallback})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(40px) brightness(0.3)",
          transform: "scale(1.2)",
        }} />
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #08081088 0%, #080810cc 60%, #080810 100%)" }} />
      </div>

      {/* HEADER */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "52px 20px 16px",
      }}>
        <a href="/dashboard" style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "#ffffff15", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "white", textDecoration: "none",
        }}>↓</a>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#ffffff88", textTransform: "uppercase" }}>
            Now Playing
          </div>
        </div>

        <button className="icon-btn" onClick={() => setShowQueue(true)} style={{
          width: 38, height: 38,
          background: "#ffffff15", backdropFilter: "blur(10px)",
          color: "white", fontSize: 16,
        }}>⋯</button>
      </div>

      {/* ALBUM ART */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", justifyContent: "center",
        padding: "20px 32px 28px",
      }}>
        <div className={playing ? "float-anim" : ""} style={{
          width: "100%", maxWidth: 300,
          aspectRatio: "1",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: playing
            ? "0 20px 80px #7c3aed66, 0 0 40px #7c3aed44"
            : "0 20px 60px #00000088",
          transition: "box-shadow 0.5s ease",
          border: "2px solid #ffffff15",
        }}>
          <img
            src={track.image || imgFallback}
            alt={track.name}
            onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              animation: playing ? "spin 20s linear infinite" : "none",
              transition: "animation 0.3s",
            }}
          />
        </div>
      </div>

      {/* TRACK INFO */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "0 24px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ flex: 1, overflow: "hidden", marginRight: 16 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 800, letterSpacing: -0.5,
            marginBottom: 6, whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{track.name}</h1>
          <p style={{
            color: "#a0a0c0", fontSize: 15, fontWeight: 500,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{track.artist_name}</p>
          {track.album_name && (
            <p style={{ color: "#6060a0", fontSize: 12, marginTop: 2 }}>
              {track.album_name}
            </p>
          )}
        </div>

        <button className="icon-btn" onClick={() => setLiked(l => !l)} style={{
          width: 46, height: 46,
          background: liked ? "#7c3aed22" : "#ffffff11",
          border: `1px solid ${liked ? "#7c3aed55" : "#ffffff22"}`,
          fontSize: 22,
        }}>
          {liked ? "💜" : "🤍"}
        </button>
      </div>

      {/* PROGRESS */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 8px" }}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type="range"
            min={0}
            max={duration || 30}
            value={progress}
            onChange={handleSeek}
            style={{
              background: `linear-gradient(to right, #7c3aed ${progressPct}%, #ffffff22 ${progressPct}%)`,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6060a0" }}>
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "12px 24px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Shuffle */}
        <button className="icon-btn" onClick={() => setShuffled(s => !s)} style={{
          width: 42, height: 42, fontSize: 20,
          color: shuffled ? "#a78bfa" : "#6060a0",
        }}>⇄</button>

        {/* Previous */}
        <button className="icon-btn" style={{
          width: 52, height: 52, fontSize: 26,
          color: "#e8e8f8", background: "#ffffff11",
          border: "1px solid #ffffff22",
        }}>⏮</button>

        {/* Play/Pause */}
        <button className="play-btn" onClick={() => setPlaying(p => !p)} style={{
          width: 72, height: 72,
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          fontSize: 28, color: "white",
          boxShadow: "0 0 40px #7c3aed88, 0 8px 32px #7c3aed44",
        }}>
          {playing ? "⏸" : "▶"}
        </button>

        {/* Next */}
        <button className="icon-btn" style={{
          width: 52, height: 52, fontSize: 26,
          color: "#e8e8f8", background: "#ffffff11",
          border: "1px solid #ffffff22",
        }}>⏭</button>

        {/* Repeat */}
        <button className="icon-btn" onClick={() => setRepeated(r => !r)} style={{
          width: 42, height: 42, fontSize: 20,
          color: repeated ? "#a78bfa" : "#6060a0",
        }}>↺</button>
      </div>

      {/* EXTRA ACTIONS */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "8px 24px 16px",
        display: "flex", gap: 12, justifyContent: "center",
      }}>
        {/* Download */}
        <button
          className="download-btn"
          onClick={handleDownload}
          style={{
            background: downloaded ? "#10b98122" : isApp ? "#7c3aed22" : "#ffffff11",
            border: `1px solid ${downloaded ? "#10b98144" : isApp ? "#7c3aed44" : "#ffffff22"}`,
            color: downloaded ? "#10b981" : isApp ? "#a78bfa" : "#6060a0",
          }}
        >
          {downloading ? (
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
          ) : downloaded ? "✅" : "⬇️"}
          {downloading ? "Downloading..." : downloaded ? "Downloaded!" : isApp ? "Download" : "Install app to download"}
        </button>

        {/* Share */}
        <button
          className="download-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: track.name, text: `Listening to ${track.name} by ${track.artist_name} on Wavely!`, url: window.location.href });
            }
          }}
          style={{
            background: "#ffffff11",
            border: "1px solid #ffffff22",
            color: "#a0a0c0",
          }}
        >
          🔗 Share
        </button>
      </div>

      {/* VOLUME */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "0 24px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 16 }}>🔈</span>
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
            flex: 1,
            background: `linear-gradient(to right, #7c3aed ${volume * 100}%, #ffffff22 ${volume * 100}%)`,
          }}
        />
        <span style={{ fontSize: 16 }}>🔊</span>
      </div>

      {/* Waveform visualizer */}
      {playing && (
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", justifyContent: "center",
          alignItems: "flex-end", gap: 3,
          height: 40, padding: "0 24px",
          marginBottom: 16,
        }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} style={{
              width: "calc(100% / 36)",
              maxWidth: 8,
              borderRadius: 4,
              background: `hsl(${260 + i * 3}, 70%, 65%)`,
              animation: `waveform ${0.4 + (i % 5) * 0.12}s ${i * 0.04}s ease-in-out infinite`,
              height: `${30 + Math.sin(i * 0.8) * 20}px`,
              opacity: 0.7,
            }} />
          ))}
        </div>
      )}

      {/* Queue Sheet */}
      {showQueue && (
        <>
          <div
            onClick={() => setShowQueue(false)}
            style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 40 }}
          />
          <div className="queue-sheet">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Options</div>
              <button onClick={() => setShowQueue(false)} style={{ background: "none", border: "none", color: "#6060a0", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            {[
              { icon: "💜", label: liked ? "Unlike" : "Like this track", action: () => { setLiked(l => !l); setShowQueue(false); } },
              { icon: "➕", label: "Add to playlist", action: () => { setShowQueue(false); } },
              { icon: "🔗", label: "Share track", action: () => { if (navigator.share) navigator.share({ title: track.name, text: `Listening to ${track.name} on Wavely!`, url: window.location.href }); setShowQueue(false); } },
              { icon: "👤", label: "View artist", action: () => setShowQueue(false) },
              { icon: "💿", label: "View album", action: () => setShowQueue(false) },
              { icon: "⬇️", label: "Download (app only)", action: () => { setShowQueue(false); handleDownload(); } },
            ].map((item, i) => (
              <div key={i} onClick={item.action} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 4px", cursor: "pointer",
                borderBottom: "1px solid #ffffff08",
                transition: "background 0.2s",
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
