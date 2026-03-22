import { Code2, Bug, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Code2 className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight">
            Neural <span className="text-accent">Insight</span>
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <BookOpen className="h-4 w-4" />
            <span>Guide</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Bug className="h-4 w-4" />
            <span>Changelog</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
