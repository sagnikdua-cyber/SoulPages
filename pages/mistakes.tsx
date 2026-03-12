import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { geminiService } from '@/services/gemini';
import { Mistake } from '@/types';
import { 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Plus,
  CheckCircle2,
  X,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [mistakeText, setMistakeText] = useState('');
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<Mistake>('mistakes');
    setMistakes(all.filter(m => m.userId === userId));
  };

  const handleAddMistake = async () => {
    if (!mistakeText.trim() || !lesson.trim()) return;
    setLoading(true);
    const userId = localStorage.getItem('soulpages_user_id') || '';

    try {
      // Get AI reflection advice
      const advice = await geminiService.getMistakeAdvice(mistakeText, lesson);

      const mistake: Mistake = {
        id: crypto.randomUUID(),
        userId,
        mistake: mistakeText,
        lesson,
        resolved: false,
        advice: advice,
      };

      await dbService.add('mistakes', mistake);
      setMistakeText('');
      setLesson('');
      setIsAdding(false);
      fetchMistakes();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (mistake: Mistake) => {
    await dbService.put('mistakes', { ...mistake, resolved: !mistake.resolved });
    fetchMistakes();
  };

  const handleDelete = async (id: string) => {
    await dbService.delete('mistakes', id);
    fetchMistakes();
  };

  return (
    <Layout title="Mistakes in Life">
      <div className="max-w-5xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              Mistakes <span className="text-soul-gold">& Wisdom</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Failure is just the beginning of wisdom.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-20 h-20 bg-white text-soul-indigo rounded-[2.5rem] flex items-center justify-center shadow-glow-gold hover:scale-110 active:scale-95 transition-all duration-500 transform hover:-rotate-6 border-4 border-white/20"
          >
            <Plus className="w-10 h-10" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <AnimatePresence>
            {mistakes.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div 
                  style={{ animationDelay: `${Math.random() * 2.5}s` }}
                  className={`p-10 glass-card-premium floating-card rounded-[4rem] shadow-2xl relative overflow-hidden transition-all duration-700 min-h-[300px] flex flex-col justify-between ${m.resolved ? 'hover:shadow-green-400/20' : ''}`}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${m.resolved ? 'bg-green-400/30' : 'bg-soul-gold/30'}`} />
                  
                  <div>
                    <div className="flex justify-between items-start mb-10">
                      <div className={`w-14 h-14 glass-premium rounded-2xl flex items-center justify-center border border-white/10 ${m.resolved ? 'text-green-400' : 'text-soul-gold'}`}>
                        <AlertCircle className="w-7 h-7" />
                      </div>
                      <div className="flex gap-3 opacity-40 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button onClick={() => setSelectedMistake(m)} className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center text-white hover:text-soul-gold hover:border-soul-gold/20 transition-all"><Lightbulb className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(m.id)} className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center text-white hover:text-red-400 hover:border-red-400/20 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 block mb-3">The Transgression</span>
                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none group-hover:text-soul-gold transition-colors">{m.mistake}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 block mb-3">The Soul's Lesson</span>
                        <p className="text-xl text-slate-400 font-medium tracking-tight italic">"{m.lesson}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                    <button 
                      onClick={() => handleToggleResolved(m)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${m.resolved ? 'bg-green-500 text-white shadow-glow-green' : 'glass-premium border border-white/10 text-slate-500 hover:text-white'}`}
                    >
                      {m.resolved ? <><CheckCircle2 className="w-4 h-4" /> Integrated</> : <><RefreshCw className="w-4 h-4" /> Resolve In Soul</>}
                    </button>
                    <button onClick={() => setSelectedMistake(m)} className="text-[10px] font-black text-soul-gold uppercase tracking-[0.3em] hover:scale-110 transition-transform">AI Insight →</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {mistakes.length === 0 && (
          <div className="py-40 text-center glass-premium border-2 border-dashed border-white/5 rounded-[4rem]">
             <RefreshCw className="w-20 h-20 text-slate-800 mx-auto mb-10 opacity-20" />
             <p className="text-3xl text-slate-500 font-black italic tracking-tighter uppercase opacity-30">Your path is clear.</p>
          </div>
        )}
      </div>

       {/* Add Mistake Modal */}
       <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-soul-bg/90 backdrop-blur-2xl z-[150]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit glass-premium z-[160] rounded-[4rem] p-16 shadow-3xl border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setIsAdding(false)} className="w-14 h-14 glass-premium rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/5 transition-all"><X /></button>
              </div>

              <div className="flex items-center gap-6 mb-16">
                <div className="w-20 h-20 glass-premium rounded-3xl flex items-center justify-center border border-white/10 text-soul-gold shadow-glow-gold">
                  <Plus className="w-10 h-10" />
                </div>
                <h2 className="text-5xl font-elegant text-white tracking-tighter">New <span className="text-soul-gold">成長</span></h2>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">What happened?</label>
                  <textarea 
                    value={mistakeText}
                    onChange={(e) => setMistakeText(e.target.value)}
                    placeholder="Be honest with your soul..."
                    className="w-full bg-white/5 border border-white/5 rounded-[2.5rem] p-8 text-xl outline-none focus:ring-2 focus:ring-soul-gold/30 text-white font-medium placeholder:text-slate-700 min-h-[120px] resize-none shadow-inner leading-relaxed"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">The Golden Lesson</label>
                  <textarea 
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    placeholder="What has this taught you?"
                    className="w-full bg-white/5 border border-white/5 rounded-[2.5rem] p-8 text-xl outline-none focus:ring-2 focus:ring-soul-gold/30 text-white font-medium placeholder:text-slate-700 min-h-[120px] resize-none shadow-inner leading-relaxed"
                  />
                </div>
                <button 
                  onClick={handleAddMistake}
                  disabled={loading || !mistakeText.trim() || !lesson.trim()}
                  className="w-full py-8 bg-white text-soul-indigo rounded-full font-black text-3xl shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4 uppercase italic tracking-tighter"
                >
                  {loading ? <RefreshCw className="animate-spin w-10 h-10 text-soul-indigo" /> : <><Sparkles className="w-10 h-10 fill-current" /> Seek Wisdom</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Advice Modal */}
      <AnimatePresence>
        {selectedMistake && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMistake(null)}
              className="fixed inset-0 bg-soul-bg/95 backdrop-blur-3xl z-[150]"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit glass-premium z-[160] rounded-[5rem] p-20 shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-soul-gold/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-soul-gold/5 animate-pulse" />
              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-soul-gold/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 border border-soul-gold/20 shadow-glow-gold">
                  <Sparkles className="text-soul-gold w-12 h-12" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-12">Cosmic <span className="text-soul-gold">Reflection</span></h3>
                <p className="text-3xl text-slate-100 leading-[1.4] italic font-medium tracking-tight mb-16 px-4">
                  "{selectedMistake.advice || "Advice processing..."}"
                </p>
                <button 
                  onClick={() => setSelectedMistake(null)}
                  className="px-16 py-6 glass-premium border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-white/5 active:scale-95 transition-all"
                >
                  Close Sanctum
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
