'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
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
  const [expandedCategories, setExpandedCategories] = useState<{[key: number]: boolean}>({});

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
        
        // Auto-expand all categories by default
        const defaultExpanded: {[key: number]: boolean} = {};
        data.categories?.forEach((_: any, index: number) => {
          defaultExpanded[index] = true;
        });
        setExpandedCategories(defaultExpanded);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [url]);

  // Helper function to toggle category expansion
  const toggleCategory = (categoryIndex: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex]
    }));
  };

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
          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 rounded-full bg-error/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper function to check if item has meaningful preview content
  const hasPreview = (item: any) => {
    // Check if item has explicit preview data or extractable content
    if (item.preview) return true;
    
    return item.status === 'success' && 
      (item.name.includes('Title') || 
       item.name.includes('Description') || 
       item.name.includes('Keywords') ||
       item.name.includes('Author') ||
       item.name.includes('Canonical') ||
       item.name.includes('Language') ||
       item.name.includes('Viewport') ||
       item.name.includes('Charset') ||
       item.name.includes('Theme') ||
       item.name.includes('Generator') ||
       item.name.includes('Image') || 
       item.name.includes('Favicon') ||
       item.name.includes('Icon') ||
       item.name.includes('Manifest') ||
       item.name.includes('OG') ||
       item.name.includes('Twitter') ||
       item.name.includes('Cache') ||
       item.name.includes('Size') ||
       item.name.includes('Encoding') ||
       item.name.includes('Structured') ||
       item.name.includes('AI') ||
       item.message.includes('present:') ||
       item.message.includes('found:') ||
       item.message.includes('detected:') ||
       item.message.includes('is:') ||
       item.message.includes('set to:') ||
       item.message.includes('size:') ||
       item.message.includes('content:'));
  };

  // Helper function to extract content from message or preview
  const extractPreviewContent = (item: any) => {
    if (item.preview) return item.preview;
    
    // Try to extract content from various message formats
    const patterns = [
      /present:\s*"([^"]+)"/i,
      /present:\s*([^()\n]+?)(?:\s*\(|$)/i,
      /found:\s*"([^"]+)"/i,
      /found:\s*([^()\n]+?)(?:\s*\(|$)/i,
      /detected:\s*"([^"]+)"/i,
      /detected:\s*([^()\n]+?)(?:\s*\(|$)/i,
      /content:\s*"([^"]+)"/i,
      /value:\s*"([^"]+)"/i,
      /is:\s*"([^"]+)"/i,
      /is:\s*([^()\n]+?)(?:\s*\(|$)/i,
      /set to:\s*"([^"]+)"/i,
      /set to:\s*([^()\n]+?)(?:\s*\(|$)/i,
      /size:\s*([0-9.]+\s*[A-Za-z]+)/i,
      /encoding:\s*([A-Za-z0-9-]+)/i,
      /"([^"]+)"/i,
    ];
    
    for (const pattern of patterns) {
      const match = item.message.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  // Helper function to render preview content
  const renderPreview = (item: any) => {
    const previewContent = extractPreviewContent(item);
    if (!previewContent) return null;
    
    // Handle images and favicons
    if (item.name.includes('Image') || item.name.includes('Favicon') || item.name.includes('Icon')) {
      return (
        <div className="mt-3 p-3 glass rounded-lg border border-foreground-tertiary/20">
          <p className="text-xs mb-2 text-foreground-tertiary font-medium">Preview:</p>
          <div className="flex items-center gap-3">
            <img 
              src={previewContent}
              alt={`${item.name} preview`} 
              className="max-h-16 max-w-16 object-contain border border-foreground-tertiary/20 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const nextElement = (e.target as HTMLImageElement).nextElementSibling;
                if (nextElement) nextElement.textContent = 'Image could not be loaded';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground-tertiary">URL:</p>
              <p className="text-sm text-foreground-secondary break-all">{previewContent}</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle different types of content with appropriate styling
    const getContentType = () => {
      if (item.name.includes('Title')) return { type: 'Title', icon: '📄', maxLength: 60 };
      if (item.name.includes('Description')) return { type: 'Description', icon: '📝', maxLength: 160 };
      if (item.name.includes('Keywords')) return { type: 'Keywords', icon: '🏷️', maxLength: 200 };
      if (item.name.includes('Author')) return { type: 'Author', icon: '👤', maxLength: 100 };
      if (item.name.includes('Language')) return { type: 'Language', icon: '🌐', maxLength: 50 };
      if (item.name.includes('Canonical')) return { type: 'URL', icon: '🔗', maxLength: 100 };
      if (item.name.includes('Theme')) return { type: 'Color', icon: '🎨', maxLength: 50 };
      if (item.name.includes('Viewport')) return { type: 'Viewport', icon: '📱', maxLength: 100 };
      if (item.name.includes('Cache')) return { type: 'Cache', icon: '⚡', maxLength: 100 };
      if (item.name.includes('Size')) return { type: 'Size', icon: '📊', maxLength: 50 };
      if (item.name.includes('Encoding')) return { type: 'Encoding', icon: '🔤', maxLength: 50 };
      return { type: 'Content', icon: '📋', maxLength: 150 };
    };
    
    const { type, icon, maxLength } = getContentType();
    const isLong = previewContent.length > maxLength;
    const displayContent = isLong ? `${previewContent.substring(0, maxLength)}...` : previewContent;
    
    return (
      <div className="mt-3 p-3 glass rounded-lg border border-foreground-tertiary/20">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-sm">{icon}</span>
          <p className="text-xs text-foreground-tertiary font-medium">{type}:</p>
        </div>
        <div className="bg-background-secondary/50 rounded-md p-3 border border-foreground-tertiary/10">
          <p className="text-sm text-foreground break-words leading-relaxed">{displayContent}</p>
          {isLong && (
            <p className="text-xs text-foreground-tertiary mt-2">
              Length: {previewContent.length} characters
            </p>
          )}
        </div>
        {type === 'Title' && previewContent.length > 60 && (
          <p className="text-xs text-warning mt-1">⚠️ Title longer than recommended 60 characters</p>
        )}
        {type === 'Description' && (previewContent.length < 120 || previewContent.length > 160) && (
          <p className="text-xs text-warning mt-1">⚠️ Description should be 120-160 characters</p>
        )}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-success to-emerald-400';
    if (score >= 60) return 'from-warning to-yellow-400';
    return 'from-error to-red-400';
  };

  // Helper function to determine if preview should be shown by default
  const shouldShowPreviewByDefault = (item: any) => {
    // Show previews by default for important SEO and metadata content
    return item.status === 'success' && (
      item.name.includes('Title') ||
      item.name.includes('Description') ||
      item.name.includes('Keywords') ||
      item.name.includes('Author') ||
      item.name.includes('Canonical') ||
      item.name.includes('Language') ||
      item.name.includes('OG Title') ||
      item.name.includes('OG Description') ||
      item.name.includes('Twitter Card') ||
      item.name.includes('Favicon') ||
      item.name.includes('Theme') ||
      item.name.includes('Viewport')
    );
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('metadata') || name.includes('seo')) return '📊';
    if (name.includes('favicon') || name.includes('icon')) return '🎯';
    if (name.includes('social')) return '📱';
    if (name.includes('files') || name.includes('robot')) return '📁';
    if (name.includes('performance')) return '⚡';
    if (name.includes('ai') || name.includes('llm')) return '🤖';
    if (name.includes('security')) return '🔒';
    if (name.includes('accessibility')) return '♿';
    return '📋';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 md:px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-foreground-tertiary/20"></div>
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">Analyzing Website</h2>
              <p className="mt-2 text-foreground-secondary">{url}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-foreground-tertiary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Running comprehensive checks...</span>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-8 border border-error/20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-error mb-4">Analysis Failed</h2>
                <p className="text-foreground-secondary mb-6">{error}</p>
                <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all duration-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Try Again
                </Link>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="glass rounded-2xl p-8 border border-foreground-tertiary/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3 gradient-text">Analysis Complete</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-foreground-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors break-all">
                        {result.url}
                      </a>
                    </div>
                    <p className="text-sm text-foreground-tertiary">
                      Analyzed on {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center lg:text-right">
                    <div className="mb-2">
                      <span className="text-4xl font-bold gradient-text">{result.overallScore}%</span>
                    </div>
                    <p className="text-sm text-foreground-secondary">Overall Score</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="w-full h-3 bg-background-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getScoreColor(result.overallScore)} transition-all duration-1000 ease-out`}
                      style={{ width: `${result.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.categories.map((category, index) => {
                  const icon = getCategoryIcon(category.name);
                  const itemsWithPreviews = category.items.filter(item => hasPreview(item));
                  const successItems = category.items.filter(item => item.status === 'success');
                  
                  return (
                    <div key={index} className="glass rounded-xl p-4 border border-foreground-tertiary/20 hover:border-foreground-tertiary/40 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{icon}</span>
                        <h3 className="font-medium text-foreground text-sm">{category.name}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold gradient-text">{category.score}%</div>
                        <div className="text-right text-xs text-foreground-tertiary">
                          <div>{successItems.length}/{category.items.length} passed</div>
                          <div>{itemsWithPreviews.length} with data</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allExpanded: {[key: number]: boolean} = {};
                      result.categories.forEach((_, index) => {
                        allExpanded[index] = true;
                      });
                      setExpandedCategories(allExpanded);
                    }}
                    className="px-4 py-2 text-sm glass border border-foreground-tertiary/30 text-foreground rounded-lg hover:border-foreground-tertiary/50 transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={() => setExpandedCategories({})}
                    className="px-4 py-2 text-sm glass border border-foreground-tertiary/30 text-foreground rounded-lg hover:border-foreground-tertiary/50 transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
                <div className="text-sm text-foreground-tertiary">
                  {Object.values(expandedCategories).filter(Boolean).length} of {result.categories.length} categories expanded
                </div>
              </div>
              
              {/* Categories */}
              <div className="space-y-6">
                {result.categories.map((category, categoryIndex) => {
                  const isExpanded = expandedCategories[categoryIndex];
                  const categoryIcon = getCategoryIcon(category.name);
                  const itemsWithPreviews = category.items.filter(item => hasPreview(item));
                  const totalItems = category.items.length;
                  
                  return (
                    <div key={categoryIndex} className="glass rounded-2xl border border-foreground-tertiary/20 overflow-hidden">
                      <button
                        onClick={() => toggleCategory(categoryIndex)}
                        className="w-full p-6 border-b border-foreground-tertiary/20 hover:bg-foreground-tertiary/5 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{categoryIcon}</span>
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
                              <p className="text-sm text-foreground-tertiary">
                                {totalItems} checks • {itemsWithPreviews.length} with previews
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-lg font-semibold text-foreground">{category.score}%</span>
                              <div className="w-24 h-2 bg-background-secondary rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getScoreColor(category.score)} transition-all duration-500`}
                                  style={{ width: `${category.score}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-2">
                              <svg 
                                className={`w-5 h-5 text-foreground-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="divide-y divide-foreground-tertiary/10">
                          {category.items.map((item, itemIndex) => {
                            const previewKey = `${categoryIndex}-${itemIndex}`;
                            const isPreviewExpanded = expandedPreviews[previewKey];
                            const canShowPreview = hasPreview(item);
                            
                            return (
                              <div key={itemIndex} className="p-6 hover:bg-foreground-tertiary/5 transition-colors">
                                <div className="flex items-start gap-4">
                                  <div className={getStatusColor(item.status)}>
                                    {getStatusIcon(item.status)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-foreground mb-1">{item.name}</h4>
                                        <p className="text-sm text-foreground-secondary leading-relaxed">{item.message}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Show preview for all content that has meaningful data */}
                                    {canShowPreview && (
                                      <div className="mt-3">
                                        {(isPreviewExpanded || shouldShowPreviewByDefault(item)) ? (
                                          <>
                                            {renderPreview(item)}
                                            {!shouldShowPreviewByDefault(item) && (
                                              <button 
                                                onClick={() => togglePreview(categoryIndex, itemIndex)}
                                                className="text-xs text-primary hover:text-primary-light transition-colors mt-2"
                                              >
                                                Hide Preview
                                              </button>
                                            )}
                                          </>
                                        ) : (
                                          <button 
                                            onClick={() => togglePreview(categoryIndex, itemIndex)}
                                            className="text-xs text-primary hover:text-primary-light transition-colors"
                                          >
                                            Show Preview
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link href="/" className="px-8 py-4 bg-gradient-to-r from-primary via-secondary to-tertiary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-center">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Another Website
                </Link>
                <button className="px-8 py-4 glass border border-foreground-tertiary/30 text-foreground font-semibold rounded-xl hover:border-foreground-tertiary/50 transition-all duration-300">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Report
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="glass rounded-2xl p-8 border border-foreground-tertiary/20 max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-foreground mb-4">No Data Available</h2>
                <p className="text-foreground-secondary mb-6">We couldn't retrieve analysis data for this request.</p>
                <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all duration-300">
                  Go Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="relative border-t border-foreground-tertiary/20 py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-background-secondary/50 to-background-tertiary/50"></div>
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-foreground-tertiary relative">
          <p>© {new Date().getFullYear()} WebSiteAnalyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
