import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';
import { hashPassword, comparePassword } from './_lib/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getUserFromRequest } from './_lib/auth';
import { ok, err, handleCors } from './_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
