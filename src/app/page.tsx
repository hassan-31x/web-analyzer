import Header from '../components/Header';
import UrlForm from '../components/UrlForm';
import FeatureList from '../components/FeatureList';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 md:px-6 py-20 md:py-32 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-secondary/20 to-tertiary/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="gradient-text">Ensure Your Website</span>
                  <br />
                  <span className="text-foreground">is Ready for</span>
                  <br />
                  <span className="gradient-text">Production</span>
                </h1>
                <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
                  Our advanced analyzer checks for common oversights in website publishing, from SEO essentials to performance optimizations. Get a comprehensive report in seconds.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span>Free Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>No Signup Required</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* URL Form Section */}
        <section className="px-4 md:px-6 pb-20">
          <div className="container mx-auto">
            <UrlForm />
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 md:px-6 pb-20">
          <div className="container mx-auto">
            <FeatureList />
          </div>
        </section>
      </main>
      
      <footer className="relative border-t border-foreground-tertiary/20 py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-background-secondary/50 to-background-tertiary/50"></div>
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-foreground-tertiary relative">
          <p>© {new Date().getFullYear()} Inspectr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
