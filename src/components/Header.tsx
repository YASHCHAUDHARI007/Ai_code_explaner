import { Bug, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="neo-blur sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl group-hover:bg-primary/40 transition-colors" />
            <div className="relative bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-black"
              >
                <path 
                  d="M12 2L4.5 6.5V15.5L12 20L19.5 15.5V6.5L12 2" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <path 
                  d="M12 7V9M12 15V17M7.5 9.5L9 10.5M15 13.5L16.5 14.5M7.5 14.5L9 13.5M15 10.5L16.5 9.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
              </svg>
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
