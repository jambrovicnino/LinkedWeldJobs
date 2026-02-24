import { getDb } from './_lib/db';
import { hashPassword, comparePassword } from './_lib/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getUserFromRequest } from './_lib/auth';
import { ok, err, handleCors } from './_lib/response';

export default async function handler(req: any, res: any) {
  try {
    if (handleCors(req, res)) return;

    const pathParam = req.query.path;
    let segments: string[];
    if (pathParam && (Array.isArray(pathParam) ? pathParam.length > 0 : true)) {
      segments = Array.isArray(pathParam) ? pathParam : [pathParam];
    } else {
      const url = (req.url || '').split('?')[0];
      const stripped = url.replace(/^\/api\/?/, '');
      segments = stripped ? stripped.split('/') : [];
    }
    const path = '/' + segments.join('/');
    const method = req.method || 'GET';

    // ──── AUTH ────
    if (path === '/auth/register' && method === 'POST') return await handleRegister(req, res);
    if (path === '/auth/login' && method === 'POST') return await handleLogin(req, res);
    if (path === '/auth/verify' && method === 'POST') return await handleVerify(req, res);
    if (path === '/auth/me') return await handleMe(req, res, method);
    if (path === '/auth/refresh' && method === 'POST') return await handleRefresh(req, res);
    if (path === '/auth/logout' && method === 'POST') return await handleLogout(req, res);

    // ──── JOBS ────
    if (path === '/jobs' && method === 'GET') return await handleJobs(req, res);
    if (path === '/jobs/user/saved' && method === 'GET') return await handleSavedJobs(req, res);
    const jobSaveMatch = path.match(/^\/jobs\/(\d+)\/save$/);
    if (jobSaveMatch && method === 'POST') return await handleToggleSave(req, res, jobSaveMatch[1]);
    const jobMatch = path.match(/^\/jobs\/(\d+)$/);
    if (jobMatch && method === 'GET') return await handleJobById(req, res, jobMatch[1]);

    // ──── APPLICATIONS ────
    if (path === '/applications') return await handleApplications(req, res, method);

    // ──── NOTIFICATIONS ────
    if (path === '/notifications' && method === 'GET') return await handleNotifications(req, res);
    if (path === '/notifications/unread-count' && method === 'GET') return await handleUnreadCount(req, res);
    if (path === '/notifications/read-all' && method === 'PUT') return await handleReadAll(req, res);
    const notifMatch = path.match(/^\/notifications\/(\d+)\/read$/);
    if (notifMatch && method === 'PUT') return await handleNotifRead(req, res, notifMatch[1]);

    // ──── NEWS ────
    if (path === '/news' && method === 'GET') return await handleNews(req, res);

    // ──── HEALTH ────
    if (path === '/health') return ok(res, { status: 'ok', app: 'LinkedWeldJobs' });

    return err(res, `Not found: ${method} /api${path}`, 404);
  } catch (e: any) {
    console.error('API error:', e?.stack || e?.message || e);
    return res.status(500).json({ success: false, error: String(e?.message || 'Internal server error') });
  }
}

// ──────────── AUTH ────────────

function safeUser(user: any) {
  const { password_hash, verification_code, verification_expires_at, ...safe } = user;
  return {
    id: safe.id,
    email: safe.email,
    firstName: safe.first_name,
    lastName: safe.last_name,
    role: safe.role || 'candidate',
    phone: safe.phone,
    subscription: safe.subscription || 'free',
    isVerified: !!safe.is_verified,
    profileHeadline: safe.profile_headline,
    bio: safe.bio,
    location: safe.location,
    nationality: safe.nationality,
    weldingTypes: safe.welding_types ? (typeof safe.welding_types === 'string' ? JSON.parse(safe.welding_types) : safe.welding_types) : [],
    experienceYears: safe.experience_years,
    certifications: safe.certifications ? (typeof safe.certifications === 'string' ? JSON.parse(safe.certifications) : safe.certifications) : [],
    availableFrom: safe.available_from,
    willingToRelocate: !!safe.willing_to_relocate,
    preferredCountries: safe.preferred_countries ? (typeof safe.preferred_countries === 'string' ? JSON.parse(safe.preferred_countries) : safe.preferred_countries) : [],
    avatarUrl: safe.avatar_url,
    createdAt: safe.created_at,
  };
}

async function handleRegister(req: any, res: any) {
  const { email, password, firstName, lastName, phone } = req.body;
  if (!email || !password || !firstName || !lastName) return err(res, 'All fields are required');
  const db = getDb();
  if (db.findOne('users', (u: any) => u.email === email)) return err(res, 'Email already registered', 409);
  const password_hash = await hashPassword(password);
  const verification_code = String(Math.floor(100000 + Math.random() * 900000));
  const result = db.insert('users', {
    email, password_hash, first_name: firstName, last_name: lastName,
    phone: phone || null, role: 'candidate', subscription: 'free',
    is_verified: 0, verification_code,
    verification_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    profile_headline: null, bio: null, location: null, nationality: null,
    welding_types: JSON.stringify([]), experience_years: null,
    certifications: JSON.stringify([]), available_from: null,
    willing_to_relocate: 0, preferred_countries: JSON.stringify([]),
    avatar_url: null, resume_url: null,
  });
  const userId = result.lastInsertRowid;
  const user = db.findOne('users', (u: any) => u.id === userId);

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  db.insert('refresh_tokens', { user_id: userId, token: refreshToken, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
  db.insert('notifications', { user_id: userId, type: 'system', title: 'Welcome to LinkedWeldJobs!', message: 'Your account is ready. Start browsing welding jobs!', is_read: 0 });
  return ok(res, { user: safeUser(user), tokens: { accessToken, refreshToken }, verificationCode: verification_code }, 201);
}

async function handleLogin(req: any, res: any) {
  const { email, password } = req.body;
  if (!email || !password) return err(res, 'Email and password are required');
  const db = getDb();
  const user = db.findOne('users', (u: any) => u.email === email);
  if (!user) return err(res, 'Invalid email or password', 401);
  if (!(await comparePassword(password, user.password_hash))) return err(res, 'Invalid email or password', 401);
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  db.insert('refresh_tokens', { user_id: user.id, token: refreshToken, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
  return ok(res, { user: safeUser(user), tokens: { accessToken, refreshToken } });
}

async function handleVerify(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const { code } = req.body;
  if (!code) return err(res, 'Verification code is required');
  const db = getDb();
  const user = db.findOne('users', (u: any) => u.id === auth.userId);
  if (!user) return err(res, 'User not found', 404);
  if (user.is_verified) return ok(res, { message: 'Already verified' });
  if (user.verification_code !== String(code)) return err(res, 'Invalid verification code');
  if (user.verification_expires_at && new Date() > new Date(user.verification_expires_at)) return err(res, 'Verification code has expired');
  db.update('users', (u: any) => u.id === auth.userId, { is_verified: 1, verification_code: null, verification_expires_at: null });
  return ok(res, { message: 'Email verified successfully', isVerified: true });
}

async function handleMe(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  if (method === 'GET') {
    const user = db.findOne('users', (u: any) => u.id === auth.userId);
    if (!user) return err(res, 'User not found', 404);
    return ok(res, safeUser(user));
  }
  if (method === 'PUT') {
    const b = req.body;
    const updates: any = {};
    const fieldMap: Record<string, string> = {
      firstName: 'first_name', lastName: 'last_name', phone: 'phone',
      profileHeadline: 'profile_headline', bio: 'bio', location: 'location',
      nationality: 'nationality', experienceYears: 'experience_years',
      availableFrom: 'available_from',
    };
    Object.entries(fieldMap).forEach(([fe, db_field]) => {
      if (b[fe] !== undefined) updates[db_field] = b[fe];
    });
    if (b.weldingTypes !== undefined) updates.welding_types = JSON.stringify(b.weldingTypes);
    if (b.certifications !== undefined) updates.certifications = JSON.stringify(b.certifications);
    if (b.willingToRelocate !== undefined) updates.willing_to_relocate = b.willingToRelocate ? 1 : 0;
    if (b.preferredCountries !== undefined) updates.preferred_countries = JSON.stringify(b.preferredCountries);
    if (Object.keys(updates).length === 0) return err(res, 'No valid fields');
    db.update('users', (u: any) => u.id === auth.userId, updates);
    const user = db.findOne('users', (u: any) => u.id === auth.userId);
    return ok(res, safeUser(user));
  }
  return err(res, 'Method not allowed', 405);
}

async function handleRefresh(req: any, res: any) {
  const { refreshToken } = req.body;
  if (!refreshToken) return err(res, 'Refresh token required', 401);
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const db = getDb();
    const stored = db.findOne('refresh_tokens', (t: any) => t.token === refreshToken);
    if (!stored) return err(res, 'Invalid refresh token', 401);
    db.remove('refresh_tokens', (t: any) => t.token === refreshToken);
    const newAccess = generateAccessToken(decoded.userId);
    const newRefresh = generateRefreshToken(decoded.userId);
    db.insert('refresh_tokens', { user_id: decoded.userId, token: newRefresh, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
    return ok(res, { accessToken: newAccess, refreshToken: newRefresh });
  } catch { return err(res, 'Invalid refresh token', 401); }
}

async function handleLogout(req: any, res: any) {
  const { refreshToken } = req.body;
  if (refreshToken) getDb().remove('refresh_tokens', (t: any) => t.token === refreshToken);
  return ok(res, { message: 'Logged out' });
}

// ──────────── JOBS ────────────

function parseJob(j: any) {
  return {
    ...j,
    weldingTypes: typeof j.weldingTypes === 'string' ? JSON.parse(j.weldingTypes) : (j.weldingTypes || []),
    requirements: typeof j.requirements === 'string' ? JSON.parse(j.requirements) : (j.requirements || []),
    benefits: typeof j.benefits === 'string' ? JSON.parse(j.benefits) : (j.benefits || []),
    certifications: typeof j.certifications === 'string' ? JSON.parse(j.certifications) : (j.certifications || []),
    isActive: !!j.isActive,
  };
}

async function handleJobs(req: any, res: any) {
  const db = getDb();
  const { search, country, jobType, weldingType, limit = '20', offset = '0' } = req.query as any;
  let jobs = db.findAll('jobs', (j: any) => j.isActive);
  if (search) {
    const s = search.toLowerCase();
    jobs = jobs.filter((j: any) => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || (j.description || '').toLowerCase().includes(s));
  }
  if (country) jobs = jobs.filter((j: any) => j.country === country);
  if (jobType) jobs = jobs.filter((j: any) => j.jobType === jobType);
  if (weldingType) {
    jobs = jobs.filter((j: any) => {
      const types = typeof j.weldingTypes === 'string' ? JSON.parse(j.weldingTypes) : (j.weldingTypes || []);
      return types.includes(weldingType);
    });
  }
  const total = jobs.length;
  jobs.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
  jobs = jobs.slice(Number(offset), Number(offset) + Number(limit));
  return ok(res, { jobs: jobs.map(parseJob), total });
}

async function handleJobById(req: any, res: any, id: string) {
  const job = getDb().findOne('jobs', (j: any) => j.id === parseInt(id));
  if (!job) return err(res, 'Job not found', 404);
  return ok(res, parseJob(job));
}

async function handleSavedJobs(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const saved = db.findAll('saved_jobs', (s: any) => s.user_id === auth.userId);
  const jobs = saved.map((s: any) => {
    const job = db.findOne('jobs', (j: any) => j.id === s.job_id);
    return job ? { ...parseJob(job), savedAt: s.created_at } : null;
  }).filter(Boolean);
  return ok(res, jobs);
}

async function handleToggleSave(req: any, res: any, jobId: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const jId = parseInt(jobId);
  const existing = db.findOne('saved_jobs', (s: any) => s.job_id === jId && s.user_id === auth.userId);
  if (existing) {
    db.remove('saved_jobs', (s: any) => s.job_id === jId && s.user_id === auth.userId);
    return ok(res, { saved: false });
  }
  db.insert('saved_jobs', { job_id: jId, user_id: auth.userId });
  return ok(res, { saved: true });
}

// ──────────── APPLICATIONS ────────────

async function handleApplications(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const apps = db.findAll('applications', (a: any) => a.user_id === auth.userId);
    return ok(res, apps.map((a: any) => {
      const job = db.findOne('jobs', (j: any) => j.id === a.job_id);
      return {
        ...a,
        jobTitle: job?.title, company: job?.company, location: job?.location,
        country: job?.country, jobType: job?.jobType,
        jobWeldingTypes: job ? (typeof job.weldingTypes === 'string' ? JSON.parse(job.weldingTypes) : job.weldingTypes) : [],
      };
    }).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')));
  }

  if (method === 'POST') {
    const { jobId, coverLetter } = req.body;
    if (!jobId) return err(res, 'Job ID is required');
    const existing = db.findOne('applications', (a: any) => a.job_id === jobId && a.user_id === auth.userId);
    if (existing) return err(res, 'Already applied', 409);
    const result = db.insert('applications', { job_id: jobId, user_id: auth.userId, status: 'applied', cover_letter: coverLetter || null });
    const job = db.findOne('jobs', (j: any) => j.id === jobId);
    if (job) db.update('jobs', (j: any) => j.id === jobId, { applicationCount: (job.applicationCount || 0) + 1 });
    return ok(res, { id: result.lastInsertRowid, status: 'applied' }, 201);
  }

  return err(res, 'Method not allowed', 405);
}

// ──────────── NOTIFICATIONS ────────────

async function handleNotifications(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  return ok(res, getDb().findAll('notifications', (n: any) => n.user_id === auth.userId).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 50));
}

async function handleUnreadCount(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  return ok(res, { count: getDb().count('notifications', (n: any) => n.user_id === auth.userId && !n.is_read) });
}

async function handleReadAll(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  getDb().update('notifications', (n: any) => n.user_id === auth.userId, { is_read: 1 });
  return ok(res, { message: 'All marked as read' });
}

async function handleNotifRead(req: any, res: any, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  getDb().update('notifications', (n: any) => n.id === parseInt(id) && n.user_id === auth.userId, { is_read: 1 });
  return ok(res, { message: 'Marked as read' });
}

// ──────────── NEWS (RSS Feed Integration) ────────────

let newsCache: { data: any; fetchedAt: number } | null = null;
const NEWS_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours — RSS feeds update a few times per day

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
  // Handle CDATA: <tag><![CDATA[content]]></tag>
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  // Handle regular: <tag>content</tag>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").trim();
}

function extractImage(itemXml: string): string | null {
  // Try <enclosure url="..."> (standard RSS media)
  const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*/i);
  if (encMatch) return encMatch[1];
  // Try <media:content url="...">
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*/i);
  if (mediaMatch) return mediaMatch[1];
  // Try <media:thumbnail url="...">
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*/i);
  if (thumbMatch) return thumbMatch[1];
  // Try <image> inside description or content
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

async function handleNews(req: any, res: any) {
  // Edge caching: 1 hour fresh, serve stale up to 2 hours while revalidating
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

  // Check in-memory cache first
  if (newsCache && (Date.now() - newsCache.fetchedAt) < NEWS_CACHE_TTL) {
    return ok(res, newsCache.data);
  }

  try {
    // 1. Primary: RSS feeds (no API key needed)
    let articles = await fetchRSSArticles();

    // 2. Bonus: GNews API (if key is configured, merge extra articles)
    const apiKey = process.env.GNEWS_API_KEY;
    if (apiKey) {
      try {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=welding&token=${apiKey}&lang=en&max=3&sortby=publishedAt`;
        const gnewsRes = await fetch(gnewsUrl);
        if (gnewsRes.ok) {
          const json: any = await gnewsRes.json();
          const gnewsArticles = (json.articles || []).map((a: any) => ({
            title: a.title,
            description: a.description,
            url: a.url,
            image: a.image,
            publishedAt: a.publishedAt,
            source: a.source?.name || 'GNews',
          }));
          articles = [...articles, ...gnewsArticles];
        }
      } catch (e: any) {
        console.error('GNews bonus fetch error:', e?.message);
      }
    }

    // 3. Fallback: static articles if nothing from RSS or GNews
    if (articles.length === 0) {
      const data = { articles: FALLBACK_NEWS, source: 'fallback', fetchedAt: new Date().toISOString() };
      return ok(res, data);
    }

    const data = { articles: articles.slice(0, 8), source: 'rss', fetchedAt: new Date().toISOString() };
    newsCache = { data, fetchedAt: Date.now() };
    return ok(res, data);
  } catch (e: any) {
    console.error('News handler error:', e?.message);
    return ok(res, { articles: FALLBACK_NEWS, source: 'fallback', fetchedAt: new Date().toISOString() });
  }
}
