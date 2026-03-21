
'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Sparkles, AlertCircle, Github, FileUp, Clipboard, Loader2 } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchGitHubRepo } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface InputAreaProps {
  onAnalyze: (data: { code: string; language: string; errorMessage?: string }) => void;
  isLoading: boolean;
}

export function InputArea({ onAnalyze, isLoading }: InputAreaProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [errorMessage, setErrorMessage] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (code.trim()) {
      onAnalyze({ code, language, errorMessage: errorMessage.trim() || undefined });
    }
  };

  const handleGithubFetch = async () => {
    if (!githubUrl.includes('github.com')) {
      toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid GitHub repository URL.' });
      return;
    }
    setIsFetchingGithub(true);
    try {
      const combinedCode = await fetchGitHubRepo(githubUrl);
      setCode(combinedCode);
      toast({ title: 'Repo Fetched', description: 'Sample code from root directory loaded.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fetch Failed', description: err.message });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.zip')) {
      const zip = new JSZip();
      try {
        const content = await zip.loadAsync(file);
        let extractedText = '';
        let fileCount = 0;
        
        // Extract first 5 text/code files
        for (const [filename, fileData] of Object.entries(content.files)) {
          if (!fileData.dir && fileCount < 5 && !filename.includes('node_modules')) {
            const text = await fileData.async('string');
            extractedText += `// File: ${filename}\n${text}\n\n`;
            fileCount++;
          }
        }
        setCode(extractedText);
        toast({ title: 'ZIP Extracted', description: `Loaded content from ${fileCount} files.` });
      } catch (err) {
        toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not process ZIP file.' });
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target?.result as string);
        toast({ title: 'File Loaded', description: file.name });
      };
      reader.readAsText(file);
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
            <h2 className="font-headline font-semibold">Input Mode</h2>
            <p className="text-xs text-muted-foreground">Choose how to provide code</p>
          </div>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 h-12">
          <TabsTrigger value="paste" className="flex gap-2">
            <Clipboard className="h-4 w-4" />
            Paste
          </TabsTrigger>
          <TabsTrigger value="file" className="flex gap-2">
            <FileUp className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="github" className="flex gap-2">
            <Github className="h-4 w-4" />
            GitHub
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <div className="relative">
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-muted px-2 py-0.5 rounded text-[10px] uppercase font-bold text-muted-foreground">Source Code</span>
            </div>
            <Textarea
              placeholder="Paste your source code here..."
              className="min-h-[300px] pt-10 font-code text-sm bg-background border-border focus-visible:ring-accent resize-none shadow-inner"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="file">
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-card/30 hover:bg-card/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-headline font-bold">Click to Upload</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">Support for .zip, .txt, .ts, .js, .py, .java, etc.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
              accept=".zip,.txt,.ts,.tsx,.js,.jsx,.py,.java,.c,.cpp"
            />
          </div>
        </TabsContent>

        <TabsContent value="github">
          <div className="p-8 border rounded-xl bg-card/30 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub Repository URL</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://github.com/owner/repo" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="bg-background"
                />
                <Button 
                  onClick={handleGithubFetch} 
                  disabled={isFetchingGithub || !githubUrl}
                  variant="secondary"
                >
                  {isFetchingGithub ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Note: This will fetch a few sample files from the repository root to provide context for analysis.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="error-logs" className="border rounded-lg bg-card/50 px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Add Runtime Error / Stack Trace (Optional)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              placeholder="Paste error messages or stack traces here..."
              className="min-h-[150px] font-code text-xs bg-background border-destructive/20 focus-visible:ring-destructive resize-none mt-2"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button 
        className="w-full h-12 text-lg font-headline font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-all active:scale-[0.98]"
        onClick={handleAnalyze}
        disabled={isLoading || !code.trim()}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Parallel AI Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 fill-current" />
            Analyze Codebase
          </div>
        )}
      </Button>
    </div>
  );
}
