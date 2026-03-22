'use client';

import { useState } from 'react';
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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<AiProjectOverviewOutput | null>(null);
  const [explanations, setExplanations] = useState<CodeExplanationOutput | null>(null);
  const [debugging, setDebugging] = useState<DebugCodeOutput | null>(null);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysisOutput | null>(null);
  const [activeCode, setActiveCode] = useState('');
  const { toast } = useToast();

  const handleAnalyze = async ({ code, language, errorMessage }: { code: string; language: string; errorMessage?: string }) => {
    setIsLoading(true);
    setActiveCode(code);
    
    setOverview(null);
    setExplanations(null);
    setDebugging(null);
    setErrorAnalysis(null);

    try {
      let finalLanguage = language;
      
      // Auto-detect language if requested
      if (language === 'auto') {
        const detection = await getDetectedLanguage(code);
        finalLanguage = detection.language;
        toast({
          title: "Language Detected",
          description: `Identified as ${finalLanguage.toUpperCase()} (${Math.round(detection.confidence * 100)}% confidence)`,
        });
      }

      // Use Promise.allSettled for maximum resilience
      const results = await Promise.allSettled([
        getProjectOverview(code),
        getLineByLineExplanation(code, finalLanguage),
        getDebugAnalysis(code, finalLanguage),
        errorMessage ? getErrorAnalysis(code, errorMessage, finalLanguage) : Promise.resolve(null)
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
          description: "All AI insights generated successfully.",
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

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30 selection:text-accent">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-5xl font-headline font-bold text-foreground tracking-tight">Neural Insight</h2>
          <p className="text-xl text-muted-foreground font-medium tracking-wide">Analyze Deeper, Debug Smarter</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full min-h-[calc(100vh-12rem)]">
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
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest font-medium">
          <p>© 2024 Neural Insight Lab</p>
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
