'use client';

import { useState, useEffect } from 'react';
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
import { Code2 } from 'lucide-react';

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
      // Intelligent Auto-Detection is now the only mode
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
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
        <div className="relative flex flex-col items-center gap-8">
          <div className="relative animate-in fade-in zoom-in duration-1000 ease-out">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-card border-2 border-accent/30 p-6 rounded-2xl shadow-2xl shadow-accent/10">
              <Code2 className="h-16 w-16 text-accent animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-5xl font-headline font-bold tracking-tighter text-foreground animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500 fill-mode-both">
              Neuralyze
            </h1>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-px w-8 bg-accent/50 animate-in slide-in-from-left-full duration-1000 delay-700" />
              <p className="text-xs font-medium text-accent uppercase tracking-[0.3em] animate-in fade-in duration-1000 delay-1000">
                Initializing Engine
              </p>
              <div className="h-px w-8 bg-accent/50 animate-in slide-in-from-right-full duration-1000 delay-700" />
            </div>
          </div>

          <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden mt-4 animate-in fade-in duration-500 delay-1200">
            <div className="h-full bg-accent animate-[loading_2.5s_ease-in-out_forwards]" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <style jsx>{`
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30 selection:text-accent animate-in fade-in duration-1000">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-6xl font-headline font-bold text-foreground tracking-tight animate-in fade-in slide-in-from-top-12 duration-1000 ease-out fill-mode-both">
            Neuralyze
          </h2>
          <p className="text-xl text-muted-foreground font-medium tracking-wide animate-in fade-in slide-in-from-top-8 duration-1000 delay-300 ease-out fill-mode-both">
            Analyze Deeper, Debug Smarter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full min-h-[calc(100vh-12rem)] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 ease-out fill-mode-both">
          <div className="space-y-6 flex flex-col">
            <div className="space-y-1">
              <h3 className="text-3xl font-headline font-bold text-foreground">Code Source</h3>
              <p className="text-muted-foreground">Paste code, upload files, or import from GitHub.</p>
            </div>
            <div className="flex-1">
              <InputArea onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="space-y-1">
              <h3 className="text-3xl font-headline font-bold text-foreground">AI Insights</h3>
              <p className="text-muted-foreground">Real-time parallel processing via Llama 3.1 8B.</p>
            </div>
            <div className="flex-1 min-h-[400px]">
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

      <footer className="border-t bg-card py-8 mt-12 animate-in fade-in duration-1000 delay-700 fill-mode-both">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest font-medium">
          <p>© 2024 Neuralyze Lab</p>
          <div className="flex gap-8">
            <span className="cursor-default">Auto-Detection Enabled</span>
            <span className="cursor-default">Engine: Groq Llama 3.1</span>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
