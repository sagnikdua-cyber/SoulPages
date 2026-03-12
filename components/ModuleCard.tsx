import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon, Sparkles } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
  color: string;
  description: string;
  delay?: number;
}

export default function ModuleCard({ title, icon: Icon, href, color, description, delay = 0 }: ModuleCardProps) {
  const [randomDelay, setRandomDelay] = useState(0);

  useEffect(() => {
    setRandomDelay(Math.random() * 2);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="group"
    >
      <Link href={href}>
        <div 
          style={randomDelay ? { animationDelay: `${randomDelay}s` } : {}}
          className={`h-full p-10 rounded-[3rem] glass-card-premium floating-card shadow-2xl overflow-hidden relative cursor-pointer transition-all duration-500`}
        >
          {/* Background Ambient Glow */}
          <div className={`absolute -top-20 -right-20 w-64 h-64 ${color} opacity-10 blur-[80px] group-hover:opacity-30 transition-opacity duration-700`} />
          
          <div className={`w-16 h-16 ${color} bg-opacity-20 rounded-[1.5rem] flex items-center justify-center mb-10 border border-white/10 shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}>
            <Icon className="w-8 h-8 text-white drop-shadow-md" />
          </div>

          <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase italic">{title}</h3>
          <p className="text-slate-400 leading-relaxed font-medium text-lg">
            {description}
          </p>

          <div className="mt-12 flex items-center gap-2 text-sm font-black text-soul-purple opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 uppercase tracking-widest">
            Enter Sanctuary <Sparkles className="w-4 h-4" />
          </div>
          
          <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-white/10 group-hover:bg-soul-gold transition-colors duration-500 shadow-[0_0_10px_transparent] group-hover:shadow-soul-gold" />
        </div>
      </Link>
    </motion.div>
  );
}
