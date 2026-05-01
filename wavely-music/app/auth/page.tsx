"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setMessage(null);

    if (!email || !password) {
      setMessage({ text: "Please fill in all fields.", type: "error" });
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (!username) {
        setMessage({ text: "Please enter a username.", type: "error" });
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      
      if (error) {
  setMessage({ text: error.message, type: "error" });
} else {
  // Insert user into users table immediately
  const { data: signUpData } = await supabase.auth.signUp({
    email, password, options: { data: { username } }
  });
  if (signUpData.user) {
    await supabase.from("users").upsert({
      id: signUpData.user.id,
      username: username,
      bio: "Exploring the deepest frequencies.",
      is_premium: false,
      hours_listened: 0,
      top_genre: "Bollywood",
    }, { onConflict: "id" });
  }
  setMessage({ text: "Check your email to confirm! 🎉", type: "success" });
}

    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Sora', system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .auth-card { animation: slide-up 0.6s ease forwards; }

        .input-field {
          width: 100%;
          background: #12121e;
          border: 1px solid #ffffff15;
          border-radius: 14px;
          padding: 14px 18px;
          color: #e8e8f8;
          font-size: 15px;
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
          width: 100%;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 14px;
          padding: 15px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Sora', system-ui;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px #7c3aed66;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-google {
          width: 100%;
          background: #12121e;
          border: 1px solid #ffffff15;
          border-radius: 14px;
          padding: 14px;
          color: #e8e8f8;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Sora', system-ui;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-google:hover {
          border-color: #7c3aed;
          background: #7c3aed11;
          transform: translateY(-2px);
        }

        .tab-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 10px;
          font-family: 'Sora', system-ui;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .error-shake { animation: shake 0.4s ease; }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "15%", left: "10%",
          width: 350, height: 350,
          background: "radial-gradient(circle, #7c3aed33 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "orb-drift 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%",
          width: 300, height: 300,
          background: "radial-gradient(circle, #00f5d422 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "orb-drift 10s 2s ease-in-out infinite",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(#7c3aed08 1px, transparent 1px),
            linear-gradient(90deg, #7c3aed08 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* Auth Card */}
      <div className="auth-card" style={{
        position: "relative", zIndex: 1,
        background: "linear-gradient(135deg, #12121e, #1a1a2e)",
        border: "1px solid #7c3aed33",
        borderRadius: 28,
        padding: "40px 32px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 40px 120px #7c3aed22",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <div style={{
              width: 56, height: 56,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, margin: "0 auto 12px",
              boxShadow: "0 0 30px #7c3aed66",
            }}>🎵</div>
          </a>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>
            Wavely<span style={{ color: "#7c3aed" }}>.</span>
          </div>
          <div style={{ color: "#6060a0", fontSize: 13, marginTop: 4 }}>
            {mode === "login" ? "Welcome back 👋" : "Join the vibe 🎧"}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", gap: 6,
          background: "#0a0a14",
          padding: 6, borderRadius: 14,
          marginBottom: 28,
        }}>
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              className="tab-btn"
              onClick={() => { setMode(m); setMessage(null); }}
              style={{
                background: mode === m ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
                color: mode === m ? "white" : "#6060a0",
                boxShadow: mode === m ? "0 4px 15px #7c3aed44" : "none",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div>
              <label style={{ color: "#8080a0", fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.5 }}>
                USERNAME
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. NeonExplorer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ color: "#8080a0", fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.5 }}>
              EMAIL
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ color: "#8080a0", fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.5 }}>
              PASSWORD
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              background: message.type === "error" ? "#ef444415" : "#10b98115",
              border: `1px solid ${message.type === "error" ? "#ef444444" : "#10b98144"}`,
              color: message.type === "error" ? "#ef4444" : "#10b981",
            }}>
              {message.type === "error" ? "⚠️ " : "✅ "}{message.text}
            </div>
          )}

          {/* Submit button */}
          <button
            className="btn-primary"
            onClick={handleAuth}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In →" : "Create Account →"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#ffffff10" }} />
            <span style={{ color: "#4040a0", fontSize: 12 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "#ffffff10" }} />
          </div>

          {/* Google button */}
          <button className="btn-google" onClick={handleGoogle}>
            <span style={{ fontSize: 18 }}>G</span>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, color: "#4040a0", fontSize: 12 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(null); }}
            style={{ color: "#a78bfa", fontWeight: 700, cursor: "pointer" }}
          >
            {mode === "login" ? "Sign up free" : "Log in"}
          </span>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, color: "#2a2a4a", fontSize: 11 }}>
          By continuing you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
}
