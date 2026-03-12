import Layout from '@/components/Layout';
import AchievementsSystem from '@/components/Achievements';
import { Award } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <Layout title="Soul Achievements">
      <div className="max-w-6xl mx-auto space-y-12">
        <header>
           <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-purple-500/20">
                 <Award className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold dark:text-white">Soul Achievements</h1>
           </div>
           <p className="text-slate-500 font-medium">Celebrate your consistency and emotional breakthroughs.</p>
        </header>

        <AchievementsSystem />
      </div>
    </Layout>
  );
}
