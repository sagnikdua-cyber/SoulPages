import React, { useRef, useEffect } from 'react';
import { Memory } from '@/types';
import { Music, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryCardProps {
  memory: Memory;
  isActive: boolean;
  onVisible: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MemoryCard({ memory, isActive, onVisible, onDelete }: MemoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(memory.id);
        }
      },
      {
        threshold: 0.6, // Trigger when 60% of the card is visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [memory.id, onVisible]);

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ animationDelay: `${Math.random() * 3}s` }}
      className={`relative p-8 rounded-3xl transition-all duration-500 glass-card-premium floating-card border ${
        isActive 
          ? 'border-soul-purple opacity-100' 
          : 'opacity-50'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border-white/5">
          <Calendar className="w-3 h-3 text-soul-purple" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            {new Date(memory.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {memory.song && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
              isActive ? 'bg-soul-purple/20 border-soul-purple text-soul-purple animate-pulse' : 'glass border-white/5 text-slate-500'
            }`}>
              <Music className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {isActive ? 'Playing' : 'Has Sound'}
              </span>
            </div>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(memory.id);
            }}
            className="p-2 glass border border-white/5 text-slate-500 hover:text-red-400 hover:border-red-400/30 rounded-full transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {memory.image && (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={memory.image} 
              alt="Memory" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <p className={`text-xl leading-relaxed transition-colors duration-500 ${
          isActive ? 'text-white' : 'text-slate-400'
        }`}>
          {memory.text}
        </p>

        {memory.song && isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 p-4 glass rounded-2xl border-white/10"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
               <img src={memory.song.thumbnail} alt={memory.song.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Now Playing</p>
               <p className="text-sm font-bold text-white truncate">{memory.song.title}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
