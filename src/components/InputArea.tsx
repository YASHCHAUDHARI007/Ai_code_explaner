'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface InputAreaProps {
  onAnalyze: (data: { code: string; language: string }) => void;
  isLoading: boolean;
}

export function InputArea({ onAnalyze, isLoading }: InputAreaProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');

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
            <h2 className="font-headline font-semibold">Ready to Analyze</h2>
            <p className="text-xs text-muted-foreground">Select language and paste your source code</p>
          </div>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Paste your source code here..."
            className="min-h-[400px] font-code text-sm bg-background border-border focus-visible:ring-accent resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <Button 
          className="w-full h-12 text-lg font-headline font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-all active:scale-[0.98]"
          onClick={handleAnalyze}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin rounded-full" />
              Running AI Analysis...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 fill-current" />
              Analyze Codebase
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}