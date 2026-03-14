import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ModuleCard from '@/components/ModuleCard';
import AchievementsSystem from '@/components/Achievements';
import Link from 'next/link';
import { dbService } from '@/database/db';
import { Streak } from '@/types';
import { 
  Book, 
  Target, 
  Camera, 
  ClipboardList, 
  AlertCircle, 
  Lock,
  Sparkles,
  Flame,
  Smile,
  BarChart3,
  Plus,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [selectedStreakId, setSelectedStreakId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStreakName, setNewStreakName] = useState('');
  const [newStreakDays, setNewStreakDays] = useState('30');

  useEffect(() => {
    fetchStreaks();
  }, []);

  const fetchStreaks = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<Streak>('streaks');
    const userStreaks = all.filter(s => s.userId === userId);
    setStreaks(userStreaks);
    if (userStreaks.length > 0 && !selectedStreakId) {
      setSelectedStreakId(userStreaks[0].id);
    }
  };

  const handleCreateStreak = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId) return;

    const newStreak: Streak = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      name: newStreakName,
      targetDays: parseInt(newStreakDays),
      startDate: new Date().toISOString().split('T')[0],
      completedDates: []
    };

    await dbService.add('streaks', newStreak);
    setNewStreakName('');
    setShowAddModal(false);
    await fetchStreaks();
    setSelectedStreakId(newStreak.id);
  };

  const handleIDidIt = async () => {
    const current = streaks.find(s => s.id === selectedStreakId);
    if (!current) return;

    const today = new Date().toISOString().split('T')[0];
    if (current.completedDates.includes(today)) return;

    const updated = {
      ...current,
      completedDates: [...current.completedDates, today]
    };

    await dbService.put('streaks', updated);
    await fetchStreaks();
  };

  const selectedStreak = streaks.find(s => s.id === selectedStreakId);

  const calculateDates = (streak: Streak) => {
    const start = new Date(streak.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + streak.targetDays - 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startCopy = new Date(start);
    startCopy.setHours(0, 0, 0, 0);

    const diffInTime = today.getTime() - startCopy.getTime();
    const currentDay = Math.floor(diffInTime / (1000 * 3600 * 24)) + 1;
    const daysLeft = Math.max(0, streak.targetDays - currentDay + 1);

    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString(),
      currentDay,
      daysLeft
    };
  };

  const modules = [
    { title: 'Digital Diary', description: 'Securely store your daily reflections with AI mood analysis.', icon: Book, color: 'bg-soul-purple', href: '/diary' },
    { title: 'Goal Setting', description: 'Break down dreams into actionable AI-powered steps.', icon: Target, color: 'bg-soul-gold', href: '/goals' },
    { title: 'Flashback Reel', description: 'Capture memories with photos and background music.', icon: Camera, color: 'bg-soul-sky', href: '/memories' },
    { title: 'Todo Reminders', description: 'Manage tasks and clear your mental space.', icon: ClipboardList, color: 'bg-soul-indigo', href: '/todo' },
    { title: 'Mistakes & Growth', description: 'Reflect on failures and gain AI-driven wisdom.', icon: AlertCircle, color: 'bg-soul-gold', href: '/mistakes' },
    { title: 'Secrets Vault', description: 'Military-grade local encryption for your truths.', icon: Lock, color: 'bg-soul-indigo', href: '/vault' },
    { title: 'Habit Tracker', description: 'Build consistency and track daily streaks.', icon: Flame, color: 'bg-soul-gold', href: '/habits' },
    { title: 'Mood Calendar', description: 'Visualize your emotional landscape over time.', icon: Smile, color: 'bg-soul-purple', href: '/mood' },
    { title: 'Life Analytics', description: 'Deep insights into your patterns and progress.', icon: BarChart3, color: 'bg-soul-sky', href: '/analytics' }
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-16">
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter mb-4 leading-tight drop-shadow-2xl">
              Hello, <span className="text-soul-gradient">Soul Traveler</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-tight">
              Every day is a new page. What will yours say?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ animationDelay: '0.5s' }}
            className="flex items-center gap-6 glass-card-premium floating-card p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-soul-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full border-2 border-soul-bg bg-soul-purple shadow-lg" />
               <div className="w-10 h-10 rounded-full border-2 border-soul-bg bg-soul-gold shadow-lg" />
               <div className="w-10 h-10 rounded-full border-2 border-soul-bg bg-soul-sky shadow-lg" />
            </div>
            <div className="relative">
              <p className="text-sm font-black text-white uppercase tracking-widest">Active Streak</p>
              <p className="text-xs text-soul-purple font-bold">5 Days Path</p>
            </div>
          </motion.div>
        </section>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {modules.map((module, idx) => (
            <ModuleCard key={idx} {...module} delay={idx * 0.1} />
          ))}
        </div>

        {/* My Streaks Section */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-5xl font-elegant text-white tracking-tighter">My <span className="text-soul-gold">Streaks</span></h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 glass-premium rounded-2xl flex items-center gap-2 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
            >
              <Plus className="w-5 h-5" /> New Streak
            </button>
          </div>

          {!selectedStreak ? (
            <div className="glass-card-premium rounded-[3rem] p-20 text-center space-y-6">
               <Flame className="w-20 h-20 text-soul-gold/20 mx-auto" />
               <p className="text-2xl text-slate-500 font-medium tracking-tight">Construct your first streak to start your journey.</p>
            </div>
          ) : (
            <div className="glass-card-premium rounded-[3.5rem] p-10 md:p-16 space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-soul-gold/5 blur-[120px] -z-10 group-hover:bg-soul-gold/10 transition-colors" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <select 
                      value={selectedStreakId || ''} 
                      onChange={(e) => setSelectedStreakId(e.target.value)}
                      className="appearance-none bg-white/5 border border-white/10 text-white text-3xl md:text-5xl font-elegant px-8 py-4 pr-16 rounded-[2rem] focus:outline-none focus:ring-2 ring-soul-gold/50 cursor-pointer hover:bg-white/10 transition-all drop-shadow-2xl"
                    >
                      {streaks.map(s => <option key={s.id} value={s.id} className="bg-soul-bg text-white">{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-soul-gold w-8 h-8 pointer-events-none" />
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    {(() => {
                      const { start, end, daysLeft } = calculateDates(selectedStreak);
                      return (
                        <>
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-black uppercase tracking-widest">
                            <span className="text-soul-gold">Start:</span> {start}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-black uppercase tracking-widest">
                            <span className="text-soul-gold">End:</span> {end}
                          </div>
                          <div className="flex items-center gap-2 text-soul-sky text-sm font-black uppercase tracking-widest bg-soul-sky/10 px-4 py-2 rounded-full border border-soul-sky/20">
                            {daysLeft} Days Remaining
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleIDidIt}
                  className="px-12 py-6 bg-white text-soul-indigo rounded-full font-black text-2xl shadow-glow-gold hover:shadow-2xl transition-all flex items-center gap-4 group/btn"
                >
                  I Did It! <CheckCircle2 className="w-8 h-8 text-soul-gold group-hover/btn:rotate-12 transition-transform" />
                </motion.button>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20 gap-4">
                {Array.from({ length: selectedStreak.targetDays }).map((_, i) => {
                  const dayNum = i + 1;
                  const { currentDay } = calculateDates(selectedStreak);
                  const isCurrent = dayNum === currentDay;
                  const dateAtDay = new Date(selectedStreak.startDate);
                  dateAtDay.setDate(dateAtDay.getDate() + i);
                  const dateStr = dateAtDay.toISOString().split('T')[0];
                  const isCompleted = selectedStreak.completedDates.includes(dateStr);
                  
                  return (
                    <div 
                      key={dayNum}
                      className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden group/cell ${
                        isCurrent 
                          ? 'bg-soul-gold/20 border-soul-gold shadow-[0_0_20px_rgba(253,224,71,0.2)] scale-110 z-10' 
                          : isCompleted 
                            ? 'bg-soul-purple/10 border-soul-purple/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className={`text-[10px] font-black tracking-tight ${isCurrent ? 'text-soul-gold' : isCompleted ? 'text-soul-purple' : 'text-slate-500'}`}>
                        {dayNum}{dayNum === 1 ? 'st' : dayNum === 2 ? 'nd' : dayNum === 3 ? 'rd' : 'th'}
                      </span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-soul-purple mt-1 drop-shadow-glow" />}
                      {isCurrent && <div className="absolute inset-x-0 bottom-0 h-1 bg-soul-gold animate-pulse" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* AI Life Coach CTA */}
        <section className="pt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ animationDelay: '1.2s' }}
            className="group relative floating-card"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-soul-purple via-soul-gold to-soul-sky rounded-[3.5rem] opacity-20 blur-xl group-hover:opacity-50 transition-opacity duration-1000" />
            <div className="glass-card-premium rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-soul-gold opacity-5 blur-3xl -z-10" />
              <div className="w-32 h-32 glass-premium rounded-full flex items-center justify-center shrink-0 border border-soul-purple/30 shadow-[0_0_30px_rgba(167,139,250,0.2)]">
                <Sparkles className="w-16 h-16 text-soul-gradient animate-pulse" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-5xl md:text-6xl font-elegant text-white mb-4 tracking-tighter">AI Mentor Is Available</h2>
                <p className="text-xl text-slate-400 mb-10 font-medium leading-relaxed max-w-2xl">
                  Need clarity on your goals or feeling overwhelmed? Consult your personal AI mentor for transcendental wisdom and guidance.
                </p>
                <Link href="/coach">
                  <span className="inline-block px-12 py-5 bg-white text-soul-indigo rounded-full font-black text-xl hover:scale-110 transition-all cursor-pointer shadow-2xl drop-shadow-glow-gold active:scale-95">
                    Enter Conversation
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Add Streak Modal */}
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
                 className="w-full max-w-xl glass-card-premium rounded-[3rem] p-10 md:p-16 border border-white/10 relative z-10 shadow-glow-purple"
               >
                  <h2 className="text-5xl font-elegant text-white mb-10 tracking-tighter">Manifest New <span className="text-soul-purple">Streak</span></h2>
                  <form onSubmit={handleCreateStreak} className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">Streak Name</label>
                        <input 
                          autoFocus
                          required
                          placeholder="e.g. Daily Meditation"
                          value={newStreakName}
                          onChange={(e) => setNewStreakName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl focus:outline-none focus:ring-2 ring-soul-purple transition-all"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">Duration (Days)</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          max="365"
                          value={newStreakDays}
                          onChange={(e) => setNewStreakDays(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl focus:outline-none focus:ring-2 ring-soul-purple transition-all"
                        />
                     </div>
                     <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-6 glass-premium text-slate-400 rounded-2xl font-bold hover:bg-white/5 transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] p-6 bg-white text-soul-indigo rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-glow-gold">Create Path</button>
                     </div>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Background Systems */}
        <div className="hidden"><AchievementsSystem /></div>
      </div>
    </Layout>
  );
}
