'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function UrlForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple URL validation
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }

    try {
      setIsLoading(true);
      // We'll redirect to the analysis page with the URL as a query parameter
      router.push(`/analyze?url=${encodeURIComponent(formattedUrl)}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., example.com)"
            className="w-full px-4 py-3 border border-solid border-black/[.08] dark:border-white/[.145] 
              rounded-radius-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary
              placeholder-foreground/50 text-foreground"
            disabled={isLoading}
          />
          {error && (
            <p className="text-error text-sm mt-1">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium 
            rounded-radius-lg hover:opacity-90 transition-opacity disabled:opacity-70
            flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Website'
          )}
        </button>
      </form>
    </div>
  );
} 