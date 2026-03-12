import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { TodoTask } from '@/types';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar,
  AlertCircle,
  Bell,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodoPage() {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<any>('medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTasks();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const fetchTasks = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<TodoTask>('tasks');
    setTasks(all.filter(t => t.userId === userId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const userId = localStorage.getItem('soulpages_user_id') || '';

    const task: TodoTask = {
      id: crypto.randomUUID(),
      userId,
      task: newTask,
      priority,
      date,
      completed: false,
    };

    await dbService.add('tasks', task);
    setNewTask('');
    fetchTasks();
    
    // Simple reminder notification if permission granted
    if (Notification.permission === "granted") {
      new Notification("New Reminder Set", {
        body: `SoulPages will remind you to: ${newTask}`,
        icon: "/heart.png"
      });
    }
  };

  const handleToggle = async (task: TodoTask) => {
    await dbService.put('tasks', { ...task, completed: !task.completed });
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await dbService.delete('tasks', id);
    fetchTasks();
  };

  const priorityColors: Record<string, string> = {
    high: 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-100',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100',
    low: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100'
  };

  return (
    <Layout title="Things to Remember">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-elegant text-white tracking-tighter drop-shadow-2xl mb-2">
              Things to <span className="text-soul-gold">Remember</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">Keep your mental space clear and focused.</p>
          </div>
          <div className="w-20 h-20 glass-premium rounded-[2.5rem] flex items-center justify-center border border-white/10 text-soul-gold shadow-glow-gold">
            <Bell className="w-10 h-10" />
          </div>
        </header>

        {/* Add Task Form */}
        <section>
          <form onSubmit={handleAddTask} className="glass-premium p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-soul-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">New Intention</label>
                <input 
                  type="text" 
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What do you want to remember?"
                  className="w-full bg-white/5 border border-white/5 rounded-3xl py-6 px-8 text-2xl outline-none focus:ring-2 focus:ring-soul-gold/30 text-white font-medium placeholder:text-slate-700 shadow-inner leading-relaxed transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Priority Level</label>
                  <div className="flex bg-black/20 p-2 rounded-2xl border border-white/5">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p as any)}
                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${priority === p ? 'bg-white text-soul-indigo shadow-glow' : 'text-slate-500 hover:text-white'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Reminder Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-soul-gold transition-colors" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-soul-gold/30"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full bg-white text-soul-indigo py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Task Lists */}
        <div className="space-y-20">
           <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center border border-soul-purple/20 text-soul-purple shadow-glow-purple/20">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Current <span className="text-soul-purple">Priorities</span></h2>
              </div>

              <div className="grid gap-6">
                <AnimatePresence>
                  {tasks.filter(t => !t.completed).map((task) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative"
                    >
                      <div 
                        style={{ animationDelay: `${Math.random() * 2}s` }}
                        className="p-8 glass-card-premium floating-card rounded-[2.5rem] shadow-xl flex items-center gap-8 group-hover:border-soul-purple/30 transition-all duration-500"
                      >
                        <button 
                          onClick={() => handleToggle(task)} 
                          className="w-12 h-12 rounded-2xl border-2 border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group-hover:border-soul-purple/40"
                        >
                          <Circle className="w-6 h-6 text-slate-600 group-hover:text-soul-purple transition-colors" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-2xl font-bold text-white tracking-tight leading-none mb-3 break-words group-hover:text-soul-purple transition-colors">{task.task}</p>
                          <div className="flex items-center gap-6">
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-glow-sky/5 ${
                              task.priority === 'high' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                              task.priority === 'medium' ? 'text-soul-gold border-soul-gold/20 bg-soul-gold/5' :
                              'text-soul-sky border-soul-sky/20 bg-soul-sky/5'
                            }`}>
                              {task.priority} Priority
                            </span>
                            <span className="text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.2em]">
                              <Calendar className="w-4 h-4 text-soul-purple/50" /> {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="p-4 glass-premium rounded-2xl text-slate-600 hover:text-red-400 transition-all border border-transparent hover:border-red-400/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {tasks.filter(t => !t.completed).length === 0 && (
                  <div className="py-20 text-center glass-premium border-2 border-dashed border-white/5 rounded-[3rem]">
                    <CheckCircle2 className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                    <p className="text-2xl text-slate-600 font-black italic tracking-tighter uppercase opacity-30">Your mind is clear.</p>
                  </div>
                )}
              </div>
           </section>

           {tasks.some(t => t.completed) && (
             <section className="space-y-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center border border-white/10 text-slate-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-500 uppercase italic tracking-tighter">Archived <span className="text-slate-400">Echoes</span></h2>
                </div>
                
                <div className="grid gap-4">
                  {tasks.filter(t => t.completed).map((task) => (
                    <div key={task.id} className="p-6 glass-premium rounded-[2rem] border border-transparent flex items-center gap-6 group grayscale hover:grayscale-0 transition-all">
                      <button onClick={() => handleToggle(task)} className="text-soul-purple">
                        <CheckCircle2 className="w-8 h-8 fill-current" />
                      </button>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-slate-500 line-through tracking-tight">{task.task}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-3 text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
             </section>
           )}
        </div>
      </div>
    </Layout>
  );
}
