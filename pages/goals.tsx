import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { geminiService } from '@/services/gemini';
import { Goal } from '@/types';
import { 
  Plus, 
  Target, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [type, setType] = useState<'short' | 'long'>('short');
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<Goal>('goals');
    setGoals(all.filter(g => g.userId === userId));
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    setLoading(true);
    const userId = localStorage.getItem('soulpages_user_id') || '';

    try {
      // Get AI motivation and plan
      const plan = await geminiService.generateGoalPlan(newGoal);

      const goal: Goal = {
        id: crypto.randomUUID(),
        userId,
        text: newGoal,
        type,
        completed: false,
        createdAt: Date.now(),
        plan: plan,
      };

      await dbService.add('goals', goal);
      setNewGoal('');
      setIsAdding(false);
      fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    const updated = { ...goal, completed: !goal.completed };
    await dbService.put('goals', updated);
    if (updated.completed) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F3E8FF', '#FCE7F3', '#E0F2FE']
      });
    }
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await dbService.delete('goals', id);
    fetchGoals();
  };

  const shortTerm = goals.filter(g => g.type === 'short');
  const longTerm = goals.filter(g => g.type === 'long');

  return (
    <Layout title="My Dreams">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              My <span className="text-soul-gold">Dreams</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Turn your dreams into reality, one step at a time.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-10 py-5 bg-white text-soul-indigo rounded-full shadow-2xl font-black text-lg uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all drop-shadow-glow-gold"
          >
            <Plus className="w-6 h-6" /> New Dream
          </button>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Dreams', value: goals.length, icon: Target, color: 'text-soul-purple', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.2)]' },
            { label: 'Bloomed', value: goals.filter(g => g.completed).length, icon: Award, color: 'text-soul-gold', glow: 'shadow-[0_0_20px_rgba(253,224,71,0.2)]' },
            { label: 'Growing', value: goals.filter(g => !g.completed).length, icon: TrendingUp, color: 'text-soul-sky', glow: 'shadow-[0_0_20px_rgba(186,230,253,0.2)]' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-8 glass-card-premium floating-card rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-6 group transition-all duration-500`}>
              <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${stat.color} ${stat.glow} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Short Term */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-soul-purple/20 flex items-center justify-center border border-soul-purple/30">
                <Sparkles className="w-4 h-4 text-soul-purple" />
              </div> 
              Short Term <span className="text-soul-purple/30 font-light ml-auto">Ascent</span>
            </h2>
            <div className="space-y-6">
              {shortTerm.map((goal) => (
                <GoalItem 
                  key={goal.id} 
                  goal={goal} 
                  onToggle={() => handleToggleComplete(goal)} 
                  onDelete={() => handleDelete(goal.id)}
                  onView={() => setSelectedGoal(goal)}
                />
              ))}
              {shortTerm.length === 0 && <EmptyState type="Short Term" />}
            </div>
          </section>

          {/* Long Term */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-soul-gold/20 flex items-center justify-center border border-soul-gold/30">
                <TrendingUp className="w-4 h-4 text-soul-gold" />
              </div> 
              Long Term <span className="text-soul-gold/30 font-light ml-auto">Vision</span>
            </h2>
            <div className="space-y-6">
              {longTerm.map((goal) => (
                <GoalItem 
                  key={goal.id} 
                  goal={goal} 
                  onToggle={() => handleToggleComplete(goal)} 
                  onDelete={() => handleDelete(goal.id)}
                  onView={() => setSelectedGoal(goal)}
                />
              ))}
              {longTerm.length === 0 && <EmptyState type="Long Term" />}
            </div>
          </section>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-soul-bg/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-premium w-full max-w-xl rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 border border-white/10"
            >
              <h2 className="text-5xl font-elegant text-white tracking-tighter mb-8">Plant A <span className="text-soul-gold">New Seed</span></h2>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 mb-3 block uppercase tracking-[0.3em]">Guardian Dream</label>
                  <input 
                    type="text" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="e.g., Learn to play piano"
                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-6 text-xl outline-none focus:ring-2 focus:ring-soul-gold/30 text-white font-medium shadow-inner transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 mb-3 block uppercase tracking-[0.3em]">Celestial Timeline</label>
                  <div className="flex glass-premium p-1.5 rounded-2xl border border-white/5">
                    {['short', 'long'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t as any)}
                        className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${type === t ? 'bg-white text-soul-indigo shadow-glow-gold' : 'text-slate-500 hover:text-white'}`}
                      >
                        {t} Term
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleAddGoal}
                  disabled={loading || !newGoal.trim()}
                  className="w-full py-6 bg-white text-soul-indigo rounded-full font-black text-2xl shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 uppercase tracking-tighter"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 animate-spin" />
                      Blueprinting...
                    </div>
                  ) : 'Manifest Dream'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Details Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedGoal(null)}
              className="absolute inset-0 bg-soul-bg/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, scale: 0.9, opacity: 0 }}
              className="glass-premium w-full max-w-3xl rounded-[4rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 border border-white/10 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 glass-premium rounded-2xl flex items-center justify-center border border-white/10 text-soul-gold">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedGoal.text}</h3>
                    <p className="text-xs font-black text-soul-gold uppercase tracking-[0.3em] mt-1">{selectedGoal.type} Term Vision</p>
                  </div>
                </div>
                <button onClick={() => setSelectedGoal(null)} className="w-12 h-12 glass-premium rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-white border border-white/5">
                  <X />
                </button>
              </div>
              <div className="space-y-10">
                <div className="glass-premium p-10 rounded-[3rem] border border-soul-purple/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-soul-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="flex items-center gap-3 text-soul-purple font-black uppercase tracking-[0.2em] mb-6 text-sm">
                    <Sparkles className="w-5 h-5" /> AI Action Blueprint
                  </h4>
                  <div className="text-slate-300 whitespace-pre-wrap leading-loose text-xl font-medium tracking-tight">
                    {selectedGoal.plan || "Blueprint unavailable."}
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Rooted On</span>
                     <span className="text-sm font-bold text-white tracking-widest">{new Date(selectedGoal.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-soul-bg/50 border border-white/5">
                      <div className={`w-3 h-3 rounded-full ${selectedGoal.completed ? 'bg-soul-gold shadow-glow-gold' : 'bg-soul-purple animate-pulse shadow-glow'}`} />
                      <span className="text-xs font-black text-white uppercase tracking-widest mt-0.5">{selectedGoal.completed ? 'Fully Bloomed' : 'Growing in Grace'}</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function GoalItem({ goal, onToggle, onDelete, onView }: { goal: Goal, onToggle: () => void, onDelete: () => void, onView: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }}
      style={{ animationDelay: `${Math.random() * 2}s` }}
      className={`p-6 pl-5 rounded-[2rem] glass-card-premium floating-card flex items-center gap-6 group transition-all duration-500 relative overflow-hidden ${goal.completed ? 'opacity-50 grayscale' : ''}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${goal.completed ? 'bg-soul-gold' : 'bg-soul-purple'} opacity-50`} />
      
      <button 
        onClick={onToggle} 
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-75 border-2 ${goal.completed ? 'bg-soul-gold/20 border-soul-gold text-soul-gold shadow-glow-gold' : 'bg-white/5 border-white/10 text-slate-500 hover:border-soul-purple hover:text-soul-purple'}`}
      >
        {goal.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
      </button>

      <div className="flex-1 cursor-pointer" onClick={onView}>
        <h4 className={`text-xl font-bold text-white tracking-tight uppercase italic ${goal.completed ? 'line-through text-slate-500' : ''}`}>
          {goal.text}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase ${goal.completed ? 'bg-soul-gold/10 text-soul-gold' : 'bg-soul-purple/10 text-soul-purple'}`}>
            {goal.completed ? 'Achieved' : 'In Progress'}
          </span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{goal.type} Term Voyage</span>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
        <button onClick={onView} className="p-3 glass-premium border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={onDelete} className="p-3 glass-premium border border-white/5 rounded-xl text-slate-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="py-20 glass-premium border-2 border-dashed border-white/5 rounded-[3rem] text-center">
      <p className="text-xl text-slate-500 font-bold italic tracking-tight opacity-50">No {type} visions yet.</p>
    </div>
  );
}

function X() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
