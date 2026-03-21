'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileCode, Github, Upload, Play, Sparkles } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface InputAreaProps {
  onAnalyze: (data: { code: string; language: string }) => void;
  isLoading: boolean;
}

export function InputArea({ onAnalyze, isLoading }: InputAreaProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [repoUrl, setRepoUrl] = useState('');

  const handleAnalyze = () => {
    if (code.trim()) {
      onAnalyze({ code, language });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-lg">
            <Sparkles className="text-accent h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headline font-semibold">Select Input Method</h2>
            <p className="text-xs text-muted-foreground">Provide your code for AI analysis</p>
          </div>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary h-11">
          <TabsTrigger value="paste" className="flex items-center gap-2 data-[state=active]:bg-background">
            <FileCode className="h-4 w-4" />
            <span className="hidden sm:inline">Paste Code</span>
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub URL</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload ZIP</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-4 space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Paste your source code here..."
              className="min-h-[300px] font-code text-sm bg-background border-border focus-visible:ring-accent resize-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button 
            className="w-full h-12 text-lg font-headline font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleAnalyze}
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin rounded-full" />
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 fill-current" />
                Start Analysis
              </div>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="github" className="mt-4">
          <div className="bg-card border rounded-xl p-8 text-center space-y-4">
            <Github className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-headline font-semibold text-lg">Analyze Repository</h3>
              <p className="text-sm text-muted-foreground">Enter a public repository URL to analyze the entire codebase structure.</p>
              <div className="flex gap-2 mt-4">
                <Input 
                  placeholder="https://github.com/username/repo" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="bg-background"
                />
                <Button variant="secondary" onClick={() => alert('This would fetch and parse the repo in a production environment.')}>Fetch</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <div className="bg-card border border-dashed rounded-xl p-12 text-center space-y-4">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="font-headline font-semibold text-lg">Upload Project ZIP</h3>
              <p className="text-sm text-muted-foreground">Drop your project archive here to analyze all source files together.</p>
              <Button variant="outline" className="mt-4" onClick={() => alert('ZIP parsing requires a backend utility. In this demo, please use Paste Code.')}>Choose File</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}