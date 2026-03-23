'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { InputArea } from '@/components/InputArea';
import { OutputArea } from '@/components/OutputArea';
import { getProjectOverview, getLineByLineExplanation, getDebugAnalysis, getErrorAnalysis, getDetectedLanguage } from '@/lib/actions';
import { type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';
import { type ErrorAnalysisOutput } from '@/ai/flows/ai-error-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<AiProjectOverviewOutput | null>(null);
  const [explanations, setExplanations] = useState<CodeExplanationOutput | null>(null);
  const [debugging, setDebugging] = useState<DebugCodeOutput | null>(null);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysisOutput | null>(null);
  const [activeCode, setActiveCode] = useState('');
  const [activeModel, setActiveModel] = useState('auto');
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleAnalyze = async ({ code, mode, model, errorMessage }: { code: string; mode: 'beginner' | 'developer'; model: string; errorMessage?: string }) => {
    setIsLoading(true);
    setActiveCode(code);
    setActiveModel(model);
    
    setOverview(null);
    setExplanations(null);
    setDebugging(null);
    setErrorAnalysis(null);

    try {
      const detection = await getDetectedLanguage(code);
      const finalLanguage = detection.language;
      
      toast({
        title: "Language Detected",
        description: `Identified as ${finalLanguage.toUpperCase()} (${Math.round(detection.confidence * 100)}% confidence)`,
      });

      const results = await Promise.allSettled([
        getProjectOverview(code, mode, model),
        getLineByLineExplanation(code, finalLanguage, mode, model),
        getDebugAnalysis(code, finalLanguage, mode, model),
        errorMessage ? getErrorAnalysis(code, errorMessage, finalLanguage, model) : Promise.resolve(null)
      ]);

      if (results[0].status === 'fulfilled') setOverview(results[0].value);
      if (results[1].status === 'fulfilled') setExplanations(results[1].value);
      if (results[2].status === 'fulfilled') setDebugging(results[2].value);
      if (results[3].status === 'fulfilled') setErrorAnalysis(results[3].value);

      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial Analysis Failure",
          description: `Failed to complete ${failures.length} analysis tasks.`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Insights generated for ${mode} level using ${model === 'auto' ? 'Intelligent Select' : model}.`,
        });
      }
    } catch (error) {
      console.error("Critical Analysis Error:", error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Failed to connect to the analysis engine.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060B14] overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="relative flex flex-col items-center gap-10">
          <div className="relative animate-in fade-in zoom-in duration-1000 ease-out">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative glass-card p-10 rounded-[2.5rem] shadow-2xl flex items-center justify-center bg-primary">
              <Image 
                src="https://neuralyze.edgeone.app/logo.png" 
                alt="Neuralyze" 
                width={120} 
                height={120} 
                className="animate-float"
                priority
                unoptimized
              />
            </div>
          </div>

          <div className="text-center space-y-3 z-10">
            <h1 className="text-6xl font-headline font-bold tracking-tighter text-foreground animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 fill-mode-both">
              Neuralyze
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-primary/30 animate-in slide-in-from-left-full duration-1000 delay-700" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.5em] animate-in fade-in duration-1000 delay-1000">
                Initializing Engine
              </p>
              <div className="h-px w-12 bg-primary/30 animate-in slide-in-from-right-full duration-1000 delay-700" />
            </div>
          </div>

          <div className="w-64 h-1.5 bg-secondary rounded-full overflow-hidden mt-6 animate-in fade-in duration-500 delay-1200 glass-card">
            <div className="h-full bg-primary relative animate-[loading_2.5s_ease-in-out_forwards]">
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes loading {
            0% { width: 0%; }
            40% { width: 60%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative selection:bg-primary/20 selection:text-primary animate-in fade-in duration-1500">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-16 max-w-[1400px] relative">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Next-Gen Analysis</span>
          </div>
          <h2 className="text-7xl font-headline font-bold text-foreground tracking-tighter animate-in fade-in slide-in-from-top-12 duration-1000 ease-out fill-mode-both">
            Neuralyze
          </h2>
          <p className="text-2xl text-muted-foreground font-medium tracking-tight max-w-2xl mx-auto animate-in fade-in slide-in-from-top-8 duration-1000 delay-300 ease-out fill-mode-both">
            Analyze Deeper, Debug Smarter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 ease-out fill-mode-both">
          <div className="lg:col-span-5 space-y-8 flex flex-col">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <h3 className="text-3xl font-headline font-bold text-foreground">Code Source</h3>
              </div>
              <p className="text-muted-foreground font-medium pl-4">Paste code, upload files, or import from GitHub.</p>
            </div>
            <div className="flex-1">
              <InputArea onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent),0.5)]" />
                <h3 className="text-3xl font-headline font-bold text-foreground">AI Insights</h3>
              </div>
              <p className="text-muted-foreground font-medium pl-4">Real-time parallel processing via Llama 3.1 8B.</p>
            </div>
            <div className="flex-1 min-h-[500px]">
              <OutputArea 
                overview={overview} 
                explanations={explanations} 
                debugging={debugging} 
                errorAnalysis={errorAnalysis}
                code={activeCode}
                model={activeModel}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="glass-card border-t-0 py-10 mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold relative z-10">
          <p className="hover:text-primary transition-colors cursor-default">© 2024 Neuralyze Lab</p>
          <div className="flex gap-12">
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              Auto-Detection Enabled
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-primary rounded-full" />
              Engine: Groq Llama 3.1
            </span>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
