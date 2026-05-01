"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const Icons = {
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

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
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/auth"; return; }
      setUser(data.user);
      const { data: profileData } = await supabase.from("users").select("*").eq("id", data.user.id).single();
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
          top_genre: "Bollywood",
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
    const { error } = await supabase.from("users").update({ username, bio }).eq("id", user.id);
    if (error) {
      setMessage({ text: "Failed to save. Try again.", type: "error" });
    } else {
      setProfile((p: any) => ({ ...p, username, bio }));
      setMessage({ text: "Profile updated!", type: "success" });
      setTimeout(() => { setEditing(false); setMessage(null); }, 1500);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{ background: "#121212", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui" }}>
      <div style={{ textAlign: "center", color: "#b3b3b3" }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: "spin 2s linear infinite", display: "inline-block" }}>🎵</div>
        <div style={{ fontWeight: 600 }}>Loading...</div>
      </div>
    </div>
  );

  const displayName = profile?.username || user?.email?.split("@")[0] || "Listener";
  const displayBio = profile?.bio || "Exploring the deepest frequencies.";
  const avatarLetter = displayName[0]?.toUpperCase() || "W";

  const stats = [
    { label: "Hours", value: profile?.hours_listened ?? 0, color: "#1db954", sub: "Listened", isNum: true },
    { label: "Spaces", value: 42, color: "#ba55d3", sub: "Joined", isNum: true },
    { label: "Tracks", value: 128, color: "#1db954", sub: "Saved", isNum: true },
    { label: "Genre", value: profile?.top_genre ?? "Bollywood", color: "#ba55d3", sub: "Top pick", isNum: false },
  ];

  const settingsItems = [
    { label: "Account Settings", desc: "Email, password, security", color: "#1db954", onClick: () => setEditing(true) },
    { label: "Notifications", desc: "Manage your alerts", color: "#ba55d3", onClick: () => showToast("Coming soon! 🔔") },
    { label: "Privacy", desc: "Who can see your activity", color: "#1db954", onClick: () => showToast("Coming soon! 🔒") },
    { label: "Appearance", desc: "Theme and display", color: "#ba55d3", onClick: () => showToast("Dark mode only 😎") },
    { label: "Discord Link", desc: "Connect your Discord", color: "#5865f2", badge: "Connect", badgeColor: "#5865f2", onClick: () => showToast("Coming soon! 🔗") },
    { label: "Go Premium", desc: "No ads · Exclusive rooms · HQ audio", color: "#f59e0b", badge: "$3.99/mo", badgeColor: "#f59e0b", onClick: () => showToast("Premium coming soon! ⭐") },
  ];

  return (
    <div style={{ background: "#121212", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#fff", paddingBottom: 80, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #ba55d3; border-radius: 2px; }
        a { text-decoration: none; color: inherit; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

        .fade-up { animation: fadeUp 0.35s ease forwards; }

        .input-field {
          width: 100%; background: #282828; border: 1.5px solid #3e3e3e;
          border-radius: 10px; padding: 13px 16px; color: #fff;
          font-size: 15px; font-family: 'DM Sans', system-ui; outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #ba55d3; }
        .input-field::placeholder { color: #535353; }

        .stat-card {
          background: #1e1e1e; border: 1px solid #282828; border-radius: 14px;
          padding: 16px; transition: all 0.2s;
        }
        .stat-card:hover { border-color: #ba55d355; transform: translateY(-2px); }

        .settings-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; cursor: pointer; transition: background 0.15s;
          border-bottom: 1px solid #1a1a1a;
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-row:hover { background: #1e1e1e; }
        .settings-row:active { background: #282828; }

        .nav-item, .nav-button {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; padding: 8px 16px; cursor: pointer;
          transition: all 0.15s ease; text-decoration: none;
          border-radius: 18px;
        }
        .nav-button.active { color: #ba55d3; transform: translateY(-1px); }
        .nav-button:active { transform: scale(0.98); }

        .tag-pill {
          border-radius: 99px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid transparent;
        }
        .tag-pill:hover { transform: scale(1.05); }
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#12121299", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #282828",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/dashboard" style={{ width: 36, height: 36, background: "#282828", border: "1px solid #3e3e3e", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#b3b3b3", transition: "all 0.15s" }}>
          {Icons.back}
        </a>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Profile</span>
        <button onClick={() => setEditing(e => !e)} style={{
          background: editing ? "#ff444415" : "#ba55d322",
          border: `1px solid ${editing ? "#ff444433" : "#ba55d344"}`,
          color: editing ? "#ff4444" : "#ba55d3",
          borderRadius: 99, padding: "7px 16px",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.15s",
        }}>
          {editing ? "Cancel" : <>{Icons.edit} Edit</>}
        </button>
      </div>

      {/* Profile Hero */}
      <div style={{
        background: "linear-gradient(160deg, #2a0a3e 0%, #1a0a2e 40%, #121212 100%)",
        padding: "28px 20px 24px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid #ba55d322" }} />
        <div style={{ position: "absolute", top: 10, right: 20, width: 90, height: 90, borderRadius: "50%", border: "1px solid #ba55d315" }} />

        {/* Avatar + Info */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #ba55d3, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 800, border: "3px solid #121212",
              boxShadow: "0 0 24px #ba55d344",
            }}>{avatarLetter}</div>
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: "#1db954", border: "2px solid #121212", boxShadow: "0 0 6px #1db954" }} />
          </div>
          <div style={{ flex: 1, paddingTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>{displayName}</h1>
              <span style={{
                background: profile?.is_premium ? "linear-gradient(135deg, #f59e0b, #f97316)" : "#282828",
                color: profile?.is_premium ? "#fff" : "#535353",
                border: profile?.is_premium ? "none" : "1px solid #3e3e3e",
                borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {profile?.is_premium ? <>{Icons.star} PREMIUM</> : "FREE"}
              </span>
            </div>
            <p style={{ color: "#b3b3b3", fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{displayBio}</p>
            <p style={{ color: "#535353", fontSize: 11 }}>{user?.email}</p>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="fade-up" style={{ background: "#0a0a0a", border: "1px solid #282828", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#b3b3b3", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Username</label>
              <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: "#b3b3b3", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Bio</label>
              <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the world about your music taste..." rows={3} style={{ resize: "none" }} />
            </div>
            {message && (
              <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 12, background: message.type === "success" ? "#1db95415" : "#ff444415", border: `1px solid ${message.type === "success" ? "#1db95444" : "#ff444444"}`, color: message.type === "success" ? "#1db954" : "#ff4444", display: "flex", alignItems: "center", gap: 6 }}>
                {message.type === "success" ? Icons.check : "⚠️"} {message.text}
              </div>
            )}
            <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: saving ? "#282828" : "linear-gradient(135deg, #ba55d3, #7c3aed)", border: "none", borderRadius: 10, padding: "13px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!editing && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => showToast("Share link copied! 🔗")} style={{ flex: 1, background: "#282828", border: "1px solid #3e3e3e", borderRadius: 99, padding: "9px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#ba55d3"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#3e3e3e"}
            >
              {Icons.share} Share
            </button>
            {!profile?.is_premium && (
              <button onClick={() => showToast("Premium coming soon! ⭐")} style={{ flex: 1, background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid #f59e0b44", borderRadius: 99, padding: "9px", color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}>
                {Icons.star} Go Premium
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* Stats Grid */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#535353", textTransform: "uppercase", marginBottom: 14 }}>Your Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#535353", textTransform: "uppercase", marginBottom: 10 }}>{s.label}</div>
                <div style={{ fontSize: s.isNum ? 32 : 18, fontWeight: 800, color: s.color, letterSpacing: -0.5, marginBottom: 6 }}>
                  {s.isNum ? Number(s.value).toLocaleString() : s.value}
                </div>
                <div style={{ height: 3, background: "#282828", borderRadius: 2, marginBottom: 6 }}>
                  <div style={{ height: "100%", borderRadius: 2, background: s.color, width: s.isNum ? "65%" : "80%", opacity: 0.8 }} />
                </div>
                <div style={{ color: "#535353", fontSize: 11 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div style={{ background: "#1e1e1e", border: "1px solid #282828", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#535353", textTransform: "uppercase", marginBottom: 16 }}>Weekly Activity</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
            {[{ h: 35, day: "M" }, { h: 60, day: "T" }, { h: 25, day: "W" }, { h: 75, day: "T" }, { h: 50, day: "F" }, { h: 90, day: "S" }, { h: 40, day: "S" }].map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "100%", borderRadius: 4, background: i === 5 ? "linear-gradient(to top, #ba55d3, #7c3aed)" : "#282828", height: `${b.h}%`, boxShadow: i === 5 ? "0 0 10px #ba55d366" : "none" }} />
                <span style={{ color: i === 5 ? "#ba55d3" : "#535353", fontSize: 10, fontWeight: 700 }}>{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vibe Tags */}
        <div style={{ background: "#1e1e1e", border: "1px solid #282828", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#535353", textTransform: "uppercase", marginBottom: 14 }}>Vibe Tags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["#bollywood", "#lofi", "#electronic", "#chill", "#retro"].map((tag, i) => (
              <span key={i} className="tag-pill" style={{ background: i === 0 ? "#ba55d322" : "#282828", border: `1px solid ${i === 0 ? "#ba55d355" : "#3e3e3e"}`, color: i === 0 ? "#ba55d3" : "#b3b3b3" }}>{tag}</span>
            ))}
            <span className="tag-pill" onClick={() => showToast("Custom tags coming soon! 🏷️")} style={{ background: "transparent", border: "1.5px dashed #ba55d344", color: "#ba55d3" }}>+ Add</span>
          </div>
        </div>

        {/* Settings */}
        <div style={{ background: "#1e1e1e", border: "1px solid #282828", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #282828" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#535353", textTransform: "uppercase" }}>Settings</div>
          </div>
          {settingsItems.map((item, i) => (
            <div key={i} className="settings-row" onClick={item.onClick}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, border: `1px solid ${item.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
                <div style={{ color: "#535353", fontSize: 12 }}>{item.desc}</div>
              </div>
              {item.badge ? (
                <span style={{ background: `${item.badgeColor}15`, color: item.badgeColor, border: `1px solid ${item.badgeColor}33`, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{item.badge}</span>
              ) : (
                <span style={{ color: "#535353" }}>{Icons.chevron}</span>
              )}
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut} style={{ width: "100%", background: "transparent", border: "1.5px solid #ff444433", borderRadius: 12, padding: "14px", color: "#ff4444", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ff444415"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          Sign Out
        </button>

        <div style={{ textAlign: "center", marginTop: 20, color: "#282828", fontSize: 11 }}>Wavely Music v1.0 · Made with ❤️</div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#282828", border: "1px solid #3e3e3e", borderRadius: 99, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: "nowrap", boxShadow: "0 8px 24px #00000088", animation: "fadeUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      {/* Bottom Nav */}
      <div className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "1px solid #282828", padding: "10px 0 14px", zIndex: 50, display: "flex", justifyContent: "space-around", maxWidth: 480, margin: "0 auto" }}>
        {[
          { icon: Icons.home, label: "HOME", href: "/dashboard", active: false },
          { icon: Icons.search, label: "SEARCH", href: "/dashboard", active: false },
          { icon: Icons.user, label: "PROFILE", href: "/profile", active: true },
          { icon: Icons.bell, label: "ACTIVITY", href: "/dashboard", active: false },
        ].map((tab) => (
          <a key={tab.label} href={tab.href} className={`nav-button${tab.active ? " active" : ""}`} style={{ color: tab.active ? "#ba55d3" : "#535353" }}>
            <div style={{ transform: tab.active ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s ease" }}>{tab.icon}</div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{tab.label}</span>
            {tab.active && (
              <div style={{ width: 24, height: 3, background: "#ba55d3", borderRadius: 2, marginTop: 4 }} />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
