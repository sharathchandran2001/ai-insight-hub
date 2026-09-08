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
  Github,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { AIInsight } from './types';
// Import the new module view
import InsightsDiary from './InsightsDiary';
import { useTheme } from './useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // Navigation & Security States
  const [currentView, setCurrentView] = useState<'hub' | 'diary'>('hub');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Existing Core States
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
      const response = await fetch('/aiinsightdiary.json');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Password Security Check Handler
  const handleVerifyPassword = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'sharathinsights') {
      setPasswordError(false);
      setShowPasswordModal(false);
      setPasswordInput('');
      setCurrentView('diary');
      window.scrollTo({ top: 0 });
    } else {
      setPasswordError(true);
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

  const leaderboard = Object.entries(
    insights.reduce((acc, curr) => {
      acc[curr.contributor] = (acc[curr.contributor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const topContributor = leaderboard[0];

  // Route interception: If view is 'diary', render the specialized clean child view
  if (currentView === 'diary') {
    return <InsightsDiary onBack={() => setCurrentView('hub')} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative pt-28">
      {/* Liquid Background */}
      <div className="atmosphere" />

      {/* Floating Nav */}
      <header className="fixed top-6 left-0 right-0 z-40 px-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 pl-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-400 to-teal-300 flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--violet), var(--teal))' }}>
              <Database size={16} className="text-black/70" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold">AI Insight Hub</p>
              <p className="text-[11px] text-faint">Community AI archive</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="relative group hidden md:block w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
              <input
                type="text"
                placeholder="Search the archive"
                className="glass-input rounded-full py-2.5 pl-11 pr-5 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full glass-input hover:border-[var(--line-2)] flex items-center justify-center transition-colors shrink-0"
              title="Toggle theme"
              aria-label="Toggle light and dark theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-input hover:border-[var(--line-2)] text-xs font-medium transition-colors"
            >
              <Lock size={13} />
              <span className="hidden sm:inline">Diary</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-black transition-transform hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, var(--violet), var(--teal))' }}
            >
              <Plus size={15} />
              Contribute
            </button>
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 glass rounded-[2rem] p-10 flex flex-col justify-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
              Documenting the collective intelligence of AI.
            </h1>
            <p className="text-base leading-relaxed text-dim mb-8 max-w-lg">
              AI Insight Hub is a community-owned ledger capturing AI facts and the practical
              insight behind them. Read what's here, or add what you know back to the record.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl glass-input hover:border-[var(--line-2)] transition-all flex items-center gap-3 group"
              >
                <span className="text-sm font-medium">Join the initiative</span>
                <ArrowUpRight size={16} className="opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div
            id="protocol"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-5 glass rounded-[2rem] p-10 flex flex-col scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-6">
              <History size={16} className="opacity-60" />
              <h2 className="text-sm font-semibold">How to contribute</h2>
            </div>
            <div className="space-y-5 flex-1 relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--fill-2)]" />
              <a
                href="https://github.com/sharathchandran2001/ai-insight-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 group/item cursor-pointer relative"
              >
                <div className="w-8 h-8 rounded-full glass-input flex items-center justify-center shrink-0 text-xs font-semibold group-hover/item:border-[var(--line-3)] transition-all bg-[var(--canvas)]">1</div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 group-hover/item:text-[var(--ink)] transition-colors">Fork the ledger</h3>
                  <p className="text-xs text-faint leading-relaxed">Fork the public GitHub repository and grab a copy of the archive.</p>
                </div>
              </a>
              <a
                href="https://github.com/sharathchandran2001/ai-insight-hub/edit/main/public/aiinsightdiary.json"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 group/item cursor-pointer relative"
              >
                <div className="w-8 h-8 rounded-full glass-input flex items-center justify-center shrink-0 text-xs font-semibold group-hover/item:border-[var(--line-3)] transition-all bg-[var(--canvas)]">2</div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 group-hover/item:text-[var(--ink)] transition-colors">Add your insight</h3>
                  <p className="text-xs text-faint leading-relaxed">Follow the existing schema in <code className="bg-[var(--fill-2)] px-1.5 py-0.5 rounded">aiinsightdiary.json</code>.</p>
                </div>
              </a>
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full glass-input flex items-center justify-center shrink-0 text-xs font-semibold bg-[var(--canvas)]">3</div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Open a pull request</h3>
                  <p className="text-xs text-faint leading-relaxed">Submit it for review — once merged, it's live for everyone.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
              <p className="text-[11px] text-faint leading-relaxed">
                Contributions are permanent and stay attributed to your GitHub handle.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main id="archive" className="flex-1 px-6 pb-8 z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Archive</h2>
              <p className="text-xs text-faint mt-0.5">{insights.length} entries logged so far</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin opacity-50 mb-6" size={40} />
                <p className="text-sm text-faint">Loading the archive…</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredInsights.map((item, idx) => (
                  <motion.div
                    key={item.aifact + idx}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 16 }}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    className="glass liquid-edge lift rounded-3xl p-7 group relative overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--fill-1)] border border-[var(--glass-border)]">
                          <Calendar size={11} className="opacity-60" />
                          <span className="text-[11px] text-dim">{item.date}</span>
                        </div>
                        {getTags(item.aifact + ' ' + item.aifactinsight).slice(0, 3).map(tag => (
                          <div key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                            <Hash size={9} />
                            {tag.slice(1)}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-faint shrink-0 ml-2">
                        <User size={12} />
                        <span className="text-[11px]">@{item.contributor}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3 leading-snug">
                      {item.aifact}
                    </h3>

                    <p className="text-sm leading-relaxed text-dim mb-5">
                      {item.aifactinsight}
                    </p>

                    {item.practicalUsage && (
                      <div className="pt-5 border-t border-[var(--glass-border)] space-y-2 mt-auto">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-faint">
                          <Lightbulb size={13} className="opacity-70" />
                          Practical usage
                        </div>
                        <p className="text-xs text-dim leading-relaxed italic">
                          {item.practicalUsage}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-5 pt-1">
                      <button
                        onClick={() => handleCopy(`${item.aifact}: ${item.aifactinsight}`, item.aifact)}
                        className="p-2 rounded-full hover:bg-[var(--fill-2)] transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy to clipboard"
                      >
                        {copyStatus === item.aifact ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 rounded-full hover:bg-[var(--fill-2)] transition-colors opacity-0 group-hover:opacity-100"
                        title="Share insight"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!loading && filteredInsights.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--fill-1)] flex items-center justify-center mb-6">
                <Database size={36} className="opacity-30" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matches</h3>
              <p className="text-sm text-faint max-w-xs leading-relaxed">
                Nothing in the archive matches that search. Try a different term.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-6 px-5 py-2.5 rounded-full glass-input hover:border-[var(--line-2)] text-xs font-medium transition-colors"
              >
                Clear search
              </button>
            </motion.div>
          )}

          {/* Leaderboard & Stats Section */}
          <section className="mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-8 glass rounded-[2rem] p-9"
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--fill-1)] flex items-center justify-center">
                      <History size={18} className="opacity-70" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Contributor leaderboard</h3>
                      <p className="text-xs text-faint">Ranked by entries added</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--fill-1)] border border-[var(--glass-border)] text-xs">
                    <span className="text-faint">Total</span>
                    <span className="font-semibold">{insights.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leaderboard.map(([name, count], idx) => (
                    <motion.div
                      key={name}
                      whileHover={{ scale: 1.02 }}
                      className="glass-input rounded-2xl p-5 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-[var(--fill-2)] flex items-center justify-center">
                            <User size={15} />
                          </div>
                          {idx === 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--amber)' }}>
                              <ArrowUpRight size={9} className="text-black" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">@{name}</p>
                          <p className="text-[11px] text-faint">{count} contributions</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold opacity-15">
                        {idx + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="lg:col-span-4 glass rounded-[2rem] p-9 flex flex-col justify-center relative overflow-hidden"
              >
                <div className="relative z-10 space-y-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--violet-soft)' }}>
                    <Plus size={20} style={{ color: 'var(--violet)' }} />
                  </div>
                  <h3 className="text-xl font-semibold leading-snug">
                    Most active contributor
                  </h3>
                  {topContributor ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold tracking-tight">@{topContributor[0]}</p>
                      <p className="text-sm text-faint">
                        Leading the ledger with {topContributor[1]} entries
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-faint italic">Awaiting the first contribution…</p>
                  )}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, var(--violet), var(--teal))' }}
                  >
                    Add your insight
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-[var(--fill-2)] transition-colors"
          >
            <ArrowUp size={18} />
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
            className="fixed bottom-10 left-1/2 z-[100] px-7 py-4 glass rounded-2xl flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--violet-soft)' }}>
              <Check size={16} style={{ color: 'var(--violet)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold">Contribution received</p>
              <p className="text-xs text-faint">It's been added to the archive</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Gate Password Prompt Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPasswordModal(false); setPasswordError(false); setPasswordInput(''); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass w-full max-w-md rounded-[2rem] p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Unlock Insights Diary</h3>
                  <p className="text-xs text-faint mt-1">Enter the passphrase to view this private archive</p>
                </div>

                <form onSubmit={handleVerifyPassword} className="w-full space-y-4 pt-3">
                  <input
                    required
                    type="password"
                    placeholder="Passphrase"
                    className={`w-full glass-input rounded-xl p-4 text-center text-sm ${passwordError ? 'border-red-500/50' : ''}`}
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); if (passwordError) setPasswordError(false); }}
                  />
                  {passwordError && (
                    <p className="text-xs text-[var(--danger)]">That passphrase isn't right — try again</p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowPasswordModal(false); setPasswordError(false); setPasswordInput(''); }}
                      className="flex-1 py-3 rounded-xl glass-input hover:border-[var(--line-2)] text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, var(--violet), var(--teal))' }}
                    >
                      Unlock
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-6 z-10 space-y-4 max-w-7xl mx-auto w-full">
        <div className="glass rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--fill-1)] flex items-center justify-center shrink-0">
              <Lightbulb size={18} className="opacity-70" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-faint mb-2">Educational & open-source disclaimer</h4>
              <p className="text-[11px] leading-relaxed text-faint">
                AI Insight Hub is an open-source educational initiative. All knowledge cards are community-curated summaries and transformative syntheses of publicly available information, provided for informational and educational purposes only. Factual claims are derived from public sources; all rights in original source material remain with their respective owners. Agentic insights and practical guidance represent original editorial analysis and do not represent the views of any AI laboratory or corporate entity. While we strive for accuracy, AI Insight Hub does not guarantee the validity of any entry. Contributions are subject to community review. Use of this data is at your own risk.
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center px-7">
          <div className="flex items-center gap-6 text-xs text-faint">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> System online</span>
            <span>{insights.length} entries</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-faint">
            <a href="#protocol" className="hover:text-[var(--ink)] transition-colors">How it works</a>
            <a href="#archive" className="hover:text-[var(--ink)] transition-colors">Archive</a>
            <a
              href="https://github.com/sharathchandran2001/ai-insight-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ink)] transition-colors flex items-center gap-1.5"
            >
              <Github size={13} />
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
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="relative glass w-full max-w-2xl rounded-[2rem] overflow-hidden"
            >
              <div className="p-9 border-b border-[var(--glass-border)] flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Add a new insight</h2>
                  <p className="text-xs text-faint">Contribute to the collective archive</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full glass-input flex items-center justify-center hover:border-[var(--line-2)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-9 space-y-6">
                <a
                  href="https://github.com/sharathchandran2001/ai-insight-hub/edit/main/public/aiinsightdiary.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-16 rounded-2xl glass-input hover:border-[var(--line-2)] flex items-center justify-center gap-3 text-sm font-semibold transition-all group"
                >
                  <Github size={18} className="group-hover:scale-110 transition-transform" />
                  Open a GitHub pull request
                </a>
                {isSubmitting && (
                  <p className="text-xs text-faint text-center">Submitting…</p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
