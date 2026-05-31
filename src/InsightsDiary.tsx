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
  Lightbulb
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col relative">
      {/* Liquid Background */}
      <div className="atmosphere" />

      {/* Header */}
      <header className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-60 hover:opacity-100 text-accent transition-opacity mb-2"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <h1 className="text-4xl font-serif italic tracking-tighter gradient-text flex items-center gap-3">
            Insights Diary
            <Lock className="text-accent opacity-50" size={20} />
          </h1>
          <p className="text-xs font-mono opacity-40 uppercase tracking-[0.2em]">Secure Agentic Ledger</p>
        </div>

        <div className="relative group w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={16} />
          <input 
            type="text" 
            placeholder="Search diary nodes..."
            className="glass-input rounded-full py-3 pl-12 pr-6 text-sm font-mono w-full outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 px-8 z-10 mt-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-serif italic">Exclusive Insights</h2>
          <div className="h-px flex-1 mx-6 bg-white/5" />
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <Database size={12} />
            Isolated Core Data
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-accent mb-6" size={48} />
            <p className="font-mono text-xs uppercase tracking-[0.5em] opacity-40">Decrypting Diary Base...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-container">
            <AnimatePresence mode="popLayout">
              {filteredInsights.map((item, idx) => {
                // Defensive text fallback execution
                const fallbackFact = item.corefact || "System Insight Node";
                const uniqueKey = `diary-node-${fallbackFact.substring(0, 15)}-${idx}`;

                return (
                  <motion.div 
                    key={uniqueKey}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-card card-3d rounded-3xl p-8 group relative overflow-hidden flex flex-col justify-between min-h-[340px]"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          <Calendar size={12} className="text-accent" />
                          <span className="text-[10px] font-mono opacity-60">{item.date || 'Pending'}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-4 group-hover:text-accent transition-colors leading-tight">
                        {fallbackFact}
                      </h3>
                      
                      <p className="text-sm leading-relaxed opacity-70 mb-6 font-light">
                        {item.domaininsight || "No supplemental engineering insight defined."}
                      </p>
                    </div>

                    {item.contributorSource && (
                      <div className="pt-4 border-t border-white/5">
                        <a 
                          href={item.contributorSource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[11px] font-mono text-accent opacity-60 hover:opacity-100 transition-opacity break-all"
                        >
                          <ExternalLink size={12} className="shrink-0" />
                          <span>Source Profile</span>
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
            <h3 className="text-xl font-serif italic opacity-50">No execution matches found</h3>
          </div>
        )}
      </main>

      {/* Protective Liability & Educational Disclaimer Block */}
      <footer className="p-8 z-10 space-y-6 mt-12">
        <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Lightbulb size={20} className="text-accent" />
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest mb-2 opacity-50">Educational & Open Source Disclaimer</h4>
              <p className="text-[11px] leading-relaxed opacity-60 font-light">
                AI Insight Hub is an open-source educational initiative. All knowledge cards are community-curated summaries and transformative syntheses of publicly available information, provided for informational and educational purposes only. Factual claims are derived from public sources; all rights in original source material remain with their respective owners. Agentic insights and practical guidance represent original editorial analysis and do not represent the views of any AI laboratory or corporate entity. While we strive for accuracy, AI Insight Hub does not guarantee the validity of any entry. Contributions are subject to community review. Use of this data is at your own risk.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex justify-between items-center px-8">
          <div className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500" /> Secure Node Active</span>
            <span>Diary Count: {insights.length} Entries</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <button onClick={onBack} className="hover:text-accent transition-colors">Return Hub</button>
            <span className="opacity-20">|</span>
            <span className="text-accent/50">Protected Isolation Layer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}