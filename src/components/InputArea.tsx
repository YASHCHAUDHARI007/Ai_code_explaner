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
const SUPPORTED_EXTENSIONS = ['.py', '.java', '.js', '.ts', '.tsx', '.jsx', '.c', '.cpp', '.h', '.hpp', '.html', '.css', '.json', '.md', '.go', '.rs', '.php'];
const PRIORITY_FILES = ['README.md', 'package.json', 'requirements.txt', 'main.py', 'app.py', 'index.js', 'server.js', 'tsconfig.json', 'Cargo.toml', 'pom.xml', 'build.gradle'];

export function InputArea({ onAnalyze, isLoading }: InputAreaProps) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'beginner' | 'developer'>('developer');
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
        description: `ZIP files are limited to ${MAX_ZIP_SIZE / (1024 * 1024)}MB.` 
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Sparkles className="text-accent h-5 w-5" />
            </div>
            <div>
              <h2 className="font-headline font-semibold">Workspace Settings</h2>
              <p className="text-xs text-muted-foreground">Configure your analysis engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-secondary p-1 rounded-lg border border-border/50">
              <button
                onClick={() => setMode('beginner')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all",
                  mode === 'beginner' ? "bg-background text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-3 w-3" />
                Beginner
              </button>
              <button
                onClick={() => setMode('developer')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all",
                  mode === 'developer' ? "bg-background text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Terminal className="h-3 w-3" />
                Developer
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">AI Intelligence</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full h-9 bg-secondary border-border focus:ring-accent">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">✨ Auto-Select (Intelligent)</SelectItem>
                  <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (Speed)</SelectItem>
                  <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Logic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
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
          <div 
            className={cn(
              "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-card/30 hover:bg-card/50 transition-colors cursor-pointer",
              zipProcessingStatus && "pointer-events-none opacity-80"
            )} 
            onClick={() => !zipProcessingStatus && fileInputRef.current?.click()}
          >
            {zipProcessingStatus ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-accent animate-spin" />
                <p className="text-sm font-medium text-accent">{zipProcessingStatus}</p>
              </div>
            ) : (
              <>
                <FileUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-headline font-bold">Click to Upload</h3>
                <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
                  Supported formats: .py, .java, .js, .ts, .c, .cpp, .html, .css, .json, and .md
                  <br />
                  max limit: 15mb
                </p>
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
                  disabled={isFetchingGitHub || !githubUrl}
                  variant="secondary"
                >
                  {isFetchingGitHub ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="error-logs" className="border rounded-lg bg-card/50 px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Add Runtime Error (Optional)</span>
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
        disabled={isLoading || !code.trim() || !!zipProcessingStatus}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            AI Processing...
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
