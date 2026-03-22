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
  Loader2
} from 'lucide-react';
import { type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';
import { type ErrorAnalysisOutput } from '@/ai/flows/ai-error-analysis-flow';
import { getAiAnswer } from '@/lib/actions';

interface OutputAreaProps {
  overview: AiProjectOverviewOutput | null;
  explanations: CodeExplanationOutput | null;
  debugging: DebugCodeOutput | null;
  errorAnalysis: ErrorAnalysisOutput | null;
  code: string;
}

export function OutputArea({ overview, explanations, debugging, errorAnalysis, code }: OutputAreaProps) {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);

  const handleAsk = async () => {
    if (!question.trim() || !code) return;
    
    setIsAsking(true);
    try {
      const result = await getAiAnswer(code, question);
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
      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-card/50 border-2 border-dashed rounded-2xl">
        <Terminal className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-headline font-bold text-muted-foreground/70">Awaiting Input</h3>
        <p className="text-muted-foreground max-w-sm mt-2">Paste some code and click "Analyze Codebase" to see results here.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="flex w-full bg-secondary h-11 overflow-x-auto">
        <TabsTrigger value="overview" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <Info className="h-4 w-4" />
          <span>Architecture</span>
        </TabsTrigger>
        <TabsTrigger value="explanations" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <ListChecks className="h-4 w-4" />
          <span>Explain</span>
        </TabsTrigger>
        <TabsTrigger value="debugging" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <Bug className="h-4 w-4" />
          <span>Bugs</span>
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <MessageSquare className="h-4 w-4" />
          <span>Ask AI</span>
        </TabsTrigger>
        <TabsTrigger value="error-analysis" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <span>Troubleshoot</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 animate-in slide-in-from-bottom-2 duration-300">
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent text-xl font-headline">
              <Cpu className="h-5 w-5" />
              Project Architecture
            </CardTitle>
            <CardDescription>High-level structural analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {overview ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Purpose</h4>
                  <p className="text-foreground leading-relaxed">{overview.purpose}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Functionality</h4>
                  <p className="text-foreground leading-relaxed">{overview.functionality}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {overview.coreTechnologies.map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-background border-accent/20 text-accent font-code text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : <LoadingPlaceholder label="Computing structure..." />}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="explanations" className="mt-4 animate-in slide-in-from-bottom-2 duration-300">
        <div className="bg-card border rounded-xl overflow-hidden divide-y">
          {explanations?.explanations.map((exp, idx) => (
            <div key={idx} className="flex group hover:bg-accent/5 transition-colors">
              <div className="w-10 bg-muted/30 p-4 text-[10px] font-code text-muted-foreground text-right border-r shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <pre className="text-sm font-code text-foreground overflow-x-auto scrollbar-hide">
                  <code>{exp.line}</code>
                </pre>
                <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground italic bg-secondary/30 p-2 rounded">
                  <ChevronRight className="h-3 w-3 mt-1 shrink-0 text-accent" />
                  {exp.explanation}
                </div>
              </div>
            </div>
          )) || <LoadingPlaceholder label="Deconstructing logic..." />}
        </div>
      </TabsContent>

      <TabsContent value="debugging" className="mt-4 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
        {debugging?.bugs.length ? (
          debugging.bugs.map((bug, idx) => (
            <Card key={idx} className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="font-headline tracking-tighter uppercase text-[10px]">Logic Issue</Badge>
                  {bug.lineNumber && <span className="text-[10px] text-muted-foreground font-code">L:{bug.lineNumber}</span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-1">
                    <Zap className="h-3 w-3 text-destructive" />
                    Problem
                  </h4>
                  <p className="text-sm text-muted-foreground">{bug.description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-accent">Suggested Refactor</h4>
                  <pre className="bg-background border p-3 rounded text-[11px] font-code text-accent overflow-x-auto">
                    <code>{bug.suggestion}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))
        ) : debugging ? (
          <EmptyState title="No Static Bugs" description="Heuristic analysis passed with flying colors." />
        ) : <LoadingPlaceholder label="Scanning for vulnerabilities..." />}
      </TabsContent>

      <TabsContent value="chat" className="mt-4 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Ask anything about this code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {chatHistory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 italic">
                  Example: "Explain the authentication logic" or "How can I improve performance here?"
                </p>
              )}
              {chatHistory.map((chat, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-accent/10 border border-accent/20 p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                      <p className="text-sm font-medium">{chat.q}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-card border p-3 rounded-2xl rounded-tl-none max-w-[90%] space-y-2">
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest">AI Response</p>
                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {chat.a}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-card border p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Textarea 
                placeholder="Type your question..."
                className="min-h-[60px] resize-none text-sm"
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
                className="h-auto px-4 bg-accent hover:bg-accent/90"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="error-analysis" className="mt-4 animate-in slide-in-from-bottom-2 duration-300">
        {errorAnalysis ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <Badge className={
                  errorAnalysis.severity === 'high' ? 'bg-destructive' : 
                  errorAnalysis.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                }>
                  Severity: {errorAnalysis.severity.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-xl font-headline text-destructive flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Root Cause Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">The Breakdown</h4>
                <p className="text-sm text-foreground leading-relaxed">{errorAnalysis.explanation}</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-destructive/10">
                <h4 className="text-xs font-bold text-destructive uppercase mb-2">Primary Fault</h4>
                <p className="text-sm font-medium">{errorAnalysis.rootCause}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-accent flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Step-by-Step Resolution
                </h4>
                <p className="text-sm bg-accent/10 p-4 rounded-lg border border-accent/20 text-foreground whitespace-pre-wrap">
                  {errorAnalysis.solution}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center p-8 bg-card/30 border border-dashed rounded-xl">
            <ShieldAlert className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Provide error logs in the input area to see runtime analysis here.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function LoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-4">
      <div className="h-6 w-6 border-2 border-accent border-t-transparent animate-spin rounded-full" />
      <p className="text-xs text-muted-foreground font-medium animate-pulse uppercase tracking-widest">{label}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-card border-accent/20 border-2 rounded-2xl p-12 text-center">
      <ShieldAlert className="text-accent h-12 w-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-headline font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
}
