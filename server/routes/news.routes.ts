import { Router } from 'express';

const router = Router();

let newsCache: { data: any; fetchedAt: number } | null = null;
const NEWS_CACHE_TTL = 15 * 60 * 1000;

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

router.get('/', async (_req, res) => {
  // Check in-memory cache
  if (newsCache && (Date.now() - newsCache.fetchedAt) < NEWS_CACHE_TTL) {
    return res.json({ success: true, data: newsCache.data });
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return res.json({ success: true, data: { articles: FALLBACK_NEWS, source: 'fallback' } });
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=welding&token=${apiKey}&lang=en&max=5&sortby=publishedAt`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`GNews API returned ${response.status}`);
    const json = await response.json();

    const articles = (json.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || 'Unknown',
    }));

    if (articles.length === 0) {
      return res.json({ success: true, data: { articles: FALLBACK_NEWS, source: 'fallback' } });
    }

    const data = { articles, source: 'gnews' };
    newsCache = { data, fetchedAt: Date.now() };
    return res.json({ success: true, data });
  } catch (e: any) {
    console.error('News fetch error:', e?.message);
    return res.json({ success: true, data: { articles: FALLBACK_NEWS, source: 'fallback' } });
  }
});

export default router;
