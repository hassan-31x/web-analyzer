export default function Header() {
  return (
    <header className="w-full py-6 glass border-b border-foreground-tertiary/20 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              WebSiteAnalyzer
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-foreground-secondary">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              Production Ready
            </span>
          </div>
        </div>
        <p className="text-center mt-3 text-sm text-foreground-secondary">
          Analyze your website for common publishing requirements
        </p>
      </div>
    </header>
  );
} 