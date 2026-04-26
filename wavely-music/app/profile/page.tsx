"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/auth"; return; }
      setUser(data.user);

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || "");
        setBio(profileData.bio || "");
      } else {
        const newProfile = {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "Listener",
          bio: "Exploring the deepest frequencies.",
          is_premium: false,
          hours_listened: 0,
          top_genre: "Synthwave",
        };
        await supabase.from("users").insert(newProfile);
        setProfile(newProfile);
        setUsername(newProfile.username);
        setBio(newProfile.bio);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("users")
      .update({ username, bio })
      .eq("id", user.id);
    if (error) {
      setMessage({ text: "Failed to save. Try again.", type: "error" });
    } else {
      setProfile((p: any) => ({ ...p, username, bio }));
      setMessage({ text: "Profile updated! ✅", type: "success" });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const stats = [
    { label: "HOURS LISTENED", value: profile?.hours_listened || 0, color: "#00f5d4", icon: "⏱️", sub: "Top 5% of listeners" },
    { label: "SPACES JOINED", value: 42, color: "#7c3aed", icon: "🎧", sub: "This month" },
    { label: "TRACKS SAVED", value: 128, color: "#a855f7", icon: "🎵", sub: "In your library" },
    { label: "TOP GENRE", value: profile?.top_genre || "Synthwave", color: "#f59e0b", icon: "📊", sub: "All time favorite", isText: true },
  ];

  const tags = ["#chill", "#electronic", "#retro", "#lofi", "#synthwave"];

  const settingsItems = [
    { icon: "👤", label: "Account Settings", desc: "Email, password, security" },
    { icon: "🔔", label: "Notifications", desc: "Manage your alerts" },
    { icon: "🔒", label: "Privacy", desc: "Who can see your activity" },
    { icon: "🎨", label: "Appearance", desc: "Theme and display options" },
    { icon: "🔗", label: "Discord Link", desc: "Connect your Discord", badge: "Connect" },
    { icon: "⭐", label: "Upgrade to Premium", desc: "No ads, exclusive spaces", badge: "₹349/mo", badgeColor: "#f59e0b" },
  ];

  const navTabs = [
    { id: "home", icon: "🏠", label: "HOME", href: "/dashboard" },
    { id: "discovery", icon: "🔍", label: "DISCOVERY", href: "/dashboard" },
    { id: "profile", icon: "👤", label: "PROFILE", href: "/profile" },
    { id: "activity", icon: "🔔", label: "ACTIVITY", href: "/dashboard" },
  ];

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      color: "#e8e8f8",
      paddingBottom: 80,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes orb {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(15px,-15px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-up { animation: fade-up 0.5s ease forwards; }

        .stat-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .stat-card:hover { transform: translateY(-3px); }

        .settings-item {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .settings-item:hover {
          background: #1e1e2e !important;
          transform: translateX(4px);
        }

        .input-field {
          width: 100%;
          background: #12121e;
          border: 1px solid #ffffff15;
          border-radius: 12px;
          padding: 12px 16px;
          color: #e8e8f8;
          font-size: 14px;
          font-family: 'Sora', system-ui;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px #7c3aed22;
        }
        .input-field::placeholder { color: #4040a0; }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none; color: white; cursor: pointer;
          transition: all 0.3s ease; font-family: 'Sora', system-ui;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px #7c3aed44; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .nav-btn {
          background: none; border: none; cursor: pointer;
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; padding: 8px 12px; border-radius: 12px;
          transition: all 0.2s ease; text-decoration: none;
        }
        .nav-btn:active { transform: scale(0.9); }

        .shimmer-text {
          background: linear-gradient(90deg, #7c3aed, #00f5d4, #a855f7, #7c3aed);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .avatar-ring {
          background: linear-gradient(135deg, #7c3aed, #00f5d4, #a855f7);
          padding: 3px;
          border-radius: 50%;
        }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "5%", right: "5%",
          width: 250, height: 250,
          background: "radial-gradient(circle, #7c3aed22 0%, transparent 70%)",
          filter: "blur(50px)", animation: "orb 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", left: "5%",
          width: 200, height: 200,
          background: "radial-gradient(circle, #00f5d415 0%, transparent 70%)",
          filter: "blur(40px)", animation: "orb 10s 2s ease-in-out infinite",
        }} />
      </div>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "#08081088", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #ffffff08",
        padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/dashboard" style={{ color: "#7c3aed", fontSize: 20, textDecoration: "none" }}>←</a>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Profile</span>
        <button onClick={() => setEditing(e => !e)} style={{
          background: editing ? "#ef444422" : "#7c3aed22",
          border: `1px solid ${editing ? "#ef444444" : "#7c3aed44"}`,
          color: editing ? "#ef4444" : "#a78bfa",
          borderRadius: 99, padding: "6px 14px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Sora', system-ui",
        }}>
          {editing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 0 20px" }}>

        {/* Profile Banner */}
        <div style={{
          height: 120,
          background: "linear-gradient(135deg, #1a0a2e, #0a1a3e, #1a0a2e)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Animated banner elements */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${40 + i * 20}px`, height: `${40 + i * 20}px`,
              borderRadius: "50%",
              border: "1px solid #7c3aed22",
              top: `${Math.random() * 100}%`,
              left: `${i * 18}%`,
              animation: `orb ${4 + i}s ease-in-out infinite`,
            }} />
          ))}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 60%, #080810)",
          }} />
        </div>

        {/* Avatar */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ marginTop: -40, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div className="avatar-ring" style={{ display: "inline-block" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 800, border: "3px solid #080810",
              }}>
                {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "W"}
              </div>
            </div>
            {profile?.is_premium && (
              <div style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                borderRadius: 99, padding: "4px 12px",
                fontSize: 11, fontWeight: 800, letterSpacing: 1,
                color: "white", marginBottom: 8,
              }}>⭐ PREMIUM</div>
            )}
          </div>

          {/* User Info / Edit Form */}
          {editing ? (
            <div className="fade-up" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: "#8080a0", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>USERNAME</label>
                <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#8080a0", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>BIO</label>
                <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the world about your music taste..." rows={3} style={{ resize: "none" }} />
              </div>
              {message && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12,
                  background: message.type === "success" ? "#10b98115" : "#ef444415",
                  border: `1px solid ${message.type === "success" ? "#10b98144" : "#ef444444"}`,
                  color: message.type === "success" ? "#10b981" : "#ef4444",
                }}>{message.text}</div>
              )}
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="fade-up" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                  {profile?.username || user?.email?.split("@")[0] || "Listener"}
                </h2>
                {!profile?.is_premium && (
                  <span style={{
                    background: "#ffffff11", border: "1px solid #ffffff22",
                    borderRadius: 99, padding: "2px 10px",
                    fontSize: 10, fontWeight: 700, color: "#8080a0",
                  }}>FREE</span>
                )}
              </div>
              <p style={{ color: "#6060a0", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                {profile?.bio || "Exploring the deepest frequencies of the nocturnal net."}
              </p>
              <p style={{ color: "#4040a0", fontSize: 12 }}>{user?.email}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {stats.map((stat, i) => (
              <div key={i} className="stat-card" style={{
                background: "#12121e", border: "1px solid #ffffff08",
                borderRadius: 16, padding: "16px",
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4040a0", textTransform: "uppercase", marginBottom: 8 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: stat.isText ? 18 : 28, fontWeight: 800, color: stat.color, marginBottom: 4, letterSpacing: -0.5 }}>
                  {stat.isText ? stat.value : stat.value.toLocaleString()}
                </div>
                <div style={{
                  height: 3, background: "#ffffff08", borderRadius: 2, marginBottom: 6,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`,
                    width: stat.isText ? "80%" : "65%",
                  }} />
                </div>
                <div style={{ color: "#4040a0", fontSize: 11 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Top Genre Tags */}
          <div style={{
            background: "#12121e", border: "1px solid #ffffff08",
            borderRadius: 16, padding: "16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4040a0", textTransform: "uppercase", marginBottom: 12 }}>
              YOUR VIBE TAGS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tags.map((tag, i) => (
                <span key={i} style={{
                  background: i === 0 ? "#7c3aed22" : "#ffffff08",
                  border: `1px solid ${i === 0 ? "#7c3aed44" : "#ffffff10"}`,
                  color: i === 0 ? "#a78bfa" : "#8080a0",
                  borderRadius: 99, padding: "6px 14px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}>{tag}</span>
              ))}
              <span style={{
                background: "#7c3aed11", border: "1px dashed #7c3aed44",
                color: "#7c3aed", borderRadius: 99, padding: "6px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>+ Add</span>
            </div>
          </div>

          {/* Listening Activity */}
          <div style={{
            background: "#12121e", border: "1px solid #ffffff08",
            borderRadius: 16, padding: "16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>
              WEEKLY ACTIVITY
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
              {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%", borderRadius: 4,
                    background: i === 5 ? "linear-gradient(to top, #7c3aed, #a855f7)" : "#7c3aed22",
                    height: `${h}%`,
                    transition: "all 0.3s ease",
                  }} />
                  <span style={{ color: "#4040a0", fontSize: 9 }}>
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{
            background: "#12121e", border: "1px solid #ffffff08",
            borderRadius: 16, overflow: "hidden", marginBottom: 20,
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #ffffff08" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4040a0", textTransform: "uppercase" }}>
                SETTINGS
              </div>
            </div>
            {settingsItems.map((item, i) => (
              <div key={i} className="settings-item" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                borderBottom: i < settingsItems.length - 1 ? "1px solid #ffffff06" : "none",
                background: "transparent",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#7c3aed15", border: "1px solid #7c3aed22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: "#6060a0", fontSize: 12 }}>{item.desc}</div>
                </div>
                {item.badge ? (
                  <span style={{
                    background: item.badgeColor ? `${item.badgeColor}22` : "#7c3aed22",
                    color: item.badgeColor || "#a78bfa",
                    border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : "#7c3aed44"}`,
                    borderRadius: 99, padding: "3px 10px",
                    fontSize: 11, fontWeight: 700,
                  }}>{item.badge}</span>
                ) : (
                  <span style={{ color: "#4040a0", fontSize: 18 }}>›</span>
                )}
              </div>
            ))}
          </div>

          {/* Sign Out */}
          <button onClick={handleSignOut} style={{
            width: "100%",
            background: "#ef444415", border: "1px solid #ef444433",
            borderRadius: 14, padding: "14px",
            color: "#ef4444", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Sora', system-ui",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ef444422")}
            onMouseLeave={e => (e.currentTarget.style.background = "#ef444415")}
          >
            Sign Out
          </button>

          <div style={{ textAlign: "center", marginTop: 20, color: "#2a2a4a", fontSize: 11 }}>
            Wavely Music v1.0 · Made with ❤️
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#0a0a14", borderTop: "1px solid #ffffff08",
        padding: "8px 0 12px", zIndex: 30,
        display: "flex", justifyContent: "space-around",
      }}>
        {navTabs.map((tab) => (
          <a key={tab.id} href={tab.href} className="nav-btn"
            style={{ color: tab.id === "profile" ? "#a78bfa" : "#4040a0" }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
