import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ArrowLeft,
  Search,
  Database,
  ExternalLink,
  Loader2,
  Lock,
  Lightbulb,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './useTheme';

// Streamlined schema interface matching your unified keys
interface SecondaryInsight {
  corefact: string;
  domaininsight: string;
  contributorSource: string;
  date: string;
}

interface InsightsDiaryProps {
  onBack: () => void;
}

export default function InsightsDiary({ onBack }: InsightsDiaryProps) {
  const { theme, toggleTheme } = useTheme();
  const [insights, setInsights] = useState<SecondaryInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDiaryInsights = async () => {
      try {
        const response = await fetch('/insightdiary.json');
        const data = await response.json();
        // Fallback to empty array if data isn't structured as expected
        setInsights(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch diary insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaryInsights();
  }, []);

  // Safe search filtering mapped to the unified keys
  const filteredInsights = insights.filter(item => {
    const title = (item.corefact || '').toLowerCase();
    const insightText = (item.domaininsight || '').toLowerCase();
    const source = (item.contributorSource || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return title.includes(query) || insightText.includes(query) || source.includes(query);
  });

  return (
    <div className="min-h-screen flex flex-col relative pt-8">
      {/* Liquid Background */}
      <div className="atmosphere" />

      {/* Header */}
      <header className="px-6 z-10">
        <div className="max-w-7xl mx-auto w-full glass rounded-[2rem] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-medium text-faint hover:text-[var(--ink)] transition-opacity"
            >
              <ArrowLeft size={14} /> Back to hub
            </button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Insights Diary
              <Lock size={17} className="opacity-40" />
            </h1>
            <p className="text-xs text-faint">A smaller, curated archive</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
              <input
                type="text"
                placeholder="Search this archive"
                className="glass-input rounded-full py-3 pl-11 pr-5 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-full glass-input hover:border-[var(--line-2)] flex items-center justify-center transition-colors shrink-0"
              title="Toggle theme"
              aria-label="Toggle light and dark theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 px-6 z-10 mt-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-lg font-semibold">Entries</h2>
            <div className="h-px flex-1 bg-[var(--fill-2)]" />
            <div className="flex items-center gap-2 text-xs text-faint">
              <Database size={13} />
              {insights.length} isolated entries
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="animate-spin opacity-50 mb-6" size={40} />
              <p className="text-sm text-faint">Loading the diary…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredInsights.map((item, idx) => {
                  // Defensive text fallback execution
                  const fallbackFact = item.corefact || 'System Insight Node';
                  const uniqueKey = `diary-node-${fallbackFact.substring(0, 15)}-${idx}`;

                  return (
                    <motion.div
                      key={uniqueKey}
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 16 }}
                      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                      className="glass liquid-edge lift rounded-3xl p-7 group relative overflow-hidden flex flex-col justify-between min-h-[300px]"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--fill-1)] border border-[var(--glass-border)]">
                            <Calendar size={11} className="opacity-60" />
                            <span className="text-[11px] text-dim">{item.date || 'Pending'}</span>
                          </div>
                        </div>

                        <h3 className="text-base font-semibold mb-3 leading-snug">
                          {fallbackFact}
                        </h3>

                        <p className="text-sm leading-relaxed text-dim">
                          {item.domaininsight || 'No supplemental insight defined.'}
                        </p>
                      </div>

                      {item.contributorSource && (
                        <div className="pt-4 mt-4 border-t border-[var(--glass-border)]">
                          <a
                            href={item.contributorSource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-faint hover:text-[var(--ink)] transition-opacity break-all"
                          >
                            <ExternalLink size={12} className="shrink-0" />
                            <span>Source</span>
                          </a>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {!loading && filteredInsights.length === 0 && (
            <div className="text-center py-24">
              <h3 className="text-lg font-semibold text-faint">No matches found</h3>
            </div>
          )}
        </div>
      </main>

      {/* Disclaimer & footer */}
      <footer className="p-6 z-10 space-y-4 mt-10 max-w-7xl mx-auto w-full">
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
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Secure node active</span>
            <span>{insights.length} entries</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-faint">
            <button onClick={onBack} className="hover:text-[var(--ink)] transition-colors">Return to hub</button>
            <span style={{ color: 'var(--violet)' }}>Private, isolated archive</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
