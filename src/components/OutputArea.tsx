'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Info, 
  ListChecks, 
  Bug, 
  Terminal, 
  ChevronRight, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  MessageSquare, 
  Send,
  Loader2,
  Layers,
  Search,
  CheckCircle2,
  FileCode,
  MapPin,
  Activity,
  FileJson,
  Sparkles
} from 'lucide-react';
import { type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';
import { type ErrorAnalysisOutput } from '@/ai/flows/ai-error-analysis-flow';
import { getAiAnswer } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface OutputAreaProps {
  overview: AiProjectOverviewOutput | null;
  explanations: CodeExplanationOutput | null;
  debugging: DebugCodeOutput | null;
  errorAnalysis: ErrorAnalysisOutput | null;
  code: string;
  model: string;
}

export function OutputArea({ overview, explanations, debugging, errorAnalysis, code, model }: OutputAreaProps) {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);

  const handleAsk = async () => {
    if (!question.trim() || !code) return;
    
    setIsAsking(true);
    try {
      const result = await getAiAnswer(code, question, undefined, model);
      setChatHistory(prev => [...prev, { q: question, a: result.answer }]);
      setQuestion('');
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsAsking(false);
    }
  };

  if (!overview && !explanations && !debugging && !errorAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-16 glass-card border-2 border-dashed border-white/10 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="bg-muted/50 p-8 rounded-full mb-8 relative">
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
          <Terminal className="h-16 w-16 text-muted-foreground/30 relative" />
        </div>
        <h3 className="text-2xl font-headline font-bold text-muted-foreground/70 tracking-tight">Awaiting Code Source</h3>
        <p className="text-muted-foreground max-w-sm mt-4 leading-relaxed font-medium">
          Neuralyze will analyze project structure, detect frameworks, and map execution flows.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Layers, label: "Project Type", value: overview?.projectType || "Detecting...", color: "text-primary" },
          { icon: MapPin, label: "Entry Point", value: overview?.entryPoint || "Locating...", color: "text-accent", code: true },
          { icon: Bug, label: "Potential Bugs", value: debugging ? debugging.bugs.length : "...", color: "text-destructive" },
          { icon: CheckCircle2, label: "Confidence", value: overview ? "98%" : "...", color: "text-green-500" }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <item.icon className={cn("h-3.5 w-3.5", item.color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </div>
            <span className={cn(
              "block font-bold truncate",
              item.code ? "text-[11px] font-code" : "text-sm",
              idx === 2 || idx === 3 ? "text-lg font-headline" : "text-foreground"
            )}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full bg-muted/50 h-14 p-1.5 rounded-[1.5rem] border border-white/5 overflow-x-auto">
          {[
            { value: "overview", icon: Search, label: "Overview" },
            { value: "flow", icon: Activity, label: "Working Flow" },
            { value: "explanations", icon: ListChecks, label: "File Logic" },
            { value: "debugging", icon: Bug, label: "Bugs" },
            { value: "chat", icon: MessageSquare, label: "Ask AI" }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="flex-1 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-card border-none rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-primary text-2xl font-headline font-bold">
                <Cpu className="h-7 w-7" />
                Project Architecture
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Deep codebase scan and framework identification</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {overview ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        Purpose
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed font-medium">{overview.purpose}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        Functionality
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed font-medium">{overview.functionality}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      Important Files
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {overview.importantFiles.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="font-code text-[11px] py-1.5 px-3 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {overview.coreTechnologies.map((tech, idx) => (
                        <Badge key={idx} className="bg-primary border-none text-primary-foreground font-code text-[11px] py-1.5 px-4 rounded-xl">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : <LoadingPlaceholder label="Scanning codebase architecture..." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-card border-none rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-foreground text-2xl font-headline font-bold">
                <Activity className="h-7 w-7 text-accent" />
                Execution Flow & Logic
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">How data and control moves through this project</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {overview?.workingFlow ? (
                <div className="bg-muted/30 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl -mr-32 -mt-32" />
                  <p className="text-sm text-foreground leading-loose whitespace-pre-wrap relative z-10 font-medium">
                    {overview.workingFlow}
                  </p>
                </div>
              ) : <LoadingPlaceholder label="Mapping execution paths..." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanations" className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card border-none rounded-[2rem] overflow-hidden divide-y divide-white/5">
            {explanations?.explanations.map((exp, idx) => (
              <div key={idx} className="flex group hover:bg-primary/5 transition-all duration-300">
                <div className="w-12 bg-muted/20 p-6 text-[11px] font-code text-muted-foreground/50 text-right border-r border-white/5 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 p-6 overflow-hidden">
                  <pre className="text-sm font-code text-foreground overflow-x-auto scrollbar-hide">
                    <code>{exp.line}</code>
                  </pre>
                  <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground font-medium italic bg-muted/40 p-4 rounded-2xl border border-white/5">
                    <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    {exp.explanation}
                  </div>
                </div>
              </div>
            )) || <LoadingPlaceholder label="Breaking down logic steps..." />}
          </div>
        </TabsContent>

        <TabsContent value="debugging" className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {debugging?.bugs.length ? (
            debugging.bugs.map((bug, idx) => (
              <Card key={idx} className="border-none glass-card bg-destructive/5 rounded-[2rem] overflow-hidden group hover:bg-destructive/10 transition-colors">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="font-headline tracking-widest uppercase text-[10px] py-1 px-4 rounded-full">Static Analysis Issue</Badge>
                    {bug.lineNumber && <span className="text-[10px] text-muted-foreground font-code font-bold uppercase tracking-widest">Line {bug.lineNumber}</span>}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-3 mb-2 uppercase tracking-wider">
                      <Zap className="h-4 w-4 text-destructive" />
                      Issue Description
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{bug.description}</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Suggested Fix</h4>
                    <div className="bg-background/80 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl" />
                      <pre className="text-[12px] font-code text-primary relative z-10 overflow-x-auto scrollbar-hide">
                        <code>{bug.suggestion}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : debugging ? (
            <EmptyState title="No Critical Bugs Found" description="The codebase passed all static heuristic scans." />
          ) : <LoadingPlaceholder label="Scanning for vulnerabilities..." />}
        </TabsContent>

        <TabsContent value="chat" className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-primary" />
                Interactive Code Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20">
                {chatHistory.length === 0 && (
                  <div className="text-center py-16 space-y-6">
                    <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <Cpu className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground italic font-medium">
                      Ask specific questions about this codebase.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {['How does the routing work?', 'Find bottlenecks', 'Security check'].map((hint) => (
                        <Button 
                          key={hint} 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-9 px-6 font-bold uppercase tracking-widest border-white/10 hover:bg-primary hover:text-primary-foreground rounded-full transition-all"
                          onClick={() => setQuestion(hint)}
                        >
                          {hint}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((chat, i) => (
                  <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-end">
                      <div className="bg-primary/20 border border-primary/30 px-6 py-4 rounded-3xl rounded-tr-none max-w-[85%] shadow-lg">
                        <p className="text-sm font-bold text-foreground leading-relaxed">{chat.q}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted/40 border border-white/5 px-8 py-6 rounded-3xl rounded-tl-none max-w-[95%] space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-2xl -ml-16 -mt-16" />
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] relative z-10">Neuralyze AI</p>
                        <div className="text-sm text-foreground whitespace-pre-wrap leading-loose font-medium relative z-10">
                          {chat.a}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="bg-muted/40 border border-white/5 px-8 py-5 rounded-3xl rounded-tl-none flex items-center gap-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Processing Stream...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-8 border-t border-white/5">
                <Textarea 
                  placeholder="Ask a question about this codebase..."
                  className="min-h-[70px] flex-1 resize-none text-sm bg-muted/30 border-white/5 rounded-2xl px-6 py-4 focus-visible:ring-primary font-medium"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                />
                <Button 
                  onClick={handleAsk} 
                  disabled={isAsking || !question.trim()}
                  className="h-auto w-16 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-primary-foreground"
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
        <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full relative" />
      </div>
      <p className="text-[11px] text-primary font-bold animate-pulse uppercase tracking-[0.4em]">{label}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-muted/30 border border-white/5 rounded-[2rem] p-20 text-center relative overflow-hidden group">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 relative border border-primary/20">
        <CheckCircle2 className="text-primary h-10 w-10 relative" />
      </div>
      <h3 className="text-2xl font-headline font-bold text-foreground tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-4 leading-relaxed font-medium max-w-sm mx-auto">{description}</p>
    </div>
  );
}
