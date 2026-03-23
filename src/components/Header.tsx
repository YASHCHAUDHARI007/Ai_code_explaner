import { Bug, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="neo-blur sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl group-hover:bg-primary/40 transition-colors" />
            <div className="relative bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <svg 
                viewBox="0 0 100 100" 
                fill="none" 
                className="h-7 w-7 text-black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M50 20C40 20 30 25 25 35C22 40 20 45 20 50C20 60 25 68 32 73C34 75 35 78 35 81V83C35 85 37 87 39 87H61C63 87 65 85 65 83V81C65 78 66 75 68 73C75 68 80 60 80 50C80 45 78 40 75 35C70 25 60 20 50 20Z" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                />
                <circle cx="50" cy="40" r="4" fill="currentColor" />
                <circle cx="35" cy="45" r="3" fill="currentColor" />
                <circle cx="65" cy="45" r="3" fill="currentColor" />
                <circle cx="42" cy="58" r="3" fill="currentColor" />
                <circle cx="58" cy="58" r="3" fill="currentColor" />
                <circle cx="50" cy="70" r="3" fill="currentColor" />
                <path d="M50 40L35 45M50 40L65 45M35 45L42 58M65 45L58 58M42 58L50 70M58 58L50 70" stroke="currentColor" strokeWidth="1.5" />
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