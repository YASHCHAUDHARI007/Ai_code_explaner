import { Code2, Bug, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="neo-blur sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl group-hover:bg-primary/40 transition-colors" />
            <div className="relative bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Code2 className="text-white h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tighter">
            Neuralyze <span className="text-primary">Studio</span>
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer group">
            <BookOpen className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span>Guide</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer group">
            <Bug className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span>Changelog</span>
          </div>
        </nav>
      </div>
    </header>
  );
}