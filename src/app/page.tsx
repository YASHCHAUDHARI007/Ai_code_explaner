'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { InputArea } from '@/components/InputArea';
import { OutputArea } from '@/components/OutputArea';
import { getProjectOverview, getLineByLineExplanation, getDebugAnalysis } from '@/lib/actions';
import { type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<AiProjectOverviewOutput | null>(null);
  const [explanations, setExplanations] = useState<CodeExplanationOutput | null>(null);
  const [debugging, setDebugging] = useState<DebugCodeOutput | null>(null);
  const [activeCode, setActiveCode] = useState('');
  const { toast } = useToast();

  const handleAnalyze = async ({ code, language }: { code: string; language: string }) => {
    setIsLoading(true);
    setActiveCode(code);
    
    // Clear previous results
    setOverview(null);
    setExplanations(null);
    setDebugging(null);

    try {
      // Execute analysis flows in parallel
      const [ovRes, expRes, debugRes] = await Promise.all([
        getProjectOverview(code),
        getLineByLineExplanation(code, language),
        getDebugAnalysis(code, language)
      ]);

      setOverview(ovRes);
      setExplanations(expRes);
      setDebugging(debugRes);

      toast({
        title: "Analysis Successful",
        description: "AI insights have been generated for your snippet.",
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "The AI engine encountered an issue processing your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30 selection:text-accent">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full min-h-[calc(100vh-12rem)]">
          {/* Left Column: Input */}
          <div className="space-y-6 flex flex-col">
            <div className="space-y-1">
              <h2 className="text-3xl font-headline font-bold text-foreground">Code Input</h2>
              <p className="text-muted-foreground">Paste your snippet below for structural and logic analysis.</p>
            </div>
            <div className="flex-1">
              <InputArea onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6 flex flex-col">
            <div className="space-y-1">
              <h2 className="text-3xl font-headline font-bold text-foreground">AI Insights</h2>
              <p className="text-muted-foreground">Architectural overview, detailed breakdown, and security analysis.</p>
            </div>
            <div className="flex-1 min-h-[400px]">
              <OutputArea 
                overview={overview} 
                explanations={explanations} 
                debugging={debugging} 
                code={activeCode}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest font-medium">
          <p>© 2024 AI Code Intelligence Lab</p>
          <div className="flex gap-8">
            <span className="cursor-default">Version 1.0.0 Stable</span>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}