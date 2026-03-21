'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, AlertCircle } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface InputAreaProps {
  onAnalyze: (data: { code: string; language: string; errorMessage?: string }) => void;
  isLoading: boolean;
}

export function InputArea({ onAnalyze, isLoading }: InputAreaProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = () => {
    if (code.trim()) {
      onAnalyze({ code, language, errorMessage: errorMessage.trim() || undefined });
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
            <p className="text-xs text-muted-foreground">Select language and input source</p>
          </div>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
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
        </div>

        <Button 
          className="w-full h-12 text-lg font-headline font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-all active:scale-[0.98]"
          onClick={handleAnalyze}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin rounded-full" />
              Processing Parallel Analysis...
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
