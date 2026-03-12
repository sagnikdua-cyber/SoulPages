import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Book, 
  Target, 
  Camera, 
  ClipboardList, 
  AlertCircle, 
  Lock, 
  LogOut,
  Menu,
  X,
  Flame,
  Smile,
  BarChart3,
  Bot,
  Award,
  ChevronLeft
} from 'lucide-react';
import WatercolorCursor from './WatercolorCursor';
import { dbService } from '@/database/db';
import { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId) {
      if (router.pathname !== '/' && router.pathname !== '/auth') {
        router.push('/auth');
      }
      return;
    }
    
    dbService.getById<User>('users', userId).then(userData => {
      if (userData) {
        setUser(userData);
      } else {
        localStorage.removeItem('soulpages_user_id');
        router.push('/auth');
      }
    });
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('soulpages_user_id');
    router.push('/');
  };

  const navLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Diary', icon: Book, href: '/diary' },
    { label: 'Goals', icon: Target, href: '/goals' },
    { label: 'Memories', icon: Camera, href: '/memories' },
    { label: 'Todo', icon: ClipboardList, href: '/todo' },
    { label: 'Mistakes', icon: AlertCircle, href: '/mistakes' },
    { label: 'Vault', icon: Lock, href: '/vault' },
    { label: 'Habits', icon: Flame, href: '/habits' },
    { label: 'Mood', icon: Smile, href: '/mood' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Coach', icon: Bot, href: '/coach' },
    { label: 'Achievements', icon: Award, href: '/achievements' },
  ];

  if (!user && router.pathname !== '/' && router.pathname !== '/auth') return null;
  if (router.pathname === '/' || router.pathname === '/auth') return <>{children}</>;

  return (
    <div className="min-h-screen bg-soul-bg text-white relative overflow-hidden">
      <WatercolorCursor />
      <Head>
        <title>{title ? `${title} | SoulPages` : 'SoulPages'}</title>
      </Head>

      {/* Background elements */}
      <div className="fixed inset-0 -z-10 animate-gradient opacity-30" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(167,139,250,0.1),transparent_50%)]" />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-premium border-r border-white/5 transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-lg overflow-hidden group-hover:border-soul-purple/50 transition-all">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <span className="text-2xl font-elegant tracking-tighter text-white uppercase italic text-shadow-glow">Soul<span className="text-soul-purple">Pages</span></span>
            </Link>
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  router.pathname === link.href 
                    ? 'bg-soul-purple/20 text-soul-purple border border-soul-purple/30 shadow-[0_0_20px_rgba(167,139,250,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                  <link.icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                    router.pathname === link.href ? 'text-soul-purple' : 'group-hover:text-soul-purple'
                  }`} />
                  <span className="font-bold tracking-tight">{link.label}</span>
                  {router.pathname === link.href && (
                    <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-soul-purple shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all group"
            >
              <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="font-bold tracking-tight">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 glass bg-soul-bg/30 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 glass rounded-xl"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {router.pathname !== '/dashboard' && (
              <button 
                onClick={() => router.back()}
                className="p-2 glass rounded-xl text-slate-400 hover:text-white hover:border-soul-purple/50 transition-all group border border-white/5"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            <div>
              <h1 className="text-4xl font-elegant text-white tracking-tight">
                {navLinks.find(l => l.href === router.pathname)?.label || 'Sanctuary'}
              </h1>
              <p className="text-sm text-soul-purple font-medium tracking-wide">
                Welcome back, {user?.username || 'Soul'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass rounded-full border-soul-gold/20">
                <div className="w-2 h-2 rounded-full bg-soul-gold animate-pulse shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
                <span className="text-xs font-bold text-soul-gold uppercase tracking-widest leading-none mt-0.5">Connected</span>
             </div>
             <div className="w-12 h-12 glass rounded-full flex items-center justify-center border border-soul-purple/30 text-soul-purple font-black shadow-lg">
                {user?.username?.[0]?.toUpperCase() || 'S'}
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
