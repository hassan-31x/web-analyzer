import { ReactNode } from 'react';

interface FeatureProps {
  title: string;
  description: string;
  icon: ReactNode;
  gradient: string;
}

function Feature({ title, description, icon, gradient }: FeatureProps) {
  return (
    <div className="group relative">
      <div className="glass rounded-xl p-6 border border-foreground-tertiary/20 hover:border-foreground-tertiary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${gradient} text-white shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 text-lg">{title}</h3>
            <p className="text-sm text-foreground-secondary leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureList() {
  const features = [
    {
      title: 'SEO & Metadata',
      description: 'Comprehensive check of title tags, meta descriptions, keywords, canonical URLs, and other essential SEO elements',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
      ),
    },
    {
      title: 'Favicons & Icons',
      description: 'Verify different favicon formats, sizes, and Apple touch icons for optimal display across all devices and platforms',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      title: 'Social Media Tags',
      description: 'Comprehensive analysis of Open Graph and Twitter card metadata for perfect social media sharing experience',
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
    },
    {
      title: 'Critical Files',
      description: 'Validate essential files like robots.txt, sitemap.xml, humans.txt, and security.txt for complete website setup',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      title: 'Performance Metrics',
      description: 'Deep analysis of image optimization, CSS/JS minification, caching headers, and loading performance indicators',
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      title: 'AI Integration',
      description: 'Modern AI-readiness check including llm.txt files, AI-related meta tags, and structured data for AI crawlers',
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="gradient-text">Comprehensive Analysis</span>
        </h2>
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          Our advanced analyzer checks every critical aspect of your website to ensure it's production-ready
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <div className="glass rounded-xl p-8 border border-foreground-tertiary/20">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span>100+ Checks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Detailed Reports</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <div className="w-3 h-3 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <span>Export Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 