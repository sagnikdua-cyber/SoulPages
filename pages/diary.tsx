import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { geminiService } from '@/services/gemini';
import { DiaryEntry, Mood } from '@/types';
import { 
  Search, 
  Plus, 
  Mic, 
  MicOff, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ChevronLeft,
  X,
  Save,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moodEmoji: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  anxious: '😰',
  excited: '🤩',
  tired: '😴',
  angry: '😠'
};

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchEntries();
    // Setup Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setText(transcript);
      };
    }
  }, []);

  const fetchEntries = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<DiaryEntry>('diary');
    setEntries(all.filter(e => e.userId === userId).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()));
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const userId = localStorage.getItem('soulpages_user_id') || '';
    
    try {
      // AI Analysis
      const analysis = await geminiService.analyzeDiaryEntry(text);
      
      const now = new Date();
      const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        userId,
        text,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        mood: analysis.mood as Mood,
        summary: analysis.summary,
        emotionalScore: analysis.emotionalScore,
      };

      await dbService.add('diary', newEntry);
      setText('');
      setIsAdding(false);
      fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this entry?')) {
      await dbService.delete('diary', id);
      fetchEntries();
    }
  };

  const filteredEntries = entries.filter(e => 
    e.text.toLowerCase().includes(search.toLowerCase()) || 
    e.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Daily Life">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-7xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              Daily <span className="text-soul-purple">Reflections</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Capture your soul's journey, moment by moment.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-8 py-5 bg-white text-soul-indigo rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 font-black text-lg uppercase tracking-widest drop-shadow-glow-gold"
          >
            <Plus className="w-6 h-6" /> New Entry
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-soul-purple transition-colors" />
            <input 
              type="text" 
              placeholder="Search your memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-soul-bg/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] py-5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-soul-purple/30 transition-all text-white text-lg font-medium shadow-2xl"
            />
          </div>
          <div className="flex glass-premium p-1.5 rounded-[1.5rem] border border-white/5 shadow-2xl">
            <button 
              onClick={() => setView('list')}
              className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-soul-purple/20 text-soul-purple shadow-[0_0_20px_rgba(167,139,250,0.2)]' : 'text-slate-500 hover:text-white'}`}
            >
              Chronicle
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${view === 'calendar' ? 'bg-soul-purple/20 text-soul-purple shadow-[0_0_20px_rgba(167,139,250,0.2)]' : 'text-slate-500 hover:text-white'}`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ animationDelay: `${Math.random() * 2}s` }}
                className="p-8 glass-card-premium floating-card rounded-[3rem] shadow-2xl transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-soul-purple opacity-5 blur-3xl -z-10 group-hover:opacity-10 transition-opacity" />
                
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="text-5xl h-20 w-20 flex items-center justify-center glass-premium rounded-[1.5rem] border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                      {moodEmoji[entry.mood]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 text-xs font-black text-soul-purple uppercase tracking-[0.2em] mb-2">
                        <CalendarIcon className="w-3.5 h-3.5" /> {entry.date}
                        <span className="opacity-30">•</span>
                        <Clock className="w-3.5 h-3.5" /> {entry.time}
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tight line-clamp-1 group-hover:text-soul-gold transition-colors">{entry.summary}</h3>
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 glass-premium rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-3 glass-premium rounded-xl text-slate-400 hover:text-red-400 transition-colors border border-white/5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-400 leading-loose whitespace-pre-wrap text-xl font-medium tracking-tight">
                  {entry.text}
                </p>

                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-soul-purple uppercase tracking-[0.3em]">Emotional Essence</span>
                      <span className="text-[10px] font-black text-soul-gold uppercase tracking-[0.3em]">{entry.emotionalScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.emotionalScore}%` }}
                        className="h-full bg-gradient-to-r from-soul-purple via-soul-gold to-soul-sky shadow-[0_0_10px_rgba(167,139,250,0.5)]" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-2 glass-premium rounded-full border border-soul-purple/20">
                    <Sparkles className="w-4 h-4 text-soul-gold" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest mt-0.5">AI Insights Ready</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-32 glass-premium rounded-[4rem] border-2 border-dashed border-white/5">
              <BookOpen className="w-20 h-20 text-slate-700 mx-auto mb-8 opacity-50" />
              <p className="text-2xl text-slate-500 font-bold italic tracking-tight">The ink of your soul awaits. Time to reflect?</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-10 text-soul-purple font-black uppercase tracking-widest hover:text-soul-gold transition-colors flex items-center gap-2 mx-auto"
              >
                Begin Chronicle <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over for adding entry */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-soul-bg/80 backdrop-blur-xl z-[90]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-soul-bg/95 backdrop-blur-3xl z-[100] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-0 flex flex-col border-l border-white/5"
            >
              <div className="p-12 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 glass-premium rounded-2xl flex items-center justify-center border border-soul-purple/30 shadow-glow">
                    <Edit3 className="text-soul-purple w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-5xl font-elegant text-white tracking-tighter">New <span className="text-soul-purple">Page</span></h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{new Date().toDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-12 h-12 glass-premium rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-white border border-white/5">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col p-12 pt-6 space-y-8">
                <div className="flex items-center justify-between glass-premium p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-soul-gold'}`} />
                    <span className="text-xs font-black text-white uppercase tracking-widest mt-0.5">{isRecording ? 'Transmission Active' : 'Celestial Silence'}</span>
                  </div>
                  <button 
                    onClick={handleToggleRecording}
                    className={`p-4 rounded-full transition-all flex items-center gap-3 active:scale-90 ${isRecording ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                  >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>

                <div className="flex-1 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-soul-purple/10 to-soul-gold/10 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="How is your soul today? Begin your transmission..."
                    className="relative w-full h-full p-10 text-2xl bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/5 outline-none resize-none text-white focus:ring-2 focus:ring-soul-purple/20 transition-all font-medium leading-relaxed custom-scrollbar"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleSave}
                    disabled={loading || !text.trim()}
                    className="w-full py-6 bg-white text-soul-indigo rounded-full font-black text-2xl shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-30 uppercase tracking-tighter"
                  >
                    {loading ? (
                      <Sparkles className="w-8 h-8 animate-spin" />
                    ) : (
                      <><Save className="w-7 h-7" /> Seal Reflection</>
                    )}
                  </button>
                  <p className="text-center mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Encrypted Pulse • Private Sanctuary</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
