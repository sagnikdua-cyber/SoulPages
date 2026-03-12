import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { Memory } from '@/types';
import { Plus, X, Heart, Search, Music, Camera, Image as ImageIcon, Trash2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CelestialPlayer from '@/components/CelestialPlayer';
import MemoryCard from '@/components/MemoryCard';
import { youtubeService } from '@/services/youtube';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Memory['song'] | null>(null);
  const [songQuery, setSongQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (songQuery.trim().length > 2) {
        handleSearchSongs();
      } else if (songQuery.trim() === "") {
        setSearchResults([]);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [songQuery]);

  const fetchMemories = async () => {
    try {
      const userId = localStorage.getItem('soulpages_user_id');
      if (!userId) return;
      
      const all = await dbService.getAll<Memory>('memories');
      setMemories(all.filter(m => m.userId === userId).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (err) {
      console.error('Error fetching memories:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchSongs = async () => {
    if (!songQuery.trim()) return;
    setIsSearching(true);
    const results = await youtubeService.searchMusic(songQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId || !text.trim()) return;

    try {
      const newMemory: Memory = {
        id: crypto.randomUUID(),
        userId,
        text,
        image: image || undefined,
        song: selectedSong || undefined,
        date: new Date().toISOString(),
      };

      await dbService.add('memories', newMemory);
      fetchMemories();
      resetForm();
    } catch (err) {
      console.error('Error saving memory:', err);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setText('');
    setImage(null);
    setSelectedSong(null);
    setSearchResults([]);
    setSongQuery('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to let this memory fade?')) {
      try {
        await dbService.delete('memories', id);
        fetchMemories();
        if (activeMemoryId === id) {
          setActiveMemoryId(null);
        }
      } catch (err) {
        console.error('Error deleting memory:', err);
      }
    }
  };

  const activeMemory = memories.find(m => m.id === activeMemoryId);
  const activeVideoId = activeMemory?.song?.id || null;

  const handleVisible = useCallback((id: string) => {
    setActiveMemoryId(id);
  }, []);

  return (
    <Layout title="Memory Sanctum">
      <div className="max-w-4xl mx-auto pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
          <div className="space-y-2">
            <h1 className="text-7xl font-elegant text-white tracking-tighter">
              Memories
            </h1>
            <p className="text-soul-purple font-bold tracking-widest uppercase text-sm">
              Your Eternal Resonance
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-5 rounded-full glass border transition-all ${
                isPlaying ? 'border-soul-purple text-soul-purple' : 'border-white/10 text-slate-500'
              }`}
            >
              <Music className={isPlaying ? 'animate-pulse' : ''} />
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-5 bg-soul-purple text-white rounded-full shadow-[0_0_30px_rgba(167,139,250,0.3)] hover:scale-110 transition-transform"
            >
              <Plus />
            </button>
          </div>
        </header>

        <div className="space-y-12 px-4">
          {memories.length === 0 ? (
            <div className="py-20 text-center glass rounded-3xl border border-white/5">
              <Camera className="w-16 h-16 text-slate-700 mx-auto mb-6" />
              <p className="text-slate-500 font-bold uppercase tracking-widest">No traces found in this sanctum</p>
            </div>
          ) : (
            memories.map((m) => (
              <MemoryCard 
                key={m.id} 
                memory={m} 
                isActive={m.id === activeMemoryId}
                onVisible={handleVisible}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <CelestialPlayer 
        videoId={activeVideoId} 
        isPlaying={isPlaying && !!activeVideoId} 
      />

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-950 p-6 md:p-10 rounded-[2.5rem] w-full max-w-2xl border border-white/10 shadow-2xl my-8 h-fit max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-5xl font-elegant text-white tracking-tighter">Add Trace</h2>
                  <p className="text-soul-purple text-xs font-bold uppercase tracking-widest mt-1">Fragment of consciousness</p>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Text Input */}
                <textarea 
                  placeholder="What resonates with you today?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-white min-h-[120px] focus:outline-none focus:border-soul-purple transition-colors resize-none text-lg"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Section */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Visual Essence</p>
                    {image ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setImage(null)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-2xl hover:border-soul-purple/50 hover:bg-white/5 transition-all text-slate-500 hover:text-soul-purple"
                      >
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-bold uppercase tracking-widest">Add Photo</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* Music Section */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Ethereal Resonance</p>
                    {selectedSong ? (
                      <div className="p-4 glass rounded-2xl border border-soul-purple/30 flex items-center gap-4 relative group">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <img src={selectedSong.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">{selectedSong.title}</p>
                          <p className="text-[10px] text-soul-purple font-black uppercase tracking-widest">Selected</p>
                        </div>
                        <button 
                          onClick={() => setSelectedSong(null)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="text"
                              placeholder="Search song..."
                              value={songQuery}
                              onChange={(e) => setSongQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearchSongs()}
                              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-soul-purple text-white"
                            />
                          </div>
                          <button 
                            onClick={handleSearchSongs}
                            className="px-4 bg-soul-purple/20 text-soul-purple rounded-xl border border-soul-purple/30 hover:bg-soul-purple/30 transition-all font-bold text-xs uppercase tracking-widest"
                          >
                            Find
                          </button>
                        </div>
                        
                        <div className="max-h-[150px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                          {isSearching ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 text-soul-purple animate-spin" />
                            </div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((s) => (
                              <button 
                                key={s.id}
                                onClick={() => setSelectedSong(s)}
                                className="w-full p-2 flex items-center gap-3 hover:bg-white/5 rounded-xl text-left transition-colors group border border-transparent hover:border-white/5"
                              >
                                <div className="w-8 h-8 rounded shrink-0 overflow-hidden">
                                  <img src={s.thumbnail} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-slate-400 font-medium truncate group-hover:text-white">{s.title}</span>
                              </button>
                            ))
                          ) : songQuery.trim() !== '' && !isSearching ? (
                             <p className="text-[10px] text-center text-slate-600 uppercase font-black tracking-widest py-4">
                               Press Enter or "Find" to search
                             </p>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="w-full py-5 bg-white text-black rounded-full font-black uppercase tracking-tighter text-xl hover:bg-soul-purple hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_30px_rgba(167,139,250,0.2)]"
                >
                  Commune
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glass-premium {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(167, 139, 250, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </Layout>
  );
}
