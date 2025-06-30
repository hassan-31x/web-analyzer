'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Link from 'next/link';

interface AnalysisResult {
  url: string;
  overallScore: number;
  categories: {
    name: string;
    score: number;
    items: {
      name: string;
      status: 'success' | 'warning' | 'error';
      message: string;
      preview?: string;
    }[];
  }[];
  timestamp: string;
}

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPreviews, setExpandedPreviews] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [url]);

  // Helper function to toggle preview expansion
  const togglePreview = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedPreviews(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to get color class based on status
  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-foreground';
    }
  };

  // Helper function to get icon based on status
  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Helper function to extract preview content from item
  const hasPreview = (item: any) => {
    return item.status === 'success' && 
      (item.name.includes('Title') || 
       item.name.includes('Description') || 
       item.name.includes('Image') || 
       item.name.includes('Favicon') ||
       item.name.includes('OG') ||
       item.name.includes('Twitter'));
  };

  // Helper function to render preview content
  const renderPreview = (item: any) => {
    if (!item.preview && !item.message.includes('present:')) return null;
    
    let previewContent = item.preview;
    
    // If no explicit preview, try to extract from message
    if (!previewContent && item.message.includes('present:')) {
      const match = item.message.match(/present: (.*?)($|\s\()/);
      if (match && match[1]) {
        previewContent = match[1];
      }
    }
    
    if (!previewContent) return null;
    
    if (item.name.includes('Image') || item.name.includes('Favicon')) {
      return (
        <div className="mt-2 p-2 bg-gray-light rounded-radius-md">
          <p className="text-xs mb-1 text-foreground/60">Preview:</p>
          <img 
            src={previewContent.startsWith('http') ? previewContent : `${url}${previewContent.startsWith('/') ? '' : '/'}${previewContent}`} 
            alt={`${item.name} preview`} 
            className="max-h-20 max-w-full object-contain border border-black/10"
          />
        </div>
      );
    } else {
      return (
        <div className="mt-2 p-2 bg-gray-light rounded-radius-md">
          <p className="text-xs mb-1 text-foreground/60">Content:</p>
          <p className="text-sm break-words">{previewContent}</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 md:px-6 py-12">
        <div className="container mx-auto max-w-5xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-foreground/70">Analyzing {url}...</p>
            </div>
          ) : error ? (
            <div className="bg-error/10 rounded-radius-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-error mb-4">Error</h2>
              <p className="mb-6">{error}</p>
              <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-radius-md">
                Try Again
              </Link>
            </div>
          ) : result ? (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Analysis Report</h1>
                <div className="flex items-center gap-2">
                  <span className="text-foreground/70">URL:</span>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {result.url}
                  </a>
                </div>
                <p className="text-sm text-foreground/60 mt-1">Analyzed on {new Date(result.timestamp).toLocaleString()}</p>
              </div>
              
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Overall Score</h2>
                  <div className="text-2xl font-bold">
                    {result.overallScore}%
                  </div>
                </div>
                <div className="w-full bg-gray-light rounded-radius-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${result.overallScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-8">
                {result.categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="border border-black/[.08] dark:border-white/[.145] rounded-radius-lg overflow-hidden">
                    <div className="p-4 bg-gray-light border-b border-black/[.08] dark:border-white/[.145] flex justify-between items-center">
                      <h3 className="font-semibold">{category.name}</h3>
                      <div className="flex items-center gap-2">
                        <span>{category.score}%</span>
                        <div className="w-20 bg-foreground/10 rounded-radius-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${category.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-black/[.08] dark:divide-white/[.145]">
                      {category.items.map((item, itemIndex) => {
                        const previewKey = `${categoryIndex}-${itemIndex}`;
                        const isExpanded = expandedPreviews[previewKey];
                        const canShowPreview = hasPreview(item);
                        
                        return (
                          <div key={itemIndex} className="p-4 flex items-start gap-3">
                            <div className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-foreground/70 mt-1">{item.message}</p>
                              
                              {canShowPreview && (
                                <div>
                                  {isExpanded ? (
                                    <>
                                      {renderPreview(item)}
                                      <button 
                                        onClick={() => togglePreview(categoryIndex, itemIndex)}
                                        className="text-xs text-primary mt-2 hover:underline"
                                      >
                                        Hide Preview
                                      </button>
                                    </>
                                  ) : (
                                    <button 
                                      onClick={() => togglePreview(categoryIndex, itemIndex)}
                                      className="text-xs text-primary mt-2 hover:underline"
                                    >
                                      Show Preview
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 flex justify-center">
                <Link href="/" className="px-6 py-3 bg-foreground text-background rounded-radius-lg hover:opacity-90">
                  Analyze Another Website
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p>No data available</p>
              <Link href="/" className="inline-flex items-center px-4 py-2 mt-4 bg-primary text-white rounded-radius-md">
                Go Home
              </Link>
            </div>
          )}
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