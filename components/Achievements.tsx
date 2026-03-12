import { useState, useEffect } from 'react';
import { dbService } from '@/database/db';
import { Achievement, DiaryEntry, Goal, Habit, Memory } from '@/types';
import { Award, Star, Zap, Heart, Target, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BADGES = [
  { id: 'first_entry', title: 'Soul Awakened', desc: 'First diary entry saved', icon: Heart, color: 'text-pink-500 bg-pink-50' },
  { id: 'goals_10', title: 'Dream Weaver', desc: '10 goals completed', icon: Target, color: 'text-blue-500 bg-blue-50' },
  { id: 'streak_30', title: 'Unstoppable Spirit', desc: '30 day habit streak', icon: Zap, color: 'text-orange-500 bg-orange-50' },
  { id: 'memories_100', title: 'Life Curator', desc: '100 memories saved', icon: Music, color: 'text-purple-500 bg-purple-50' },
];

export default function AchievementsSystem() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  const [randomDelays, setRandomDelays] = useState<number[]>([]);

  useEffect(() => {
    checkAchievements();
    setRandomDelays(BADGES.map(() => Math.random() * 2));
  }, []);

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
  };

  const checkAchievements = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId) return;

    const existing = await dbService.getAll<Achievement>('achievements');
    const userUnlocked = existing.filter(a => a.userId === userId).map(a => a.badgeId);
    setUnlocked(userUnlocked);

    // Criteria Check
    const entries = await dbService.getAll<DiaryEntry>('diary');
    const goals = await dbService.getAll<Goal>('goals');
    const habits = await dbService.getAll<Habit>('habits');
    const memories = await dbService.getAll<Memory>('memories');

    const userEntries = entries.filter(e => e.userId === userId);
    const userGoalsDone = goals.filter(g => g.userId === userId && g.completed);
    const userMaxStreak = Math.max(...habits.filter(h => h.userId === userId).map(h => h.streak), 0);
    const userMemories = memories.filter(m => m.userId === userId);

    const checks = [
      { id: 'first_entry', met: userEntries.length >= 1 },
      { id: 'goals_10', met: userGoalsDone.length >= 10 },
      { id: 'streak_30', met: userMaxStreak >= 30 },
      { id: 'memories_100', met: userMemories.length >= 100 },
    ];

    for (const check of checks) {
      if (check.met && !userUnlocked.includes(check.id)) {
        const ach: Achievement = {
          id: generateUUID(),
          userId,
          badgeId: check.id,
          unlockedAt: Date.now()
        };
        await dbService.add('achievements', ach);
        setUnlocked(prev => [...prev, check.id]);
        setNewlyUnlocked(check.id);
        setTimeout(() => setNewlyUnlocked(null), 5000);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BADGES.map((badge, idx) => {
          const isUnlocked = unlocked.includes(badge.id);
          const delay = randomDelays[idx] || 0;
          return (
            <div 
              key={badge.id} 
              style={{ animationDelay: `${delay}s` }}
              className={`p-6 rounded-[2rem] transition-all floating-card glass-card-premium ${isUnlocked ? 'opacity-100 shadow-xl' : 'opacity-40 grayscale'}`}
            >
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isUnlocked ? badge.color : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                  <badge.icon className="w-7 h-7" />
               </div>
               <h3 className="text-lg font-bold dark:text-white capitalize">{badge.title}</h3>
               <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">{badge.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Unlock Notification Popup */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] p-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[2rem] shadow-2xl flex items-center gap-6 border-4 border-purple-500"
          >
             <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                <Star className="text-white w-8 h-8 fill-current" />
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Achievement Unlocked</p>
                <h4 className="text-xl font-black">{BADGES.find(b => b.id === newlyUnlocked)?.title}</h4>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
