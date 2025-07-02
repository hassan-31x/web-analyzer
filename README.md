# Inspectr - Website Analyzer

Inspectr is a modern, open-source website analyzer that helps you ensure your website is production-ready. It checks for SEO essentials, performance optimizations, metadata, and more, providing a comprehensive report in seconds.

## Features
- **SEO Analysis**: Checks for meta tags, keywords, canonical URLs, and more.
- **Performance Insights**: Analyzes HTML size, caching headers, and compression.
- **Social Media Readiness**: Validates Open Graph and Twitter metadata.
- **Security Checks**: Ensures HTTPS, Content Security Policy, and other headers are in place.
- **AI Integration**: Detects AI-related meta tags and structured data.
- **Responsive Design**: Verifies viewport and language settings.

## Tech Stack
- **Frontend**: [Next.js](https://nextjs.org), React, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Parsing**: [Cheerio](https://cheerio.js.org) for HTML parsing, [JSDOM](https://github.com/jsdom/jsdom) for DOM manipulation
- **Styling**: Tailwind CSS with custom gradients and glass morphism

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm, yarn, or pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/inspectr.git
   cd inspectr
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running Locally
Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Building for Production
To build the app for production:
```bash
npm run build
```

To start the production server:
```bash
npm start
```

## How It Works

### Overview
Inspectr analyzes websites by fetching their HTML and running various checks using both server-side and client-side tools. The results are displayed in a modern, user-friendly interface.

### Key Components
1. **API Route** (`/api/analyze`):
   - Fetches the website's HTML using `fetch`.
   - Parses the HTML using `Cheerio` and `JSDOM`.
   - Runs checks for metadata, performance, security, and more.
   - Returns a structured JSON response with analysis results.

2. **Frontend**:
   - **Hero Section**: Highlights the app's purpose and features.
   - **URL Form**: Allows users to input a website URL for analysis.
   - **Results Page**: Displays a detailed report with collapsible sections for each category.

3. **Styling**:
   - Tailwind CSS is used for responsive design and modern UI elements.
   - Custom gradients and glass morphism effects enhance the visual appeal.

### Example Snippet
#### API Route (`/api/analyze`)
```typescript
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text();
    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Frontend (`page.tsx`)
```tsx
<section className="relative px-4 md:px-6 py-20 md:py-32 overflow-hidden">
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl animate-float"></div>
  </div>
  <div className="container mx-auto relative">
    <h1 className="text-4xl md:text-6xl font-bold">Ensure Your Website is Ready for Production</h1>
  </div>
</section>
```

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments
- [Next.js](https://nextjs.org)
- [Cheerio](https://cheerio.js.org)
- [Tailwind CSS](https://tailwindcss.com)
