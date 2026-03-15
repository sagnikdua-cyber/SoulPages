import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { ProductivitySlot, ProductivityHistory } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Plus, 
  Trash2, 
  History, 
  Zap, 
  Timer,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function ProductivityPage() {
  const [slots, setSlots] = useState<ProductivitySlot[]>([]);
  const [history, setHistory] = useState<ProductivityHistory[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [currentTime, setCurrentTime] = useState(new Date());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slotsRef = useRef<ProductivitySlot[]>([]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      stopTimer();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTimer();
      } else {
        stopTimer();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.focus(); // Ensure focus
    startTimer();

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTimer();
    };
  }, []);

  const fetchData = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId) {
        window.location.href = '/auth';
        return;
    }

    const lastDate = localStorage.getItem('productivity_last_date');
    const today = new Date().toISOString().split('T')[0];

    let allSlots = await dbService.getAll<ProductivitySlot>('productivity_slots');
    allSlots = allSlots.filter(s => s.userId === userId);

    if (lastDate && lastDate !== today) {
        if (allSlots.length > 0) {
            const totalPerc = calculateOverallProgress(allSlots);
            const newHistory: ProductivityHistory = {
                id: Math.random().toString(36).substring(2, 9),
                userId,
                date: lastDate,
                totalProductivityPercentage: totalPerc,
                slotsDetails: allSlots.map(s => ({
                    name: s.name,
                    percentage: calculateSlotProgress(s)
                }))
            };
            await dbService.add('productivity_history', newHistory);

            for (const slot of allSlots) {
                slot.activeSecondsToday = 0;
                await dbService.put('productivity_slots', slot);
            }
        }
    }
    localStorage.setItem('productivity_last_date', today);

    setSlots(allSlots);
    const allHistory = await dbService.getAll<ProductivityHistory>('productivity_history');
    setHistory(allHistory.filter(h => h.userId === userId).sort((a,b) => b.date.localeCompare(a.date)));
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const now = new Date();
      const nowStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      setSlots(prev => {
        let changed = false;
        const next = prev.map(slot => {
          if (nowStr >= slot.startTime && nowStr < slot.endTime) {
            changed = true;
            return { ...slot, activeSecondsToday: slot.activeSecondsToday + 1 };
          }
          return slot;
        });
        
        if (changed) {
            // Persist periodically (every minute) or on change (optimized for demo but batched)
            // To prevent heavy writes, we only put if we really need to.
            // For now, let's just do it every 10 seconds or so, or just keep it in state and save on unmount/interval.
            if (now.getSeconds() % 5 === 0) {
                next.forEach(s => {
                    if (nowStr >= s.startTime && nowStr < s.endTime) {
                        dbService.put('productivity_slots', s);
                    }
                });
            }
        }
        return next;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId) return;

    const newSlot: ProductivitySlot = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      name: newName,
      startTime: newStart,
      endTime: newEnd,
      activeSecondsToday: 0,
      lastUpdated: new Date().toISOString()
    };

    await dbService.add('productivity_slots', newSlot);
    setNewName('');
    setShowAddModal(false);
    await fetchData();
  };

  const handleDeleteSlot = async (id: string) => {
    await dbService.delete('productivity_slots', id);
    await fetchData();
  };

  const calculateSlotProgress = (slot: ProductivitySlot) => {
    const start = slot.startTime.split(':').map(Number);
    const end = slot.endTime.split(':').map(Number);
    const totalMinutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    if (totalMinutes <= 0) return 0;
    const totalSeconds = totalMinutes * 60;
    return Math.min(100, (slot.activeSecondsToday / totalSeconds) * 100);
  };

  const calculateOverallProgress = (allSlots: ProductivitySlot[]) => {
    if (allSlots.length === 0) return 0;
    const items = allSlots.map(s => calculateSlotProgress(s));
    return items.reduce((a, b) => a + b, 0) / items.length;
  };

  const overall = calculateOverallProgress(slots);

  return (
    <Layout title="Productivity Progress">
      <div className="space-y-12 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-6xl md:text-7xl font-elegant text-white tracking-tighter mb-4">
              Pulse <span className="text-soul-sky">Tracker</span>
            </h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-sm bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <Clock className="w-4 h-4 text-soul-sky" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          
          <div className="flex items-center gap-10 bg-soul-sky/5 p-8 rounded-[2.5rem] border border-soul-sky/20">
            <div className="relative w-24 h-24">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                 <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-soul-sky" strokeDasharray={251} strokeDashoffset={251 - (251 * overall) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl">
                 {Math.round(overall)}%
               </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Overall Productivity</p>
              <p className="text-3xl font-elegant text-white">Daily Focus</p>
            </div>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex justify-between items-center">
             <h2 className="text-4xl font-elegant text-white flex items-center gap-4"><Timer className="w-8 h-8 text-soul-sky" /> Daily Slots</h2>
             <button 
               onClick={() => setShowAddModal(true)}
               className="px-8 py-4 glass-premium rounded-2xl flex items-center gap-3 text-white font-bold hover:bg-white/10 transition-all shadow-glow-sky border border-white/10"
             >
               <Plus className="w-5 h-5" /> New Slot
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {slots.length === 0 ? (
                <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 text-center">
                    <p className="text-slate-500 font-bold">No productivity slots defined for today.</p>
                </div>
            ) : (
                slots.map(slot => {
                    const progress = calculateSlotProgress(slot);
                    const now = new Date();
                    const nowStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                    const isNow = nowStr >= slot.startTime && nowStr < slot.endTime;
                    
                    return (
                        <motion.div 
                          layout
                          key={slot.id} 
                          className={`glass-card-premium p-8 rounded-[2.5rem] relative overflow-hidden group ${isNow ? 'ring-2 ring-soul-sky/50' : ''}`}
                        >
                            {isNow && <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-soul-sky/20 rounded-full border border-soul-sky/30">
                                <span className="w-2 h-2 bg-soul-sky rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-soul-sky uppercase tracking-tighter">Live Slot</span>
                            </div>}
                            
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20 shrink-0">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-soul-sky" strokeDasharray={213} strokeDashoffset={213 - (213 * progress) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">
                                        {Math.round(progress)}%
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-elegant text-white mb-1">{slot.name}</h3>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{slot.startTime} - {slot.endTime}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="p-3 text-slate-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })
            )}
          </div>
        </section>

        <section className="pt-8 space-y-8">
          <h2 className="text-4xl font-elegant text-white flex items-center gap-4"><History className="w-8 h-8 text-soul-purple" /> History Log</h2>
          <div className="space-y-4">
            {history.length === 0 ? (
                <p className="text-slate-500 italic">No historical data recorded yet.</p>
            ) : (
                history.map(h => (
                    <div key={h.id} className="glass-card-premium p-6 rounded-3xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-8">
                           <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 font-bold text-sm">{h.date}</div>
                           <p className="font-elegant text-xl text-white">Efficiency Achievement</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-2">
                                {h.slotsDetails.map((s, i) => (
                                    <div key={i} title={`${s.name}: ${Math.round(s.percentage)}%`} className="w-8 h-8 rounded-full border-2 border-soul-bg bg-soul-sky flex items-center justify-center text-[8px] font-black text-white">
                                        {s.name[0].toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <div className="font-black text-soul-sky bg-soul-sky/10 px-4 py-2 rounded-full border border-soul-sky/20 text-sm">
                                {Math.round(h.totalProductivityPercentage)}% Total
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </section>

        {/* Add Slot Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-20">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowAddModal(false)}
                 className="absolute inset-0 bg-soul-bg/80 backdrop-blur-3xl"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 30 }}
                 className="w-full max-w-xl glass-card-premium rounded-[3rem] p-10 md:p-16 border border-white/10 relative z-10 shadow-glow-sky"
               >
                  <h2 className="text-5xl font-elegant text-white mb-10 tracking-tighter">Secure Focus <span className="text-soul-sky">Slot</span></h2>
                  <form onSubmit={handleCreateSlot} className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">Focus Goal</label>
                        <input 
                          autoFocus
                          required
                          placeholder="e.g. Deep Work Session"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl focus:outline-none focus:ring-2 ring-soul-sky transition-all"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">Start Time</label>
                            <input 
                                type="time"
                                required
                                value={newStart}
                                onChange={(e) => setNewStart(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl focus:outline-none focus:ring-2 ring-soul-sky transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">End Time</label>
                            <input 
                                type="time"
                                required
                                value={newEnd}
                                onChange={(e) => setNewEnd(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl focus:outline-none focus:ring-2 ring-soul-sky transition-all"
                            />
                        </div>
                     </div>
                     <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-6 glass-premium text-slate-400 rounded-2xl font-bold hover:bg-white/5 transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] p-6 bg-white text-soul-indigo rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-glow-sky">Create Slot</button>
                     </div>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
