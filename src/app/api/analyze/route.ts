import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { load } from 'cheerio';
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
    
    // Parse the HTML using both JSDOM and Cheerio for better compatibility
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const $ = load(html);
    
    // Check for various elements
    const result = analyzeWebsite(url, html, doc, $, headers, response.status);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// Function to resolve relative URLs to absolute URLs
function resolveUrl(baseUrl: string, relativeUrl: string): string {
  if (!relativeUrl) return '';
  
  // If already absolute URL, return as is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // If protocol-relative URL
  if (relativeUrl.startsWith('//')) {
    const protocol = baseUrl.startsWith('https://') ? 'https:' : 'http:';
    return protocol + relativeUrl;
  }
  
  // Create URL object to resolve relative paths
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    // Fallback for malformed URLs
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const relative = relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl;
    return base + relative;
  }
}

// Function to analyze the website
function analyzeWebsite(url: string, html: string, doc: Document, $: cheerio.Root, headers: Record<string, string>, statusCode: number): AnalysisResult {
  // Initialize categories and items
  const categories: AnalysisCategory[] = [
    {
      name: 'Metadata',
      score: 0,
      items: checkMetadata(doc, $, url),
    },
    {
      name: 'Favicon',
      score: 0,
      items: checkFavicon(doc, $, url),
    },
    {
      name: 'Social Media',
      score: 0,
      items: checkSocialMedia(doc, $, url),
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
      items: checkAIIntegration(doc, $, url),
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
function checkMetadata(doc: Document, $: cheerio.Root, baseUrl: string): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for title - use cheerio for better text extraction
  const title = $('title').text().trim();
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

  // Check for meta description - use cheerio for better attribute extraction
  const description = $('meta[name="description"]').attr('content')?.trim();
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
  const keywords = $('meta[name="keywords"]').attr('content')?.trim();
  items.push({
    name: 'Meta Keywords',
    status: keywords ? 'success' : 'warning',
    message: keywords 
      ? 'Meta keywords present'
      : 'Meta keywords not present (not critical for SEO but may help with some search engines)',
    preview: keywords || undefined,
  });

  // Check for canonical URL
  const canonical = $('link[rel="canonical"]').attr('href')?.trim();
  items.push({
    name: 'Canonical URL',
    status: canonical ? 'success' : 'warning',
    message: canonical 
      ? `Canonical URL present: ${canonical}`
      : 'Canonical URL not present (recommended to prevent duplicate content issues)',
    preview: canonical ? resolveUrl(baseUrl, canonical) : undefined,
  });

  // Check for viewport
  const viewport = $('meta[name="viewport"]').attr('content')?.trim();
  items.push({
    name: 'Viewport',
    status: viewport ? 'success' : 'error',
    message: viewport 
      ? `Viewport tag present: ${viewport}`
      : 'Viewport meta tag is missing (required for responsive design)',
    preview: viewport || undefined,
  });

  // Check for charset
  const charset = $('meta[charset]').attr('charset')?.trim();
  items.push({
    name: 'Character Set',
    status: charset ? 'success' : 'error',
    message: charset 
      ? `Character set specified: ${charset}`
      : 'Character set meta tag is missing',
    preview: charset || undefined,
  });

  // Check for language
  const language = $('html').attr('lang')?.trim();
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
function checkFavicon(doc: Document, $: cheerio.Root, baseUrl: string): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for traditional favicon
  const faviconHref = $('link[rel="icon"], link[rel="shortcut icon"]').first().attr('href')?.trim();
  const faviconUrl = faviconHref ? resolveUrl(baseUrl, faviconHref) : undefined;
  items.push({
    name: 'Standard Favicon',
    status: faviconHref ? 'success' : 'error',
    message: faviconHref 
      ? `Standard favicon present: ${faviconHref}`
      : 'Standard favicon is missing',
    preview: faviconUrl,
  });

  // Check for Apple Touch Icon
  const appleTouchIconHref = $('link[rel="apple-touch-icon"]').first().attr('href')?.trim();
  const appleTouchIconUrl = appleTouchIconHref ? resolveUrl(baseUrl, appleTouchIconHref) : undefined;
  items.push({
    name: 'Apple Touch Icon',
    status: appleTouchIconHref ? 'success' : 'warning',
    message: appleTouchIconHref 
      ? `Apple Touch Icon present: ${appleTouchIconHref}`
      : 'Apple Touch Icon is missing (recommended for iOS devices)',
    preview: appleTouchIconUrl,
  });

  // Check for Web App Manifest
  const manifestHref = $('link[rel="manifest"]').first().attr('href')?.trim();
  const manifestUrl = manifestHref ? resolveUrl(baseUrl, manifestHref) : undefined;
  items.push({
    name: 'Web App Manifest',
    status: manifestHref ? 'success' : 'warning',
    message: manifestHref 
      ? `Web App Manifest present: ${manifestHref}`
      : 'Web App Manifest is missing (recommended for PWA support)',
    preview: manifestUrl,
  });

  return items;
}

// Check social media tags
function checkSocialMedia(doc: Document, $: cheerio.Root, baseUrl: string): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for Open Graph title
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  items.push({
    name: 'OG Title',
    status: ogTitle ? 'success' : 'warning',
    message: ogTitle 
      ? `Open Graph title present: ${ogTitle}`
      : 'Open Graph title is missing (recommended for social media sharing)',
    preview: ogTitle || undefined,
  });

  // Check for Open Graph description
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim();
  items.push({
    name: 'OG Description',
    status: ogDescription ? 'success' : 'warning',
    message: ogDescription 
      ? `Open Graph description present`
      : 'Open Graph description is missing (recommended for social media sharing)',
    preview: ogDescription || undefined,
  });

  // Check for Open Graph image
  const ogImageHref = $('meta[property="og:image"]').attr('content')?.trim();
  const ogImageUrl = ogImageHref ? resolveUrl(baseUrl, ogImageHref) : undefined;
  items.push({
    name: 'OG Image',
    status: ogImageHref ? 'success' : 'warning',
    message: ogImageHref 
      ? `Open Graph image present: ${ogImageHref}`
      : 'Open Graph image is missing (recommended for social media sharing)',
    preview: ogImageUrl,
  });

  // Check for Open Graph URL
  const ogUrl = $('meta[property="og:url"]').attr('content')?.trim();
  items.push({
    name: 'OG URL',
    status: ogUrl ? 'success' : 'warning',
    message: ogUrl 
      ? `Open Graph URL present: ${ogUrl}`
      : 'Open Graph URL is missing (recommended for social media sharing)',
    preview: ogUrl || undefined,
  });

  // Check for Twitter Card
  const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim();
  items.push({
    name: 'Twitter Card',
    status: twitterCard ? 'success' : 'warning',
    message: twitterCard 
      ? `Twitter Card present: ${twitterCard}`
      : 'Twitter Card is missing (recommended for Twitter sharing)',
    preview: twitterCard || undefined,
  });

  // Check for Twitter Image
  const twitterImageHref = $('meta[name="twitter:image"]').attr('content')?.trim();
  const twitterImageUrl = twitterImageHref ? resolveUrl(baseUrl, twitterImageHref) : undefined;
  items.push({
    name: 'Twitter Image',
    status: twitterImageHref ? 'success' : 'warning',
    message: twitterImageHref 
      ? `Twitter Image present`
      : 'Twitter Image is missing (recommended for Twitter sharing)',
    preview: twitterImageUrl,
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
function checkAIIntegration(doc: Document, $: cheerio.Root, url: string): AnalysisItem[] {
  const items: AnalysisItem[] = [];

  // Check for llm.txt (Note: In a real implementation, we would make an HTTP request to check)
  items.push({
    name: 'LLM.txt',
    status: 'warning', // Simulated status
    message: 'Could not verify llm.txt file (server-side check required)',
  });

  // Check for AI-related meta tags using cheerio for better searching
  const aiMetaTags: string[] = [];
  $('meta').each((_, element) => {
    const $el = $(element);
    const name = $el.attr('name') || $el.attr('property');
    const content = $el.attr('content');
    
    if (name && content && (
      name.toLowerCase().includes('ai') || 
      name.toLowerCase().includes('bot') ||
      name.toLowerCase().includes('robot') ||
      name.toLowerCase().includes('llm')
    )) {
      aiMetaTags.push(`${name}: ${content}`);
    }
  });

  items.push({
    name: 'AI Meta Tags',
    status: aiMetaTags.length > 0 ? 'success' : 'warning',
    message: aiMetaTags.length > 0
      ? `Found ${aiMetaTags.length} AI-related meta tags`
      : 'No AI-related meta tags found (optional but becoming more common)',
    preview: aiMetaTags.length > 0 ? aiMetaTags.join('\n') : undefined,
  });

  // Check for structured data (simplified check)
  const structuredDataBlocks: string[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const content = $(element).html()?.trim();
    if (content) {
      structuredDataBlocks.push(content);
    }
  });

  const structuredDataContent = structuredDataBlocks.length > 0 
    ? structuredDataBlocks[0].substring(0, 200) + (structuredDataBlocks[0].length > 200 ? '...' : '')
    : null;

  items.push({
    name: 'Structured Data',
    status: structuredDataBlocks.length > 0 ? 'success' : 'warning',
    message: structuredDataBlocks.length > 0
      ? `Found ${structuredDataBlocks.length} structured data blocks`
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