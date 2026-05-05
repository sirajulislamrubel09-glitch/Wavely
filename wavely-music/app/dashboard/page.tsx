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

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  home:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  library:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  bell:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  play:     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause:    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev:     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><rect x="4" y="4" width="3" height="16" rx="1"/></svg>,
  next:     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="4" width="3" height="16" rx="1"/></svg>,
  shuffle:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  repeat:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  heart:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill:<svg width="20" height="20" viewBox="0 0 24 24" fill="#a855f7" stroke="#a855f7" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  volume:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  volumeX:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  dots:     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  plus:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  lock:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  copy:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  share:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  back:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  music:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
};

// ─── Genre list ────────────────────────────────────────────────────────────────
const GENRES = [
  { label: "Trending",    tag: "trending hindi 2024" },
  { label: "Bollywood",   tag: "bollywood hits" },
  { label: "Arijit Singh",tag: "arijit singh" },
  { label: "Lo-Fi",       tag: "lofi hindi" },
  { label: "Romantic",    tag: "romantic hindi songs" },
  { label: "Party",       tag: "party songs hindi" },
  { label: "English",     tag: "english pop 2024" },
  { label: "Bengali",     tag: "bengali songs" },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; background: #08070f; }
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #e2dff0;
  -webkit-font-smoothing: antialiased;
}
button, input { font: inherit; }
button { cursor: pointer; outline: none; border: none; background: none; }
img { display: block; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.25); border-radius: 99px; }

/* ── Shell ── */
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 70% 45% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 65%),
    radial-gradient(ellipse 40% 30% at 85% 15%, rgba(109,40,217,0.1) 0%, transparent 55%),
    #08070f;
}

/* ── Header ── */
.hdr {
  position: sticky; top: 0; z-index: 20;
  height: 58px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px;
  background: rgba(8,7,15,0.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139,92,246,0.12);
}
.hdr-brand {
  font-size: 19px; font-weight: 800; letter-spacing: -0.4px;
  color: #a855f7;
}
.hdr-icon-btn {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af;
  transition: background 0.15s, color 0.15s;
}
.hdr-icon-btn:hover { background: rgba(168,85,247,0.1); color: #a855f7; }
.hdr-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(124,58,237,0.35);
  border: 1.5px solid rgba(168,85,247,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #c4b5fd;
  text-decoration: none; transition: border-color 0.15s;
}
.hdr-avatar:hover { border-color: #a855f7; }

/* ── Main scroll area ── */
.main {
  flex: 1; overflow-y: auto;
  padding: 20px 16px 170px;
  max-width: 680px; width: 100%; margin: 0 auto;
}

/* ── Genre pills ── */
.genre-row {
  display: flex; gap: 8px; overflow-x: auto; margin-bottom: 22px;
  padding-bottom: 2px; scrollbar-width: none;
}
.genre-row::-webkit-scrollbar { display: none; }
.gpill {
  flex-shrink: 0; border-radius: 99px; padding: 8px 15px;
  font-size: 13px; font-weight: 600; border: none;
  transition: all 0.18s ease;
}
.gpill-on  { background: #7c3aed; color: #fff; box-shadow: 0 2px 14px rgba(124,58,237,0.4); }
.gpill-off { background: rgba(139,92,246,0.1); color: #9ca3af; border: 1px solid rgba(139,92,246,0.18); }
.gpill-off:hover { background: rgba(139,92,246,0.18); color: #c4b5fd; }

/* ── Search bar (clickable fake) ── */
.searchbar-fake {
  display: flex; align-items: center; gap: 11px;
  background: rgba(139,92,246,0.07);
  border: 1px solid rgba(139,92,246,0.14);
  border-radius: 14px; padding: 13px 16px;
  margin-bottom: 22px; cursor: pointer; transition: all 0.18s;
}
.searchbar-fake:hover { background: rgba(139,92,246,0.12); border-color: rgba(168,85,247,0.3); }
.searchbar-fake span { color: #6b7280; font-size: 14px; }

/* ── Real search input ── */
.search-inp {
  width: 100%; background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.16);
  border-radius: 14px; padding: 13px 16px;
  color: #e2dff0; font-size: 15px; transition: all 0.18s;
}
.search-inp::placeholder { color: #4b5563; }
.search-inp:focus { outline: none; border-color: rgba(168,85,247,0.5); background: rgba(139,92,246,0.12); box-shadow: 0 0 0 4px rgba(124,58,237,0.08); }

/* ── Section label ── */
.slabel {
  font-size: 11px; font-weight: 700; letter-spacing: 1.4px;
  text-transform: uppercase; color: #6b7280; margin-bottom: 12px;
}

/* ── Featured card ── */
.feat-card {
  display: flex; border-radius: 20px; overflow: hidden;
  background: rgba(124,58,237,0.08);
  border: 1px solid rgba(139,92,246,0.18);
  margin-bottom: 28px; transition: border-color 0.18s;
}
.feat-card:hover { border-color: rgba(168,85,247,0.35); }
.feat-img { width: 110px; height: 110px; object-fit: cover; flex-shrink: 0; }
.feat-body { padding: 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
.feat-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: #9333ea; margin-bottom: 5px; }
.feat-title { font-size: 16px; font-weight: 700; color: #f5f3ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.feat-artist { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
.feat-play-btn {
  display: inline-flex; align-items: center; gap: 7px;
  background: #7c3aed; color: #fff; border: none; border-radius: 99px;
  padding: 7px 16px; font-size: 12px; font-weight: 600;
  width: fit-content; transition: all 0.18s;
  box-shadow: 0 3px 12px rgba(124,58,237,0.35);
}
.feat-play-btn:hover { background: #6d28d9; transform: scale(1.03); }

/* ── Track row ── */
.trow {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 14px;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  cursor: pointer;
}
.trow:hover { background: rgba(139,92,246,0.07); }
.trow.trow-active { background: rgba(124,58,237,0.1); border-color: rgba(139,92,246,0.25); }
.tart-wrap { position: relative; flex-shrink: 0; }
.tart { width: 48px; height: 48px; border-radius: 11px; object-fit: cover; box-shadow: 0 3px 10px rgba(0,0,0,0.35); }
.tart-ov { position: absolute; inset: 0; border-radius: 11px; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; }
.eq { display: flex; gap: 2.5px; align-items: flex-end; height: 14px; }
.eq-b { width: 3px; border-radius: 2px; background: #a855f7; height: 100%; }
.eq-b:nth-child(1) { animation: eqA 0.55s ease-in-out infinite; }
.eq-b:nth-child(2) { animation: eqA 0.42s 0.1s ease-in-out infinite; }
.eq-b:nth-child(3) { animation: eqA 0.65s 0.2s ease-in-out infinite; }
.tmeta { flex: 1; overflow: hidden; }
.tname { font-size: 14px; font-weight: 500; color: #e2dff0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.tname.ton { color: #a855f7; }
.tartist { font-size: 12px; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tacts { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.ticonbtn { padding: 7px; border-radius: 50%; color: #4b5563; transition: background 0.15s, color 0.15s; display: flex; }
.ticonbtn:hover { background: rgba(139,92,246,0.12); color: #a855f7; }
.ticonbtn.ton { color: #a855f7; }
.tdur { font-size: 11px; color: #374151; font-variant-numeric: tabular-nums; padding: 0 4px; }

/* ── Loader ── */
.loader { text-align: center; padding: 70px 0; color: #374151; }
.lring { width: 38px; height: 38px; border: 3px solid rgba(139,92,246,0.15); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 14px; }

/* ── Empty ── */
.empty { text-align: center; padding: 64px 20px; }
.empty-ico { font-size: 48px; margin-bottom: 14px; }
.empty-t { font-size: 17px; font-weight: 700; color: #4b5563; margin-bottom: 8px; }
.empty-s { font-size: 13px; color: #374151; margin-bottom: 20px; }

/* ── Buttons ── */
.btn-p { background: #7c3aed; color: #fff; border: none; border-radius: 99px; padding: 10px 22px; font-size: 13px; font-weight: 600; transition: all 0.18s; box-shadow: 0 3px 12px rgba(124,58,237,0.35); display: inline-flex; align-items: center; gap: 7px; }
.btn-p:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 5px 18px rgba(124,58,237,0.45); }
.btn-g { background: rgba(139,92,246,0.1); color: #9ca3af; border: 1px solid rgba(139,92,246,0.18); border-radius: 99px; padding: 9px 18px; font-size: 13px; font-weight: 500; transition: all 0.18s; display: inline-flex; align-items: center; gap: 6px; }
.btn-g:hover { background: rgba(139,92,246,0.18); color: #c4b5fd; }

/* ── Mini player ── */
.mini-player {
  position: fixed; bottom: 68px; left: 10px; right: 10px; z-index: 35;
  background: rgba(12,10,22,0.94);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(139,92,246,0.2);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 16px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08);
  cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.mini-player:hover { transform: translateY(-3px); box-shadow: 0 22px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15); }
.mini-prog { height: 2px; background: rgba(139,92,246,0.15); }
.mini-prog-fill { height: 100%; background: #9333ea; transition: width 0.15s linear; }
.mini-body { display: flex; align-items: center; gap: 11px; padding: 9px 13px; }
.mini-art { width: 42px; height: 42px; border-radius: 10px; object-fit: cover; }
.mini-info { flex: 1; overflow: hidden; }
.mini-title { font-size: 13px; font-weight: 600; color: #f5f3ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-artist { font-size: 11px; color: #4b5563; margin-top: 2px; }
.mini-ctrls { display: flex; align-items: center; gap: 3px; }
.mini-play {
  width: 36px; height: 36px; border-radius: 50%;
  background: #7c3aed; display: flex; align-items: center; justify-content: center;
  color: #fff; transition: all 0.18s; box-shadow: 0 3px 10px rgba(124,58,237,0.35);
}
.mini-play:hover { background: #6d28d9; transform: scale(1.07); }

/* ── Full-page player ── */
.player-page {
  position: fixed; inset: 0; z-index: 50;
  background: #08070f;
  display: flex; flex-direction: column;
  animation: slideInUp 0.32s cubic-bezier(0.22,1,0.36,1);
  overflow-y: auto;
}
.player-page-bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.22) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 20% 80%, rgba(124,58,237,0.1) 0%, transparent 60%);
}
.player-hdr {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 0;
}
.player-hdr-label { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; }
.player-body { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; align-items: center; padding: 20px 24px 36px; }
.player-art {
  width: min(300px, 78vw); aspect-ratio: 1;
  border-radius: 24px; object-fit: cover;
  box-shadow: 0 28px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.12);
  margin-bottom: 30px;
  animation: artPop 0.4s 0.1s cubic-bezier(0.34,1.4,0.64,1) both;
}
.player-track-row { width: 100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.player-tname { font-size: 21px; font-weight: 700; color: #f5f3ff; letter-spacing: -0.3px; }
.player-tartist { font-size: 14px; color: #6b7280; margin-top: 4px; }
.prog-bar { width: 100%; height: 4px; background: rgba(139,92,246,0.15); border-radius: 99px; cursor: pointer; position: relative; margin-bottom: 8px; }
.prog-fill { height: 100%; background: #9333ea; border-radius: 99px; position: relative; transition: width 0.12s linear; }
.prog-fill::after { content: ''; position: absolute; right: -6px; top: 50%; transform: translateY(-50%); width: 13px; height: 13px; border-radius: 50%; background: #a855f7; box-shadow: 0 0 0 4px rgba(168,85,247,0.2); }
.prog-times { display: flex; justify-content: space-between; font-size: 11px; color: #374151; font-variant-numeric: tabular-nums; margin-bottom: 28px; width: 100%; }
.ctrl-row { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 28px; }
.ctrl-btn { padding: 8px; border-radius: 50%; color: #6b7280; transition: all 0.15s; display: flex; }
.ctrl-btn:hover { color: #a855f7; }
.ctrl-btn.c-on { color: #9333ea; }
.ctrl-skip { padding: 10px; color: #c4b5fd; transition: all 0.15s; display: flex; }
.ctrl-skip:hover { color: #fff; transform: scale(1.08); }
.play-big {
  width: 68px; height: 68px; border-radius: 50%;
  background: #7c3aed; display: flex; align-items: center; justify-content: center;
  color: #fff; transition: all 0.18s;
  box-shadow: 0 6px 24px rgba(124,58,237,0.5);
}
.play-big:hover { background: #6d28d9; transform: scale(1.06); box-shadow: 0 10px 32px rgba(124,58,237,0.6); }
.vol-row { display: flex; align-items: center; gap: 12px; width: 100%; margin-bottom: 24px; }
.vol-slider { flex: 1; -webkit-appearance: none; height: 3px; border-radius: 99px; background: rgba(139,92,246,0.15); cursor: pointer; }
.vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #9333ea; box-shadow: 0 0 0 4px rgba(147,51,234,0.2); }
.player-footer { display: flex; gap: 10px; width: 100%; }
.player-footer-btn { flex: 1; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.16); border-radius: 14px; padding: 12px; color: #6b7280; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.18s; }
.player-footer-btn:hover { background: rgba(139,92,246,0.15); color: #c4b5fd; border-color: rgba(168,85,247,0.3); }

/* ── Bottom nav ── */
.bnav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 30;
  background: rgba(8,7,15,0.96); backdrop-filter: blur(24px);
  border-top: 1px solid rgba(139,92,246,0.1);
  display: flex; justify-content: space-around;
  padding: 8px 0 20px;
}
.bnav-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 6px 18px; border-radius: 12px; color: #374151; transition: all 0.18s; }
.bnav-btn.b-on { color: #9333ea; }
.bnav-btn span { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
.bnav-dot { width: 4px; height: 4px; border-radius: 50%; background: #9333ea; opacity: 0; transition: opacity 0.2s; margin-top: 1px; }
.bnav-btn.b-on .bnav-dot { opacity: 1; }

/* ── Sidebar ── */
.sb-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 40; }
.sb { position: fixed; top: 0; left: 0; bottom: 0; width: 284px; z-index: 50; background: rgba(10,8,20,0.98); border-right: 1px solid rgba(139,92,246,0.12); display: flex; flex-direction: column; animation: slideInLeft 0.26s ease; overflow: hidden; }
.sb-hdr { padding: 20px 18px; border-bottom: 1px solid rgba(139,92,246,0.1); }
.sb-brand { font-size: 20px; font-weight: 800; color: #a855f7; margin-bottom: 18px; }
.sb-nav-item { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: 11px; cursor: pointer; color: #4b5563; font-size: 14px; font-weight: 500; margin-bottom: 3px; transition: all 0.15s; }
.sb-nav-item:hover { background: rgba(139,92,246,0.08); color: #c4b5fd; }
.sb-nav-item.s-on { background: rgba(124,58,237,0.14); color: #a855f7; }
.sb-lib { flex: 1; overflow-y: auto; padding: 14px; }
.sb-lib-label { font-size: 10px; font-weight: 700; letter-spacing: 1.3px; text-transform: uppercase; color: #2d2945; padding: 0 5px; margin-bottom: 8px; }
.sb-pl-item { display: flex; align-items: center; gap: 10px; padding: 8px 9px; border-radius: 9px; cursor: pointer; transition: background 0.15s; }
.sb-pl-item:hover { background: rgba(139,92,246,0.07); }
.sb-pl-thumb { width: 36px; height: 36px; border-radius: 8px; background: rgba(124,58,237,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 15px; flex-shrink: 0; }
.sb-footer { padding: 14px 18px; border-top: 1px solid rgba(139,92,246,0.1); }
.sb-user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sb-av { width: 32px; height: 32px; border-radius: 50%; background: rgba(124,58,237,0.3); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #c4b5fd; }
.sb-signout { width: 100%; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.12); border-radius: 9px; padding: 9px; color: #4b5563; font-size: 13px; font-weight: 500; transition: all 0.18s; }
.sb-signout:hover { background: rgba(220,38,38,0.07); border-color: rgba(220,38,38,0.15); color: #f87171; }

/* ── Modals ── */
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.72); z-index: 40; backdrop-filter: blur(4px); }
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(13,11,24,0.98); border: 1px solid rgba(139,92,246,0.16); border-radius: 22px; padding: 24px; z-index: 50; width: min(100% - 28px, 360px); box-shadow: 0 28px 70px rgba(0,0,0,0.55); }
.modal-t { font-size: 18px; font-weight: 700; color: #f5f3ff; margin-bottom: 14px; }
.modal-inp { width: 100%; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.16); border-radius: 11px; padding: 12px 15px; color: #e2dff0; font-size: 14px; margin-bottom: 16px; transition: all 0.18s; }
.modal-inp:focus { outline: none; border-color: rgba(168,85,247,0.45); background: rgba(139,92,246,0.12); box-shadow: 0 0 0 4px rgba(124,58,237,0.07); }
.modal-row { display: flex; gap: 10px; }
.mbtn { flex: 1; border: none; border-radius: 11px; padding: 11px; font-size: 14px; font-weight: 600; transition: all 0.18s; }
.mbtn-c { background: rgba(139,92,246,0.08); color: #6b7280; }
.mbtn-c:hover { background: rgba(139,92,246,0.14); }
.mbtn-ok { background: #7c3aed; color: #fff; box-shadow: 0 3px 12px rgba(124,58,237,0.3); }
.mbtn-ok:hover { background: #6d28d9; }
.pl-pick { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 11px; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.1); cursor: pointer; margin-bottom: 6px; transition: all 0.15s; }
.pl-pick:hover { background: rgba(124,58,237,0.12); border-color: rgba(168,85,247,0.25); }

/* ── Library cards ── */
.lib-list { display: flex; flex-direction: column; gap: 8px; }
.lib-card { display: flex; align-items: center; gap: 13px; padding: 12px 14px; border-radius: 16px; background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.1); cursor: pointer; transition: all 0.18s; }
.lib-card:hover { background: rgba(139,92,246,0.09); border-color: rgba(168,85,247,0.2); }
.lib-thumb { width: 52px; height: 52px; border-radius: 12px; background: rgba(124,58,237,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 22px; flex-shrink: 0; }
.lib-name { font-size: 14px; font-weight: 600; color: #e2dff0; margin-bottom: 4px; }
.lib-sub { font-size: 12px; color: #374151; display: flex; align-items: center; gap: 5px; }

/* ── Playlist hero ── */
.pl-back { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #4b5563; margin-bottom: 18px; transition: color 0.15s; }
.pl-back:hover { color: #a855f7; }
.pl-hero { display: flex; gap: 18px; align-items: flex-end; margin-bottom: 22px; }
.pl-cover { width: 96px; height: 96px; border-radius: 16px; background: rgba(124,58,237,0.25); display: flex; align-items: center; justify-content: center; font-size: 32px; overflow: hidden; flex-shrink: 0; box-shadow: 0 10px 28px rgba(0,0,0,0.4); }
.pl-cover img { width: 100%; height: 100%; object-fit: cover; }
.pl-label { font-size: 10px; font-weight: 700; letter-spacing: 1.3px; text-transform: uppercase; color: #4b5563; margin-bottom: 5px; }
.pl-name { font-size: 21px; font-weight: 800; color: #f5f3ff; margin-bottom: 5px; }
.pl-meta { font-size: 12px; color: #374151; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 148px; left: 50%; transform: translateX(-50%);
  background: rgba(18,14,32,0.96); border: 1px solid rgba(139,92,246,0.2);
  border-radius: 99px; padding: 9px 18px; color: #e2dff0; font-size: 13px; font-weight: 500;
  z-index: 100; white-space: nowrap; pointer-events: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.45);
  animation: toastUp 0.28s cubic-bezier(0.34,1.4,0.64,1);
}

/* ── Quick tags ── */
.qtag { background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.14); border-radius: 99px; padding: 7px 14px; color: #6b7280; font-size: 12px; font-weight: 500; transition: all 0.16s; }
.qtag:hover { background: rgba(124,58,237,0.13); border-color: rgba(168,85,247,0.28); color: #c4b5fd; }

/* ── Fade-up ── */
.fu { animation: fuA 0.35s ease both; }

/* ── Keyframes ── */
@keyframes eqA { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fuA { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes artPop { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
@keyframes toastUp { from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.92); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (s: number) => (!s || isNaN(s)) ? "0:00" : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%2310091e'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='20' fill='%233d2f6e'%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E";

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser]                         = useState<any>(null);
  const [tracks, setTracks]                     = useState<Track[]>([]);
  const [featuredTrack, setFeaturedTrack]       = useState<Track | null>(null);
  const [currentTrack, setCurrentTrack]         = useState<Track | null>(null);
  const [playing, setPlaying]                   = useState(false);
  const [progress, setProgress]                 = useState(0);
  const [duration, setDuration]                 = useState(0);
  const [volume, setVolume]                     = useState(0.8);
  const [loading, setLoading]                   = useState(false);
  const [activeTab, setActiveTab]               = useState("home");
  const [activeGenre, setActiveGenre]           = useState(0);
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [showPlayer, setShowPlayer]             = useState(false);
  const [liked, setLiked]                       = useState<Set<string>>(new Set());
  const [shuffle, setShuffle]                   = useState(false);
  const [repeat, setRepeat]                     = useState(false);
  const [toast, setToast]                       = useState<string | null>(null);
  const [playlists, setPlaylists]               = useState<Playlist[]>([]);
  const [showNewPlaylist, setShowNewPlaylist]   = useState(false);
  const [newPlaylistName, setNewPlaylistName]   = useState("");
  const [activePlaylist, setActivePlaylist]     = useState<Playlist | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Track | null>(null);
  const [isMuted, setIsMuted]                   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 2500);
  }, []);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/auth"; return; }
      setUser(data.user);
      try {
        const { data: db } = await supabase.from("playlists").select("*").eq("user_id", data.user.id);
        if (db?.length) {
          const loaded = db.map(p => ({ id: p.id, name: p.name, tracks: p.tracks, isPublic: p.is_public, createdAt: new Date(p.created_at).getTime() }));
          setPlaylists(loaded);
          localStorage.setItem("wavely_playlists", JSON.stringify(loaded));
        } else {
          const s = localStorage.getItem("wavely_playlists");
          if (s) setPlaylists(JSON.parse(s));
        }
      } catch {
        const s = localStorage.getItem("wavely_playlists");
        if (s) setPlaylists(JSON.parse(s));
      }
    });
  }, []);

  useEffect(() => { fetchTracks(GENRES[0].tag); }, []);

  const savePlaylists = useCallback(async (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem("wavely_playlists", JSON.stringify(updated));
    if (user) {
      try {
        await supabase.from("playlists").delete().eq("user_id", user.id);
        const pub = updated.filter(p => p.isPublic);
        if (pub.length) await supabase.from("playlists").insert(pub.map(p => ({ id: p.id, name: p.name, tracks: p.tracks, is_public: p.isPublic, created_at: new Date(p.createdAt).toISOString(), user_id: user.id })));
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

  const removeFromPlaylist = (plId: string, tId: string) => {
    const updated = playlists.map(p => p.id === plId ? { ...p, tracks: p.tracks.filter(t => t.id !== tId) } : p);
    savePlaylists(updated);
    if (activePlaylist?.id === plId) setActivePlaylist(updated.find(p => p.id === plId) || null);
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
      const res  = await fetch(`https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(tag)}&limit=30`);
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

  const switchGenre = (i: number) => { setActiveGenre(i); fetchTracks(GENRES[i].tag); setActiveTab("home"); };

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
    const idx  = pool.findIndex(t => t.id === currentTrack?.id);
    if (shuffle) { setCurrentTrack(pool[Math.floor(Math.random() * pool.length)]); setPlaying(true); }
    else if (idx < pool.length - 1) { setCurrentTrack(pool[idx + 1]); setPlaying(true); }
    else setPlaying(false);
  }, [repeat, shuffle, activePlaylist, allTracks, currentTrack]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) { setProgress(audioRef.current.currentTime); setDuration(audioRef.current.duration || 0); }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
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
      else { n.add(id); showToast("❤️ Liked!"); }
      return n;
    });
  };

  const pct = duration ? (progress / duration) * 100 : 0;
  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "Listener";

  // ── Track row component ─────────────────────────────────────────────────────
  const TrackRow = ({ track, onRemove }: { track: Track; onRemove?: () => void }) => {
    const active = currentTrack?.id === track.id;
    return (
      <div className={`trow${active ? " trow-active" : ""}`} onClick={() => playTrack(track)}>
        <div className="tart-wrap">
          <img className="tart" src={track.image || fallback} alt="" onError={e => (e.target as HTMLImageElement).src = fallback} />
          {active && playing && (
            <div className="tart-ov">
              <div className="eq"><div className="eq-b"/><div className="eq-b"/><div className="eq-b"/></div>
            </div>
          )}
        </div>
        <div className="tmeta">
          <div className={`tname${active ? " ton" : ""}`}>{track.name}</div>
          <div className="tartist">{track.artist_name}</div>
        </div>
        <div className="tacts" onClick={e => e.stopPropagation()}>
          <button className={`ticonbtn${liked.has(track.id) ? " ton" : ""}`} onClick={() => toggleLike(track.id)}>
            {liked.has(track.id) ? Icons.heartFill : Icons.heart}
          </button>
          <span className="tdur">{fmt(track.duration)}</span>
          {onRemove
            ? <button className="ticonbtn" style={{ color: "#7f1d1d" }} onClick={onRemove}>{Icons.trash}</button>
            : <button className="ticonbtn" onClick={() => setShowAddToPlaylist(track)}>{Icons.dots}</button>
          }
        </div>
      </div>
    );
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="shell">
      <style>{CSS}</style>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      {/* ── FULL-PAGE PLAYER ─────────────────────────────────────────────────── */}
      {showPlayer && currentTrack && (
        <div className="player-page">
          <div className="player-page-bg" />

          {/* Header row with back button */}
          <div className="player-hdr">
            <button className="hdr-icon-btn" onClick={() => setShowPlayer(false)} style={{ color: "#9ca3af" }}>
              {Icons.back}
            </button>
            <span className="player-hdr-label">Now Playing</span>
            <button className="ticonbtn" onClick={() => setShowAddToPlaylist(currentTrack)} style={{ color: "#6b7280", padding: 8 }}>
              {Icons.dots}
            </button>
          </div>

          <div className="player-body">
            {/* Album art */}
            <img
              className="player-art"
              src={currentTrack.image || fallback}
              alt=""
              onError={e => (e.target as HTMLImageElement).src = fallback}
            />

            {/* Track info + like */}
            <div className="player-track-row">
              <div style={{ flex: 1, overflow: "hidden", marginRight: 12 }}>
                <div className="player-tname" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentTrack.name}
                </div>
                <div className="player-tartist">{currentTrack.artist_name}</div>
              </div>
              <button
                className={`ticonbtn${liked.has(currentTrack.id) ? " ton" : ""}`}
                style={{ padding: 10, flexShrink: 0 }}
                onClick={() => toggleLike(currentTrack.id)}
              >
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
            </div>

            {/* Progress bar */}
            <div className="prog-bar" onClick={handleSeek} style={{ marginBottom: 8 }}>
              <div className="prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="prog-times">
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>

            {/* Controls */}
            <div className="ctrl-row">
              <button className={`ctrl-btn${shuffle ? " c-on" : ""}`} onClick={() => setShuffle(s => !s)}>{Icons.shuffle}</button>
              <button className="ctrl-skip" onClick={() => skip(-1)}>{Icons.prev}</button>
              <button className="play-big" onClick={() => setPlaying(p => !p)}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="ctrl-skip" onClick={() => skip(1)}>{Icons.next}</button>
              <button className={`ctrl-btn${repeat ? " c-on" : ""}`} onClick={() => setRepeat(r => !r)}>{Icons.repeat}</button>
            </div>

            {/* Volume */}
            <div className="vol-row">
              <button className="ticonbtn" onClick={() => setIsMuted(m => !m)} style={{ color: "#6b7280" }}>
                {isMuted ? Icons.volumeX : Icons.volume}
              </button>
              <input
                type="range" className="vol-slider" min={0} max={1} step={0.01}
                value={isMuted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
              />
            </div>

            {/* Footer actions */}
            <div className="player-footer">
              <button className="player-footer-btn" onClick={() => { setShowPlayer(false); setShowAddToPlaylist(currentTrack); }}>
                {Icons.plus} Add to playlist
              </button>
              <button
                className="player-footer-btn"
                onClick={() => navigator.share?.({ title: currentTrack.name, text: `Listening to ${currentTrack.name} on Wavely!` })}
              >
                {Icons.share} Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div className="sb-bg" onClick={() => setSidebarOpen(false)} />
          <aside className="sb">
            <div className="sb-hdr">
              <div className="sb-brand">Wavely</div>
              {[
                { id: "home",    icon: Icons.home,    label: "Home" },
                { id: "search",  icon: Icons.search,  label: "Search" },
                { id: "library", icon: Icons.library, label: "Library" },
              ].map(it => (
                <div key={it.id} className={`sb-nav-item${activeTab === it.id ? " s-on" : ""}`}
                  onClick={() => { setActiveTab(it.id); setSidebarOpen(false); }}>
                  {it.icon}<span>{it.label}</span>
                </div>
              ))}
            </div>
            <div className="sb-lib">
              <div className="sb-lib-label">Your Library</div>
              <div className="sb-pl-item" onClick={() => { setActiveTab("liked"); setSidebarOpen(false); }}>
                <div className="sb-pl-thumb" style={{ background: "rgba(147,51,234,0.3)" }}>❤️</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd" }}>Liked Songs</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{liked.size} songs</div>
                </div>
              </div>
              {playlists.map(pl => (
                <div key={pl.id} className="sb-pl-item" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); setSidebarOpen(false); }}>
                  <div className="sb-pl-thumb">
                    {pl.tracks[0] ? <img src={pl.tracks[0].image || fallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎵"}
                  </div>
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#c4b5fd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                    <div style={{ fontSize: 11, color: "#374151" }}>{pl.isPublic ? "Public" : "Private"} · {pl.tracks.length}</div>
                  </div>
                </div>
              ))}
              {!playlists.length && <div style={{ textAlign: "center", padding: "28px 0", color: "#2d2945", fontSize: 13 }}>No playlists yet</div>}
            </div>
            <div className="sb-footer">
              <div className="sb-user">
                <div className="sb-av">{displayName[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#4b5563" }}>{displayName}</span>
              </div>
              <button className="sb-signout" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── MODALS ───────────────────────────────────────────────────────────── */}
      {showNewPlaylist && (
        <>
          <div className="modal-bg" onClick={() => setShowNewPlaylist(false)} />
          <div className="modal">
            <div className="modal-t">New Playlist</div>
            <input autoFocus className="modal-inp" placeholder="Give it a name…" value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)} onKeyDown={e => e.key === "Enter" && createPlaylist()} />
            <div className="modal-row">
              <button className="mbtn mbtn-c" onClick={() => setShowNewPlaylist(false)}>Cancel</button>
              <button className="mbtn mbtn-ok" onClick={createPlaylist}>Create</button>
            </div>
          </div>
        </>
      )}

      {showAddToPlaylist && (
        <>
          <div className="modal-bg" onClick={() => setShowAddToPlaylist(null)} />
          <div className="modal">
            <div className="modal-t">Add to Playlist</div>
            <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{showAddToPlaylist.name}</div>
            {!playlists.length ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ color: "#374151", marginBottom: 14, fontSize: 13 }}>No playlists yet</div>
                <button className="btn-p" onClick={() => { setShowAddToPlaylist(null); setShowNewPlaylist(true); }}>Create Playlist</button>
              </div>
            ) : (
              <div style={{ maxHeight: 230, overflowY: "auto", marginBottom: 12 }}>
                {playlists.map(pl => (
                  <div key={pl.id} className="pl-pick" onClick={() => addToPlaylist(pl, showAddToPlaylist)}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {pl.tracks[0] ? <img src={pl.tracks[0].image || fallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎵"}
                    </div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#e2dff0" }}>{pl.name}</div>
                      <div style={{ fontSize: 11, color: "#374151" }}>{pl.tracks.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="mbtn mbtn-c" style={{ width: "100%" }} onClick={() => setShowAddToPlaylist(null)}>Cancel</button>
          </div>
        </>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="hdr">
        <button className="hdr-icon-btn" onClick={() => setSidebarOpen(true)}>{Icons.menu}</button>
        <span className="hdr-brand">Wavely</span>
        <a href="/profile" className="hdr-avatar">{displayName[0]?.toUpperCase()}</a>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="main">

        {/* HOME */}
        {activeTab === "home" && (
          <div className="fu">
            <div className="searchbar-fake" onClick={() => setActiveTab("search")}>
              <span style={{ color: "#6b7280", display: "flex" }}>{Icons.search}</span>
              <span>Search songs, artists…</span>
            </div>
            <div className="genre-row">
              {GENRES.map((g, i) => (
                <button key={i} className={`gpill ${i === activeGenre ? "gpill-on" : "gpill-off"}`} onClick={() => switchGenre(i)}>
                  {g.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="loader"><div className="lring" /><div style={{ fontSize: 13 }}>Loading…</div></div>
            )}

            {!loading && featuredTrack && (
              <>
                <div className="slabel">Featured</div>
                <div className="feat-card">
                  <img className="feat-img" src={featuredTrack.image || fallback} alt="" onError={e => (e.target as HTMLImageElement).src = fallback} />
                  <div className="feat-body">
                    <div>
                      <div className="feat-eyebrow">Now Trending</div>
                      <div className="feat-title">{featuredTrack.name}</div>
                      <div className="feat-artist">{featuredTrack.artist_name}</div>
                    </div>
                    <button className="feat-play-btn" onClick={() => playTrack(featuredTrack)}>
                      {currentTrack?.id === featuredTrack.id && playing ? Icons.pause : Icons.play}
                      {currentTrack?.id === featuredTrack.id && playing ? "Pause" : "Play Now"}
                    </button>
                  </div>
                </div>

                <div className="slabel">{GENRES[activeGenre].label} · Popular</div>
                <div>{tracks.map(t => <TrackRow key={t.id} track={t} />)}</div>
              </>
            )}

            {!loading && !featuredTrack && (
              <div className="empty">
                <div className="empty-ico">😕</div>
                <div className="empty-t">No tracks found</div>
                <div className="empty-s">Try a different genre or check your connection</div>
                <button className="btn-p" onClick={() => fetchTracks(GENRES[activeGenre].tag)}>Try Again</button>
              </div>
            )}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <SearchTab playTrack={playTrack} currentTrack={currentTrack} playing={playing}
            liked={liked} toggleLike={toggleLike} setShowAddToPlaylist={setShowAddToPlaylist} Icons={Icons} />
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div className="fu">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f5f3ff" }}>Library</div>
              <button className="btn-p" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => setShowNewPlaylist(true)}>
                {Icons.plus} New
              </button>
            </div>
            <div className="lib-list">
              <div className="lib-card" onClick={() => setActiveTab("liked")}>
                <div className="lib-thumb" style={{ background: "rgba(124,58,237,0.3)" }}>❤️</div>
                <div>
                  <div className="lib-name">Liked Songs</div>
                  <div className="lib-sub">{liked.size} songs</div>
                </div>
              </div>
              {playlists.map(pl => (
                <div key={pl.id} className="lib-card" onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); }}>
                  <div className="lib-thumb">
                    {pl.tracks[0] ? <img src={pl.tracks[0].image || fallback} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎵"}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div className="lib-name">{pl.name}</div>
                    <div className="lib-sub">
                      {pl.isPublic ? Icons.unlock : Icons.lock}
                      {pl.isPublic ? "Public" : "Private"} · {pl.tracks.length} songs
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 2 }}>
                    <button className="ticonbtn" onClick={() => togglePublic(pl.id)}>{pl.isPublic ? Icons.unlock : Icons.lock}</button>
                    <button className="ticonbtn" style={{ color: "#7f1d1d" }} onClick={() => deletePlaylist(pl.id)}>{Icons.trash}</button>
                  </div>
                </div>
              ))}
            </div>
            {!playlists.length && (
              <div className="empty" style={{ paddingTop: 44 }}>
                <div className="empty-ico">🎵</div>
                <div className="empty-t">No playlists yet</div>
                <div className="empty-s">Create your first playlist</div>
                <button className="btn-p" onClick={() => setShowNewPlaylist(true)}>Create Playlist</button>
              </div>
            )}
          </div>
        )}

        {/* PLAYLIST VIEW */}
        {activeTab === "playlist" && activePlaylist && (
          <div className="fu">
            <button className="pl-back" onClick={() => setActiveTab("library")}>{Icons.back} Back</button>
            <div className="pl-hero">
              <div className="pl-cover">
                {activePlaylist.tracks[0] ? <img src={activePlaylist.tracks[0].image || fallback} alt="" /> : "🎵"}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="pl-label">Playlist</div>
                <div className="pl-name">{activePlaylist.name}</div>
                <div className="pl-meta">{activePlaylist.isPublic ? "🌍 Public" : "🔒 Private"} · {activePlaylist.tracks.length} songs</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 9, marginBottom: 22, flexWrap: "wrap" }}>
              {activePlaylist.tracks.length > 0 && (
                <button className="btn-p" onClick={() => { setCurrentTrack(activePlaylist.tracks[0]); setPlaying(true); }}>
                  {Icons.play} Play All
                </button>
              )}
              <button className="btn-g" onClick={() => togglePublic(activePlaylist.id)}>
                {activePlaylist.isPublic ? Icons.lock : Icons.unlock}
                {activePlaylist.isPublic ? "Make Private" : "Make Public"}
              </button>
              {activePlaylist.isPublic && (
                <button className="btn-g" onClick={() => copyPlaylistLink(activePlaylist.id)}>{Icons.copy} Copy Link</button>
              )}
            </div>
            {!activePlaylist.tracks.length ? (
              <div className="empty">
                <div className="empty-ico">🎵</div>
                <div className="empty-t">Empty playlist</div>
                <div className="empty-s">Search for songs and add them here</div>
                <button className="btn-p" onClick={() => setActiveTab("search")}>Find Music</button>
              </div>
            ) : (
              <div>{activePlaylist.tracks.map(t => <TrackRow key={t.id} track={t} onRemove={() => removeFromPlaylist(activePlaylist.id, t.id)} />)}</div>
            )}
          </div>
        )}

        {/* LIKED SONGS */}
        {activeTab === "liked" && (
          <div className="fu">
            <button className="pl-back" onClick={() => setActiveTab("library")}>{Icons.back} Back</button>
            <div className="pl-hero">
              <div className="pl-cover" style={{ background: "rgba(124,58,237,0.3)" }}>❤️</div>
              <div>
                <div className="pl-label">Collection</div>
                <div className="pl-name">Liked Songs</div>
                <div className="pl-meta">{liked.size} songs</div>
              </div>
            </div>
            {!liked.size ? (
              <div className="empty">
                <div className="empty-ico">🎵</div>
                <div className="empty-t">No liked songs</div>
                <div className="empty-s">Tap the heart on any track</div>
              </div>
            ) : (
              <div>{allTracks.filter(t => liked.has(t.id)).map(t => <TrackRow key={t.id} track={t} />)}</div>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="empty fu">
            <div className="empty-ico">🔔</div>
            <div className="empty-t">No Activity Yet</div>
            <div className="empty-s">Join live spaces to see what's happening</div>
          </div>
        )}
      </main>

      {/* ── MINI PLAYER ──────────────────────────────────────────────────────── */}
      {currentTrack && (
        <div className="mini-player" onClick={() => setShowPlayer(true)}>
          <div className="mini-prog">
            <div className="mini-prog-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="mini-body">
            <img className="mini-art" src={currentTrack.image || fallback} alt="" onError={e => (e.target as HTMLImageElement).src = fallback} />
            <div className="mini-info">
              <div className="mini-title">{currentTrack.name}</div>
              <div className="mini-artist">{currentTrack.artist_name}</div>
            </div>
            <div className="mini-ctrls" onClick={e => e.stopPropagation()}>
              <button className={`ticonbtn${liked.has(currentTrack.id) ? " ton" : ""}`} onClick={() => toggleLike(currentTrack.id)}>
                {liked.has(currentTrack.id) ? Icons.heartFill : Icons.heart}
              </button>
              <button className="mini-play" onClick={() => setPlaying(p => !p)}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <button className="ticonbtn" style={{ color: "#6b7280" }} onClick={() => skip(1)}>{Icons.next}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ────────────────────────────────────────────────────────────── */}
      {toast && <div className="toast">{toast}</div>}

      {/* ── BOTTOM NAV ───────────────────────────────────────────────────────── */}
      <nav className="bnav">
        {[
          { id: "home",     icon: Icons.home,    label: "Home" },
          { id: "search",   icon: Icons.search,  label: "Search" },
          { id: "library",  icon: Icons.library, label: "Library" },
          { id: "activity", icon: Icons.bell,    label: "Activity" },
        ].map(tab => (
          <button key={tab.id} className={`bnav-btn${activeTab === tab.id ? " b-on" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            <span>{tab.label}</span>
            <div className="bnav-dot" />
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Search component ──────────────────────────────────────────────────────────
function SearchTab({ playTrack, currentTrack, playing, liked, toggleLike, setShowAddToPlaylist, Icons }: any) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 180); }, []);

  const search = async (q?: string) => {
    const sq = q || query; if (!sq.trim()) return;
    setSearching(true); setSearched(true);
    try {
      const res  = await fetch(`https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(sq)}&limit=25`);
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

  const tags = ["Arijit Singh","Shreya Ghoshal","Bollywood 2024","Lo-Fi Hindi","Taylor Swift","The Weeknd","Bengali Songs","Punjabi Hits"];

  return (
    <div className="fu">
      <div style={{ fontSize: 20, fontWeight: 800, color: "#f5f3ff", marginBottom: 16 }}>Search</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input ref={inputRef} className="search-inp" value={query}
          onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Artists, songs, albums…" />
        <button className="btn-p" style={{ borderRadius: 13, padding: "0 18px", flexShrink: 0 }} onClick={() => search()}>Go</button>
      </div>

      {!searched && (
        <>
          <div className="slabel">Quick Search</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {tags.map(t => <button key={t} className="qtag" onClick={() => { setQuery(t); search(t); }}>{t}</button>)}
          </div>
        </>
      )}

      {searching && <div className="loader"><div className="lring" /><div style={{ fontSize: 13 }}>Searching…</div></div>}

      {searched && !searching && !results.length && (
        <div className="empty">
          <div className="empty-ico">😕</div>
          <div className="empty-t">No results</div>
          <div className="empty-s">Try a different search term</div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="slabel" style={{ marginBottom: 10 }}>{results.length} Results</div>
          {results.map((track: any) => {
            const active = currentTrack?.id === track.id;
            return (
              <div key={track.id} className={`trow${active ? " trow-active" : ""}`} onClick={() => playTrack(track)}>
                <div className="tart-wrap">
                  <img className="tart" src={track.image || fallback} alt="" onError={(e: any) => e.target.src = fallback} />
                  {active && playing && (
                    <div className="tart-ov"><div className="eq"><div className="eq-b"/><div className="eq-b"/><div className="eq-b"/></div></div>
                  )}
                </div>
                <div className="tmeta">
                  <div className={`tname${active ? " ton" : ""}`}>{track.name}</div>
                  <div className="tartist">{track.artist_name}</div>
                </div>
                <div className="tacts" onClick={(e: any) => e.stopPropagation()}>
                  <button className={`ticonbtn${liked.has(track.id) ? " ton" : ""}`} onClick={() => toggleLike(track.id)}>
                    {liked.has(track.id) ? Icons.heartFill : Icons.heart}
                  </button>
                  <span className="tdur">{fmt(track.duration)}</span>
                  <button className="ticonbtn" onClick={() => setShowAddToPlaylist(track)}>{Icons.dots}</button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
