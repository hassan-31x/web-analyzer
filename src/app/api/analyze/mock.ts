// Mock data for testing the analyzer

export interface MockAnalysisResult {
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

export const createMockResult = (url: string): MockAnalysisResult => {
  return {
    url,
    overallScore: 78,
    categories: [
      {
        name: 'Metadata',
        score: 85,
        items: [
          {
            name: 'Title',
            status: 'success',
            message: 'Title present with optimal length (54 characters)',
            preview: 'Website Analyzer - Check your website for publishing requirements',
          },
          {
            name: 'Meta Description',
            status: 'success',
            message: 'Meta description present with optimal length (142 characters)',
            preview: 'Our website analyzer checks for common oversights in website publishing, from SEO essentials to performance optimizations. Get a comprehensive report in seconds.',
          },
          {
            name: 'Meta Keywords',
            status: 'warning',
            message: 'Meta keywords not present (not critical for SEO but may help with some search engines)',
          },
          {
            name: 'Canonical URL',
            status: 'success',
            message: `Canonical URL present: ${url}`,
            preview: url,
          },
          {
            name: 'Viewport',
            status: 'success',
            message: 'Viewport tag present: width=device-width, initial-scale=1.0',
            preview: 'width=device-width, initial-scale=1.0',
          },
          {
            name: 'Character Set',
            status: 'success',
            message: 'Character set specified: UTF-8',
            preview: 'UTF-8',
          },
          {
            name: 'Language',
            status: 'success',
            message: 'Language specified: en',
            preview: 'en',
          },
        ],
      },
      {
        name: 'Favicon',
        score: 67,
        items: [
          {
            name: 'Standard Favicon',
            status: 'success',
            message: 'Standard favicon present: /favicon.ico',
            preview: '/favicon.ico',
          },
          {
            name: 'Apple Touch Icon',
            status: 'warning',
            message: 'Apple Touch Icon is missing (recommended for iOS devices)',
          },
          {
            name: 'Web App Manifest',
            status: 'warning',
            message: 'Web App Manifest is missing (recommended for PWA support)',
          },
        ],
      },
      {
        name: 'Social Media',
        score: 50,
        items: [
          {
            name: 'OG Title',
            status: 'success',
            message: 'Open Graph title present: Example Website',
            preview: 'Example Website',
          },
          {
            name: 'OG Description',
            status: 'success',
            message: 'Open Graph description present',
            preview: 'This is an example website description for social media sharing',
          },
          {
            name: 'OG Image',
            status: 'warning',
            message: 'Open Graph image is missing (recommended for social media sharing)',
          },
          {
            name: 'OG URL',
            status: 'warning',
            message: 'Open Graph URL is missing (recommended for social media sharing)',
          },
          {
            name: 'Twitter Card',
            status: 'warning',
            message: 'Twitter Card is missing (recommended for Twitter sharing)',
          },
          {
            name: 'Twitter Image',
            status: 'warning',
            message: 'Twitter Image is missing (recommended for Twitter sharing)',
          },
        ],
      },
      {
        name: 'SEO Files',
        score: 75,
        items: [
          {
            name: 'robots.txt',
            status: 'success',
            message: 'robots.txt file found',
            preview: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: /sitemap.xml',
          },
          {
            name: 'sitemap.xml',
            status: 'success',
            message: 'sitemap.xml file found',
            preview: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n  </url>\n</urlset>',
          },
          {
            name: 'humans.txt',
            status: 'warning',
            message: 'humans.txt file not found (optional but recommended)',
          },
          {
            name: 'security.txt',
            status: 'warning',
            message: 'security.txt file not found (optional but recommended for security contacts)',
          },
        ],
      },
      {
        name: 'Performance',
        score: 90,
        items: [
          {
            name: 'Cache Control',
            status: 'success',
            message: 'Cache-Control header present: max-age=3600, public',
            preview: 'max-age=3600, public',
          },
          {
            name: 'HTML Size',
            status: 'success',
            message: 'HTML size is good (42 KB)',
          },
          {
            name: 'CSS Minification',
            status: 'success',
            message: 'CSS appears to be minified or loaded externally',
          },
          {
            name: 'JS Minification',
            status: 'success',
            message: 'JavaScript appears to be minified or loaded externally',
          },
          {
            name: 'Compression',
            status: 'warning',
            message: 'Content compression (gzip/brotli) may not be enabled',
          },
        ],
      },
      {
        name: 'AI Integration',
        score: 33,
        items: [
          {
            name: 'LLM.txt',
            status: 'error',
            message: 'No llm.txt file found',
          },
          {
            name: 'AI Meta Tags',
            status: 'warning',
            message: 'No AI-related meta tags found (optional but becoming more common)',
          },
          {
            name: 'Structured Data',
            status: 'success',
            message: 'Found 2 structured data blocks',
            preview: '{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Example Website",\n  "url": "https://example.com"\n}',
          },
        ],
      },
      {
        name: 'Security',
        score: 80,
        items: [
          {
            name: 'HTTPS',
            status: 'success',
            message: 'Website is served over HTTPS',
          },
          {
            name: 'Content Security Policy',
            status: 'warning',
            message: 'Content Security Policy header is missing (recommended for better security)',
          },
          {
            name: 'X-Content-Type-Options',
            status: 'success',
            message: 'X-Content-Type-Options header is properly set',
            preview: 'nosniff',
          },
          {
            name: 'X-XSS-Protection',
            status: 'success',
            message: 'X-XSS-Protection header is set: 1; mode=block',
            preview: '1; mode=block',
          },
          {
            name: 'HTTP Strict Transport Security',
            status: 'warning',
            message: 'HSTS header is missing (recommended for HTTPS security)',
          },
        ],
      },
    ],
    timestamp: new Date().toISOString(),
  };
}; 