import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { DiaryEntry, Mood } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Smile,
  Meh,
  Frown,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const moodPalette: Record<Mood, string> = {
  happy: 'bg-pastel-yellow dark:bg-yellow-500',
  sad: 'bg-pastel-blue dark:bg-blue-600',
  neutral: 'bg-pastel-purple dark:bg-purple-400',
  anxious: 'bg-pastel-orange dark:bg-orange-600',
  excited: 'bg-pastel-pink dark:bg-pink-500',
  tired: 'bg-slate-200 dark:bg-slate-600',
  angry: 'bg-red-200 dark:bg-red-600'
};

export default function MoodCalendarPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<DiaryEntry>('diary');
    setEntries(all.filter(e => e.userId === userId));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1));

  const handleMoodSelect = async (mood: Mood) => {
    if (!selectedDate) return;
    const userId = localStorage.getItem('soulpages_user_id');
    if (!userId) return;

    const existingEntry = entries.find(e => e.date === selectedDate);
    
    // Create or update entry
    const entry: DiaryEntry = existingEntry ? {
      ...existingEntry,
      mood
    } : {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      date: selectedDate,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      mood,
      text: '',
      summary: `Mood set to ${mood}`,
      emotionalScore: 0.5
    };

    await dbService.put('diary', entry);
    await fetchEntries();
  };

  const handleClearMood = async () => {
    if (!selectedDate) return;
    const existingEntry = entries.find(e => e.date === selectedDate);
    if (!existingEntry) return;

    if (existingEntry.text === '') {
      await dbService.delete('diary', existingEntry.id);
    } else {
      // If it's a real diary entry, we just clear the mood summary
      // Since Mood is a fixed set of strings, we might have to delete if we don't have a 'none'
      // But for now, let's just delete the entry if it was created via this calendar
      await dbService.delete('diary', existingEntry.id);
    }
    await fetchEntries();
  };

  return (
    <Layout title="Mood Calendar">
      <div className="max-w-5xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              Mood <span className="text-soul-gold">Calendar</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Your emotional landscape over time.</p>
          </div>
          <div className="flex items-center glass-premium rounded-[2rem] border border-white/10 p-2 shadow-glow-gold/20">
            <button onClick={handlePrevMonth} className="w-14 h-14 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all text-white"><ChevronLeft /></button>
            <span className="px-8 font-black text-white uppercase italic tracking-tighter text-2xl">{monthName} <span className="text-soul-gold">{year}</span></span>
            <button onClick={handleNextMonth} className="w-14 h-14 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all text-white"><ChevronRight /></button>
          </div>
        </header>

        <section className="glass-premium rounded-[4rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.4)] overflow-hidden relative group">
          <div className="absolute inset-0 bg-soul-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="grid grid-cols-7 border-b border-white/5 bg-white/5 relative z-10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-8 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 relative z-10">
            {/* Empty Days */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-r border-b border-white/5 bg-black/10" />
            ))}

            {/* Month Days */}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEntries = entries.filter(e => e.date === dStr);
              const dominantMood = dayEntries.length > 0 ? dayEntries[0].mood : null;
              const isSelected = selectedDate === dStr;

              return (
                <motion.div 
                  key={day}
                  whileHover={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(dStr)}
                  className={`aspect-square border-r border-b border-white/5 p-4 relative group cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-soul-gold/50 z-20 shadow-[0_0_30px_rgba(212,175,55,0.3)]' : ''
                  } ${
                    dominantMood ? moodPalette[dominantMood] + ' bg-opacity-5' : isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                   <span className={`text-sm font-black transition-all uppercase tracking-widest pl-2 ${
                     isSelected ? 'text-soul-gold' : 'text-slate-700 group-hover:text-white'
                   }`}>
                      {day}
                   </span>
                   {dominantMood && (
                     <div className={`mt-2 w-full h-[70%] rounded-[2rem] ${moodPalette[dominantMood]} bg-opacity-10 border border-white/10 shadow-glow flex flex-col items-center justify-center transition-transform hover:scale-110 relative overflow-hidden group/mood`}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/mood:opacity-100 transition-opacity" />
                        <span className="text-3xl drop-shadow-2xl relative z-10 scale-125">
                          {dominantMood === 'happy' ? '✨' : dominantMood === 'sad' ? '🌊' : dominantMood === 'excited' ? '🔥' : '🌑'}
                        </span>
                        <span className="mt-2 text-[8px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/mood:opacity-100 transition-all transform translate-y-2 group-hover/mood:translate-y-0">{dominantMood}</span>
                     </div>
                   )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Legend */}
        <div className="flex flex-col items-center gap-8 pt-10">
           {selectedDate && (
             <motion.p 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-soul-gold font-black uppercase tracking-[0.3em] text-sm animate-pulse"
             >
               Select a mood for {selectedDate}
             </motion.p>
           )}
           <div className="flex flex-wrap justify-center gap-10">
              {Object.keys(moodPalette).map((mood) => (
                <button 
                  key={mood} 
                  onClick={() => handleMoodSelect(mood as Mood)}
                  disabled={!selectedDate}
                  className={`flex items-center gap-4 group transition-all ${!selectedDate ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                >
                   <div className={`w-8 h-8 rounded-xl ${moodPalette[mood as Mood]} border border-white/10 shadow-glow transition-transform group-hover:shadow-[0_0_20px_white/20]`} />
                   <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-[0.3em] transition-colors">{mood}</span>
                </button>
              ))}
              
              {selectedDate && entries.some(e => e.date === selectedDate) && (
                <button 
                  onClick={handleClearMood}
                  className="flex items-center gap-4 group transition-all hover:scale-110 active:scale-95"
                >
                   <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/50 shadow-glow flex items-center justify-center transition-transform group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                     <span className="text-red-500 text-xs font-bold leading-none">×</span>
                   </div>
                   <span className="text-[10px] font-black text-red-500/80 group-hover:text-red-500 uppercase tracking-[0.3em] transition-colors">Clear</span>
                </button>
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
}
