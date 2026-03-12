import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { Habit } from '@/types';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Calendar, 
  ChevronRight, 
  BarChart3, 
  Target,
  CheckCircle2,
  Circle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<Habit>('habits');
    setHabits(all.filter(h => h.userId === userId));
  };

  const handleAddHabit = async () => {
    if (!newName.trim()) return;
    const userId = localStorage.getItem('soulpages_user_id') || '';

    const habit: Habit = {
      id: crypto.randomUUID(),
      userId,
      name: newName,
      completedDates: [],
      streak: 0,
    };

    await dbService.add('habits', habit);
    setNewName('');
    setIsAdding(false);
    fetchHabits();
  };

  const toggleHabit = async (habit: Habit) => {
    let newDates = [...habit.completedDates];
    if (newDates.includes(today)) {
      newDates = newDates.filter(d => d !== today);
    } else {
      newDates.push(today);
    }

    // Calculate Streak (Simplified)
    let streak = 0;
    const sortedDates = [...newDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let checkDate = new Date(today);
    
    for (const d of sortedDates) {
      if (d === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (d > checkDate.toISOString().split('T')[0]) {
        continue;
      } else {
        break;
      }
    }

    await dbService.put('habits', { ...habit, completedDates: newDates, streak });
    fetchHabits();
  };

  const handleDelete = async (id: string) => {
    await dbService.delete('habits', id);
    fetchHabits();
  };

  return (
    <Layout title="Habit Alchemy">
      <div className="max-w-5xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              Habit <span className="text-soul-sky">Alchemy</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Small ripples create big waves in the soul.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-10 py-5 bg-white text-soul-indigo rounded-full shadow-glow-sky font-black text-lg uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" /> Create Habit
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <AnimatePresence>
            {habits.map((h) => {
              const completedToday = h.completedDates.includes(today);
              return (
                <motion.div
                  key={h.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ animationDelay: `${Math.random() * 2}s` }}
                  className="p-10 glass-card-premium floating-card rounded-[3.5rem] shadow-2xl relative group overflow-hidden"
                >
                   <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000">
                      <BarChart3 className="w-48 h-48 text-white" />
                   </div>

                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-12">{h.name}</h3>
                        <div className="flex items-center gap-3 px-4 py-2 bg-soul-gold/10 border border-soul-gold/20 rounded-full w-fit shadow-glow-gold/10">
                           <Flame className="w-5 h-5 text-soul-gold animate-pulse" />
                           <span className="text-xs font-black text-soul-gold uppercase tracking-[0.2em]">{h.streak} DAY STREAK</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(h.id)} className="opacity-0 group-hover:opacity-100 p-3 glass-premium rounded-xl text-slate-500 hover:text-red-400 border border-white/5 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>

                   <div className="flex items-center justify-between mt-auto relative z-10">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                           <Target className="w-4 h-4" /> 
                           <span>Manifested</span>
                         </div>
                         <span className="text-xl font-black text-white italic tracking-tighter uppercase">{h.completedDates.length} Cycles</span>
                      </div>
                      <button 
                        onClick={() => toggleHabit(h)}
                        className={`w-18 h-18 p-5 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl active:scale-95 border-2 ${completedToday ? 'bg-soul-sky/20 border-soul-sky text-soul-sky shadow-glow-sky' : 'bg-white/5 border-white/10 text-slate-700 hover:border-soul-purple hover:text-soul-purple'}`}
                      >
                         {completedToday ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                      </button>
                   </div>

                   {/* Progress Visual Mini-Calendar (Last 7 days) */}
                   <div className="mt-10 flex gap-3 relative z-10">
                       {Array.from({ length: 7 }).map((_, i) => {
                         const d = new Date();
                         d.setDate(d.getDate() - (6 - i));
                         const dStr = d.toISOString().split('T')[0];
                         const isDone = h.completedDates.includes(dStr);
                         return (
                           <div key={i} className={`flex-1 h-3 rounded-full border border-white/5 transition-all duration-700 ${isDone ? 'bg-soul-sky shadow-glow-sky' : 'bg-white/5'}`} />
                         );
                       })}
                   </div>
                </motion.div>
              );
            })}
           </AnimatePresence>
        </div>

        {habits.length === 0 && (
          <div className="py-40 text-center glass-premium border-2 border-dashed border-white/5 rounded-[4rem]">
             <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 text-slate-700">
               <Target className="w-10 h-10" />
             </div>
             <p className="text-2xl text-slate-500 font-bold italic tracking-tight opacity-50 uppercase">No patterns woven yet.</p>
          </div>
        )}
      </div>

       {/* Add Habit Modal */}
       <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-soul-bg/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="glass-premium w-full max-w-lg rounded-[4rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 border border-white/10"
            >
              <h2 className="text-5xl font-elegant text-white tracking-tighter mb-10">Weave A <span className="text-soul-sky">Process</span></h2>
              <div className="space-y-8">
                 <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block ml-2">Habit Intention</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Morning Meditation"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-xl outline-none focus:ring-2 focus:ring-soul-sky/30 text-white font-medium placeholder:text-slate-700 shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleAddHabit}
                  disabled={!newName.trim()}
                  className="w-full py-6 bg-white text-soul-indigo rounded-full font-black text-2xl shadow-glow-sky hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 uppercase tracking-tighter"
                >
                  Initiate Journey
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
