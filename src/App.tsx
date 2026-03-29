import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  History, 
  User, 
  Calendar, 
  Lightbulb, 
  ArrowUpRight,
  X,
  Loader2,
  Database,
  Copy,
  Share2,
  Check,
  ArrowUp,
  Hash,
  Sparkles,
  Github
} from 'lucide-react';
import { AIInsight } from './types';

export default function App() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [newEntry, setNewEntry] = useState<Partial<AIInsight>>({
    aifact: '',
    aifactinsight: '',
    contributor: '',
    date: new Date().toISOString().split('T')[0],
    practicalUsage: ''
  });

  useEffect(() => {
    fetchInsights();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchInsights = async () => {
    try {
      // Fetching directly from the public folder (the "magic" from your other project)
      // This allows the archive to show up on Vercel deployments.
      const response = await fetch('/aiinsightdiary.json');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      if (response.ok) {
        await fetchInsights();
        setIsModalOpen(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
        setNewEntry({
          aifact: '',
          aifactinsight: '',
          contributor: '',
          date: new Date().toISOString().split('T')[0],
          practicalUsage: ''
        });
      }
    } catch (error) {
      console.error('Failed to submit insight:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleShare = async (item?: AIInsight) => {
    const shareData = {
      title: item ? `AI Insight: ${item.aifact}` : 'AI Insight Hub',
      text: item 
        ? `${item.aifact}: ${item.aifactinsight}` 
        : 'Documenting the evolution of artificial intelligence through community-driven insights.',
      url: window.location.origin
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      const textToCopy = item 
        ? `${item.aifact}: ${item.aifactinsight}` 
        : 'AI Insight Hub: Documenting the evolution of artificial intelligence.';
      handleCopy(textToCopy, item ? item.aifact : 'Hub Link');
    }
  };

  const getTags = (text: string) => {
    const keywords = ['llm', 'robot', 'agent', 'model', 'gpu', 'data', 'ethics', 'safety', 'vision', 'audio', 'video'];
    return keywords.filter(k => text.toLowerCase().includes(k)).map(k => `#${k}`);
  };

  const filteredInsights = insights.filter(item => 
    item.aifact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.aifactinsight.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contributor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Leaderboard Logic
  const leaderboard = Object.entries(
    insights.reduce((acc, curr) => {
      acc[curr.contributor] = (acc[curr.contributor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const topContributor = leaderboard[0];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Liquid Background */}
      <div className="atmosphere" />
      
      {/* Header */}
      <header className="p-8 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#00F0FF]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">Community Archive v2.0</span>
          </div>
          <h1 className="text-5xl font-serif italic tracking-tighter gradient-text flex items-center gap-3">
            AI Insight Hub
            <Sparkles className="text-accent animate-pulse" size={24} />
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={16} />
            <input 
              type="text" 
              placeholder="Query the ledger..."
              className="glass-input rounded-full py-3 pl-12 pr-6 text-sm font-mono w-72 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative px-6 py-3 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-alt opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
              <Plus size={16} />
              Contribute
            </div>
          </button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 glass-card rounded-[2.5rem] p-10 flex flex-col justify-center"
          >
            <h2 className="text-3xl font-serif italic mb-6 leading-tight">
              Documenting the <span className="text-accent">Collective Intelligence</span> of our Era.
            </h2>
            <p className="text-lg font-light leading-relaxed opacity-80 mb-8">
              AI Insight Hub is a community-owned collective dedicated to capturing the rapid evolution of artificial intelligence. 
              We believe that the history of AI belongs to everyone. 
              Whether you're a researcher, a developer, or a curious observer, your insights help build a transparent, decentralized record of humanity's greatest technological leap.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 group"
              >
                <span className="text-sm font-bold uppercase tracking-widest">Join the Initiative</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            id="protocol"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 glass-card rounded-[2.5rem] p-10 flex flex-col scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-accent" />
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] opacity-50">Community Protocol</h3>
            </div>
            <div className="space-y-6 flex-1">
              <a 
                href="https://github.com/sharathchandran2001/ai-insight-hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex gap-4 group/item cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full glass-input flex items-center justify-center shrink-0 text-xs font-mono border-accent/30 text-accent group-hover/item:border-accent group-hover/item:bg-accent/10 transition-all">01</div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 group-hover/item:text-accent transition-colors">Fork the Ledger</h4>
                  <p className="text-xs opacity-60 leading-relaxed">Access our public GitHub repository and fork the core JSON database.</p>
                </div>
              </a>
              <a 
                href="https://github.com/sharathchandran2001/ai-insight-hub/edit/main/public/aiinsightdiary.json" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex gap-4 group/item cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full glass-input flex items-center justify-center shrink-0 text-xs font-mono border-accent/30 text-accent group-hover/item:border-accent group-hover/item:bg-accent/10 transition-all">02</div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 group-hover/item:text-accent transition-colors">Append Insight</h4>
                  <p className="text-xs opacity-60 leading-relaxed">Add your AI fact following our schema in <code className="bg-white/5 px-1 rounded">aiinsightdiary.json</code>.</p>
                </div>
              </a>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full glass-input flex items-center justify-center shrink-0 text-xs font-mono border-accent/30 text-accent">03</div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Pull Request</h4>
                  <p className="text-xs opacity-60 leading-relaxed">Submit a PR to have your contribution verified and merged into the live archive.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[10px] font-mono opacity-40 leading-relaxed">
                * Contributions are permanent and attributed to your GitHub alias.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main id="archive" className="flex-1 px-8 pb-8 z-10 scroll-mt-24">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-serif italic">Historical Archive</h2>
          <div className="h-px flex-1 mx-8 bg-white/5" />
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <Database size={12} />
            Live Neural Feed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-container">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-40">
              <Loader2 className="animate-spin text-accent mb-6" size={48} />
              <p className="font-mono text-xs uppercase tracking-[0.5em] opacity-40">Accessing Neural Core...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredInsights.map((item, idx) => (
                <motion.div 
                  key={item.aifact + idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="glass-card card-3d rounded-3xl p-8 group relative overflow-hidden"
                >
                  {/* Liquid Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6 card-3d-inner">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Calendar size={12} className="text-accent" />
                        <span className="text-[10px] font-mono opacity-60">{item.date}</span>
                      </div>
                      {getTags(item.aifact + ' ' + item.aifactinsight).map(tag => (
                        <div key={tag} className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/5 border border-accent/10 text-[9px] font-mono text-accent uppercase tracking-tighter">
                          <Hash size={8} />
                          {tag.slice(1)}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <User size={12} />
                      <span className="text-[10px] font-mono">@{item.contributor}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4 group-hover:text-accent transition-colors leading-tight card-3d-inner-deep">
                    {item.aifact}
                  </h3>
                  
                  <p className="text-sm leading-relaxed opacity-70 mb-6 font-light card-3d-inner">
                    {item.aifactinsight}
                  </p>

                  {item.practicalUsage && (
                    <div className="pt-6 border-t border-white/5 space-y-2 card-3d-inner">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 font-bold">
                        <Lightbulb size={12} className="text-accent" />
                        Practical Usage
                      </div>
                      <p className="text-xs italic opacity-60 leading-relaxed">
                        {item.practicalUsage}
                      </p>
                    </div>
                  )}
                  
                  <div className="absolute bottom-6 right-6 flex items-center gap-3 card-3d-inner">
                    <button 
                      onClick={() => handleCopy(`${item.aifact}: ${item.aifactinsight}`, item.aifact)}
                      className="p-2 rounded-full hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-40 hover:!opacity-100"
                      title="Copy to clipboard"
                    >
                      {copyStatus === item.aifact ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                    <button 
                      onClick={() => handleShare(item)}
                      className="p-2 rounded-full hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-40 hover:!opacity-100"
                      title="Share insight"
                    >
                      <Share2 size={16} />
                    </button>
                    <ArrowUpRight className="opacity-0 group-hover:opacity-20 transition-opacity" size={24} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {!loading && filteredInsights.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center mb-8 relative">
              <Database size={48} className="opacity-20" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-accent/20"
              />
            </div>
            <h3 className="text-2xl font-serif italic mb-2">No Records Found</h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 max-w-xs leading-relaxed">
              The neural archive has no data matching your current query. Try broadening your search.
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-8 px-6 py-2 rounded-full border border-white/10 hover:border-accent/40 text-[10px] font-mono uppercase tracking-widest transition-colors"
            >
              Reset Search
            </button>
          </motion.div>
        )}

        {/* Leaderboard & Stats Section */}
        <section className="mt-12 perspective-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 glass-card card-3d rounded-[2.5rem] p-10"
            >
              <div className="flex items-center justify-between mb-8 card-3d-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <History size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif italic">Contributor Leaderboard</h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Top minds in the neural archive</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono opacity-60">Total Nodes:</span>
                  <span className="text-xs font-bold text-accent">{insights.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 card-3d-inner">
                {leaderboard.map(([name, count], idx) => (
                  <motion.div 
                    key={name}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card rounded-2xl p-6 flex items-center justify-between group hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-ink/10 flex items-center justify-center overflow-hidden">
                          <User size={16} />
                        </div>
                        {idx === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center shadow-[0_0_10px_#00F0FF]">
                            <ArrowUpRight size={8} className="text-black" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold group-hover:text-accent transition-colors">@{name}</p>
                        <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{count} Contributions</p>
                      </div>
                    </div>
                    <div className="text-xl font-serif italic opacity-10 group-hover:opacity-30 transition-opacity">
                      0{idx + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-4 glass-card card-3d rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group"
            >
              {/* Liquid Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent-alt/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 space-y-6 card-3d-inner">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-2">
                  <Plus size={24} className="text-accent" />
                </div>
                <h3 className="text-2xl font-serif italic leading-tight card-3d-inner-deep">
                  Most Active <span className="text-accent">Neural Contributor</span>
                </h3>
                {topContributor ? (
                  <div className="space-y-2 card-3d-inner">
                    <p className="text-4xl font-bold tracking-tighter">@{topContributor[0]}</p>
                    <p className="text-sm font-mono opacity-60 uppercase tracking-widest">
                      Dominating the ledger with {topContributor[1]} entries
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-mono opacity-40 italic">Awaiting first contribution...</p>
                )}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 rounded-xl bg-ink text-bg text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors card-3d-inner"
                >
                  Surpass the Leader
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full glass-card flex items-center justify-center hover:text-accent transition-colors shadow-2xl"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[100] px-8 py-4 glass-card rounded-2xl border-accent/30 flex items-center gap-4 shadow-[0_0_50px_rgba(0,240,255,0.2)]"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Check size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold">Contribution Received</p>
              <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Node successfully added to archive</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-8 z-10 space-y-6">
        <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Lightbulb size={20} className="text-accent" />
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest mb-2 opacity-50">Educational & Open Source Disclaimer</h4>
              <p className="text-[11px] leading-relaxed opacity-60 font-light">
                This project is an open-source educational initiative. The insights and facts contained within this ledger are contributed by the community and are provided for informational purposes only. While we strive for accuracy, the AI Insight Hub does not guarantee the validity of any specific entry. Contributions are subject to community review. Use of this data is at your own risk. This project is not affiliated with any specific AI laboratory or corporate entity.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex justify-between items-center px-8">
          <div className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500" /> System Online</span>
            <span>Archive Size: {insights.length} Nodes</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <a href="#protocol" className="hover:text-accent transition-colors">Protocol</a>
            <a href="#archive" className="hover:text-accent transition-colors">Neural Net</a>
            <a 
              href="https://github.com/sharathchandran2001/ai-insight-hub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors flex items-center gap-2"
            >
              <Github size={12} />
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Contribution Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative glass-card w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif italic">New Archive Node</h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Contribute to the collective intelligence</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-10 h-10 rounded-full glass-input flex items-center justify-center hover:text-accent transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                {/* <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono tracking-widest opacity-40 ml-1">Contributor ID</label>
                      <span className="text-[9px] font-mono opacity-30">{(newEntry.contributor?.length || 0)}/30</span>
                    </div>
                    <input 
                      required
                      maxLength={30}
                      type="text" 
                      placeholder="neural_alias"
                      className="w-full glass-input rounded-2xl p-4 text-sm font-mono outline-none"
                      value={newEntry.contributor}
                      onChange={e => setNewEntry({...newEntry, contributor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest opacity-40 ml-1">Discovery Date</label>
                    <input 
                      required
                      type="date" 
                      className="w-full glass-input rounded-2xl p-4 text-sm font-mono outline-none"
                      value={newEntry.date}
                      onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                    />
                  </div>
                </div> */}

                {/* <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-widest opacity-40 ml-1">Breakthrough Event</label>
                    <span className="text-[9px] font-mono opacity-30">{(newEntry.aifact?.length || 0)}/120</span>
                  </div>
                  <input 
                    required
                    maxLength={120}
                    type="text" 
                    placeholder="What happened in the AI space?"
                    className="w-full glass-input rounded-2xl p-4 text-sm outline-none"
                    value={newEntry.aifact}
                    onChange={e => setNewEntry({...newEntry, aifact: e.target.value})}
                  />
                </div> */}

                {/* <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-widest opacity-40 ml-1">Deep Implication</label>
                    <span className="text-[9px] font-mono opacity-30">{(newEntry.aifactinsight?.length || 0)}/600</span>
                  </div>
                  <textarea 
                    required
                    maxLength={600}
                    rows={3}
                    placeholder="Analyze the long-term impact..."
                    className="w-full glass-input rounded-2xl p-4 text-sm outline-none resize-none"
                    value={newEntry.aifactinsight}
                    onChange={e => setNewEntry({...newEntry, aifactinsight: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-widest opacity-40 ml-1">Practical Application</label>
                    <span className="text-[9px] font-mono opacity-30">{(newEntry.practicalUsage?.length || 0)}/300</span>
                  </div>
                  <input 
                    maxLength={300}
                    type="text" 
                    placeholder="How can this be utilized?"
                    className="w-full glass-input rounded-2xl p-4 text-sm outline-none"
                    value={newEntry.practicalUsage}
                    onChange={e => setNewEntry({...newEntry, practicalUsage: e.target.value})}
                  />
                </div> */}

                {/* <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full relative group h-16 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-alt opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-white">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpRight size={20} />}
                    Commit to Archive
                  </div>
                </button> */}

                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                    <span className="bg-[#050505] px-4 opacity-30">or</span>
                  </div>
                </div> */}

                <a 
                  href="https://github.com/sharathchandran2001/ai-insight-hub/edit/main/public/aiinsightdiary.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-16 rounded-2xl border border-white/10 hover:bg-white/5 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-[0.2em] transition-all group"
                >
                  <Github size={20} className="group-hover:scale-110 transition-transform" />
                  Initiate GitHub PR
                </a>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
