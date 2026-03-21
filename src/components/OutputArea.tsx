'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, ListChecks, Bug, Terminal, ChevronRight, Cpu } from 'lucide-react';
import { type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';

interface OutputAreaProps {
  overview: AiProjectOverviewOutput | null;
  explanations: CodeExplanationOutput | null;
  debugging: DebugCodeOutput | null;
  code: string;
}

export function OutputArea({ overview, explanations, debugging, code }: OutputAreaProps) {
  if (!overview && !explanations && !debugging) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-card/50 border-2 border-dashed rounded-2xl">
        <Terminal className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-headline font-bold text-muted-foreground/70">Awaiting Input</h3>
        <p className="text-muted-foreground max-w-sm mt-2">Paste some code and click "Start Analysis" to see results here.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="flex w-full bg-secondary h-11 overflow-x-auto">
        <TabsTrigger value="overview" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <Info className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="explanations" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <ListChecks className="h-4 w-4" />
          <span>Explanation</span>
        </TabsTrigger>
        <TabsTrigger value="debugging" className="flex-1 flex items-center gap-2 data-[state=active]:bg-background">
          <Bug className="h-4 w-4 text-destructive" />
          <span>Debugger</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 animate-in fade-in duration-500">
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent text-xl">
              <SparkleIcon className="h-5 w-5" />
              Project Architecture
            </CardTitle>
            <CardDescription>Generated high-level summary of the provided code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {overview ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wider">Purpose</h4>
                  <p className="text-foreground leading-relaxed">{overview.purpose}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wider">Functionality</h4>
                  <p className="text-foreground leading-relaxed">{overview.functionality}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Core Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {overview.coreTechnologies.map((tech: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-background border-accent/20 text-accent">
                        {tech}
                      </Badge>
                    ))}
                    {overview.coreTechnologies.length === 0 && (
                      <span className="text-sm text-muted-foreground italic">None identified</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground italic">
                Gathering architectural insights...
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="explanations" className="mt-4 animate-in fade-in duration-500">
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="bg-muted p-3 border-b flex items-center justify-between">
              <span className="text-xs font-code text-muted-foreground">Detailed Breakdown</span>
            </div>
            <div className="divide-y">
              {explanations?.explanations.map((exp, idx) => (
                <div key={idx} className="flex group hover:bg-accent/5 transition-colors">
                  <div className="w-12 bg-muted/30 p-4 text-xs font-code text-muted-foreground text-right select-none border-r">
                    {idx + 1}
                  </div>
                  <div className="flex-1 p-4 space-y-2">
                    <pre className="text-sm font-code text-foreground overflow-x-auto">
                      <code>{exp.line}</code>
                    </pre>
                    <div className="flex items-start gap-2 bg-secondary/50 p-2 rounded border-l-2 border-accent">
                      <ChevronRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground italic">
                        {exp.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!explanations || explanations.explanations.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">
                  Analyzing line by line...
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="debugging" className="mt-4 animate-in fade-in duration-500">
        <div className="space-y-4">
          {debugging?.bugs && debugging.bugs.length > 0 ? (
            debugging.bugs.map((bug, idx) => (
              <Card key={idx} className="border-destructive/30 bg-destructive/5 overflow-hidden">
                <div className="bg-destructive/10 px-4 py-2 border-b flex items-center justify-between">
                  <Badge variant="destructive" className="font-headline">Bug #{idx + 1}</Badge>
                  {bug.lineNumber && <span className="text-xs text-muted-foreground">Line {bug.lineNumber}</span>}
                </div>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      Problem
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{bug.description}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-accent flex items-center gap-2 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Suggested Fix
                    </h4>
                    <pre className="bg-background/80 p-3 rounded-lg border text-xs font-code text-accent overflow-x-auto my-2">
                      <code>{bug.suggestion}</code>
                    </pre>
                  </div>
                  <div className="bg-background/40 p-3 rounded-lg border-l-2 border-muted">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Reasoning</h4>
                    <p className="text-xs text-muted-foreground">{bug.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="bg-card border-accent/20 border-2 rounded-2xl p-12 text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparkleIcon className="text-accent h-8 w-8" />
              </div>
              <h3 className="text-xl font-headline font-bold text-foreground">Clean Code Found!</h3>
              <p className="text-muted-foreground mt-2">The AI couldn't find any critical bugs in this snippet.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 3c.132 0 .263 0 .393 0a.75.75 0 0 0 .144-1.486l-.873-.11a.75.75 0 0 1-.658-.658l-.11-.873a.75.75 0 0 0-1.486.144c0 .13-.001.261-.001.393V3h2.591ZM12 21c-.132 0-.263 0-.393 0a.75.75 0 0 0-.144 1.486l.873.11a.75.75 0 0 1 .658.658l.11.873a.75.75 0 0 0 1.486-.144c0-.13.001-.261.001-.393V21H12ZM3 12c0-.132 0-.263 0-.393a.75.75 0 0 0-1.486-.144l-.11.873a.75.75 0 0 1-.658.658l-.873.11a.75.75 0 0 0 .144 1.486c.13 0 .261.001.393.001H3V12ZM21 12c0 .132 0 .263 0 .393a.75.75 0 0 0 1.486.144l.11-.873a.75.75 0 0 1 .658-.658l.873-.11a.75.75 0 0 0-.144-1.486c-.13 0-.261-.001-.393-.001H21V12ZM16.5 7.5l-.884-.884a.75.75 0 0 0-1.06 1.06l.883.884a.75.75 0 0 1 0 1.06l-.883.884a.75.75 0 0 0 1.06 1.06l.884-.884a.75.75 0 0 1 1.06 0l.884.884a.75.75 0 0 0 1.06-1.06l-.884-.884a.75.75 0 0 1 0-1.06l.884-.884a.75.75 0 0 0-1.06-1.06l-.884.884a.75.75 0 0 1-1.06 0ZM7.5 16.5l.884.884a.75.75 0 0 0 1.06-1.06l-.883-.884a.75.75 0 0 1 0-1.06l.883-.884a.75.75 0 0 0-1.06-1.06l-.884.884a.75.75 0 0 1-1.06 0l-.884-.884a.75.75 0 0 0-1.06 1.06l.884.884a.75.75 0 0 1 0 1.06l-.884.884a.75.75 0 0 0 1.06 1.06l.884-.884a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}
