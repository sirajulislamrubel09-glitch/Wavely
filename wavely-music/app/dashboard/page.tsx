import { useState, useEffect, useRef, useCallback, MouseEvent, FC } from "react";
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Volume2, 
  MoreVertical, 
  Share2, 
  Lock, 
  Unlock, 
  Trash2, 
  Music, 
  User, 
  Bell, 
  Menu, 
  ChevronRight, 
  Copy 
} from "lucide-react";

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

const GENRES = [
  { label: "Trending", tag: "trending hindi 2024" },
  { label: "Bollywood", tag: "bollywood hits" },
  { label: "Arijit Singh", tag: "arijit singh" },
  { label: "Lo-Fi", tag: "lofi hindi" },
  { label: "Romantic", tag: "romantic hindi songs" },
  { label: "Party", tag: "party songs hindi" },
  { label: "English", tag: "english pop 2024" },
  { label: "Bengali", tag: "bengali songs" },
];

export default function App() {
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Use localStorage instead of Supabase as per your decline
  useEffect(() => {
    const savedPlaylists = localStorage.getItem("wavely_playlists");
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
    const savedLiked = localStorage.getItem("wavely_liked");
    if (savedLiked) {
      setLiked(new Set(JSON.parse(savedLiked)));
    }
    fetchTracks(GENRES[0].tag);
  }, []);

  const savePlaylists = useCallback((updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem("wavely_playlists", JSON.stringify(updated));
  }, []);

  const saveLiked = useCallback((updated: Set<string>) => {
    localStorage.setItem("wavely_liked", JSON.stringify(Array.from(updated)));
  }, []);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      tracks: [],
      isPublic: false,
      createdAt: Date.now(),
    };
    savePlaylists([...playlists, newPl]);
    setNewPlaylistName("");
    setShowNewPlaylist(false);
    showToast(`✅ "${newPl.name}" created!`);
  };

  const addToPlaylist = (playlist: Playlist, track: Track) => {
    const exists = playlist.tracks.find(t => t.id === track.id);
    if (exists) { showToast("Already in playlist!"); return; }
    const updated = playlists.map(p =>
      p.id === playlist.id ? { ...p, tracks: [...p.tracks, track] } : p
    );
    savePlaylists(updated);
    setShowAddToPlaylist(null);
    showToast(`Added to "${playlist.name}"! 🎵`);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
    );
    savePlaylists(updated);
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(updated.find(p => p.id === playlistId) || null);
    }
  };

  const deletePlaylist = (id: string) => {
    savePlaylists(playlists.filter(p => p.id !== id));
    if (activePlaylist?.id === id) setActivePlaylist(null);
    showToast("Playlist deleted");
  };

  const togglePublic = (id: string) => {
    const updated = playlists.map(p =>
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    );
    savePlaylists(updated);
    const pl = updated.find(p => p.id === id);
    if (activePlaylist?.id === id) setActivePlaylist(pl || null);
    showToast(pl?.isPublic ? "🌍 Playlist is now public!" : "🔒 Playlist is now private");
  };

  const copyPlaylistLink = useCallback((id: string) => {
    const url = `${window.location.origin}/playlist/${id}`;
    navigator.clipboard?.writeText(url).then(() => showToast("🔗 Link copied!"));
  }, [showToast]);

  const fetchTracks = useCallback(async (tag: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(tag)}&limit=30`
      );
      const data = await res.json();
      const songs = data?.data?.results || [];
      const results = songs.map((s: any) => ({
        id: s.id,
        name: s.name,
        artist_name: s.artists?.primary?.[0]?.name || "Unknown",
        album_name: s.album?.name || "",
        duration: s.duration,
        audio: s.downloadUrl?.[s.downloadUrl.length - 1]?.url || "",
        image: s.image?.[s.image.length - 1]?.url || "",
      })).filter((s: any) => s.audio);

      if (results?.length > 0) {
        setFeaturedTrack(results[0]);
        setTracks(results.slice(1));
      } else {
        showToast("No tracks found 😕");
      }
    } catch {
      showToast("Failed to load. Check internet!");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const switchGenre = (idx: number) => {
    setActiveGenre(idx);
    fetchTracks(GENRES[idx].tag);
    setActiveTab("home");
  };

  useEffect(() => {
    if (!currentTrack?.audio || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = currentTrack.audio;
    audioRef.current.volume = volume;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    setPlaying(true);
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  const allTracks = featuredTrack ? [featuredTrack, ...tracks] : tracks;

  const handleEnded = useCallback(() => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }
    const pool = activePlaylist ? activePlaylist.tracks : allTracks;
    const idx = pool.findIndex(t => t.id === currentTrack?.id);
    if (shuffle) {
      const next = pool[Math.floor(Math.random() * pool.length)];
      setCurrentTrack(next);
    } else if (idx < pool.length - 1) {
      setCurrentTrack(pool[idx + 1]);
    } else {
      setPlaying(false);
    }
  }, [repeat, currentTrack, shuffle, activePlaylist, allTracks]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  }, []);

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setPlaying(p => !p);
    } else {
      setCurrentTrack(track);
    }
  };

  const skip = (dir: 1 | -1) => {
    const pool = activePlaylist ? activePlaylist.tracks : allTracks;
    const idx = pool.findIndex(t => t.id === currentTrack?.id);
    const nextIdx = idx + dir;
    if (nextIdx >= 0 && nextIdx < pool.length) {
      setCurrentTrack(pool[nextIdx]);
    }
  };

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        showToast("Removed from liked");
      } else {
        n.add(id);
        showToast("❤️ Added to liked!");
      }
      saveLiked(n);
      return n;
    });
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const imgFallback = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200&h=200";

  return (
    <div className="bg-bg-deep text-white min-h-screen flex flex-col font-sans selection:bg-primary/30">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onLoadedMetadata={handleTimeUpdate} />

      <style>{`
        @keyframes wave {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSidebarOpen(false)}>
          <div className="w-[280px] h-full bg-bg-deep border-r border-white/10 flex flex-col p-4 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Music className="text-black" size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight">Wavely</span>
             </div>

             <nav className="space-y-1 mb-8">
               {[
                 { icon: Home, label: "Home", id: "home" },
                 { icon: Search, label: "Search", id: "search" },
                 { icon: Library, label: "Library", id: "library" },
               ].map(item => (
                 <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group ${activeTab === item.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                 >
                   <item.icon size={20} className={activeTab === item.id ? "text-primary" : "group-hover:text-primary transition-colors"} />
                   <span className="font-semibold text-sm">{item.label}</span>
                 </button>
               ))}
             </nav>

             <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between px-2 mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Playlists</span>
                  <button onClick={() => setShowNewPlaylist(true)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => { setActiveTab("liked"); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-purple-500/10">
                      <Heart size={18} fill="white" className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">Liked Songs</div>
                      <div className="text-[10px] text-gray-500">{liked.size} songs</div>
                    </div>
                  </button>

                  {playlists.map(pl => (
                    <button 
                      key={pl.id} 
                      onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); setSidebarOpen(false); }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#282828] flex items-center justify-center overflow-hidden">
                        {pl.tracks[0] ? (
                          <img src={pl.tracks[0].image} className="w-full h-full object-cover" />
                        ) : (
                          <Music size={18} className="text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 text-left truncate">
                        <div className="text-sm font-semibold truncate">{pl.name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          {pl.isPublic ? <Unlock size={8} /> : <Lock size={8} />}
                          {pl.tracks.length} songs
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showNewPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-bold mb-6">New Playlist</h3>
             <input 
              value={newPlaylistName} 
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="Give your playlist a name"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors mb-6"
              autoFocus
             />
             <div className="flex gap-3">
               <button onClick={() => setShowNewPlaylist(false)} className="flex-1 p-3 rounded-xl bg-white/5 font-semibold hover:bg-white/10 transition-colors">Cancel</button>
               <button onClick={createPlaylist} className="flex-1 p-3 rounded-xl bg-primary text-black font-bold hover:opacity-90 transition-opacity">Create</button>
             </div>
          </div>
        </div>
      )}

      {showAddToPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-lg font-bold mb-1">Add to Playlist</h3>
             <p className="text-xs text-gray-500 mb-6 truncate">{showAddToPlaylist.name}</p>
             
             <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {playlists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4 text-sm">No playlists found</p>
                    <button onClick={() => { setShowAddToPlaylist(null); setShowNewPlaylist(true); }} className="text-[#ba55d3] font-bold text-sm underline">Create one</button>
                  </div>
                ) : (
                  playlists.map(pl => (
                    <button key={pl.id} onClick={() => addToPlaylist(pl, showAddToPlaylist)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="w-8 h-8 rounded-lg bg-[#282828] flex items-center justify-center">
                        <Music size={14} className="text-gray-400 group-hover:text-[#ba55d3]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{pl.name}</div>
                        <div className="text-[10px] text-gray-500">{pl.tracks.length} songs</div>
                      </div>
                    </button>
                  ))
                )}
             </div>
             <button onClick={() => setShowAddToPlaylist(null)} className="w-full p-3 rounded-xl bg-white/5 font-semibold hover:bg-white/10 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-bg-deep/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative group">
          <Menu size={24} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Wavely</h1>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary border border-white/5 cursor-pointer hover:bg-white/20 transition-colors">
          <User size={20} />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-40">
        
        {activeTab === "home" && (
          <div className="animate-in fade-in duration-500">
             {/* SEARCH BUTTON REDIRECT */}
             <div 
              onClick={() => setActiveTab("search")}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 mb-8 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
             >
                <Search size={22} className="text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-gray-400 font-medium">Search for songs, artists, or genres...</span>
             </div>

             {/* GENRES */}
             <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
                {GENRES.map((g, i) => (
                  <button 
                    key={i} 
                    onClick={() => switchGenre(i)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex-shrink-0 ${activeGenre === i ? "bg-primary text-black shadow-lg shadow-purple-500/20" : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5"}`}
                  >
                    {g.label}
                  </button>
                ))}
             </div>

             {loading ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="font-medium">Finding the best beats...</p>
               </div>
             ) : (
               <>
                 {featuredTrack && (
                   <div className="relative group cursor-pointer overflow-hidden rounded-3xl mb-10 shadow-2xl shadow-black/40" onClick={() => playTrack(featuredTrack)}>
                      <div className="aspect-[16/9] md:aspect-[21/9]">
                        <img 
                          src={featuredTrack.image} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <span className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-2 drop-shadow-md">Trending Now</span>
                        <h2 className="text-3xl md:text-5xl font-black mb-2 line-clamp-2 leading-tight">{featuredTrack.name}</h2>
                        <p className="text-gray-300 mb-6 font-medium text-lg">{featuredTrack.artist_name}</p>
                        <div className="flex items-center gap-4">
                           <button className="bg-primary text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-primary/30">
                             {currentTrack?.id === featuredTrack.id && playing ? <Pause fill="black" size={28} /> : <Play fill="black" size={28} />}
                           </button>
                           <button className="bg-white/20 backdrop-blur-md p-4 rounded-2xl hover:bg-white/30 transition-colors">
                             <Heart size={24} className={liked.has(featuredTrack.id) ? "fill-primary text-primary" : ""} />
                           </button>
                        </div>
                      </div>
                   </div>
                 )}

                 <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold">New Discoveries</h3>
                    <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                      See All <ChevronRight size={16} />
                    </button>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                    {tracks.map(track => (
                      <TrackRow 
                        key={track.id} 
                        track={track}
                        currentTrack={currentTrack}
                        playing={playing}
                        playTrack={playTrack}
                        toggleLike={toggleLike}
                        liked={liked}
                        setShowAddToPlaylist={setShowAddToPlaylist}
                        formatTime={formatTime}
                        imgFallback={imgFallback}
                      />
                    ))}
                 </div>
               </>
             )}
          </div>
        )}

        {activeTab === "search" && (
          <SearchComponent 
            playTrack={playTrack} 
            currentTrack={currentTrack} 
            playing={playing} 
            formatTime={formatTime} 
            imgFallback={imgFallback} 
            liked={liked} 
            toggleLike={toggleLike} 
            setShowAddToPlaylist={setShowAddToPlaylist} 
          />
        )}

        {activeTab === "library" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-3xl font-black">Your Library</h2>
                <button onClick={() => setShowNewPlaylist(true)} className="bg-[#ba55d3] text-black px-6 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-[#ba55d3]/20 hover:scale-105 active:scale-95 transition-all">
                  + Create
                </button>
             </div>

             {playlists.length === 0 ? (
               <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Plus size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Build your collection</h3>
                  <p className="text-gray-400 mb-8 max-w-[240px] mx-auto">Create a playlist and start adding your favorite tracks</p>
                  <button onClick={() => setShowNewPlaylist(true)} className="px-8 py-3 rounded-2xl bg-white text-black font-bold hover:opacity-90 transition-opacity">Let's Go</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                  {playlists.map(pl => (
                    <div 
                      key={pl.id} 
                      onClick={() => { setActivePlaylist(pl); setActiveTab("playlist"); }}
                      className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-300 group shadow-lg shadow-black/20"
                    >
                       <div className="w-20 h-20 rounded-2xl bg-[#282828] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg shadow-black/40">
                         {pl.tracks[0] ? (
                           <img src={pl.tracks[0].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                           <Music size={32} className="text-gray-500" />
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-xl font-bold mb-1 truncate">{pl.name}</div>
                         <div className="text-gray-500 text-sm font-medium flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              {pl.isPublic ? <Unlock size={12} /> : <Lock size={12} />}
                              {pl.isPublic ? "Public" : "Private"}
                            </span>
                            <span>•</span>
                            <span>{pl.tracks.length} track{pl.tracks.length !== 1 ? 's' : ''}</span>
                         </div>
                       </div>
                       <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                            <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {activeTab === "playlist" && activePlaylist && (
          <div className="animate-in fade-in duration-500">
             <button onClick={() => setActiveTab("library")} className="text-gray-400 font-bold text-sm mb-6 flex items-center gap-2 hover:text-white transition-colors">
               <ChevronRight className="rotate-180" size={18} /> Back to Library
             </button>

             <div className="flex flex-col md:flex-row gap-8 mb-10 items-end">
                <div className="w-60 h-60 rounded-[40px] bg-gradient-to-br from-[#282828] to-[#111] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xl shadow-black/80">
                  {activePlaylist.tracks[0] ? (
                    <img src={activePlaylist.tracks[0].image} className="w-full h-full object-cover" />
                  ) : (
                    <Music size={80} className="text-gray-700" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[#ba55d3] font-black text-xs uppercase tracking-widest mb-3">Playlist</div>
                  <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">{activePlaylist.name}</h1>
                  <div className="flex items-center gap-6 text-gray-400 font-bold text-sm">
                    <span className="flex items-center gap-2">
                       {activePlaylist.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                       {activePlaylist.isPublic ? "Public" : "Private"}
                    </span>
                    <span>{activePlaylist.tracks.length} tracks</span>
                    {activePlaylist.isPublic && (
                      <button onClick={() => copyPlaylistLink(activePlaylist.id)} className="flex items-center gap-2 text-[#ba55d3] hover:underline">
                        <Copy size={16} /> Copy share link
                      </button>
                    )}
                  </div>
                </div>
             </div>

             <div className="flex gap-4 mb-10">
                {activePlaylist.tracks.length > 0 && (
                  <button 
                    onClick={() => { setCurrentTrack(activePlaylist.tracks[0]); setPlaying(true); }}
                    className="bg-[#ba55d3] text-black px-10 py-4 rounded-[20px] font-black text-lg flex items-center gap-3 shadow-2xl shadow-[#ba55d3]/40 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play fill="black" size={24} /> Play All
                  </button>
                )}
                <button 
                  onClick={() => togglePublic(activePlaylist.id)}
                  className="bg-white/5 border border-white/10 px-8 py-4 rounded-[20px] font-bold text-sm flex items-center gap-3 hover:bg-white/10 transition-colors"
                >
                   {activePlaylist.isPublic ? <Lock size={20} /> : <Unlock size={20} />}
                   Make {activePlaylist.isPublic ? "Private" : "Public"}
                </button>
             </div>

             <div className="space-y-1">
                {activePlaylist.tracks.map((track, i) => (
                  <div key={track.id} className="group relative">
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-gray-700 font-black text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <TrackRow 
                          track={track} 
                          showMenu={false}
                          currentTrack={currentTrack}
                          playing={playing}
                          playTrack={playTrack}
                          toggleLike={toggleLike}
                          liked={liked}
                          setShowAddToPlaylist={setShowAddToPlaylist}
                          formatTime={formatTime}
                          imgFallback={imgFallback}
                        />
                      </div>
                      <button 
                        onClick={() => removeFromPlaylist(activePlaylist.id, track.id)}
                        className="p-3 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === "liked" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="relative overflow-hidden rounded-[40px] mb-12 p-10 bg-gradient-to-br from-[#ba55d3] to-[#6a0dad] shadow-2xl shadow-purple-500/20">
                <div className="absolute -right-20 -bottom-20 opacity-10">
                   <Heart size={300} fill="white" />
                </div>
                <h1 className="text-5xl font-black mb-4">Liked Songs</h1>
                <p className="text-white/80 font-bold text-lg">{liked.size} tracks saved</p>
             </div>

             {liked.size === 0 ? (
               <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/5">
                 <Heart size={60} className="mx-auto mb-6 text-gray-700" />
                 <h3 className="text-xl font-bold mb-2">No likes yet</h3>
                 <p className="text-gray-500">Songs you heart will appear here</p>
               </div>
             ) : (
               <div className="space-y-1">
                  {allTracks.filter(t => liked.has(t.id)).map(track => (
                    <TrackRow 
                      key={track.id} 
                      track={track}
                      currentTrack={currentTrack}
                      playing={playing}
                      playTrack={playTrack}
                      toggleLike={toggleLike}
                      liked={liked}
                      setShowAddToPlaylist={setShowAddToPlaylist}
                      formatTime={formatTime}
                      imgFallback={imgFallback}
                    />
                  ))}
               </div>
             )}
          </div>
        )}

        {/* ACTIVITY - Placeholder */}
        {activeTab === "activity" && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in zoom-in-95">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <Bell size={40} className="text-gray-600" />
             </div>
             <h2 className="text-2xl font-black mb-2">Everything's Quiet</h2>
             <p className="text-gray-500 max-w-xs font-medium">Follow artists or creators to see their latest updates here.</p>
          </div>
        )}
      </main>

      {/* PLAYER */}
      {currentTrack && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-50">
           {/* Mini Player */}
           <div 
            onClick={() => setShowPlayer(true)}
            className="bg-[#1e1e1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex items-center gap-4 shadow-2xl cursor-pointer hover:bg-[#252525] transition-all group"
           >
              <img 
                src={currentTrack.image} 
                className="w-14 h-14 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform" 
              />
              <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate pr-2">{currentTrack.name}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{currentTrack.artist_name}</div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setPlaying(!playing)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all">
                    {playing ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
                 </button>
                 <button onClick={() => skip(1)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                    <SkipForward size={20} fill="currentColor" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FULL PLAYER MODAL */}
      {showPlayer && currentTrack && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col p-8 animate-in slide-in-from-bottom duration-500">
           <button onClick={() => setShowPlayer(false)} className="self-start p-2 hover:bg-white/10 rounded-full mb-8">
              <ChevronRight className="rotate-90" size={32} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
              <img 
                src={currentTrack.image} 
                className="w-full aspect-square rounded-[40px] object-cover shadow-2xl shadow-black mb-12"
                onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} 
              />
              
              <div className="w-full mb-10 flex items-center justify-between">
                 <div className="min-w-0 pr-6">
                    <h2 className="text-4xl font-black mb-2 truncate leading-tight">{currentTrack.name}</h2>
                    <p className="text-xl text-gray-400 font-bold">{currentTrack.artist_name}</p>
                 </div>
                 <button onClick={() => toggleLike(currentTrack.id)} className={`p-4 rounded-[20px] bg-white/5 transition-colors ${liked.has(currentTrack.id) ? "text-[#ba55d3]" : "text-gray-500"}`}>
                   <Heart size={32} fill={liked.has(currentTrack.id) ? "currentColor" : "none"} />
                 </button>
              </div>

              <div className="w-full mb-12">
                 <div className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer mb-3 group" onClick={handleSeek}>
                    <div className="absolute h-full bg-[#ba55d3] rounded-full" style={{ width: `${(progress / duration) * 100}%` }} />
                    <div className="absolute h-4 w-4 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${(progress / duration) * 100}%` }} />
                 </div>
                 <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                 </div>
              </div>

              <div className="w-full flex items-center justify-between mb-16">
                 <button className={`p-2 transition-colors ${shuffle ? "text-[#ba55d3]" : "text-gray-500"}`} onClick={() => setShuffle(!shuffle)}><Shuffle size={24} /></button>
                 <button onClick={() => skip(-1)} className="p-2 text-white hover:text-[#ba55d3] transition-colors"><SkipBack size={40} fill="currentColor" /></button>
                 <button 
                  onClick={() => setPlaying(!playing)} 
                  className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                 >
                    {playing ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" className="ml-1" />}
                 </button>
                 <button onClick={() => skip(1)} className="p-2 text-white hover:text-[#ba55d3] transition-colors"><SkipForward size={40} fill="currentColor" /></button>
                 <button className={`p-2 transition-colors ${repeat ? "text-[#ba55d3]" : "text-gray-500"}`} onClick={() => setRepeat(!repeat)}><Repeat size={24} /></button>
              </div>

              <div className="w-full flex items-center gap-6">
                 <Volume2 size={24} className="text-gray-500" />
                 <input 
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
                  className="flex-1 accent-[#ba55d3]"
                 />
              </div>
           </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-40">
        {[
          { id: "home", icon: Home, label: "Home" },
          { id: "search", icon: Search, label: "Search" },
          { id: "library", icon: Library, label: "Library" },
          { id: "activity", icon: Bell, label: "Activity" },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <tab.icon size={22} className={activeTab === tab.id ? "text-[#ba55d3] scale-110" : ""} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* TOAST */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-white text-black px-8 py-3 rounded-2xl font-bold text-sm shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}

interface SearchProps {
  playTrack: (track: Track) => void;
  currentTrack: Track | null;
  playing: boolean;
  formatTime: (s: number) => string;
  imgFallback: string;
  liked: Set<string>;
  toggleLike: (id: string) => void;
  setShowAddToPlaylist: (track: Track) => void;
}

interface TrackRowProps {
  track: Track;
  showMenu?: boolean;
  currentTrack: Track | null;
  playing: boolean;
  playTrack: (track: Track) => void;
  toggleLike: (id: string) => void;
  liked: Set<string>;
  setShowAddToPlaylist: (track: Track) => void;
  formatTime: (s: number) => string;
  imgFallback: string;
}

const TrackRow: FC<TrackRowProps> = ({ 
  track, 
  showMenu = true, 
  currentTrack, 
  playing, 
  playTrack, 
  toggleLike, 
  liked, 
  setShowAddToPlaylist, 
  formatTime, 
  imgFallback 
}) => {
  return (
    <div
      onClick={() => playTrack(track)}
      className="group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-200"
      style={{
        backgroundColor: currentTrack?.id === track.id ? "rgba(186, 85, 211, 0.1)" : "transparent",
      }}
    >
      <div className="relative flex-shrink-0 w-12 h-12">
        <img 
          src={track.image || imgFallback} 
          alt={track.name} 
          className="w-full h-full rounded-md object-cover" 
          onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} 
        />
        {currentTrack?.id === track.id && playing && (
          <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center">
            <div className="flex gap-1 items-end h-4">
              {[0, 1, 2].map(j => (
                <div key={j} className="w-1 bg-[#ba55d3] rounded-full animate-wave" style={{ animationDelay: `${j * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm truncate ${currentTrack?.id === track.id ? "text-[#ba55d3]" : "text-white"}`}>
          {track.name}
        </div>
        <div className="text-xs text-gray-400 truncate">{track.artist_name}</div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => toggleLike(track.id)} 
          className={`transition-colors duration-200 ${liked.has(track.id) ? "text-[#ba55d3]" : "text-gray-500 hover:text-white"}`}
        >
          <Heart size={18} fill={liked.has(track.id) ? "currentColor" : "none"} />
        </button>
        <span className="text-xs text-gray-400 w-10 text-right">{formatTime(track.duration)}</span>
        {showMenu && (
          <button onClick={() => setShowAddToPlaylist(track)} className="text-gray-500 hover:text-white">
            <MoreVertical size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function SearchComponent({ 
  playTrack, 
  currentTrack, 
  playing, 
  formatTime, 
  imgFallback, 
  liked, 
  toggleLike, 
  setShowAddToPlaylist 
}: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const search = async (q?: string) => {
    const sq = q || query;
    if (!sq.trim()) return;
    setSearching(true); setSearched(true);
    try {
      const res = await fetch(`https://jiosaavn-api-qefh.onrender.com/api/search/songs?query=${encodeURIComponent(sq)}&limit=40`);
      const data = await res.json();
      const songs = data?.data?.results || [];
      const results = songs.map((s: any) => ({
        id: s.id,
        name: s.name,
        artist_name: s.artists?.primary?.[0]?.name || "Unknown",
        album_name: s.album?.name || "",
        duration: s.duration,
        audio: s.downloadUrl?.[s.downloadUrl.length - 1]?.url || "",
        image: s.image?.[s.image.length - 1]?.url || "",
      })).filter((s: any) => s.audio);
      setResults(results);
    } catch { 
      setResults([]); 
    } finally { 
      setSearching(false); 
    }
  };

  const categories = [
    { name: "Bollywood", color: "from-pink-500 to-rose-700" },
    { name: "Punjabi", color: "from-amber-400 to-orange-600" },
    { name: "Global", color: "from-blue-500 to-indigo-700" },
    { name: "Lo-Fi", color: "from-purple-500 to-indigo-900" },
    { name: "Romantic", color: "from-red-500 to-pink-700" },
    { name: "Retro", color: "from-cyan-500 to-blue-700" }
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-400">
       <h2 className="text-3xl font-black mb-8 px-2">Explore</h2>
       <div className="relative mb-10 group">
          <input 
            ref={inputRef} 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="What do you want to listen to?"
            className="w-full bg-white/5 border-2 border-white/5 rounded-3xl p-6 text-xl font-bold placeholder:text-gray-600 focus:outline-none focus:border-[#ba55d3] focus:bg-white/10 transition-all duration-300"
          />
          <button onClick={() => search()} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-[#ba55d3] text-black rounded-2xl font-black hover:scale-105 active:scale-95 transition-all">
            Find
          </button>
       </div>

       {!searched && (
         <>
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 px-2">Browse categories</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div 
                  key={cat.name} 
                  onClick={() => { setQuery(cat.name); search(cat.name); }}
                  className={`aspect-square md:aspect-[4/3] rounded-3xl bg-gradient-to-br ${cat.color} p-6 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xl group`}
                >
                   <span className="text-2xl font-black drop-shadow-md">{cat.name}</span>
                   <Music className="absolute -right-4 -bottom-4 text-white/10 group-hover:text-white/20 transition-colors" size={100} />
                </div>
              ))}
           </div>
         </>
       )}

       {searching && (
         <div className="flex flex-col items-center py-20 animate-pulse">
            <Music size={60} className="text-[#ba55d3] mb-6" />
            <p className="font-bold text-gray-500">Searching the sonic universe...</p>
         </div>
       )}

       {searched && !searching && results.length === 0 && (
         <div className="text-center py-20 bg-white/5 rounded-[40px]">
            <Search size={60} className="mx-auto mb-6 text-gray-700" />
            <h3 className="text-xl font-bold mb-2">No echoes found</h3>
            <p className="text-gray-500">Try searching for something else</p>
         </div>
       )}

       {results.length > 0 && (
         <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
               <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Top results</h3>
               <button onClick={() => setSearched(false)} className="text-[#ba55d3] text-xs font-bold hover:underline">Clear</button>
            </div>
            <div className="grid grid-cols-1 gap-1">
               {results.map(track => (
                 <TrackRow 
                    key={track.id} 
                    track={track}
                    currentTrack={currentTrack}
                    playing={playing}
                    playTrack={playTrack}
                    toggleLike={toggleLike}
                    liked={liked}
                    setShowAddToPlaylist={setShowAddToPlaylist}
                    formatTime={formatTime}
                    imgFallback={imgFallback}
                 />
               ))}
            </div>
         </div>
       )}
    </div>
  );
}
