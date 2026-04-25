"use client";
import { useState, useEffect, useRef } from "react";

const tracks = [
  { title: "Cybernetic Dawn", artist: "NeonExplorer", time: "3:45", genre: "Synthwave" },
  { title: "Midnight Frequencies", artist: "LoFi Collective", time: "4:12", genre: "Lo-Fi" },
  { title: "Deep Pulse", artist: "BassArchitect", time: "5:01", genre: "Electronic" },
  { title: "Neon Rain", artist: "RetroWave", time: "3:28", genre: "Chill" },
];

const spaces = [
  { name: "Lo-Fi Study Lounge", listeners: 1204, genre: "Lo-Fi", live: true, color: "#7c3aed" },
  { name: "Midnight Synthwave Club", listeners: 876, genre: "Synthwave", live: true, color: "#0ea5e9" },
  { name: "Berlin Techno Underground", listeners: 543, genre: "Techno", live: false, color: "#10b981" },
  { name: "Jazz & Blues Late Night", listeners: 329, genre: "Jazz", live: true, color: "#f59e0b" },
];

const genres = ["Synthwave", "Lo-Fi", "Electronic", "Jazz", "Techno", "Chill", "Ambient", "House"];

export default function LandingPage() {
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(35);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   useEffect(() => {
     import("../lib/supabase").then(({ supabase }) => {
     supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
     });
   });
 }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing) {
      interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.3));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const bars = Array.from({ length: 28 }, (_, i) => i);

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif",
      color: "#e8e8f8",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }
        .glow-purple { box-shadow: 0 0 40px #7c3aed44, 0 0 80px #7c3aed22; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orb-drift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.05); } 66% { transform: translate(-20px, 15px) scale(0.95); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes waveform { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        .hero-animate { animation: slide-up 0.8s ease forwards; }
        .hero-animate-2 { animation: slide-up 0.8s 0.2s ease both; }
        .hero-animate-3 { animation: slide-up 0.8s 0.4s ease both; }
        .hero-animate-4 { animation: slide-up 0.8s 0.6s ease both; }
        .float { animation: float 4s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #7c3aed, #00f5d4, #a855f7, #7c3aed);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .nav-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px #7c3aed33; }
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none; color: white; cursor: pointer;
          transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .btn-primary:hover { transform: scale(1.03); box-shadow: 0 8px 30px #7c3aed66; }
        .btn-ghost {
          background: transparent; border: 1px solid #ffffff22;
          color: #e8e8f8; cursor: pointer; transition: all 0.3s ease;
        }
        .btn-ghost:hover { border-color: #7c3aed; background: #7c3aed11; color: #a78bfa; }
        .genre-pill { transition: all 0.2s ease; cursor: pointer; }
        .genre-pill:hover { background: #7c3aed !important; color: white !important; transform: scale(1.05); }
        .space-card { transition: all 0.3s ease; cursor: pointer; }
        .space-card:hover { background: #1e1e2e !important; transform: translateX(4px); }
        .progress-bar { transition: width 0.1s linear; }
        .orb { animation: orb-drift 8s ease-in-out infinite; filter: blur(60px); }
        .orb-2 { animation: orb-drift 10s 2s ease-in-out infinite; filter: blur(80px); }
        a { text-decoration: none; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .hero-title { font-size: 36px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Background Orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div className="orb" style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, background: "radial-gradient(circle, #7c3aed44 0%, transparent 70%)" }} />
        <div className="orb-2" style={{ position: "absolute", top: "50%", right: "10%", width: 350, height: 350, background: "radial-gradient(circle, #00f5d433 0%, transparent 70%)" }} />
        <div className="orb" style={{ position: "absolute", bottom: "20%", left: "30%", width: 300, height: 300, background: "radial-gradient(circle, #a855f722 0%, transparent 70%)", animationDelay: "4s" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(#7c3aed08 1px, transparent 1px), linear-gradient(90deg, #7c3aed08 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.5 }} />
      </div>

      {/* NAV */}
      <nav className="nav-blur" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#08081088", borderBottom: "1px solid #ffffff0a",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px #7c3aed66" }}>🎵</div>
          <span style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: "#e8e8f8" }}>Wavely<span style={{ color: "#7c3aed" }}>.</span></span>
        </a>

        <div className="hide-mobile" style={{ display: "flex", gap: 32, fontSize: 14, color: "#a0a0c0" }}>
          {["Discover", "Spaces", "Artists", "Pricing"].map((item) => (
            <span key={item} style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#a78bfa")}
              onMouseLeave={e => (e.currentTarget.style.color = "#a0a0c0")}
            >{item}</span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
  {isLoggedIn ? (
    <a href="/dashboard">
      <button className="btn-primary" style={{ padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
        Go to App →
      </button>
    </a>
  ) : (
    <>
      <a href="/auth">
        <button className="btn-ghost" style={{ padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>Log in</button>
      </a>
      <a href="/auth">
        <button className="btn-primary" style={{ padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>Get Started</button>
      </a>
    </>
  )}
</div>
    </nav>

      {/* HERO */}
      <section ref={heroRef} style={{
        position: "relative", zIndex: 1, minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px", textAlign: "center",
      }}>
        <div className="hero-animate" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#7c3aed15", border: "1px solid #7c3aed44",
          borderRadius: 99, padding: "6px 16px", marginBottom: 32,
          fontSize: 12, fontWeight: 600, color: "#a78bfa",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 8px #00f5d4", animation: "pulse-ring 1.5s ease infinite", display: "inline-block" }} />
          1,204 people listening right now
        </div>

        <h1 className="hero-animate-2 hero-title" style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -2, marginBottom: 24, maxWidth: 800 }}>
          Music is better<br /><span className="shimmer-text">together.</span>
        </h1>

        <p className="hero-animate-3" style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#8080a0", maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
          Join live music spaces, vibe with real people, discover your next obsession. Stream together. Chat. Feel every beat.
        </p>

        {/* ✅ ALL BUTTONS NOW LINKED */}
        <div className="hero-animate-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/auth">
            <button className="btn-primary" style={{ padding: "14px 32px", borderRadius: 99, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <span>▶</span> Start Listening Free
            </button>
          </a>
          <a href="/dashboard">
            <button className="btn-ghost" style={{ padding: "14px 32px", borderRadius: 99, fontSize: 15, fontWeight: 600 }}>
              Explore Spaces
            </button>
          </a>
        </div>

        {/* Floating Player Card */}
        <div className="float glow-purple" style={{
          marginTop: 64, background: "linear-gradient(135deg, #12121e, #1a1a2e)",
          border: "1px solid #7c3aed33", borderRadius: 24,
          padding: 24, width: "100%", maxWidth: 420, backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#7c3aed", textTransform: "uppercase" }}>Now Playing</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["🔥", "💜", "✨"].map((e, i) => <span key={i} style={{ fontSize: 14, cursor: "pointer" }}>{e}</span>)}
            </div>
          </div>

          <div style={{ width: "100%", height: 160, background: "linear-gradient(135deg, #1a0a2e, #0a1a2e)", borderRadius: 16, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3, height: 60 }}>
              {bars.map((i) => (
                <div key={i} style={{
                  width: 3, borderRadius: 2,
                  background: playing ? `hsl(${260 + i * 3}, 80%, 65%)` : "#7c3aed44",
                  transformOrigin: "bottom",
                  animation: playing ? `waveform ${0.5 + (i % 5) * 0.15}s ${i * 0.05}s ease-in-out infinite` : "none",
                  height: playing ? `${20 + Math.sin(i * 0.8) * 20}px` : "8px",
                  transition: "height 0.3s ease, background 0.3s ease",
                }} />
              ))}
            </div>
            <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, #7c3aed33, transparent)", animation: playing ? "pulse-ring 2s ease infinite" : "none" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{tracks[currentTrack].title}</div>
              <div style={{ color: "#6060a0", fontSize: 13 }}>{tracks[currentTrack].artist}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4" }} />
              <span style={{ color: "#00f5d4", fontSize: 11, fontWeight: 700 }}>{tracks[currentTrack].genre}</span>
            </div>
          </div>

          <div style={{ height: 3, background: "#ffffff11", borderRadius: 2, marginBottom: 20, cursor: "pointer" }}>
            <div className="progress-bar" style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #7c3aed, #00f5d4)", width: `${progress}%`, boxShadow: "0 0 8px #7c3aed" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <button onClick={() => setCurrentTrack(t => (t - 1 + tracks.length) % tracks.length)} style={{ background: "none", border: "none", color: "#6060a0", fontSize: 18, cursor: "pointer" }}>⏮</button>
            <button onClick={() => setPlaying(p => !p)} style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px #7c3aed66", transition: "transform 0.2s" }}>
              {playing ? "⏸" : "▶"}
            </button>
            <button onClick={() => setCurrentTrack(t => (t + 1) % tracks.length)} style={{ background: "none", border: "none", color: "#6060a0", fontSize: 18, cursor: "pointer" }}>⏭</button>
          </div>

          <div style={{ marginTop: 20, padding: "10px 14px", background: "#ffffff05", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex" }}>
                {["#7c3aed", "#00f5d4", "#a855f7"].map((c, i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "2px solid #12121e", marginLeft: i > 0 ? -6 : 0, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
                ))}
              </div>
              <span style={{ color: "#6060a0", fontSize: 12 }}>+1,201 listening</span>
            </div>
            <a href="/dashboard">
              <button style={{ background: "#7c3aed22", border: "1px solid #7c3aed44", color: "#a78bfa", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Join Space</button>
            </a>
          </div>
        </div>
      </section>

      {/* LIVE SPACES */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 8 }}>Live Right Now</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: -1 }}>Active Spaces</h2>
          </div>
          <a href="/dashboard"><span style={{ color: "#7c3aed", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>View all →</span></a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {spaces.map((space, i) => (
            <a href="/dashboard" key={i}>
              <div className="space-card" style={{ background: "#12121e", border: "1px solid #ffffff08", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${space.color}22`, border: `1px solid ${space.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎵</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{space.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {space.live && <span style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444", borderRadius: 99, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>● LIVE</span>}
                      <span style={{ background: `${space.color}22`, color: space.color, borderRadius: 99, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>{space.genre}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#00f5d4", fontWeight: 700, fontSize: 15 }}>{space.listeners.toLocaleString()}</div>
                  <div style={{ color: "#6060a0", fontSize: 11 }}>listeners</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GENRES */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#00f5d4", textTransform: "uppercase", marginBottom: 12 }}>Browse by Mood</div>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: -1, marginBottom: 28 }}>Find your vibe</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {genres.map((g) => (
            <a href="/dashboard" key={g}>
              <div className="genre-pill" style={{ background: "#12121e", border: "1px solid #ffffff10", borderRadius: 99, padding: "10px 22px", fontSize: 14, fontWeight: 600, color: "#a0a0c0" }}>{g}</div>
            </a>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { value: "50K+", label: "Active Listeners", color: "#7c3aed" },
            { value: "1.2K", label: "Live Spaces", color: "#00f5d4" },
            { value: "600K+", label: "Free Tracks", color: "#a855f7" },
            { value: "100%", label: "Legal & Free", color: "#f59e0b" },
          ].map((stat, i) => (
            <div key={i} className="card-hover" style={{ background: "#12121e", border: "1px solid #ffffff08", borderRadius: 20, padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: stat.color, marginBottom: 8, letterSpacing: -1 }}>{stat.value}</div>
              <div style={{ color: "#6060a0", fontSize: 13 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 12 }}>Why Wavely</div>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: -1 }}>Built for music lovers</h2>
        </div>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "🎧", title: "Listen Together", desc: "Sync with friends in real-time. Everyone hears the same beat at the same moment.", color: "#7c3aed" },
            { icon: "💬", title: "Vibe & Chat", desc: "React, chat, and connect with people who love the same music as you.", color: "#00f5d4" },
            { icon: "🔍", title: "Discover Daily", desc: "Recommendations based on your mood, genre, and listening history.", color: "#a855f7" },
            { icon: "📻", title: "Live Spaces", desc: "Join or host live DJ sets, listening parties, and curated radio channels.", color: "#f59e0b" },
            { icon: "🎵", title: "Free Downloads", desc: "600,000+ Creative Commons tracks. Download legally, no subscription needed.", color: "#10b981" },
            { icon: "⭐", title: "Go Premium", desc: "No ads, exclusive spaces, high quality audio. Just $3.99/month.", color: "#ec4899" },
          ].map((f, i) => (
            <div key={i} className="card-hover" style={{ background: "#12121e", border: "1px solid #ffffff08", borderRadius: 20, padding: "28px 22px" }}>
              <div style={{ width: 48, height: 48, background: `${f.color}15`, border: `1px solid ${f.color}33`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: "#6060a0", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg, #12121e, #1a0a2e)", border: "1px solid #7c3aed33", borderRadius: 32, padding: "60px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, #7c3aed33, transparent)", borderRadius: "50%" }} />
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>Ready to vibe?</h2>
          <p style={{ color: "#8080a0", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Join thousands of music lovers discovering, streaming, and connecting on Wavely Music. Free forever.
          </p>
          <a href="/auth">
            <button className="btn-primary" style={{ padding: "16px 40px", borderRadius: 99, fontSize: 16, fontWeight: 700, width: "100%", maxWidth: 280 }}>
              Join Wavely Free →
            </button>
          </a>
          <div style={{ color: "#4040a0", fontSize: 12, marginTop: 16 }}>No credit card needed · Free forever · Cancel anytime</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid #ffffff08", padding: "40px 24px", textAlign: "center", color: "#4040a0", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎵</div>
          <span style={{ fontWeight: 800, color: "#e8e8f8", fontSize: 16 }}>Wavely Music</span>
        </div>
        <p>© 2025 Wavely Music · Built with ❤️ for music lovers everywhere</p>
      </footer>
    </div>
  );
}
