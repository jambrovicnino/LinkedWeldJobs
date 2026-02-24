import { Router } from 'express';

const router = Router();

let newsCache: { data: any; fetchedAt: number } | null = null;
const NEWS_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

const RSS_FEEDS = [
  { url: 'https://www.thefabricator.com/metal_fabricating_news.rss', source: 'The Fabricator' },
];

const FALLBACK_NEWS = [
  {
    title: 'Welding Industry Trends: Automation and Robotics Continue to Rise',
    description: 'The global welding market sees increased adoption of automated welding solutions, with robotic welding systems becoming standard across automotive and heavy manufacturing sectors.',
    url: 'https://www.thefabricator.com',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
    publishedAt: new Date().toISOString(),
    source: 'The Fabricator',
  },
  {
    title: 'European Demand for Skilled Welders Reaches Record High',
    description: 'Major infrastructure projects across the EU are driving unprecedented demand for certified welding professionals, with salaries increasing by 15% year-over-year.',
    url: 'https://www.ewf.be',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    source: 'European Welding Federation',
  },
  {
    title: 'New AWS Certification Standards for 2026 Released',
    description: 'The American Welding Society announces updated certification requirements affecting welders worldwide. Changes include enhanced testing for structural steel welding.',
    url: 'https://www.aws.org',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    source: 'AWS Welding Journal',
  },
  {
    title: 'Green Welding: Sustainable Practices Gain Momentum in Manufacturing',
    description: 'Companies are adopting eco-friendly welding technologies to reduce emissions and energy consumption, with laser welding and friction stir welding leading the charge.',
    url: 'https://www.thefabricator.com',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    source: 'Welding Productivity',
  },
  {
    title: 'Pipeline Welding Jobs Surge Across Northern Europe',
    description: 'The expansion of natural gas and hydrogen pipelines in Scandinavia creates thousands of new welding positions, with contractors offering premium rates for certified pipe welders.',
    url: 'https://www.ewf.be',
    image: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    source: 'Pipeline & Gas Journal',
  },
];

// ── RSS XML Parser (zero dependencies) ──
function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").trim();
}

function extractImage(itemXml: string): string | null {
  const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*/i);
  if (encMatch) return encMatch[1];
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*/i);
  if (mediaMatch) return mediaMatch[1];
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*/i);
  if (thumbMatch) return thumbMatch[1];
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["'][^>]*/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

function parseRSS(xml: string, sourceName: string): any[] {
  const articles: any[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && articles.length < 8) {
    const itemXml = match[1];
    const title = stripHtml(extractTag(itemXml, 'title'));
    const link = extractTag(itemXml, 'link');
    const description = stripHtml(extractTag(itemXml, 'description')).substring(0, 300);
    const pubDate = extractTag(itemXml, 'pubDate');
    const image = extractImage(itemXml);

    if (title && link) {
      articles.push({
        title,
        description: description || 'Read more on ' + sourceName,
        url: link,
        image,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: sourceName,
      });
    }
  }
  return articles;
}

async function fetchRSSArticles(): Promise<any[]> {
  const allArticles: any[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: { 'User-Agent': 'LinkedWeldJobs/1.0 (News Aggregator)' },
      });
      if (!response.ok) throw new Error(`RSS ${response.status}`);
      const xml = await response.text();
      const articles = parseRSS(xml, feed.source);
      allArticles.push(...articles);
    } catch (e: any) {
      console.error(`RSS fetch error [${feed.source}]:`, e?.message);
    }
  }
  return allArticles;
}

router.get('/', async (_req, res) => {
  // Check in-memory cache
  if (newsCache && (Date.now() - newsCache.fetchedAt) < NEWS_CACHE_TTL) {
    return res.json({ success: true, data: newsCache.data });
  }

  try {
    // 1. Primary: RSS feeds (no API key needed)
    let articles = await fetchRSSArticles();

    // 2. Bonus: GNews API (if key is configured)
    const apiKey = process.env.GNEWS_API_KEY;
    if (apiKey) {
      try {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=welding&token=${apiKey}&lang=en&max=3&sortby=publishedAt`;
        const gnewsRes = await fetch(gnewsUrl);
        if (gnewsRes.ok) {
          const json = await gnewsRes.json();
          const gnewsArticles = (json.articles || []).map((a: any) => ({
            title: a.title, description: a.description, url: a.url,
            image: a.image, publishedAt: a.publishedAt, source: a.source?.name || 'GNews',
          }));
          articles = [...articles, ...gnewsArticles];
        }
      } catch (e: any) {
        console.error('GNews bonus fetch error:', e?.message);
      }
    }

    // 3. Fallback
    if (articles.length === 0) {
      return res.json({ success: true, data: { articles: FALLBACK_NEWS, source: 'fallback', fetchedAt: new Date().toISOString() } });
    }

    const data = { articles: articles.slice(0, 8), source: 'rss', fetchedAt: new Date().toISOString() };
    newsCache = { data, fetchedAt: Date.now() };
    return res.json({ success: true, data });
  } catch (e: any) {
    console.error('News handler error:', e?.message);
    return res.json({ success: true, data: { articles: FALLBACK_NEWS, source: 'fallback', fetchedAt: new Date().toISOString() } });
  }
});

export default router;
