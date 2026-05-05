"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
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
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" opacity=".9"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  library: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  bell: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2"/></svg>,
  next: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2"/></svg>,
  shuffle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  repeat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="18" height="18" viewBox="0 0 24 24" fill="#f472b6" stroke="#f472b6" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  volume: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  volumeX: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  dots: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  music: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>,
};

const GENRES = [
  { label: "🔥 Trending", tag: "trending hindi 2024" },
  { label: "🎬 Bollywood", tag: "bollywood hits" },
  { label: "🎤 Arijit Singh", tag: "arijit singh" },
  { label: "☁️ Lo-Fi", tag: "lofi hindi" },
  { label: "💕 Romantic", tag: "romantic hindi songs" },
  { label: "🎉 Party", tag: "party songs hindi" },
  { label: "🌍 English", tag: "english pop 2024" },
  { label: "🎵 Bengali", tag: "bengali songs" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #060609; }
  body { font-family: 'DM Sans', system-ui, sans-serif; color: #e8e8f0; -webkit-font-smoothing: antialiased; }
  button, input { font: inherit; }
  button { outline: none; cursor: pointer; }
  img { display: block; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

  .shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.22) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 90% 20%, rgba(236,72,153,0.1) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 10% 60%, rgba(99,102,241,0.08) 0%, transparent 50%),
      #060609;
  }

  /* Noise overlay */
  .shell::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  }

  .header {
    position: sticky; top: 0; z-index: 20;
    background: rgba(6,6,9,0.85);
    backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 20px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .brand {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  .avatar-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 2px solid rgba(167,139,250,0.4);
    background: linear-gradient(135deg, #7c3aed, #db2777);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 14px; color: #fff;
    text-decoration: none;
    transition: all 0.2s;
  }
  .avatar-btn:hover { border-color: rgba(167,139,250,0.8); transform: scale(1.05); }

  .menu-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    color: #e8e8f0; transition: all 0.2s;
  }
  .menu-btn:hover { background: rgba(255,255,255,0.1); }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 24px 18px 180px;
    position: relative; z-index: 1;
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
  }

  /* Genre pills */
  .genre-scroll {
    display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 24px;
    scrollbar-width: none;
  }
  .genre-scroll::-webkit-scrollbar { display: none; }

  .genre-pill {
    border-radius: 99px; padding: 8px 16px;
    font-size: 13px; font-weight: 500;
    white-space: nowrap; border: none;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .genre-pill.active {
    background: linear-gradient(135deg, #7c3aed, #db2777);
    color: #fff;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4);
  }
  .genre-pill.idle {
    background: rgba(255,255,255,0.06);
    color: #a1a1b8;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .genre-pill.idle:hover { background: rgba(255,255,255,0.1); color: #e8e8f0; }

  /* Search bar */
  .search-bar {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px;
    padding: 13px 18px;
    margin-bottom: 24px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .search-bar:hover { background: rgba(255,255,255,0.08); border-color: rgba(167,139,250,0.3); }
  .search-bar span { color: #6b6b80; font-size: 14px; }

  .search-input-field {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px;
    padding: 14px 18px;
    color: #e8e8f0;
    font-size: 15px;
    transition: all 0.2s;
  }
  .search-input-field::placeholder { color: #555570; }
  .search-input-field:focus { outline: none; border-color: rgba(167,139,250,0.5); background: rgba(255,255,255,0.07); box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }

  /* Section labels */
  .section-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #555570;
    margin-bottom: 14px;
  }

  /* Featured card */
  .featured-card {
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 28px;
    position: relative;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .featured-card-inner {
    display: flex; gap: 0; align-items: stretch;
  }
  .featured-img {
    width: 120px; height: 120px;
    object-fit: cover; flex-shrink: 0;
  }
  .featured-info {
    padding: 16px 18px;
    flex: 1; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    background: linear-gradient(90deg, rgba(124,58,237,0.15), transparent);
  }
  .featured-tag {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: #a78bfa; margin-bottom: 6px;
  }
  .featured-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 700;
    color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  .featured-artist { font-size: 13px; color: #7878a0; margin-bottom: 14px; }
  .play-btn-featured {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #7c3aed, #db2777);
    border: none; border-radius: 99px;
    padding: 9px 18px;
    color: #fff; font-size: 13px; font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(124,58,237,0.35);
    width: fit-content;
  }
  .play-btn-featured:hover { transform: scale(1.04); box-shadow: 0 6px 24px rgba(124,58,237,0.5); }

  /* Track rows */
  .track-list { display: flex; flex-direction: column; gap: 2px; }

  .track-row {
    display: flex; align-items: center; gap: 14px;
    padding: 11px 14px;
    border-radius: 16px;
    border: 1px solid transparent;
    transition: all 0.18s ease;
    cursor: pointer;
    position: relative;
  }
  .track-row:hover { background: rgba(255,255,255,0.055); border-color: rgba(255,255,255,0.07); }
  .track-row.active-track {
    background: rgba(124,58,237,0.12);
    border-color: rgba(167,139,250,0.25);
  }

  .track-art-wrap { position: relative; flex-shrink: 0; }
  .track-art {
    width: 50px; height: 50px;
    border-radius: 12px; object-fit: cover;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }
  .track-art-overlay {
    position: absolute; inset: 0; border-radius: 12px;
    background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
  }
  .eq-bars { display: flex; gap: 2.5px; align-items: flex-end; height: 16px; }
  .eq-bar {
    width: 3px; border-radius: 2px; height: 100%;
    background: linear-gradient(to top, #7c3aed, #f472b6);
  }
  .eq-bar:nth-child(1) { animation: eq 0.6s ease-in-out infinite; }
  .eq-bar:nth-child(2) { animation: eq 0.45s 0.1s ease-in-out infinite; }
  .eq-bar:nth-child(3) { animation: eq 0.7s 0.2s ease-in-out infinite; }

  .track-meta { flex: 1; overflow: hidden; }
  .track-name {
    font-size: 14px; font-weight: 500; color: #e8e8f0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .track-name.playing { color: #a78bfa; }
  .track-artist { font-size: 12px; color: #55556a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .track-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .icon-btn {
    background: none; border: none; padding: 7px; border-radius: 50%;
    color: #55556a; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.08); color: #e8e8f0; }
  .icon-btn.liked { color: #f472b6; }
  .track-duration { font-size: 11px; color: #44445a; font-variant-numeric: tabular-nums; }

  /* ── Mini Player ─────────────────────────────────── */
  .mini-player {
    position: fixed; bottom: 70px; left: 10px; right: 10px;
    z-index: 35;
    background: rgba(10,10,16,0.9);
    backdrop-filter: blur(32px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
  }
  .mini-player:hover { transform: translateY(-3px); }
  .mini-progress { height: 2px; background: rgba(255,255,255,0.08); }
  .mini-progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #f472b6); transition: width 0.15s linear; }
  .mini-body { display: flex; align-items: center; gap: 12px; padding: 10px 14px; }
  .mini-art { width: 44px; height: 44px; border-radius: 11px; object-fit: cover; }
  .mini-info { flex: 1; overflow: hidden; }
  .mini-title { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mini-artist { font-size: 11px; color: #55556a; }
  .mini-controls { display: flex; align-items: center; gap: 4px; }
  .mini-play-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #db2777);
    border: none; display: flex; align-items: center; justify-content: center;
    color: #fff; transition: all 0.18s;
    box-shadow: 0 4px 14px rgba(124,58,237,0.4);
  }
  .mini-play-btn:hover { transform: scale(1.08); }

  /* ── Full Player Modal ───────────────────────────── */
  .player-modal-bg {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(20px);
  }
  .player-modal {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: linear-gradient(180deg, rgba(20,10,40,0.98) 0%, rgba(6,6,9,0.99) 100%);
    border-top: 1px solid rgba(255,255,255,0.08);
    border-radius: 28px 28px 0 0;
    padding: 0 24px 40px;
    max-height: 92vh; overflow-y: auto;
    animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .drag-pill { width: 40px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; margin: 14px auto 24px; }
  .player-art {
    width: 100%; max-width: 280px;
    aspect-ratio: 1; border-radius: 24px;
    object-fit: cover; display: block; margin: 0 auto 28px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06);
  }
  .player-track-info { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .player-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #fff; line-height: 1.2; }
  .player-artist { font-size: 14px; color: #55556a; margin-top: 4px; }
  .progress-wrap { margin-bottom: 6px; }
  .progress-bar {
    height: 4px; background: rgba(255,255,255,0.1); border-radius: 99px;
    cursor: pointer; position: relative; margin-bottom: 8px;
  }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #f472b6); border-radius: 99px; position: relative; }
  .progress-fill::after {
    content: ''; position: absolute; right: -6px; top: 50%; transform: translateY(-50%);
    width: 12px; height: 12px; border-radius: 50%;
    background: #fff; box-shadow: 0 0 0 3px rgba(167,139,250,0.3);
  }
  .time-row { display: flex; justify-content: space-between; font-size: 11px; color: #44445a; font-variant-numeric: tabular-nums; margin-bottom: 28px; }
  .player-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .ctrl-btn { background: none; border: none; color: #7878a0; padding: 8px; border-radius: 50%; transition: all 0.18s; display: flex; }
  .ctrl-btn:hover { color: #e8e8f0; }
  .ctrl-btn.active { color: #a78bfa; }
  .big-play-btn {
    width: 66px; height: 66px; border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #db2777);
    border: none; display: flex; align-items: center; justify-content: center;
    color: #fff; transition: all 0.2s;
    box-shadow: 0 8px 30px rgba(124,58,237,0.5);
  }
  .big-play-btn:hover { transform: scale(1.06); box-shadow: 0 12px 40px rgba(124,58,237,0.6); }
  .volume-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .vol-slider { flex: 1; -webkit-appearance: none; height: 3px; border-radius: 99px; background: rgba(255,255,255,0.1); cursor: pointer; }
  .vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #a78bfa; box-shadow: 0 0 0 4px rgba(167,139,250,0.15); }
  .player-footer { display: flex; gap: 10px; }
  .player-footer-btn {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 12px; color: #7878a0; font-size: 13px; font-weight: 500;
    display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.18s;
  }
  .player-footer-btn:hover { background: rgba(255,255,255,0.1); color: #e8e8f0; }

  /* ── Bottom Nav ──────────────────────────────────── */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 30;
    background: rgba(6,6,9,0.96);
    backdrop-filter: blur(30px) saturate(180%);
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-around;
    padding: 8px 0 22px;
  }
  .nav-btn {
    background: none; border: none;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 6px 20px; border-radius: 16px; transition: all 0.2s;
    color: #44445a;
  }
  .nav-btn.active { color: #a78bfa; }
  .nav-btn span { font-size: 10px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; }
  .nav-dot { width: 4px; height: 4px; border-radius: 50%; background: #a78bfa; opacity: 0; transition: opacity 0.2s; }
  .nav-btn.active .nav-dot { opacity: 1; }

  /* ── Sidebar ─────────────────────────────────────── */
  .sidebar-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); z-index: 40; }
  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 290px; z-index: 50;
    background: rgba(8,8,14,0.98);
    border-right: 1px solid rgba(255,255,255,0.07);
    display: flex; flex-direction: column; overflow: hidden;
    animation: slideIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sidebar-header { padding: 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sidebar-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
  .sidebar-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 12px; cursor: pointer;
    transition: all 0.18s; margin-bottom: 3px;
    color: #55556a; font-size: 14px; font-weight: 500;
  }
  .sidebar-nav-item:hover { background: rgba(255,255,255,0.05); color: #e8e8f0; }
  .sidebar-nav-item.active { background: rgba(124,58,237,0.15); color: #a78bfa; }
  .sidebar-section { flex: 1; overflow-y: auto; padding: 16px 14px; }
  .sidebar-section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #33334a; margin-bottom: 10px; padding: 0 6px; }
  .sidebar-pl-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
  .sidebar-pl-item:hover { background: rgba(255,255,255,0.04); }
  .sidebar-pl-thumb { width: 38px; height: 38px; border-radius: 9px; background: rgba(124,58,237,0.25); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 16px; flex-shrink: 0; }
  .sidebar-footer { padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.06); }
  .sidebar-user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #db2777); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
  .signout-btn { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 9px; color: #44445a; font-size: 13px; font-weight: 500; transition: all 0.18s; }
  .signout-btn:hover { background: rgba(255,50,50,0.08); border-color: rgba(255,50,50,0.2); color: #ff6666; }

  /* ── Modals ──────────────────────────────────────── */
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 40; backdrop-filter: blur(4px); }
  .modal-box {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(14,14,22,0.98); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px; padding: 26px; z-index: 50;
    width: min(100% - 32px, 360px);
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 16px; }
  .modal-input {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 13px 16px; color: #e8e8f0; font-size: 14px;
    transition: all 0.2s; margin-bottom: 18px;
  }
  .modal-input:focus { outline: none; border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }
  .modal-row { display: flex; gap: 10px; }
  .modal-btn {
    flex: 1; border: none; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; transition: all 0.18s;
  }
  .modal-btn.cancel { background: rgba(255,255,255,0.06); color: #7878a0; }
  .modal-btn.cancel:hover { background: rgba(255,255,255,0.1); }
  .modal-btn.confirm { background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; box-shadow: 0 4px 16px rgba(124,58,237,0.35); }
  .modal-btn.confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,58,237,0.5); }
  .pl-pick-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 12px; background: rgba(255,255,255,0.04); cursor: pointer; margin-bottom: 6px; transition: background 0.15s; border: 1px solid rgba(255,255,255,0.05); }
  .pl-pick-item:hover { background: rgba(124,58,237,0.12); border-color: rgba(167,139,250,0.2); }

  /* ── Toast ───────────────────────────────────────── */
  .toast {
    position: fixed; bottom: 148px; left: 50%; transform: translateX(-50%);
    background: rgba(20,20,30,0.95); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 99px; padding: 10px 20px; color: #e8e8f0; font-size: 13px; font-weight: 500;
    z-index: 100; white-space: nowrap; pointer-events: none;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    animation: toastPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── Library / Playlist views ────────────────────── */
  .library-grid { display: flex; flex-direction: column; gap: 8px; }
  .lib-card {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px; border-radius: 18px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    cursor: pointer; transition: all 0.18s;
  }
  .lib-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(167,139,250,0.2); transform: translateY(-1px); }
  .lib-thumb { width: 56px; height: 56px; border-radius: 14px; background: rgba(124,58,237,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 24px; flex-shrink: 0; }
  .lib-name { font-size: 15px; font-weight: 600; color: #e8e8f0; margin-bottom: 4px; }
  .lib-meta { font-size: 12px; color: #44445a; display: flex; align-items: center; gap: 6px; }

  .back-btn { background: none; border: none; color: #55556a; font-size: 13px; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; transition: color 0.15s; }
  .back-btn:hover { color: #a78bfa; }

  .pl-hero { display: flex; gap: 18px; align-items: flex-end; margin-bottom: 24px; }
  .pl-cover { width: 100px; height: 100px; border-radius: 18px; overflow: hidden; flex-shrink: 0; background: linear-gradient(135deg, #7c3aed, #db2777); display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 12px 35px rgba(124,58,237,0.35); }
  .pl-cover img { width: 100%; height: 100%; object-fit: cover; }
  .pl-info-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #44445a; margin-bottom: 6px; }
  .pl-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .pl-sub { font-size: 13px; color: #44445a; }

  /* ── Loading spinner ─────────────────────────────── */
  .loader { text-align: center; padding: 70px 0; color: #33334a; }
  .loader-ring { width: 42px; height: 42px; border: 3px solid rgba(255,255,255,0.06); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.9s linear infinite; margin: 0 auto 14px; }

  /* ── Empty state ─────────────────────────────────── */
  .empty { text-align: center; padding: 70px 20px; color: #33334a; }
  .empty-icon { font-size: 52px; margin-bottom: 14px; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #55556a; margin-bottom: 8px; }
  .empty-sub { font-size: 14px; margin-bottom: 20px; }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #db2777);
    border: none; border-radius: 99px; padding: 11px 24px;
    color: #fff; font-size: 14px; font-weight: 600;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(124,58,237,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,58,237,0.5); }

  .btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 99px; padding: 10px 20px; color: #7878a0; font-size: 13px; font-weight: 500; transition: all 0.18s; }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #e8e8f0; }

  .quick-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
  .quick-tag { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 99px; padding: 8px 16px; color: #7878a0; font-size: 12px; font-weight: 500; transition: all 0.18s; }
  .quick-tag:hover { background: rgba(124,58,237,0.12); border-color: rgba(167,139,250,0.25); color: #a78bfa; }

  @keyframes eq { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes toastPop { from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.9); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.4s ease both; }
`;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [activeGenre, setActiveGenre] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Track | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Auth + playlist load
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/auth"; return; }
      setUser(data.user);
      try {
        const { data: dbPlaylists } = await supabase.from('playlists').select('*').eq('user_id', data.user.id);
        if (dbPlaylists?.length) {
          const loaded = dbPlaylists.map(p => ({ id: p.id, name: p.name, tracks: p.tracks, isPublic: p.is_public, createdAt: new Date(p.created_at).getTime() }));
          setPlaylists(loaded);
          localStorage.setItem("wavely_playlists", JSON.stringify(loaded));
        } else {
          const saved = localStorage.getItem("wavely_playlists");
          if (saved) setPlaylists(JSON.parse(saved));
        }
      } catch {
        const saved = localStorage.getItem("wavely_playlists");
        if (saved) setPlaylists(JSON.parse(saved));
      }
    });
  }, []);

  useEffect(() => { fetchTracks(GENRES[0].tag); }, []);

  const savePlaylists = useCallback(async (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem("wavely_playlists", JSON.stringify(updated));
    if (user) {
      try {
        await supabase.from('playlists').delete().eq('user_id', user.id);
        const pub = updated.filter(p => p.isPublic);
        if (pub.length) await supabase.from('playlists').insert(pub.map(p => ({ id: p.id, name: p.name, tracks: p.tracks, is_public: p.isPublic, created_at: new Date(p.createdAt).toISOString(), user_id: user.id })));
      } catch (e) { console.error(e); }
    }
  }, [user]);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const pl: Playlist = { id: Date.now().toString(), name: newPlaylistName.trim(), tracks: [], isPublic: false, createdAt: Date.now() };
    savePlaylists([...playlists, pl]);
    setNewPlaylistName(""); setShowNewPlaylist(false);
    showToast(`✨ "${pl.name}" created!`);
  };

  const addToPlaylist = (playlist: Playlist, track: Track) => {
    if (playlist.tracks.find(t => t.id === track.id)) { showToast("Already in playlist!"); return; }
    savePlaylists(playlists.map(p => p.id === playlist.id ? { ...p, tracks: [...p.tracks, track] } : p));
    setShowAddToPlaylist(null);
    showToast(`🎵 Added to "${playlist.name}"!`);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(p => p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p);
    savePlaylists(updated);
    if (activePlaylist?.id === playlistId) setActivePlaylist(updated.find(p => p.id === playlistId) || null);
    showToast("Removed from playlist");
  };

  const deletePlaylist = (id: string) => {
    savePlaylists(playlists.filter(p => p.id !== id));
    if (activePlaylist?.id === id) setActivePlaylist(null);
    showToast("Playlist deleted");
  };

  const togglePublic = (id: string) => {
    const updated = playlists.map(p => p.id === id ? { ...p, isPublic: !p.isPublic } : p);
    savePlaylists(updated);
    const pl = updated.find(p => p.id === id);
    if (activePlaylist?.id === id) setActivePlaylist(pl || null);
    showToast(pl?.isPublic ? "🌍 Now public!" : "🔒 Now private");
  };

  const copyPlaylistLink = useCallback((id: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/playlist/${id}`).then(() => showToast("🔗 Link copied!"));
  }, [showToast]);

  const fetchTracks = useCallback(async (tag: string) => {
    setLoading(true); setTracks([]); setFeaturedTrack(null);
    try {
      const res = await fetch(`https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(tag)}&limit=30`);
      const data = await res.json();
      const songs = (data?.data?.results || []).map((s: any) => ({
        id: s.id, name: s.name,
        artist_name: s.artists?.primary?.[0]?.name || "Unknown",
        album_name: s.album?.name || "",
        duration: s.duration,
        audio: s.downloadUrl?.[2]?.url || s.downloadUrl?.[1]?.url || s.downloadUrl?.[0]?.url || "",
        image: s.image?.[2]?.url || s.image?.[1]?.url || s.image?.[0]?.url || "",
      })).filter((s: any) => s.audio);
      if (songs.length) { setFeaturedTrack(songs[0]); setTracks(songs.slice(1)); }
      else showToast("No tracks found 😕");
    } catch { showToast("Failed to load. Check connection!"); }
    finally { setLoading(false); }
  }, [showToast]);

  const switchGenre = (idx: number) => { setActiveGenre(idx); fetchTracks(GENRES[idx].tag); setActiveTab("home"); };

  // Audio engine
  useEffect(() => {
    if (!currentTrack?.audio || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = currentTrack.audio;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    playing ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const allTracks = featuredTrack ? [featuredTrack, ...tracks] : tracks;

  const handleEnded = useCallback(() => {
    if (repeat && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); return; }
    const pool = activePlaylist ? activePlaylist.tracks : allTracks;
    const idx = pool.findIndex(t => t.id === currentTrack?.id);
    if (shuffle) { setCurrentTrack(pool[Math.floor(Math.random() * pool.length)]); setPlaying(true); }
    else if (idx < pool.length - 1) { setCurrentTrack(pool[idx + 1]); setPlaying(true); }
    else setPlaying(false);
  }, [repeat, shuffle, activePlaylist, allTracks, currentTrack]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) { setProgress(audioRef.current.currentTime); setDuration(audioRef.current.duration || 0); }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) setPlaying(p => !p);
    else { setCurrentTrack(track); setPlaying(true); }
  };

  const skip = (dir: 1 | -1) => {
    const pool = activePlaylist ? activePlaylist.tracks : allTracks;
    const next = pool[pool.findIndex(t => t.id === currentTrack?.id) + dir];
    if (next) { setCurrentTrack(next); setPlaying(true); }
  };

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); showToast("Removed from liked"); }
      else { n.add(id); showToast("❤️ Added to liked!"); }
      return n;
    });
  };

  const fmt = (s: number) => isNaN(s) || !s ? "0:00" : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  const pct = duration ? (progress / duration) * 100 : 0;
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%2310101a'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22' fill='%23333'%3E🎵%3C/text%3E%3C/svg%3E";
  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "Listener";

  // ── Track Row ────────────────────────────────────────────────────────────────
  const TrackRow = ({ track, onRemove }: { track: Track; onRemove?: () => void }) => {
    const isActive = currentTrack?.id === track.id;
    return (
      <div className={`track-row${isActive ? " active-track" : ""}`} onClick={() => playTrack(track)}>
        <div className="track-art-wrap">
          <img src={track.image || fallback} alt="" className="track-art" onError={e => (e.target as HTMLImageElement).src = fallback} />
          {isActive && playing && (
            <div className="track-art-overlay">
              <div className="eq-bars">
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
            </div>
          )}
        </div>
        <div className="track-meta">
          <div className={`track-name${isActive ? " playing" : ""}`}>{track.name}</div>
          <div className="track-artist">{track.artist_name}</div>
        </div>
        <div className="track-actions" onClick={e => e.stopPropagation()}>
          <button className={`icon-btn${liked.has(track.id) ? " liked" : ""}`} onClick={() => toggleLike(track.id)}>
            {liked.has(track.id) ? Icons.heartFill : Icons.heart}
          </button>
          <span className="track-duration">{fmt(track.duration)}</span>
          {onRemove ? (
            <button className="icon-btn" style={{ color: "#663333" }} onClick={onRemove}>{Icons.trash}</button>
          ) : (
            <button className="icon-btn" onClick={() => setShowAddToPlaylist(track)}>{Icons.dots}</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="shell">
      <style>{STYLES}</style>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      {/* ── Sidebar ─────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div className="sidebar-bg" onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-brand">Wavely.</div>
              {[
                { id: "home", icon: Icons.home, label: "Home" },
                { id: "search", icon: Icons.search, label: "Search" },
                { id: "library", icon: Icons.library, label: "Library" },
              ].map(item => (
                <div key={item.id} className={`sidebar-nav-item${activeTab === item.id ? " active" : ""}`}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                  {item.icon}<span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-label">Your Library</div>
              <div className="sidebar-pl-item" onClick={() => { setActiveTab("liked"); setSidebarOpen(false); }}>
                <div className="sidebar-pl-thumb" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>❤️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#c8c8e0" }}>Liked Songs</div>
                  <div style={{ fontSize: 11, color: "#44445a" }}>{liked.size} songs</div>
                </div>
              </div>
              {playlists.map(pl => (
                <div key={pl.id} className="sidebar-pl-item" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); setSidebarOpen(false); }}>
                  <div className="sidebar-pl-thumb">
                    {pl.tracks[0] ? <img src={pl.tracks[0].image || fallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎵"}
                  </div>
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#c8c8e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                    <div style={{ fontSize: 11, color: "#44445a" }}>{pl.isPublic ? "Public" : "Private"} · {pl.tracks.length}</div>
                  </div>
                </div>
              ))}
              {!playlists.length && <div style={{ textAlign: "center", padding: "30px 0", color: "#33334a", fontSize: 13 }}>No playlists yet</div>}
            </div>
            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="sidebar-avatar">{displayName[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#7878a0" }}>{displayName}</span>
              </div>
              <button className="signout-btn" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign out</button>
            </div>
          </aside>
        </>
      )}

      {/* ── New Playlist Modal ───────────────────────── */}
      {showNewPlaylist && (
        <>
          <div className="modal-bg" onClick={() => setShowNewPlaylist(false)} />
          <div className="modal-box">
            <div className="modal-title">New Playlist</div>
            <input className="modal-input" autoFocus placeholder="Give it a name…" value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)} onKeyDown={e => e.key === "Enter" && createPlaylist()} />
            <div className="modal-row">
              <button className="modal-btn cancel" onClick={() => setShowNewPlaylist(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={createPlaylist}>Create</button>
            </div>
          </div>
        </>
      )}

      {/* ── Add to Playlist Modal ────────────────────── */}
      {showAddToPlaylist && (
        <>
          <div className="modal-bg" onClick={() => setShowAddToPlaylist(null)} />
          <div className="modal-box">
            <div className="modal-title">Save to Playlist</div>
            <div style={{ fontSize: 13, color: "#55556a", marginBottom: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{showAddToPlaylist.name}</div>
            {!playlists.length ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ color: "#44445a", marginBottom: 14, fontSize: 13 }}>No playlists yet</div>
                <button className="btn-primary" onClick={() => { setShowAddToPlaylist(null); setShowNewPlaylist(true); }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {playlists.map(pl => (
                  <div key={pl.id} className="pl-pick-item" onClick={() => addToPlaylist(pl, showAddToPlaylist)}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {pl.tracks[0] ? <img src={pl.tracks[0].image || fallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎵"}
                    </div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#c8c8e0" }}>{pl.name}</div>
                      <div style={{ fontSize: 11, color: "#44445a" }}>{pl.tracks.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="modal-btn cancel" style={{ width: "100%" }} onClick={() => setShowAddToPlaylist(null)}>Cancel</button>
          </div>
        </>
      )}

      {/* ── Full Player Modal ────────────────────────── */}
      {showPlayer && currentTrack && (
        <>
          <div className="player-modal-bg" onClick={() => setShowPlayer(false)} />
          <div className="player-modal">
            <div className="drag-pill" />
            <img src={currentTrack.image || fallback} alt="" className="player-art" onError={e => (e.target as HTMLImageElement).src = fallback} />
            <div className="player-track-info">
              <div>
                <div className="player-title">{currentTrack.name}</div>
                <div className="player-artist">{currentTrack.artist_name}</div>
              </div>
              <button className={`icon-btn${liked.has(currentTrack.id) ? " liked" : ""}`} style={{ padding: 10 }} onClick={() => toggleLike(currentTrack.id)}>
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar" onClick={handleSeek}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="time-row"><span>{fmt(progress)}</span><span>{fmt(duration)}</span></div>
            </div>
            <div className="player-controls">
              <button className={`ctrl-btn${shuffle ? " active" : ""}`} onClick={() => setShuffle(s => !s)}>{Icons.shuffle}</button>
              <button className="ctrl-btn" style={{ color: "#c8c8e0" }} onClick={() => skip(-1)}>{Icons.prev}</button>
              <button className="big-play-btn" onClick={() => setPlaying(p => !p)}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="ctrl-btn" style={{ color: "#c8c8e0" }} onClick={() => skip(1)}>{Icons.next}</button>
              <button className={`ctrl-btn${repeat ? " active" : ""}`} onClick={() => setRepeat(r => !r)}>{Icons.repeat}</button>
            </div>
            <div className="volume-row">
              <button className="icon-btn" onClick={() => setIsMuted(m => !m)}>{isMuted ? Icons.volumeX : Icons.volume}</button>
              <input type="range" className="vol-slider" min={0} max={1} step={0.01} value={isMuted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} />
            </div>
            <div className="player-footer">
              <button className="player-footer-btn" onClick={() => setShowAddToPlaylist(currentTrack)}>{Icons.plus} Playlist</button>
              <button className="player-footer-btn" onClick={() => navigator.share?.({ title: currentTrack.name, text: `Listening to ${currentTrack.name} on Wavely!` })}>{Icons.share} Share</button>
            </div>
          </div>
        </>
      )}

      {/* ── Header ──────────────────────────────────── */}
      <header className="header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>{Icons.menu}</button>
        <div className="brand">Wavely.</div>
        <a href="/profile" className="avatar-btn">{displayName[0]?.toUpperCase()}</a>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <main className="content">

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="fade-up">
            <div className="search-bar" onClick={() => setActiveTab("search")}>
              {Icons.search}
              <span>Search songs, artists…</span>
            </div>
            <div className="genre-scroll">
              {GENRES.map((g, i) => (
                <button key={i} className={`genre-pill ${activeGenre === i ? "active" : "idle"}`} onClick={() => switchGenre(i)}>
                  {g.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="loader">
                <div className="loader-ring" />
                <div style={{ fontSize: 14 }}>Loading tracks…</div>
              </div>
            )}

            {!loading && featuredTrack && (
              <>
                <div className="section-label" style={{ marginBottom: 10 }}>Featured</div>
                <div className="featured-card" style={{ marginBottom: 28 }}>
                  <div className="featured-card-inner">
                    <img src={featuredTrack.image || fallback} alt="" className="featured-img" onError={e => (e.target as HTMLImageElement).src = fallback} />
                    <div className="featured-info">
                      <div>
                        <div className="featured-tag">Now Trending</div>
                        <div className="featured-title">{featuredTrack.name}</div>
                        <div className="featured-artist">{featuredTrack.artist_name}</div>
                      </div>
                      <button className="play-btn-featured" onClick={() => playTrack(featuredTrack)}>
                        {currentTrack?.id === featuredTrack.id && playing ? Icons.pause : Icons.play}
                        {currentTrack?.id === featuredTrack.id && playing ? "Pause" : "Play Now"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="section-label">{GENRES[activeGenre].label} · Popular</div>
                <div className="track-list">
                  {tracks.map(track => <TrackRow key={track.id} track={track} />)}
                </div>
              </>
            )}

            {!loading && !featuredTrack && (
              <div className="empty">
                <div className="empty-icon">😕</div>
                <div className="empty-title">No tracks found</div>
                <div className="empty-sub">Try a different genre or check your connection</div>
                <button className="btn-primary" onClick={() => fetchTracks(GENRES[activeGenre].tag)}>Try Again</button>
              </div>
            )}
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === "search" && (
          <SearchTab playTrack={playTrack} currentTrack={currentTrack} playing={playing} fmt={fmt} fallback={fallback} liked={liked} toggleLike={toggleLike} setShowAddToPlaylist={setShowAddToPlaylist} Icons={Icons} />
        )}

        {/* LIBRARY TAB */}
        {activeTab === "library" && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Library</div>
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setShowNewPlaylist(true)}>{Icons.plus} New</button>
            </div>
            <div className="library-grid">
              <div className="lib-card" onClick={() => setActiveTab("liked")}>
                <div className="lib-thumb" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>❤️</div>
                <div>
                  <div className="lib-name">Liked Songs</div>
                  <div className="lib-meta">{liked.size} songs</div>
                </div>
              </div>
              {playlists.map(pl => (
                <div key={pl.id} className="lib-card" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); }}>
                  <div className="lib-thumb">
                    {pl.tracks[0] ? <img src={pl.tracks[0].image || fallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎵"}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div className="lib-name">{pl.name}</div>
                    <div className="lib-meta">
                      {pl.isPublic ? Icons.unlock : Icons.lock}
                      {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 2 }}>
                    <button className="icon-btn" onClick={() => togglePublic(pl.id)} title="Toggle public">
                      {pl.isPublic ? Icons.unlock : Icons.lock}
                    </button>
                    <button className="icon-btn" style={{ color: "#663333" }} onClick={() => deletePlaylist(pl.id)}>{Icons.trash}</button>
                  </div>
                </div>
              ))}
            </div>
            {!playlists.length && (
              <div className="empty" style={{ paddingTop: 50 }}>
                <div className="empty-icon">🎵</div>
                <div className="empty-title">No playlists yet</div>
                <div className="empty-sub">Create your first playlist to get started</div>
                <button className="btn-primary" onClick={() => setShowNewPlaylist(true)}>Create Playlist</button>
              </div>
            )}
          </div>
        )}

        {/* PLAYLIST VIEW */}
        {activeTab === "playlist" && activePlaylist && (
          <div className="fade-up">
            <button className="back-btn" onClick={() => setActiveTab("library")}>← Back</button>
            <div className="pl-hero">
              <div className="pl-cover">
                {activePlaylist.tracks[0] ? <img src={activePlaylist.tracks[0].image || fallback} alt="" /> : "🎵"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="pl-info-label">Playlist</div>
                <div className="pl-title">{activePlaylist.name}</div>
                <div className="pl-sub">{activePlaylist.isPublic ? "🌍 Public" : "🔒 Private"} · {activePlaylist.tracks.length} songs</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {activePlaylist.tracks.length > 0 && (
                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px" }}
                  onClick={() => { setCurrentTrack(activePlaylist.tracks[0]); setPlaying(true); }}>
                  {Icons.play} Play All
                </button>
              )}
              <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => togglePublic(activePlaylist.id)}>
                {activePlaylist.isPublic ? Icons.lock : Icons.unlock}
                {activePlaylist.isPublic ? "Make Private" : "Make Public"}
              </button>
              {activePlaylist.isPublic && (
                <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => copyPlaylistLink(activePlaylist.id)}>
                  {Icons.copy} Copy Link
                </button>
              )}
            </div>
            {!activePlaylist.tracks.length ? (
              <div className="empty">
                <div className="empty-icon">🎵</div>
                <div className="empty-title">Empty playlist</div>
                <div className="empty-sub">Search for songs and add them here</div>
                <button className="btn-primary" onClick={() => setActiveTab("search")}>Find Music</button>
              </div>
            ) : (
              <div className="track-list">
                {activePlaylist.tracks.map(track => (
                  <TrackRow key={track.id} track={track} onRemove={() => removeFromPlaylist(activePlaylist.id, track.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIKED SONGS */}
        {activeTab === "liked" && (
          <div className="fade-up">
            <button className="back-btn" onClick={() => setActiveTab("library")}>← Back</button>
            <div className="pl-hero">
              <div className="pl-cover" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>❤️</div>
              <div>
                <div className="pl-info-label">Collection</div>
                <div className="pl-title">Liked Songs</div>
                <div className="pl-sub">{liked.size} songs</div>
              </div>
            </div>
            {!liked.size ? (
              <div className="empty">
                <div className="empty-icon">🎵</div>
                <div className="empty-title">No liked songs</div>
                <div className="empty-sub">Tap the heart on any track to save it here</div>
              </div>
            ) : (
              <div className="track-list">
                {allTracks.filter(t => liked.has(t.id)).map(track => <TrackRow key={track.id} track={track} />)}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="empty fade-up">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">No Activity Yet</div>
            <div className="empty-sub">Join live spaces to see what's happening</div>
          </div>
        )}
      </main>

      {/* ── Mini Player ──────────────────────────────── */}
      {currentTrack && (
        <div className="mini-player" onClick={() => setShowPlayer(true)}>
          <div className="mini-progress">
            <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="mini-body">
            <img src={currentTrack.image || fallback} alt="" className="mini-art" onError={e => (e.target as HTMLImageElement).src = fallback} />
            <div className="mini-info">
              <div className="mini-title">{currentTrack.name}</div>
              <div className="mini-artist">{currentTrack.artist_name}</div>
            </div>
            <div className="mini-controls" onClick={e => e.stopPropagation()}>
              <button className={`icon-btn${liked.has(currentTrack.id) ? " liked" : ""}`} onClick={() => toggleLike(currentTrack.id)}>
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
              <button className="mini-play-btn" onClick={() => setPlaying(p => !p)}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="icon-btn" style={{ color: "#7878a0" }} onClick={() => skip(1)}>{Icons.next}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────── */}
      {toast && <div className="toast">{toast}</div>}

      {/* ── Bottom Nav ──────────────────────────────── */}
      <nav className="bottom-nav">
        {[
          { id: "home", icon: Icons.home, label: "Home" },
          { id: "search", icon: Icons.search, label: "Search" },
          { id: "library", icon: Icons.library, label: "Library" },
          { id: "activity", icon: Icons.bell, label: "Activity" },
        ].map(tab => (
          <button key={tab.id} className={`nav-btn${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            <span>{tab.label}</span>
            <div className="nav-dot" />
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Search Component ──────────────────────────────────────────────────────────
function SearchTab({ playTrack, currentTrack, playing, fmt, fallback, liked, toggleLike, setShowAddToPlaylist, Icons }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const search = async (q?: string) => {
    const sq = q || query; if (!sq.trim()) return;
    setSearching(true); setSearched(true);
    try {
      const res = await fetch(`https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(sq)}&limit=25`);
      const data = await res.json();
      const songs = (data?.data?.results || []).map((s: any) => ({
        id: s.id, name: s.name,
        artist_name: s.artists?.primary?.[0]?.name || "Unknown",
        duration: s.duration,
        audio: s.downloadUrl?.[2]?.url || s.downloadUrl?.[1]?.url || s.downloadUrl?.[0]?.url || "",
        image: s.image?.[2]?.url || s.image?.[1]?.url || s.image?.[0]?.url || "",
      })).filter((s: any) => s.audio);
      setResults(songs);
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const quickTags = ["Arijit Singh", "Shreya Ghoshal", "Bollywood 2024", "Lo-Fi Hindi", "Taylor Swift", "The Weeknd", "Bengali Songs", "Punjabi Hits"];

  return (
    <div className="fade-up">
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Search</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <input ref={inputRef} className="search-input-field" value={query}
          onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Artists, songs, albums…" />
        <button className="btn-primary" style={{ padding: "0 20px", borderRadius: 14, flexShrink: 0 }} onClick={() => search()}>Go</button>
      </div>
      {!searched && (
        <>
          <div className="section-label">Quick Search</div>
          <div className="quick-tags">
            {quickTags.map(tag => (
              <button key={tag} className="quick-tag" onClick={() => { setQuery(tag); search(tag); }}>{tag}</button>
            ))}
          </div>
        </>
      )}
      {searching && (
        <div className="loader">
          <div className="loader-ring" />
          <div style={{ fontSize: 14 }}>Searching…</div>
        </div>
      )}
      {searched && !searching && !results.length && (
        <div className="empty">
          <div className="empty-icon">😕</div>
          <div className="empty-title">No results</div>
          <div className="empty-sub">Try a different search</div>
        </div>
      )}
      {results.length > 0 && (
        <>
          <div className="section-label" style={{ marginBottom: 12 }}>{results.length} results</div>
          <div className="track-list">
            {results.map((track: any) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div key={track.id} className={`track-row${isActive ? " active-track" : ""}`} onClick={() => playTrack(track)}>
                  <div className="track-art-wrap">
                    <img src={track.image || fallback} alt="" className="track-art" onError={(e: any) => e.target.src = fallback} />
                    {isActive && playing && (
                      <div className="track-art-overlay">
                        <div className="eq-bars">
                          <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="track-meta">
                    <div className={`track-name${isActive ? " playing" : ""}`}>{track.name}</div>
                    <div className="track-artist">{track.artist_name}</div>
                  </div>
                  <div className="track-actions" onClick={(e: any) => e.stopPropagation()}>
                    <button className={`icon-btn${liked.has(track.id) ? " liked" : ""}`} onClick={() => toggleLike(track.id)}>
                      {liked.has(track.id) ? Icons.heartFill : Icons.heart}
                    </button>
                    <span className="track-duration">{fmt(track.duration)}</span>
                    <button className="icon-btn" onClick={() => setShowAddToPlaylist(track)}>{Icons.dots}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
