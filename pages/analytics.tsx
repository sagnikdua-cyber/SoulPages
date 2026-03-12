import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { DiaryEntry, Goal, Habit } from '@/types';
import { 
  Line, 
  Doughnut, 
  Bar 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Target, 
  Flame,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    moodData: [] as number[],
    moodLabels: [] as string[],
    goalsDone: 0,
    goalsTotal: 0,
    habitStreaks: [] as {name: string, streak: number}[],
    reflectionCount: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const entries = await dbService.getAll<DiaryEntry>('diary');
    const goals = await dbService.getAll<Goal>('goals');
    const habits = await dbService.getAll<Habit>('habits');

    const userEntries = entries.filter(e => e.userId === userId).slice(-7);
    const userGoals = goals.filter(g => g.userId === userId);
    const userHabits = habits.filter(h => h.userId === userId);

    setStats({
      moodData: userEntries.map(e => e.emotionalScore),
      moodLabels: userEntries.map(e => e.date),
      goalsDone: userGoals.filter(g => g.completed).length,
      goalsTotal: userGoals.length,
      habitStreaks: userHabits.map(h => ({ name: h.name, streak: h.streak })),
      reflectionCount: entries.filter(e => e.userId === userId).length
    });
  };

  const lineChartData = {
    labels: stats.moodLabels,
    datasets: [{
      label: 'Emotional Score',
      data: stats.moodData,
      borderColor: '#A855F7',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: '#A855F7',
    }]
  };

  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [stats.goalsDone, stats.goalsTotal - stats.goalsDone || 1],
      backgroundColor: ['#EC4899', '#F3F4F6'],
      borderWidth: 0,
    }]
  };

  const barData = {
    labels: stats.habitStreaks.map(h => h.name),
    datasets: [{
      label: 'Current Streak',
      data: stats.habitStreaks.map(h => h.streak),
      backgroundColor: '#3B82F6',
      borderRadius: 12,
    }]
  };

  return (
    <Layout title="Life Analytics">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              Life <span className="text-soul-gold">Analytics</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Visualize your growth and emotional patterns.</p>
          </div>
          <div className="w-20 h-20 glass-premium rounded-[2.5rem] flex items-center justify-center border border-white/10 text-soul-gold shadow-glow-gold">
            <BarChart3 className="w-10 h-10" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Total Reflections', value: stats.reflectionCount, icon: Heart, color: 'text-soul-purple', border: 'border-soul-purple/20', bg: 'bg-soul-purple/5' },
             { label: 'Goals Achieved', value: stats.goalsDone, icon: Target, color: 'text-soul-gold', border: 'border-soul-gold/20', bg: 'bg-soul-gold/5' },
             { label: 'Avg Mood Score', value: stats.moodData.length ? Math.round(stats.moodData.reduce((a,b)=>a+b,0)/stats.moodData.length) : 0, icon: TrendingUp, color: 'text-soul-sky', border: 'border-soul-sky/20', bg: 'bg-soul-sky/5' },
             { label: 'Top Habit Streak', value: Math.max(...stats.habitStreaks.map(h=>h.streak), 0), icon: Flame, color: 'text-orange-400', border: 'border-orange-400/20', bg: 'bg-orange-400/5' }
           ].map((stat, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               style={{ animationDelay: `${Math.random() * 2}s` }}
               className={`p-10 glass-card-premium floating-card rounded-[3rem] border ${stat.border} shadow-2xl relative overflow-hidden group`}
             >
                <div className={`absolute inset-0 ${stat.bg} opacity-50`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 glass-premium rounded-2xl flex items-center justify-center mb-6 border border-white/10 ${stat.color} shadow-glow`}>
                      <stat.icon className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                  <p className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</p>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Mood Trends */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={{ animationDelay: '0.5s' }}
            className="p-10 glass-card-premium floating-card rounded-[4rem] shadow-2xl relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-soul-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                     <div className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center border border-soul-purple/20 text-soul-purple shadow-glow-purple/20">
                        <TrendingUp className="w-6 h-6" />
                     </div>
                     Emotional <span className="text-soul-purple">Trends</span>
                  </h2>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">7 DAY WINDOW</span>
                </div>
                <div className="h-[350px]">
                   <Line 
                    data={{
                      ...lineChartData,
                      datasets: [{
                        ...lineChartData.datasets[0],
                        borderColor: '#A855F7',
                        backgroundColor: 'rgba(168, 85, 247, 0.05)',
                        pointBackgroundColor: '#FFF',
                        pointBorderColor: '#A855F7',
                        pointBorderWidth: 2,
                      }]
                    }} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false, 
                      scales: { 
                        y: { display: false, beginAtZero: true, max: 100 },
                        x: { display: false }
                      },
                      plugins: { legend: { display: false } }
                    }} 
                   />
                </div>
              </div>
           </motion.div>

           {/* Goals Progress */}
           <div className="grid grid-cols-1 gap-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="p-10 glass-card-premium floating-card rounded-[4rem] shadow-2xl relative overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-soul-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                         <div className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center border border-soul-gold/20 text-soul-gold shadow-glow-gold/20">
                            <Target className="w-6 h-6" />
                         </div>
                         Goal <span className="text-soul-gold">Mastery</span>
                      </h2>
                    </div>
                    <div className="flex items-center justify-around h-[250px]">
                       <div className="w-1/2 h-full relative">
                          <Doughnut 
                            data={{
                              ...doughnutData,
                              datasets: [{
                                ...doughnutData.datasets[0],
                                backgroundColor: ['#EAB308', 'rgba(255,255,255,0.05)'],
                                hoverBackgroundColor: ['#FACC15', 'rgba(255,255,255,0.1)'],
                              }]
                            }} 
                            options={{ cutout: '80%', plugins: { legend: { display: false } } }} 
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                             <p className="text-5xl font-black text-white italic tracking-tighter">{Math.round((stats.goalsDone / (stats.goalsTotal || 1)) * 100)}%</p>
                             <p className="text-[8px] font-black text-soul-gold uppercase tracking-[0.4em] mt-2">ASCENDED</p>
                          </div>
                       </div>
                       <div className="space-y-6 text-right">
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">{stats.goalsDone}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">REALIZED</p>
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">{stats.goalsTotal - stats.goalsDone}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WAITING</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="p-10 glass-card-premium floating-card rounded-[4rem] shadow-2xl relative overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-soul-sky/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                         <div className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center border border-soul-sky/20 text-soul-sky shadow-glow-sky/20">
                            <Flame className="w-6 h-6" />
                         </div>
                         Habit <span className="text-soul-sky">Streaks</span>
                      </h2>
                    </div>
                    <div className="h-[250px]">
                       <Bar 
                        data={{
                          ...barData,
                          datasets: [{
                            ...barData.datasets[0],
                            backgroundColor: '#38BDF8',
                            borderRadius: 20,
                            borderSkipped: false,
                          }]
                        }} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false, 
                          scales: { 
                            y: { display: false, beginAtZero: true },
                            x: { 
                              grid: { display: false },
                              ticks: { color: 'rgba(255,255,255,0.4)', font: { weight: 'bold', size: 10 } }
                            }
                          },
                          plugins: { legend: { display: false } }
                        }} 
                       />
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
