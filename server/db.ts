import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(__dirname, '..', 'linkedweldjobs.json');

interface DB {
  users: any[];
  refreshTokens: any[];
  jobs: any[];
  applications: any[];
  savedJobs: any[];
  notifications: any[];
  _counters: { users: number; refreshTokens: number; jobs: number; applications: number; savedJobs: number; notifications: number };
}

let data: DB | null = null;

function defaultDB(): DB {
  return {
    users: [],
    refreshTokens: [],
    jobs: [],
    applications: [],
    savedJobs: [],
    notifications: [],
    _counters: { users: 0, refreshTokens: 0, jobs: 0, applications: 0, savedJobs: 0, notifications: 0 },
  };
}

export function getDB(): DB {
  if (!data) {
    if (fs.existsSync(DB_PATH)) {
      data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } else {
      data = defaultDB();
    }
  }
  return data!;
}

export function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function nextId(table: keyof DB['_counters']): number {
  const db = getDB();
  db._counters[table]++;
  return db._counters[table];
}

export function initDB() {
  const db = getDB();

  // Seed sample jobs if none exist
  if (db.jobs.length === 0) {
    const jobs = [
      { title: 'TIG Welder — Stainless Steel Piping', company: 'Nordic Welding Solutions', location: 'Oslo, Norway', country: 'Norway', jobType: 'Contract', experienceLevel: 'Senior', weldingTypes: ['TIG'], industry: 'Oil & Gas', salaryMin: 4000, salaryMax: 6000, currency: 'EUR', description: 'Join our team for a 6-month piping project at North Sea oil and gas facilities. The ideal candidate will have extensive experience with stainless steel piping systems.', requirements: ['Minimum 5 years TIG welding experience', 'EN ISO 9606-1 certification', 'Stainless steel piping experience', 'Ability to read isometric drawings'], benefits: ['Competitive daily rate', 'Accommodation provided', 'Travel expenses covered', 'Overtime opportunities'], certifications: ['EN ISO 9606-1', 'ASME IX'], isActive: true, applicationCount: 23 },
      { title: 'MIG/MAG Welder — Shipyard', company: 'Baltic Shipworks', location: 'Gdansk, Poland', country: 'Poland', jobType: 'Full-time', experienceLevel: 'Mid-Level', weldingTypes: ['MIG'], industry: 'Shipbuilding', salaryMin: 2500, salaryMax: 3500, currency: 'EUR', description: 'Full-time position at our modern shipyard facility. Join a team of 200+ welders working on next-generation vessels.', requirements: ['3+ years MIG welding experience', 'Shipyard welding experience preferred', 'EN ISO 9606-1 certification'], benefits: ['Health insurance', 'Annual bonus', 'Training opportunities', 'Relocation support'], certifications: ['EN ISO 9606-1'], isActive: true, applicationCount: 45 },
      { title: 'Pipe Welder — Oil & Gas', company: 'EnergyFlow GmbH', location: 'Hamburg, Germany', country: 'Germany', jobType: 'Contract', experienceLevel: 'Senior', weldingTypes: ['TIG', 'Stick (SMAW)'], industry: 'Oil & Gas', salaryMin: 5000, salaryMax: 7000, currency: 'EUR', description: 'Seeking experienced pipe welders for refinery maintenance shutdown. 3-month contract with extension possible.', requirements: ['7+ years pipe welding', 'ASME IX qualified', 'Refinery experience preferred', 'Valid safety training'], benefits: ['Premium rate', 'Accommodation included', 'Per diem allowance', 'Long-term potential'], certifications: ['ASME IX', 'EN ISO 9606-1'], isActive: true, applicationCount: 31 },
      { title: 'Structural Welder — Construction', company: 'SteelFrame EU', location: 'Vienna, Austria', country: 'Austria', jobType: 'Full-time', experienceLevel: 'Mid-Level', weldingTypes: ['MIG', 'Flux-Cored (FCAW)'], industry: 'Construction', salaryMin: 3000, salaryMax: 4500, currency: 'EUR', description: 'We are building the future of European infrastructure. Join our team on major construction projects across Central Europe.', requirements: ['3+ years structural welding', 'FCAW experience', 'EN 1090 knowledge', 'Valid working permit'], benefits: ['Stable employment', 'Health coverage', 'Professional development', 'Modern equipment'], certifications: ['EN ISO 9606-1'], isActive: true, applicationCount: 18 },
      { title: 'Orbital Welder — Pharmaceutical', company: 'CleanPipe Systems', location: 'Zurich, Switzerland', country: 'Switzerland', jobType: 'Contract', experienceLevel: 'Expert', weldingTypes: ['Orbital', 'TIG'], industry: 'Manufacturing', salaryMin: 6000, salaryMax: 8500, currency: 'EUR', description: 'Orbital welding specialist needed for pharmaceutical piping installations. Cleanroom environment, highest quality standards.', requirements: ['5+ years orbital welding', 'Pharmaceutical/cleanroom experience', 'ASME BPE knowledge', 'EN ISO 9606-1'], benefits: ['Top market rates', 'Swiss quality standards', 'Cutting-edge equipment', 'International team'], certifications: ['EN ISO 9606-1', 'ASME BPE'], isActive: true, applicationCount: 12 },
    ];

    for (const j of jobs) {
      const id = nextId('jobs');
      db.jobs.push({ id, ...j, postedAt: new Date().toISOString(), expiresAt: null });
    }
  }

  saveDB();
}

// User helpers
export function createUser(userData: any): any {
  const db = getDB();
  const id = nextId('users');
  const user = { id, ...userData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.users.push(user);
  saveDB();
  return user;
}

export function findUserByEmail(email: string): any | null {
  return getDB().users.find(u => u.email === email) || null;
}

export function findUserById(id: number): any | null {
  return getDB().users.find(u => u.id === id) || null;
}

export function findUserByVerificationCode(code: string): any | null {
  return getDB().users.find(u => u.verificationCode === code) || null;
}

export function updateUser(id: number, updates: any): any | null {
  const db = getDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDB();
  return db.users[idx];
}

// Token helpers
export function storeRefreshToken(userId: number, token: string) {
  const db = getDB();
  const id = nextId('refreshTokens');
  db.refreshTokens.push({ id, userId, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });
  saveDB();
}

export function findRefreshToken(token: string, userId: number): any | null {
  return getDB().refreshTokens.find(t => t.token === token && t.userId === userId) || null;
}

export function deleteRefreshToken(token: string) {
  const db = getDB();
  db.refreshTokens = db.refreshTokens.filter(t => t.token !== token);
  saveDB();
}

// Job helpers
export function listJobs(filters: any = {}): { jobs: any[]; total: number } {
  let jobs = getDB().jobs.filter(j => j.isActive);

  if (filters.search) {
    const s = filters.search.toLowerCase();
    jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.description?.toLowerCase().includes(s));
  }
  if (filters.country) jobs = jobs.filter(j => j.country === filters.country);
  if (filters.jobType) jobs = jobs.filter(j => j.jobType === filters.jobType);
  if (filters.weldingType) jobs = jobs.filter(j => j.weldingTypes?.includes(filters.weldingType));

  const total = jobs.length;
  jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  const offset = Number(filters.offset || 0);
  const limit = Number(filters.limit || 20);
  jobs = jobs.slice(offset, offset + limit);

  return { jobs, total };
}

export function findJobById(id: number): any | null {
  return getDB().jobs.find(j => j.id === id) || null;
}

// Application helpers
export function createApplication(jobId: number, userId: number, coverLetter?: string): any {
  const db = getDB();
  const existing = db.applications.find(a => a.jobId === jobId && a.userId === userId);
  if (existing) throw new Error('Already applied');

  const id = nextId('applications');
  const app = { id, jobId, userId, status: 'applied', coverLetter: coverLetter || null, appliedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.applications.push(app);

  // Update job application count
  const job = db.jobs.find(j => j.id === jobId);
  if (job) job.applicationCount = (job.applicationCount || 0) + 1;

  saveDB();
  return app;
}

export function getUserApplications(userId: number): any[] {
  const db = getDB();
  return db.applications
    .filter(a => a.userId === userId)
    .map(a => {
      const job = db.jobs.find(j => j.id === a.jobId);
      return { ...a, jobTitle: job?.title, company: job?.company, location: job?.location, country: job?.country, jobType: job?.jobType, jobWeldingTypes: job?.weldingTypes };
    })
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

// Saved job helpers
export function toggleSaveJob(jobId: number, userId: number): boolean {
  const db = getDB();
  const idx = db.savedJobs.findIndex(s => s.jobId === jobId && s.userId === userId);
  if (idx >= 0) {
    db.savedJobs.splice(idx, 1);
    saveDB();
    return false;
  }
  const id = nextId('savedJobs');
  db.savedJobs.push({ id, jobId, userId, savedAt: new Date().toISOString() });
  saveDB();
  return true;
}

export function getUserSavedJobs(userId: number): any[] {
  const db = getDB();
  return db.savedJobs
    .filter(s => s.userId === userId)
    .map(s => {
      const job = db.jobs.find(j => j.id === s.jobId);
      return { ...s, ...job, savedAt: s.savedAt };
    })
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

// Notification helpers
export function getUserNotifications(userId: number): any[] {
  return getDB().notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);
}

export function getUnreadCount(userId: number): number {
  return getDB().notifications.filter(n => n.userId === userId && !n.isRead).length;
}

export function markAllRead(userId: number) {
  const db = getDB();
  db.notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
  saveDB();
}

export function markOneRead(id: number, userId: number) {
  const db = getDB();
  const n = db.notifications.find(n => n.id === id && n.userId === userId);
  if (n) { n.isRead = true; saveDB(); }
}
