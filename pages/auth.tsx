import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService } from '@/database/db';
import { User } from '@/types';
import { Heart, User as UserIcon, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('soulpages_user_id');
    if (userId) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await dbService.getByUsername(username) as User;
        if (user && user.password === password) {
          localStorage.setItem('soulpages_user_id', user.id);
          router.push('/dashboard');
        } else {
          setError('Invalid username or password');
        }
      } else {
        const existing = await dbService.getByUsername(username);
        if (existing) {
          setError('Username already taken');
        } else {
          const newUser: User = {
            id: crypto.randomUUID(),
            username,
            password,
            createdAt: Date.now(),
          };
          await dbService.add('users', newUser);
          localStorage.setItem('soulpages_user_id', newUser.id);
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-blue/30 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <Head>
        <title>{isLogin ? 'Login' : 'Sign Up'} | SoulPages</title>
      </Head>

      {/* Decorative background */}
      <div className="absolute top-0 right-0 p-12 opacity-10">
        <Heart className="w-64 h-64 text-pastel-pink" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass dark:glass-dark rounded-[2.5rem] p-10 border border-white/50 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Heart className="text-pastel-pink fill-pastel-pink w-8 h-8" />
          </div>
          <h2 className="text-5xl font-elegant text-slate-800 dark:text-white tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join SoulPages'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {isLogin ? 'Your life. Your memories.' : 'Start your emotional journey today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-medium text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                {isLogin ? 'Login' : 'Sign Up'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-600 dark:text-slate-400 font-medium hover:text-purple-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
