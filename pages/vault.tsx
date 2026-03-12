import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dbService } from '@/database/db';
import { encryptionService } from '@/services/encryption';
import { Secret } from '@/types';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  ShieldCheck,
  Key,
  X,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VaultPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [vaultKey, setVaultKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    const userId = localStorage.getItem('soulpages_user_id');
    const all = await dbService.getAll<Secret>('secrets');
    setSecrets(all.filter(s => s.userId === userId));
  };

  const handleUnlock = () => {
    if (vaultKey.length >= 4) {
      setIsLocked(false);
    } else {
      alert("Encryption key too short (min 4 chars)");
    }
  };

  const handleAddSecret = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const userId = localStorage.getItem('soulpages_user_id') || '';

    const encrypted = encryptionService.encrypt(newContent, vaultKey);
    
    const secret: Secret = {
      id: crypto.randomUUID(),
      userId,
      title: newTitle,
      content: encrypted,
      createdAt: Date.now(),
    };

    await dbService.add('secrets', secret);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    fetchSecrets();
  };

  const toggleVisibility = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDecryptedContent = (encrypted: string) => {
    return encryptionService.decrypt(encrypted, vaultKey);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this secret?")) {
      await dbService.delete('secrets', id);
      fetchSecrets();
    }
  };

  if (isLocked) {
    return (
      <Layout title="Secrets Vault">
        <div className="flex flex-col items-center justify-center min-h-[75vh]">
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="w-full max-w-lg p-12 glass-premium floating-card rounded-[4rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] text-center space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-soul-gold/50 to-transparent" />
            
            <div className="w-24 h-24 bg-white/5 border border-white/10 text-soul-gold rounded-[2rem] flex items-center justify-center mx-auto shadow-glow-gold transition-transform hover:scale-110 duration-500">
              <Lock className="w-12 h-12" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Sanctum <span className="text-soul-gold">Locked</span></h1>
              <p className="text-slate-400 font-medium tracking-tight">Whisper your key to enter the vault of truths.</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="password" 
                  value={vaultKey}
                  onChange={(e) => setVaultKey(e.target.value)}
                  placeholder="Celestial Key"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-center text-2xl outline-none focus:ring-2 focus:ring-soul-gold/30 transition-all text-white font-medium placeholder:text-slate-600 shadow-inner"
                />
              </div>
              <button 
                onClick={handleUnlock}
                className="w-full py-6 bg-white text-soul-indigo rounded-full font-black text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow-gold"
              >
                Inhale Knowledge
              </button>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-black text-soul-purple uppercase tracking-[0.3em] leading-relaxed">
                Caution: If the key is forgotten,<br />the truths vanish into the void.
              </p>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Secrets Vault">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div>
             <div className="flex items-center gap-4 mb-3">
                <div className="p-3 glass-premium rounded-xl border border-white/10 text-soul-gold">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-6xl md:text-7xl font-elegant text-white tracking-tighter drop-shadow-2xl">
                  Secrets <span className="text-soul-purple">Vault</span>
                </h1>
             </div>
             <p className="text-xl text-slate-400 font-medium italic tracking-tight italic">"Some truths are only for the eyes of the soul."</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={() => setIsLocked(true)}
                className="p-5 glass-premium border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all active:scale-95"
              >
                <Lock className="w-6 h-6" />
              </button>
             <button 
                onClick={() => setIsAdding(true)}
                className="px-8 py-5 bg-white text-soul-indigo rounded-full shadow-glow-gold font-black text-lg uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6" /> New Secret
              </button>
          </div>
        </header>

        <div className="columns-1 md:columns-2 gap-10 space-y-10">
           <AnimatePresence>
            {secrets.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ animationDelay: `${Math.random() * 2}s` }}
                className="p-8 glass-card-premium floating-card rounded-[3rem] shadow-2xl break-inside-avoid relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-soul-purple/5 blur-[50px] rounded-full" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter pr-12 leading-none">{s.title}</h3>
                  <div className="flex gap-2 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                    <button onClick={() => toggleVisibility(s.id)} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5">
                      {visibleSecrets[s.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors border border-white/5">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-black/20 rounded-[2rem] border border-white/5 min-h-[120px] relative overflow-hidden group/content">
                  <p className={`text-xl text-slate-200 font-medium leading-relaxed transition-all duration-700 ${visibleSecrets[s.id] ? 'opacity-100 blur-0' : 'opacity-10 blur-xl select-none'}`}>
                    {visibleSecrets[s.id] ? getDecryptedContent(s.content) : "Hidden within the depths of the celestial vault..."}
                  </p>
                  {!visibleSecrets[s.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Shield className="w-10 h-10 text-soul-gold/20 animate-pulse group-hover/content:text-soul-gold/40 transition-colors" />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Archived On</span>
                     <span className="text-xs font-bold text-white tracking-widest">{new Date(s.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-soul-purple/10 border border-soul-purple/20">
                      <Key className="w-3 h-3 text-soul-purple" />
                      <span className="text-[10px] font-black text-soul-purple uppercase tracking-widest">Encrypted</span>
                   </div>
                </div>
              </motion.div>
            ))}
           </AnimatePresence>
        </div>

        {secrets.length === 0 && (
          <div className="py-40 text-center glass-premium border-2 border-dashed border-white/5 rounded-[4rem]">
             <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 text-slate-700">
               <Lock className="w-8 h-8" />
             </div>
             <p className="text-2xl text-slate-500 font-bold italic tracking-tight opacity-50 uppercase">The vault is silent.</p>
          </div>
        )}
      </div>

      {/* Add Secret Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-soul-bg/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="glass-premium w-full max-w-xl rounded-[4rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 border border-white/10"
            >
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-10">Add To <span className="text-soul-purple">The Sanctum</span></h2>
              <div className="space-y-8">
                 <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 block ml-2">Truth Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Hidden Ambition"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-xl outline-none focus:ring-2 focus:ring-soul-purple/30 text-white font-medium placeholder:text-slate-700 shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 block ml-2">The Hidden Essence</label>
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Whisper your truth here..."
                    className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-xl outline-none focus:ring-2 focus:ring-soul-purple/30 text-white font-medium placeholder:text-slate-700 min-h-[200px] resize-none shadow-inner leading-relaxed"
                  />
                </div>
                <button 
                  onClick={handleAddSecret}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="w-full py-6 bg-white text-soul-indigo rounded-full font-black text-2xl shadow-glow-purple hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 disabled:opacity-30 transition-all uppercase tracking-tighter"
                >
                  <ShieldCheck className="w-8 h-8" /> Encrypt & Seal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
