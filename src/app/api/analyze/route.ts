import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { createMockResult } from './mock';

// Check if we're in development mode
// const isDevelopment = process.env.NODE_ENV === 'development';
const isDevelopment = false;

// Timeout function for fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Types for our analysis result
interface AnalysisItem {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  preview?: string;
}

interface AnalysisCategory {
  name: string;
  score: number;
  items: AnalysisItem[];
}

interface AnalysisResult {
  url: string;
  overallScore: number;
  categories: AnalysisCategory[];
  timestamp: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  // If in development mode, return mock data
  if (isDevelopment) {
    const mockResult = createMockResult(url);
    return NextResponse.json(mockResult);
  }

  try {
    // Fetch the website
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    
    // Get response headers
    const headers = Object.fromEntries(response.headers.entries());
    
    // Parse the HTML using JSDOM
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Check for various elements
    const result = analyzeWebsite(url, html, doc, headers, response.status);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// Function to analyze the website
function analyzeWebsite(url: string, html: string, doc: Document, headers: Record<string, string>, statusCode: number): AnalysisResult {
  // Initialize categories and items
  const categories: AnalysisCategory[] = [
    {
      name: 'Metadata',
      score: 0,
      items: checkMetadata(doc),
    },
    {
      name: 'Favicon',
      score: 0,
      items: checkFavicon(doc),
    },
    {
      name: 'Social Media',
      score: 0,
      items: checkSocialMedia(doc),
    },
    {
      name: 'SEO Files',
      score: 0,
      items: checkSEOFiles(url),
    },
    {
      name: 'Performance',
      score: 0,
      items: checkPerformance(html, headers),
    },
    {
      name: 'AI Integration',
      score: 0,
      items: checkAIIntegration(doc, url),
    },
    {
      name: 'Security',
      score: 0,
      items: checkSecurity(headers),
    },
  ];

  // Calculate scores for each category
  categories.forEach(category => {
    if (category.items.length === 0) {
      category.score = 0;
    } else {
      const successItems = category.items.filter(item => item.status === 'success').length;
      const warningItems = category.items.filter(item => item.status === 'warning').length;
      category.score = Math.round((successItems + warningItems * 0.5) / category.items.length * 100);
    }
  });

  // Calculate overall score
  const totalItems = categories.reduce((total, category) => total + category.items.length, 0);
  const totalSuccessItems = categories.reduce((total, category) => 
    total + category.items.filter(item => item.status === 'success').length, 0);
  const totalWarningItems = categories.reduce((total, category) => 
    total + category.items.filter(item => item.status === 'warning').length, 0);
  
  const overallScore = totalItems > 0 
    ? Math.round((totalSuccessItems + totalWarningItems * 0.5) / totalItems * 100) 
    : 0;

  return {
    url,
    overallScore,
    categories,
    timestamp: new Date().toISOString(),
  };
}

// Check metadata
function checkMetadata(doc: Document): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for title
  const title = doc.querySelector('title')?.textContent;
  items.push({
    name: 'Title',
    status: title ? (title.length > 10 && title.length < 70 ? 'success' : 'warning') : 'error',
    message: title 
      ? (title.length > 10 && title.length < 70 
        ? `Title present with optimal length (${title.length} characters)`
        : `Title present but length (${title.length} characters) is not optimal (recommended: 10-70 characters)`) 
      : 'Title tag is missing',
    preview: title || undefined,
  });

  // Check for meta description
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content');
  items.push({
    name: 'Meta Description',
    status: description ? (description.length > 50 && description.length < 160 ? 'success' : 'warning') : 'error',
    message: description 
      ? (description.length > 50 && description.length < 160 
        ? `Meta description present with optimal length (${description.length} characters)`
        : `Meta description present but length (${description.length} characters) is not optimal (recommended: 50-160 characters)`) 
      : 'Meta description is missing',
    preview: description || undefined,
  });

  // Check for meta keywords
  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content');
  items.push({
    name: 'Meta Keywords',
    status: keywords ? 'success' : 'warning',
    message: keywords 
      ? 'Meta keywords present'
      : 'Meta keywords not present (not critical for SEO but may help with some search engines)',
    preview: keywords || undefined,
  });

  // Check for canonical URL
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  items.push({
    name: 'Canonical URL',
    status: canonical ? 'success' : 'warning',
    message: canonical 
      ? `Canonical URL present: ${canonical}`
      : 'Canonical URL not present (recommended to prevent duplicate content issues)',
    preview: canonical || undefined,
  });

  // Check for viewport
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content');
  items.push({
    name: 'Viewport',
    status: viewport ? 'success' : 'error',
    message: viewport 
      ? `Viewport tag present: ${viewport}`
      : 'Viewport meta tag is missing (required for responsive design)',
    preview: viewport || undefined,
  });

  // Check for charset
  const charset = doc.querySelector('meta[charset]')?.getAttribute('charset');
  items.push({
    name: 'Character Set',
    status: charset ? 'success' : 'error',
    message: charset 
      ? `Character set specified: ${charset}`
      : 'Character set meta tag is missing',
    preview: charset || undefined,
  });

  // Check for language
  const language = doc.querySelector('html')?.getAttribute('lang');
  items.push({
    name: 'Language',
    status: language ? 'success' : 'warning',
    message: language 
      ? `Language specified: ${language}`
      : 'HTML lang attribute is missing (recommended for accessibility and SEO)',
    preview: language || undefined,
  });

  return items;
}

// Check favicon
function checkFavicon(doc: Document): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for traditional favicon
  const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  items.push({
    name: 'Standard Favicon',
    status: favicon ? 'success' : 'error',
    message: favicon 
      ? `Standard favicon present: ${favicon.getAttribute('href')}`
      : 'Standard favicon is missing',
    preview: favicon ? favicon.getAttribute('href') || undefined : undefined,
  });

  // Check for Apple Touch Icon
  const appleTouchIcon = doc.querySelector('link[rel="apple-touch-icon"]');
  items.push({
    name: 'Apple Touch Icon',
    status: appleTouchIcon ? 'success' : 'warning',
    message: appleTouchIcon 
      ? `Apple Touch Icon present: ${appleTouchIcon.getAttribute('href')}`
      : 'Apple Touch Icon is missing (recommended for iOS devices)',
    preview: appleTouchIcon ? appleTouchIcon.getAttribute('href') || undefined : undefined,
  });

  // Check for Web App Manifest
  const manifest = doc.querySelector('link[rel="manifest"]');
  items.push({
    name: 'Web App Manifest',
    status: manifest ? 'success' : 'warning',
    message: manifest 
      ? `Web App Manifest present: ${manifest.getAttribute('href')}`
      : 'Web App Manifest is missing (recommended for PWA support)',
    preview: manifest ? manifest.getAttribute('href') || undefined : undefined,
  });

  return items;
}

// Check social media tags
function checkSocialMedia(doc: Document): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for Open Graph title
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  items.push({
    name: 'OG Title',
    status: ogTitle ? 'success' : 'warning',
    message: ogTitle 
      ? `Open Graph title present: ${ogTitle}`
      : 'Open Graph title is missing (recommended for social media sharing)',
    preview: ogTitle || undefined,
  });

  // Check for Open Graph description
  const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
  items.push({
    name: 'OG Description',
    status: ogDescription ? 'success' : 'warning',
    message: ogDescription 
      ? `Open Graph description present`
      : 'Open Graph description is missing (recommended for social media sharing)',
    preview: ogDescription || undefined,
  });

  // Check for Open Graph image
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
  items.push({
    name: 'OG Image',
    status: ogImage ? 'success' : 'warning',
    message: ogImage 
      ? `Open Graph image present: ${ogImage}`
      : 'Open Graph image is missing (recommended for social media sharing)',
    preview: ogImage || undefined,
  });

  // Check for Open Graph URL
  const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content');
  items.push({
    name: 'OG URL',
    status: ogUrl ? 'success' : 'warning',
    message: ogUrl 
      ? `Open Graph URL present: ${ogUrl}`
      : 'Open Graph URL is missing (recommended for social media sharing)',
    preview: ogUrl || undefined,
  });

  // Check for Twitter Card
  const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
  items.push({
    name: 'Twitter Card',
    status: twitterCard ? 'success' : 'warning',
    message: twitterCard 
      ? `Twitter Card present: ${twitterCard}`
      : 'Twitter Card is missing (recommended for Twitter sharing)',
    preview: twitterCard || undefined,
  });

  // Check for Twitter Image
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  items.push({
    name: 'Twitter Image',
    status: twitterImage ? 'success' : 'warning',
    message: twitterImage 
      ? `Twitter Image present`
      : 'Twitter Image is missing (recommended for Twitter sharing)',
    preview: twitterImage || undefined,
  });

  return items;
}

// Check SEO files
function checkSEOFiles(url: string): AnalysisItem[] {
  // Note: In a real implementation, we would check for the existence of these files
  // by making HTTP requests. For this example, we're simulating the checks.
  const items: AnalysisItem[] = [];

  // For a real implementation, we would check if these files exist by making HEAD requests
  items.push({
    name: 'robots.txt',
    status: 'warning', // Simulated status
    message: 'Could not verify robots.txt file (server-side check required)',
  });

  items.push({
    name: 'sitemap.xml',
    status: 'warning', // Simulated status
    message: 'Could not verify sitemap.xml file (server-side check required)',
  });

  items.push({
    name: 'humans.txt',
    status: 'warning', // Simulated status
    message: 'Could not verify humans.txt file (server-side check required)',
  });

  items.push({
    name: 'security.txt',
    status: 'warning', // Simulated status
    message: 'Could not verify security.txt file (server-side check required)',
  });

  return items;
}

// Check performance
function checkPerformance(html: string, headers: Record<string, string>): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for caching headers
  const cacheControl = headers['cache-control'];
  items.push({
    name: 'Cache Control',
    status: cacheControl ? 'success' : 'warning',
    message: cacheControl 
      ? `Cache-Control header present: ${cacheControl}`
      : 'Cache-Control header is missing (recommended for better performance)',
    preview: cacheControl || undefined,
  });

  // Check HTML size
  const htmlSize = Math.round(html.length / 1024);
  items.push({
    name: 'HTML Size',
    status: htmlSize < 100 ? 'success' : htmlSize < 200 ? 'warning' : 'error',
    message: htmlSize < 100 
      ? `HTML size is good (${htmlSize} KB)`
      : htmlSize < 200 
        ? `HTML size is acceptable (${htmlSize} KB)`
        : `HTML size is too large (${htmlSize} KB, recommended: < 100 KB)`,
    preview: `${htmlSize} KB`,
  });

  // Check for minified CSS (simplified check)
  const cssMinified = !html.includes('</style>') || !html.match(/\/\*[\s\S]*?\*\//g);
  items.push({
    name: 'CSS Minification',
    status: cssMinified ? 'success' : 'warning',
    message: cssMinified 
      ? 'CSS appears to be minified or loaded externally'
      : 'CSS might not be minified (detected comments or inline styles)',
  });

  // Check for minified JS (simplified check)
  const jsMinified = !html.includes('</script>') || !html.match(/\/\/[\s\S]*?\n/g);
  items.push({
    name: 'JS Minification',
    status: jsMinified ? 'success' : 'warning',
    message: jsMinified 
      ? 'JavaScript appears to be minified or loaded externally'
      : 'JavaScript might not be minified (detected comments or inline scripts)',
  });

  // Check for GZIP compression
  const contentEncoding = headers['content-encoding'];
  items.push({
    name: 'Compression',
    status: contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br')) ? 'success' : 'warning',
    message: contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br'))
      ? `Content compression is enabled: ${contentEncoding}`
      : 'Content compression (gzip/brotli) may not be enabled',
    preview: contentEncoding || undefined,
  });

  return items;
}

// Check AI integration
function checkAIIntegration(doc: Document, url: string): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for llm.txt (Note: In a real implementation, we would make an HTTP request to check)
  items.push({
    name: 'LLM.txt',
    status: 'warning', // Simulated status
    message: 'Could not verify llm.txt file (server-side check required)',
  });

  // Check for AI-related meta tags
  const aiMetaTags = Array.from(doc.querySelectorAll('meta'))
    .filter(meta => 
      meta.getAttribute('name')?.includes('ai') || 
      meta.getAttribute('property')?.includes('ai') ||
      meta.getAttribute('name')?.includes('bot') ||
      meta.getAttribute('property')?.includes('bot')
    );

  items.push({
    name: 'AI Meta Tags',
    status: aiMetaTags.length > 0 ? 'success' : 'warning',
    message: aiMetaTags.length > 0
      ? `Found ${aiMetaTags.length} AI-related meta tags`
      : 'No AI-related meta tags found (optional but becoming more common)',
    preview: aiMetaTags.length > 0 
      ? aiMetaTags.map(tag => `${tag.getAttribute('name') || tag.getAttribute('property')}: ${tag.getAttribute('content')}`).join('\n')
      : undefined,
  });

  // Check for structured data (simplified check)
  const structuredData = doc.querySelectorAll('script[type="application/ld+json"]');
  const structuredDataContent = structuredData.length > 0 
    ? Array.from(structuredData)[0].textContent 
    : null;

  items.push({
    name: 'Structured Data',
    status: structuredData.length > 0 ? 'success' : 'warning',
    message: structuredData.length > 0
      ? `Found ${structuredData.length} structured data blocks`
      : 'No structured data found (recommended for better SEO and AI understanding)',
    preview: structuredDataContent || undefined,
  });

  return items;
}

// Check security
function checkSecurity(headers: Record<string, string>): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for HTTPS
  const isHttps = headers['x-forwarded-proto'] === 'https' || headers['x-forwarded-protocol'] === 'https';
  items.push({
    name: 'HTTPS',
    status: isHttps ? 'success' : 'error',
    message: isHttps 
      ? 'Website is served over HTTPS'
      : 'Website is not served over HTTPS (strongly recommended for security)',
  });

  // Check for Content Security Policy
  const csp = headers['content-security-policy'];
  items.push({
    name: 'Content Security Policy',
    status: csp ? 'success' : 'warning',
    message: csp 
      ? 'Content Security Policy is implemented'
      : 'Content Security Policy header is missing (recommended for better security)',
    preview: csp || undefined,
  });

  // Check for X-Content-Type-Options
  const xContentTypeOptions = headers['x-content-type-options'];
  items.push({
    name: 'X-Content-Type-Options',
    status: xContentTypeOptions === 'nosniff' ? 'success' : 'warning',
    message: xContentTypeOptions === 'nosniff'
      ? 'X-Content-Type-Options header is properly set'
      : 'X-Content-Type-Options header is missing or not set to nosniff',
    preview: xContentTypeOptions || undefined,
  });

  // Check for X-XSS-Protection
  const xXssProtection = headers['x-xss-protection'];
  items.push({
    name: 'X-XSS-Protection',
    status: xXssProtection ? 'success' : 'warning',
    message: xXssProtection
      ? `X-XSS-Protection header is set: ${xXssProtection}`
      : 'X-XSS-Protection header is missing',
    preview: xXssProtection || undefined,
  });

  // Check for Strict-Transport-Security
  const hsts = headers['strict-transport-security'];
  items.push({
    name: 'HTTP Strict Transport Security',
    status: hsts ? 'success' : 'warning',
    message: hsts
      ? 'HSTS header is implemented'
      : 'HSTS header is missing (recommended for HTTPS security)',
    preview: hsts || undefined,
  });

  return items;
} 