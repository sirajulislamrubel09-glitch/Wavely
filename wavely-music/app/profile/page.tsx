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
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
      setTimeout(() => setToast(null), 2500);
      };const

    const init = async () => {
      const { data } = await supabase.auth.getUser();
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
      setLoading(false);
    };
    init();
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
      setTimeout(() => { setEditing(false); setMessage(null); }, 1500);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{
      background: "#080810", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Sora', system-ui",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1s linear infinite" }}>🎵</div>
        <div style={{ color: "#7c3aed", fontWeight: 700 }}>Loading profile...</div>
      </div>
    </div>
  );

  const displayName = profile?.username || user?.email?.split("@")[0] || "Listener";
  const displayBio = profile?.bio || "Exploring the deepest frequencies of the nocturnal net.";
  const avatarLetter = displayName[0]?.toUpperCase() || "W";

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      color: "#e8e8f8",
      paddingBottom: 100,
      maxWidth: 480,
      margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes orb { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(10px,-10px); } }
        @keyframes bar-grow { from { height: 4px; } to { height: var(--h); } }

        .fade-up { animation: fade-up 0.4s ease forwards; }

        .input-field {
          width: 100%;
          background: #0f0f1a;
          border: 1.5px solid #2a2a3e;
          border-radius: 14px;
          padding: 13px 16px;
          color: #e8e8f8;
          font-size: 15px;
          font-family: 'Sora', system-ui;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px #7c3aed22;
        }
        .input-field::placeholder { color: #3a3a5a; }

        .btn-save {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none; border-radius: 14px;
          padding: 15px; color: white;
          font-size: 15px; font-weight: 700;
          font-family: 'Sora', system-ui;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px #7c3aed44;
        }
        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 28px #7c3aed55; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .stat-card {
          background: #111118;
          border: 1px solid #1e1e2e;
          border-radius: 18px;
          padding: 18px 16px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); border-color: #7c3aed44; }

        .settings-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 16px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #0f0f18;
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-row:hover { background: #12121e; }
        .settings-row:active { background: #1a1a28; }

        .tag-pill {
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .tag-pill:hover { transform: scale(1.05); }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          border-radius: 12px;
        }
        .nav-item:active { transform: scale(0.9); }

        .edit-btn {
          background: #7c3aed22;
          border: 1.5px solid #7c3aed55;
          color: #a78bfa;
          border-radius: 99px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Sora', system-ui;
          transition: all 0.2s;
        }
        .edit-btn:hover { background: #7c3aed33; transform: scale(1.03); }

        .cancel-btn {
          background: #ef444415;
          border: 1.5px solid #ef444433;
          color: #ef4444;
          border-radius: 99px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Sora', system-ui;
          transition: all 0.2s;
        }
        .cancel-btn:hover { background: #ef444422; }

        .signout-btn {
          width: 100%;
          background: transparent;
          border: 1.5px solid #ef444433;
          border-radius: 14px;
          padding: 14px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Sora', system-ui;
          transition: all 0.2s;
        }
        .signout-btn:hover { background: #ef444415; border-color: #ef444455; }
      `}</style>

      {/* Fixed background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "8%", right: "8%",
          width: 220, height: 220,
          background: "radial-gradient(circle, #7c3aed22 0%, transparent 70%)",
          filter: "blur(40px)", animation: "orb 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "25%", left: "5%",
          width: 180, height: 180,
          background: "radial-gradient(circle, #00f5d415 0%, transparent 70%)",
          filter: "blur(35px)", animation: "orb 11s 2s ease-in-out infinite",
        }} />
      </div>

      {/* ── HEADER ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#08081099",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid #ffffff09",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/dashboard" style={{
          width: 36, height: 36,
          background: "#1a1a28",
          border: "1px solid #2a2a3e",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#a78bfa", textDecoration: "none",
          transition: "all 0.2s",
        }}>←</a>

        <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>My Profile</span>

        {editing ? (
          <button className="cancel-btn" onClick={() => { setEditing(false); setMessage(null); }}>
            Cancel
          </button>
        ) : (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            ✏️ Edit
          </button>
        )}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── PROFILE HERO ── */}
        <div style={{
          background: "linear-gradient(160deg, #1a0a2e 0%, #0a0e1e 50%, #080810 100%)",
          padding: "32px 20px 28px",
          position: "relative", overflow: "hidden",
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", border: "1px solid #7c3aed22" }} />
          <div style={{ position: "absolute", top: 20, right: 20, width: 80, height: 80, borderRadius: "50%", border: "1px solid #7c3aed15" }} />

          {/* Avatar + info row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 76, height: 76,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7, #00f5d4)",
                padding: 2,
              }}>
                <div style={{
                  width: "100%", height: "100%",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 800,
                  border: "3px solid #080810",
                }}>
                  {avatarLetter}
                </div>
              </div>
              {/* Online dot */}
              <div style={{
                position: "absolute", bottom: 2, right: 2,
                width: 14, height: 14, borderRadius: "50%",
                background: "#10b981",
                border: "2px solid #080810",
                boxShadow: "0 0 8px #10b981",
              }} />
            </div>

            {/* Name + badge */}
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                  {displayName}
                </h1>
                <span style={{
                  background: profile?.is_premium ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "#1e1e2e",
                  color: profile?.is_premium ? "white" : "#6060a0",
                  border: profile?.is_premium ? "none" : "1px solid #2a2a3e",
                  borderRadius: 99, padding: "2px 10px",
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                }}>
                  {profile?.is_premium ? "⭐ PREMIUM" : "FREE"}
                </span>
              </div>
              <p style={{ color: "#7070a0", fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>
                {displayBio}
              </p>
              <p style={{ color: "#3a3a5a", fontSize: 11 }}>{user?.email}</p>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="fade-up" style={{
              background: "#0f0f1a",
              border: "1px solid #2a2a3e",
              borderRadius: 18, padding: 18,
              marginBottom: 4,
            }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: "#6060a0", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                  Username
                </label>
                <input
                  className="input-field"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#6060a0", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                  Bio
                </label>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell the world about your music taste..."
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>
              {message && (
                <div style={{
                  padding: "11px 14px", borderRadius: 12,
                  fontSize: 13, fontWeight: 600, marginBottom: 14,
                  background: message.type === "success" ? "#10b98115" : "#ef444415",
                  border: `1px solid ${message.type === "success" ? "#10b98144" : "#ef444444"}`,
                  color: message.type === "success" ? "#10b981" : "#ef4444",
                }}>{message.text}</div>
              )}
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes →"}
              </button>
            </div>
          )}

          {/* Share + upgrade row */}
          {!editing && (
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{
                flex: 1,
                background: "#1a1a28", border: "1px solid #2a2a3e",
                borderRadius: 12, padding: "10px",
                color: "#a0a0c0", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Sora', system-ui",
                transition: "all 0.2s",
              }}>
                🔗 Share Profile
              </button>
              {!profile?.is_premium && (
                <button style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #7c3aed22, #a855f722)",
                  border: "1px solid #7c3aed44",
                  borderRadius: 12, padding: "10px",
                  color: "#a78bfa", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Sora', system-ui",
                  transition: "all 0.2s",
                }}>
                  ⭐ Go Premium
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── STATS ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>
              Your Stats
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Hours Listened", value: profile?.hours_listened ?? 0, color: "#00f5d4", icon: "⏱", sub: "Top 5% of listeners", isNum: true },
                { label: "Spaces Joined", value: 42, color: "#7c3aed", icon: "🎧", sub: "All time", isNum: true },
                { label: "Tracks Saved", value: 128, color: "#a855f7", icon: "🎵", sub: "In library", isNum: true },
                { label: "Top Genre", value: profile?.top_genre ?? "Synthwave", color: "#f59e0b", icon: "📊", sub: "All time fave", isNum: false },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#3a3a5a", textTransform: "uppercase" }}>{s.label}</span>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: s.isNum ? 30 : 18, fontWeight: 800, color: s.color, letterSpacing: -0.5, marginBottom: 8 }}>
                    {s.isNum ? Number(s.value).toLocaleString() : s.value}
                  </div>
                  <div style={{ height: 3, background: "#1a1a28", borderRadius: 2, marginBottom: 6 }}>
                    <div style={{ height: "100%", borderRadius: 2, background: s.color, width: s.isNum ? "60%" : "80%", opacity: 0.7 }} />
                  </div>
                  <div style={{ color: "#3a3a5a", fontSize: 11 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── WEEKLY ACTIVITY ── */}
          <div style={{
            background: "#111118", border: "1px solid #1e1e2e",
            borderRadius: 18, padding: "18px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 16 }}>
              Weekly Activity
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64 }}>
              {[
                { h: 35, day: "M" }, { h: 60, day: "T" }, { h: 25, day: "W" },
                { h: 75, day: "T" }, { h: 50, day: "F" }, { h: 90, day: "S" }, { h: 40, day: "S" },
              ].map((b, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: "100%", borderRadius: 6,
                    background: i === 5
                      ? "linear-gradient(to top, #7c3aed, #a855f7)"
                      : "#1e1e2e",
                    height: `${b.h}%`,
                    border: i === 5 ? "none" : "1px solid #2a2a3a",
                    boxShadow: i === 5 ? "0 0 12px #7c3aed66" : "none",
                  }} />
                  <span style={{ color: i === 5 ? "#a78bfa" : "#3a3a5a", fontSize: 10, fontWeight: 700 }}>{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── VIBE TAGS ── */}
          <div style={{
            background: "#111118", border: "1px solid #1e1e2e",
            borderRadius: 18, padding: "18px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase", marginBottom: 14 }}>
              Vibe Tags
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["#chill", "#electronic", "#retro", "#lofi", "#synthwave"].map((tag, i) => (
                <span key={i} className="tag-pill" style={{
                  background: i === 0 ? "#7c3aed22" : "#1a1a28",
                  border: `1px solid ${i === 0 ? "#7c3aed55" : "#2a2a3e"}`,
                  color: i === 0 ? "#a78bfa" : "#6060a0",
                }}>{tag}</span>
              ))}
              <span className="tag-pill" style={{
                background: "transparent",
                border: "1.5px dashed #7c3aed44",
                color: "#7c3aed",
              }}>+ Add</span>
            </div>
          </div>

          {/* ── SETTINGS ── */}
          <div style={{
            background: "#111118", border: "1px solid #1e1e2e",
            borderRadius: 18, overflow: "hidden", marginBottom: 20,
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a1a28" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#4040a0", textTransform: "uppercase" }}>Settings</div>
            </div>
            {[
              { icon: "👤", label: "Account Settings", desc: "Email, password, security", right: "›", onClick: () => setEditing(true) },
              { icon: "🔔", label: "Notifications", desc: "Manage your alerts", right: "›", onClick: () => showToast("Notifications coming soon! 🔔") },
              { icon: "🔒", label: "Privacy", desc: "Who can see your activity", right: "›", onClick: () => showToast("Privacy settings coming soon! 🔒") },
              { icon: "🎨", label: "Appearance", desc: "Theme and display", right: "›", onClick: () => showToast("Dark mode only for now 😎") },
              { icon: "🔗", label: "Discord Link", desc: "Connect your account", right: "Connect", rightColor: "#7c3aed", onClick: () => showToast("Discord linking coming soon! 🔗") },
              { icon: "⭐", label: "Upgrade to Premium", desc: "No ads · Exclusive spaces", right: "$3.99/mo", rightColor: "#f59e0b", onClick: () => showToast("Premium launching soon! ⭐") },
            ].map((item, i) => (
              <div key={i} className="settings-row" onClick={item.onClick}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: "#1a1a28", border: "1px solid #2a2a3e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, flexShrink: 0,
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: "#5050a0", fontSize: 12 }}>{item.desc}</div>
                </div>
                <span style={{
                  color: item.rightColor || "#3a3a5a",
                  fontSize: item.right === "›" ? 22 : 12,
                  fontWeight: item.right !== "›" ? 700 : 400,
                  background: item.rightColor ? `${item.rightColor}15` : "transparent",
                  border: item.rightColor ? `1px solid ${item.rightColor}33` : "none",
                  borderRadius: item.rightColor ? 99 : 0,
                  padding: item.rightColor ? "3px 10px" : "0",
                }}>{item.right}</span>
              </div>
            ))}
          </div>

          {/* ── SIGN OUT ── */}
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>

          <div style={{ textAlign: "center", marginTop: 20, color: "#2a2a3a", fontSize: 11 }}>
            Wavely Music v1.0 · Made with ❤️
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 90, left: "50%",
          transform: "translateX(-50%)",
          background: "#1e1e2e",
          border: "1px solid #7c3aed44",
          borderRadius: 99,
          padding: "12px 24px",
          color: "#e8e8f8",
          fontSize: 13,
          fontWeight: 600,
          zIndex: 100,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 32px #00000066",
          animation: "fade-up 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
       <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#09090f",
        borderTop: "1px solid #ffffff08",
        padding: "10px 0 16px",
        zIndex: 50,
        display: "flex", justifyContent: "space-around",
      }}>
        {[
          { icon: "🏠", label: "HOME", href: "/dashboard", active: false },
          { icon: "🔍", label: "DISCOVERY", href: "/dashboard", active: false },
          { icon: "👤", label: "PROFILE", href: "/profile", active: true },
          { icon: "🔔", label: "ACTIVITY", href: "/dashboard", active: false },
        ].map((tab) => (
          <a key={tab.label} href={tab.href} className="nav-item"
            style={{ color: tab.active ? "#a78bfa" : "#3a3a5a", textDecoration: "none" }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{tab.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
