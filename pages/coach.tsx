import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { geminiService } from '@/services/gemini';
import { dbService } from '@/database/db';
import { DiaryEntry, Habit } from '@/types';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ArrowLeft,
  MessageCircle,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICoachPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([{ role: 'ai', text: "Hello! I am your SoulPages Life Coach. I've been reflecting on your recent diary entries and habits. How can I support your journey today?" }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const userId = localStorage.getItem('soulpages_user_id') || '';
      const entries = await dbService.getAll<DiaryEntry>('diary');
      const userEntries = entries.filter(e => e.userId === userId).slice(-5);
      const habits = await dbService.getAll<Habit>('habits');
      const userHabits = habits.filter(h => h.userId === userId);

      const context = `Recent moods: ${userEntries.map(e => e.mood).join(', ')}. 
                       Active habits: ${userHabits.map(h => h.name).join(', ')}.`;

      const response = await geminiService.askLifeCoach(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having a moment of silence... please try again in a bit." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Life Coach">
      <div className="max-w-5xl mx-auto h-[85vh] flex flex-col space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-soul-indigo rounded-[2.5rem] flex items-center justify-center border-4 border-white/10 shadow-glow-purple group relative overflow-hidden">
               <div className="absolute inset-0 bg-soul-purple opacity-20 animate-pulse" />
               <Bot className="text-white w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-1">
                Soul <span className="text-soul-purple">Coach</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-soul-gold" /> Guidance from your digital essence.
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <div className="px-6 py-2 glass-premium rounded-full border border-soul-purple/20 flex items-center gap-3">
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-ping" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Resonating</span>
             </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 bg-black/20 rounded-[4rem] border border-white/5 shadow-inner overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-soul-purple/5 to-transparent pointer-events-none" />
          
          {/* Chat Window */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar space-y-10 relative z-10" ref={scrollRef}>
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative group max-w-[85%] md:max-w-[70%]`}>
                    <div 
                      style={{ animationDelay: `${Math.random() * 2}s` }}
                      className={`p-8 rounded-[3rem] shadow-2xl transition-all duration-500 border glass-card-premium floating-card ${
                      msg.role === 'user' 
                      ? 'bg-soul-indigo text-white border-white/10 rounded-tr-none' 
                      : 'text-slate-100 rounded-tl-none group-hover:border-soul-purple/30'
                    }`}>
                       <p className="text-lg md:text-xl font-medium leading-relaxed italic tracking-tight">{msg.text}</p>
                    </div>
                    {msg.role === 'ai' && (
                       <div className="absolute -left-4 -bottom-4 w-12 h-12 glass-premium rounded-2xl flex items-center justify-center border border-soul-purple/20 text-soul-purple shadow-glow opacity-0 group-hover:opacity-100 transition-opacity">
                         <Sparkles className="w-6 h-6" />
                       </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                   <div className="glass-premium p-6 rounded-[2rem] rounded-tl-none border border-soul-purple/20 shadow-glow-purple/5">
                      <div className="flex gap-2">
                         <div className="w-2.5 h-2.5 bg-soul-purple rounded-full animate-bounce [animation-duration:0.6s]" />
                         <div className="w-2.5 h-2.5 bg-soul-purple rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.6s]" />
                         <div className="w-2.5 h-2.5 bg-soul-purple rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.6s]" />
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-white/5 bg-white/5 backdrop-blur-3xl relative z-20">
            <div className="max-w-4xl mx-auto relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Seek perspective... What's on your soul?"
                className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-10 pr-32 text-xl outline-none focus:ring-4 focus:ring-soul-purple/20 text-white font-medium placeholder:text-slate-700 shadow-inner transition-all hover:border-white/20"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-20 h-20 bg-white text-soul-indigo rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-purple disabled:opacity-30 group"
              >
                {loading ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8 group-hover:rotate-12 transition-transform" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-black text-slate-600 uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity">
           <Info className="w-4 h-4" /> Reflections are guided by your stored essence.
        </div>
      </div>
    </Layout>
  );
}
