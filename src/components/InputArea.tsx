'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Sparkles, AlertCircle, Github, FileUp, Clipboard, Loader2, User, Terminal, Cpu } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchGitHubRepo } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface InputAreaProps {
  onAnalyze: (data: { code: string; mode: 'beginner' | 'developer'; model: string; errorMessage?: string }) => void;
  isLoading: boolean;
}

const MAX_ZIP_SIZE = 15 * 1024 * 1024; 
const MAX_TOTAL_CHARS = 50000;
const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'venv', '__pycache__', 'images', 'videos', 'bin', 'obj', '.next', 'out', 'target'];
const SUPPORTED_EXTENSIONS = ['.py', '.java', '.js', '.ts', '.tsx', '.jsx', '. Eisen', '.c', '.cpp', '.h', '.hpp', '.html', '.css', '.json', '.md', '.go', '.rs', '.php'];
const PRIORITY_FILES = ['README.md', 'package.json', 'requirements.txt', 'main.py', 'app.py', 'index.js', 'server.js', 'tsconfig.json', 'Cargo.toml', 'pom.xml', 'build.gradle'];

export function InputArea({ onAnalyze, isLoading }: InputAreaProps) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'beginner' | 'developer'>('beginner');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [errorMessage, setErrorMessage] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isFetchingGitHub, setIsFetchingGitHub] = useState(false);
  const [zipProcessingStatus, setZipProcessingStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (code.trim()) {
      onAnalyze({ 
        code, 
        mode, 
        model: selectedModel,
        errorMessage: errorMessage.trim() || undefined 
      });
    }
  };

  const handleGithubFetch = async () => {
    if (!githubUrl.includes('github.com')) {
      toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid GitHub repository URL.' });
      return;
    }
    setIsFetchingGitHub(true);
    try {
      const combinedCode = await fetchGitHubRepo(githubUrl);
      setCode(combinedCode);
      toast({ title: 'Repo Fetched', description: 'Sample code from root directory loaded.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fetch Failed', description: err.message });
    } finally {
      setIsFetchingGitHub(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ZIP_SIZE) {
      toast({ 
        variant: 'destructive', 
        title: 'File Too Large', 
        description: `ZIP files are limited to 15mb.` 
      });
      return;
    }

    if (file.name.endsWith('.zip')) {
      setZipProcessingStatus('Reading ZIP structure...');
      const zip = new JSZip();
      try {
        const zipContent = await zip.loadAsync(file);
        let extractedText = '';
        let totalChars = 0;
        let fileCount = 0;
        
        const filesToProcess: { name: string; file: JSZip.JSZipObject; priority: boolean }[] = [];
        
        for (const [filename, fileData] of Object.entries(zipContent.files)) {
          if (fileData.dir) continue;
          
          const pathParts = filename.split('/');
          const isIgnored = pathParts.some(part => IGNORED_DIRS.includes(part));
          const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
          const isSupported = SUPPORTED_EXTENSIONS.includes(ext);
          
          if (!isIgnored && isSupported) {
            const baseName = pathParts[pathParts.length - 1];
            filesToProcess.push({
              name: filename,
              file: fileData,
              priority: PRIORITY_FILES.includes(baseName)
            });
          }
        }

        filesToProcess.sort((a, b) => (a.priority === b.priority ? 0 : a.priority ? -1 : 1));

        setZipProcessingStatus(`Extracting ${filesToProcess.length} valid source files...`);

        for (const entry of filesToProcess) {
          if (totalChars >= MAX_TOTAL_CHARS) break;

          const text = await entry.file.async('string');
          const remainingLimit = MAX_TOTAL_CHARS - totalChars;
          const textToAppend = text.length > remainingLimit ? text.substring(0, remainingLimit) + '\n... [File Truncated]' : text;
          
          extractedText += `// --- File: ${entry.name} ---\n${textToAppend}\n\n`;
          totalChars += textToAppend.length;
          fileCount++;
        }

        setCode(extractedText);
        setZipProcessingStatus(null);
        
        toast({ 
          title: 'ZIP Processed Successfully', 
          description: `Extracted content from ${fileCount} files.` 
        });
      } catch (err) {
        setZipProcessingStatus(null);
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
    <div className="space-y-8 h-full flex flex-col">
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl shadow-inner border border-primary/20">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-foreground">Workspace Settings</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Configure your analysis engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-secondary p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setMode('beginner')}
              className={cn(
                "flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all",
                mode === 'beginner' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <User className="h-3.5 w-3.5" />
              Beginner
            </button>
            <button
              onClick={() => setMode('developer')}
              className={cn(
                "flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all",
                mode === 'developer' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
              Developer
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Cpu className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Intelligence</span>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full h-12 bg-secondary border-white/5 focus:ring-primary rounded-2xl">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="glass-card rounded-2xl">
                <SelectItem value="auto">✨ Auto-Select (Intelligent)</SelectItem>
                <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (Speed)</SelectItem>
                <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Logic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <Tabs defaultValue="paste" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-secondary p-1.5 h-14 rounded-2xl border border-white/5">
            <TabsTrigger value="paste" className="rounded-xl flex gap-2 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clipboard className="h-4 w-4" />
              Paste
            </TabsTrigger>
            <TabsTrigger value="file" className="rounded-xl flex gap-2 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileUp className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="github" className="rounded-xl flex gap-2 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="flex-1 mt-6">
            <div className="glass-card rounded-3xl overflow-hidden h-full min-h-[400px] flex flex-col">
              <div className="bg-secondary/50 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Source Code</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                </div>
              </div>
              <Textarea
                placeholder="Paste your source code here..."
                className="flex-1 p-6 font-code text-sm bg-transparent border-none focus-visible:ring-0 resize-none text-foreground"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="flex-1 mt-6">
            <div 
              className={cn(
                "h-full min-h-[400px] flex flex-col items-center justify-center p-12 glass-card rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 transition-all cursor-pointer group",
                zipProcessingStatus && "pointer-events-none opacity-80"
              )} 
              onClick={() => !zipProcessingStatus && fileInputRef.current?.click()}
            >
              {zipProcessingStatus ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
                    <Loader2 className="h-16 w-16 text-primary animate-spin relative" />
                  </div>
                  <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">{zipProcessingStatus}</p>
                </div>
              ) : (
                <>
                  <div className="bg-secondary p-6 rounded-3xl border border-white/5 group-hover:scale-110 group-hover:bg-primary/10 transition-all mb-6">
                    <FileUp className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-foreground">Click to Upload</h3>
                  <div className="text-sm text-muted-foreground text-center mt-4 max-w-xs leading-relaxed space-y-1">
                    <p>Supported formats: .py, .java, .js, .ts, .c, .cpp, .html, .css, .json, and .md</p>
                    <p className="font-bold text-primary/80 uppercase tracking-widest text-[10px]">max limit: 15mb</p>
                  </div>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept=".zip,.txt,.ts,.tsx,.js,.jsx,.py,.java,.c,.cpp,.go,.rs,.php"
              />
            </div>
          </TabsContent>

          <TabsContent value="github" className="flex-1 mt-6">
            <div className="h-full min-h-[400px] p-10 glass-card rounded-3xl flex flex-col items-center justify-center space-y-8">
              <div className="bg-secondary p-6 rounded-3xl border border-white/5">
                <Github className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="w-full max-w-md space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block text-center">GitHub Repository URL</label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="https://github.com/owner/repo" 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="bg-secondary border-white/5 h-12 rounded-2xl px-6 focus:ring-primary text-foreground"
                  />
                  <Button 
                    onClick={handleGithubFetch} 
                    disabled={isFetchingGitHub || !githubUrl}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 rounded-2xl font-bold shadow-lg shadow-primary/20 text-primary-foreground"
                  >
                    {isFetchingGitHub ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Fetch'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="error-logs" className="border-none glass-card rounded-2xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4 text-muted-foreground hover:text-foreground transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Add Runtime Error (Optional)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Textarea
                placeholder="Paste error messages or stack traces here..."
                className="min-h-[150px] font-code text-xs bg-secondary/50 border-white/5 focus-visible:ring-destructive rounded-xl resize-none mt-2 text-foreground"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button 
          className="w-full h-16 text-xl font-headline font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all active:scale-[0.98] group relative overflow-hidden mt-8"
          onClick={handleAnalyze}
          disabled={isLoading || !code.trim() || !!zipProcessingStatus}
        >
          <div className="absolute inset-0 bg-white/10 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          {isLoading ? (
            <div className="flex items-center gap-3 relative z-10">
              <Loader2 className="h-6 w-6 animate-spin" />
              AI Processing...
            </div>
          ) : (
            <div className="flex items-center gap-3 relative z-10">
              <Play className="h-6 w-6 fill-current" />
              Analyze Codebase
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}