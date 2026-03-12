import Layout from '@/components/Layout';
import ModuleCard from '@/components/ModuleCard';
import AchievementsSystem from '@/components/Achievements';
import Link from 'next/link';
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
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
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

        {/* Background Systems */}
        <div className="hidden"><AchievementsSystem /></div>
      </div>
    </Layout>
  );
}
