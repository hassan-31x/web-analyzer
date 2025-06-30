import Header from './components/Header';
import UrlForm from './components/UrlForm';
import FeatureList from './components/FeatureList';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 md:px-6 py-12">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Ensure Your Website is Ready for Production
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Our analyzer checks for common oversights in website publishing, from SEO essentials to performance optimizations.
              Get a comprehensive report in seconds.
            </p>
          </div>
          
          <UrlForm />
          <FeatureList />
        </div>
      </main>
      
      <footer className="border-t border-solid border-black/[.08] dark:border-white/[.145] py-6">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-foreground/70">
          <p>© {new Date().getFullYear()} WebSiteAnalyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
