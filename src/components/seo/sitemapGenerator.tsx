import { useEffect } from 'react';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const SitemapGenerator = () => {
  useEffect(() => {
    // Generate dynamic sitemap URLs
    const sitemapUrls: SitemapUrl[] = [
      {
        loc: 'https://tvanamm.com/',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: 'https://tvanamm.com/about',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: 'https://tvanamm.com/franchise',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: 'https://tvanamm.com/order',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.9
      },
      {
        loc: 'https://tvanamm.com/franchise-inventory',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.7
      },
      {
        loc: 'https://tvanamm.com/login',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: 'https://tvanamm.com/signup',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.5
      }
    ];

    // Generate XML content
    const generateSitemapXML = (urls: SitemapUrl[]): string => {
      const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urlEntries}
</urlset>`;
    };

    // Update meta tags dynamically for current page
    const updatePageMeta = () => {
      const path = window.location.pathname;
      let title = 'Tvanamm - Premium Tea Collection | Indian Tea Online';
      let description = 'Discover Tvanamm\'s premium tea collection sourced directly from Indian tea gardens. Order online, explore franchise opportunities, and join our tea-loving community.';

      switch (path) {
        case '/about':
          title = 'About Tvanamm - Premium Indian Tea Company | Our Story';
          description = 'Learn about Tvanamm\'s journey from Darjeeling tea gardens to premium tea brand. Discover our commitment to quality, sustainability, and exceptional tea experiences.';
          break;
        case '/franchise':
          title = 'Tea Franchise Opportunities | Join Tvanamm Family';
          description = 'Start your tea business with Tvanamm franchise. Low investment, high returns, complete support. Join India\'s fastest growing premium tea franchise network.';
          break;
        case '/order':
          title = 'Order Premium Tea Online | Fresh from Gardens to Cup';
          description = 'Order premium tea blends online. Fresh from Darjeeling gardens, delivered to your doorstep. Black tea, green tea, masala chai and more. Free delivery available.';
          break;
        case '/franchise-inventory':
          title = 'Franchise Inventory | Tea Products for Partners';
          description = 'Access exclusive tea inventory for Tvanamm franchise partners. Premium quality products, competitive pricing, reliable supply chain management.';
          break;
      }

      // Update title
      document.title = title;
      
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (metaDesc) metaDesc.content = description;
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
      if (ogTitle) ogTitle.content = title;
      
      const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
      if (ogDesc) ogDesc.content = description;
      
      // Update Twitter tags
      const twitterTitle = document.querySelector('meta[property="twitter:title"]') as HTMLMetaElement;
      if (twitterTitle) twitterTitle.content = title;
      
      const twitterDesc = document.querySelector('meta[property="twitter:description"]') as HTMLMetaElement;
      if (twitterDesc) twitterDesc.content = description;
    };

    updatePageMeta();

    // Analytics tracking for SEO
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }

    // Facebook Pixel tracking
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'PageView', {
        page_title: document.title,
        page_url: window.location.href
      });
    }

  }, []);

  return null; // This component doesn't render anything
};

export default SitemapGenerator;