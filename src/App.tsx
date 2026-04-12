import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  RefreshCw,
  Globe,
  Lightbulb,
  ShieldCheck,
  Code2,
  MousePointer2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { analyzeExperimentIdea, ExperimentAnalysis } from '@/src/services/geminiService';

type AppState = 'input' | 'loading' | 'results';

const LOADING_MESSAGES = [
  "Analyzing your experiment idea...",
  "Detecting website structure...",
  "Evaluating implementation complexity...",
  "Mapping to VWO capabilities...",
  "Estimating effort and feasibility...",
  "Generating recommendations..."
];

export default function App() {
  const [state, setState] = useState<AppState>('input');
  const [idea, setIdea] = useState('');
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<ExperimentAnalysis | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate loading messages
  useEffect(() => {
    if (state === 'loading') {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 95));
      }, 100);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }
  }, [state]);

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    
    setState('loading');
    setProgress(0);
    
    const result = await analyzeExperimentIdea(idea, url);
    
    // Artificial delay to ensure user sees the "intelligent" analysis
    setTimeout(() => {
      setAnalysis(result);
      setState('results');
      setProgress(100);
    }, 4000);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'No-Code': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Low-Code': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'High Complexity': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'No-Code': return <MousePointer2 className="w-5 h-5" />;
      case 'Low-Code': return <Code2 className="w-5 h-5" />;
      case 'High Complexity': return <Zap className="w-5 h-5" />;
      default: return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-vwo-purple/20">
      {/* Navigation / Logo */}
      <nav className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-vwo-purple rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">VWO <span className="font-normal text-zinc-400">Labs</span></span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {state === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10 text-center"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 max-w-2xl mx-auto leading-tight">
                  Can you launch this experiment <span className="text-vwo-purple underline decoration-vwo-purple/30 underline-offset-8">without engineering?</span>
                </h1>
                <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                  Describe your idea and we’ll tell you how quickly you can run it using VWO's no-code capabilities.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6 text-left">
                <div className="space-y-3">
                  <Label htmlFor="idea" className="text-sm font-semibold text-zinc-700">Experiment Idea</Label>
                  <Textarea
                    id="idea"
                    placeholder="Describe your experiment idea... (e.g., Change the hero CTA text to 'Start Free Trial' and make it purple)"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="vwo-input min-h-[160px] text-lg p-4 resize-none rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="url" className="text-sm font-semibold text-zinc-700">Website URL (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="url"
                      placeholder="https://yourwebsite.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="vwo-input h-12 pl-11 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!idea.trim()}
                  className="vwo-button-primary w-full h-14 text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze Experiment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Example Ideas</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Change CTA text on homepage",
                      "Test pricing layout with 3 tiers",
                      "Hide the newsletter popup for mobile users",
                      "Swap hero image for a video"
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setIdea(ex)}
                        className="px-4 py-2 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 hover:border-vwo-purple hover:text-vwo-purple transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-10"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-vwo-purple/10 rounded-full"></div>
                <motion.div
                  className="absolute inset-0 border-4 border-vwo-purple rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-vwo-purple animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-6 w-full max-w-md">
                <div className="h-8 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMessageIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-xl font-semibold text-zinc-800 absolute inset-0"
                    >
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 bg-zinc-200" />
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Deep Analysis in Progress</p>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'results' && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Verdict Header */}
              <div className={`vwo-card p-8 border-2 ${getVerdictColor(analysis.verdict)}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white shadow-sm">
                      {getVerdictIcon(analysis.verdict)}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Verdict</p>
                      <h2 className="text-3xl font-black tracking-tight">{analysis.verdict}</h2>
                      <p className="text-sm font-medium mt-1 opacity-90">{analysis.verdictExplanation}</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">Time Estimate</p>
                      <p className="text-xl font-bold flex items-center justify-end gap-2">
                        <Clock className="w-4 h-4" />
                        {analysis.timeEstimate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">Confidence</p>
                      <p className="text-xl font-bold">{analysis.confidenceScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Why & How */}
                <div className="md:col-span-7 space-y-8">
                  <section className="vwo-card p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Why this classification
                    </h3>
                    <ul className="space-y-3">
                      {analysis.reasoning.map((reason, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-vwo-purple mt-1.5 shrink-0"></div>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="vwo-card p-6 space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <MousePointer2 className="w-4 h-4" />
                      How to implement (Pro Path)
                    </h3>
                    <div className="space-y-6">
                      {analysis.implementationSteps.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-vwo-purple-light text-vwo-purple flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm text-zinc-700 font-medium leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column: Simpler Alternative & CTA */}
                <div className="md:col-span-5 space-y-8">
                  <section className="vwo-card p-6 bg-vwo-purple-light border-vwo-purple/20 space-y-4">
                    <div className="flex items-center gap-2 text-vwo-purple">
                      <Lightbulb className="w-5 h-5" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Simpler Alternative</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-white/50 rounded-lg border border-vwo-purple/10">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Instead of</p>
                        <p className="text-xs text-zinc-500 italic">"{analysis.simplerAlternative.original}"</p>
                      </div>
                      <div className="p-3 bg-vwo-purple text-white rounded-lg shadow-md">
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Try this first</p>
                        <p className="text-sm font-semibold">{analysis.simplerAlternative.alternative}</p>
                      </div>
                    </div>
                  </section>

                  <div className="space-y-3">
                    <button className="vwo-button-primary w-full flex items-center justify-center gap-2">
                      Launch in VWO
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setState('input')}
                      className="w-full py-3 px-6 rounded-lg border border-zinc-200 text-zinc-600 font-semibold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Analyze another idea
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Grade Security</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-semibold text-zinc-400 hover:text-vwo-purple transition-colors">Documentation</a>
            <a href="#" className="text-xs font-semibold text-zinc-400 hover:text-vwo-purple transition-colors">VWO Visual Editor</a>
            <a href="#" className="text-xs font-semibold text-zinc-400 hover:text-vwo-purple transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

