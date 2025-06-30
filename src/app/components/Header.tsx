export default function Header() {
  return (
    <header className="w-full py-6 border-b border-solid border-black/[.08] dark:border-white/[.145]">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          WebSiteAnalyzer
        </h1>
        <p className="text-center mt-2 text-sm text-foreground/70">
          Analyze your website for common publishing requirements
        </p>
      </div>
    </header>
  );
} 