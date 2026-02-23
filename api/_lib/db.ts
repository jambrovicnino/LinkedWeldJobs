/**
 * Pure in-memory database for Vercel serverless.
 * No external dependencies. Ephemeral per cold start.
 * LinkedWeldJobs — Welding Job Board
 */

interface Table {
  rows: any[];
  autoId: number;
}

interface Store {
  [tableName: string]: Table;
}

let store: Store | null = null;

function now(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
}

function push(t: Table, row: any) {
  t.rows.push({ id: t.autoId++, ...row, created_at: now(), updated_at: now() });
}

function initStore(): Store {
  const s: Store = {
    users: { rows: [], autoId: 1 },
    refresh_tokens: { rows: [], autoId: 1 },
    jobs: { rows: [], autoId: 1 },
    applications: { rows: [], autoId: 1 },
    saved_jobs: { rows: [], autoId: 1 },
    notifications: { rows: [], autoId: 1 },
  };

  // ═══════════════════ SEED JOBS (5) ═══════════════════
  const jobs = [
    { title: 'TIG Welder — Stainless Steel Piping', company: 'Nordic Welding Solutions', location: 'Oslo, Norway', country: 'Norway', jobType: 'Contract', experienceLevel: 'Senior', weldingTypes: JSON.stringify(['TIG']), industry: 'Oil & Gas', salaryMin: 4000, salaryMax: 6000, currency: 'EUR', description: 'Join our team for a 6-month piping project at North Sea oil and gas facilities. The ideal candidate will have extensive experience with stainless steel piping systems.', requirements: JSON.stringify(['Minimum 5 years TIG welding experience', 'EN ISO 9606-1 certification', 'Stainless steel piping experience', 'Ability to read isometric drawings']), benefits: JSON.stringify(['Competitive daily rate', 'Accommodation provided', 'Travel expenses covered', 'Overtime opportunities']), certifications: JSON.stringify(['EN ISO 9606-1', 'ASME IX']), isActive: 1, applicationCount: 23 },
    { title: 'MIG/MAG Welder — Shipyard', company: 'Baltic Shipworks', location: 'Gdansk, Poland', country: 'Poland', jobType: 'Full-time', experienceLevel: 'Mid-Level', weldingTypes: JSON.stringify(['MIG']), industry: 'Shipbuilding', salaryMin: 2500, salaryMax: 3500, currency: 'EUR', description: 'Full-time position at our modern shipyard facility. Join a team of 200+ welders working on next-generation vessels.', requirements: JSON.stringify(['3+ years MIG welding experience', 'Shipyard welding experience preferred', 'EN ISO 9606-1 certification']), benefits: JSON.stringify(['Health insurance', 'Annual bonus', 'Training opportunities', 'Relocation support']), certifications: JSON.stringify(['EN ISO 9606-1']), isActive: 1, applicationCount: 45 },
    { title: 'Pipe Welder — Oil & Gas', company: 'EnergyFlow GmbH', location: 'Hamburg, Germany', country: 'Germany', jobType: 'Contract', experienceLevel: 'Senior', weldingTypes: JSON.stringify(['TIG', 'Stick (SMAW)']), industry: 'Oil & Gas', salaryMin: 5000, salaryMax: 7000, currency: 'EUR', description: 'Seeking experienced pipe welders for refinery maintenance shutdown. 3-month contract with extension possible.', requirements: JSON.stringify(['7+ years pipe welding', 'ASME IX qualified', 'Refinery experience preferred', 'Valid safety training']), benefits: JSON.stringify(['Premium rate', 'Accommodation included', 'Per diem allowance', 'Long-term potential']), certifications: JSON.stringify(['ASME IX', 'EN ISO 9606-1']), isActive: 1, applicationCount: 31 },
    { title: 'Structural Welder — Construction', company: 'SteelFrame EU', location: 'Vienna, Austria', country: 'Austria', jobType: 'Full-time', experienceLevel: 'Mid-Level', weldingTypes: JSON.stringify(['MIG', 'Flux-Cored (FCAW)']), industry: 'Construction', salaryMin: 3000, salaryMax: 4500, currency: 'EUR', description: 'We are building the future of European infrastructure. Join our team on major construction projects across Central Europe.', requirements: JSON.stringify(['3+ years structural welding', 'FCAW experience', 'EN 1090 knowledge', 'Valid working permit']), benefits: JSON.stringify(['Stable employment', 'Health coverage', 'Professional development', 'Modern equipment']), certifications: JSON.stringify(['EN ISO 9606-1']), isActive: 1, applicationCount: 18 },
    { title: 'Orbital Welder — Pharmaceutical', company: 'CleanPipe Systems', location: 'Zurich, Switzerland', country: 'Switzerland', jobType: 'Contract', experienceLevel: 'Expert', weldingTypes: JSON.stringify(['Orbital', 'TIG']), industry: 'Manufacturing', salaryMin: 6000, salaryMax: 8500, currency: 'EUR', description: 'Orbital welding specialist needed for pharmaceutical piping installations. Cleanroom environment, highest quality standards.', requirements: JSON.stringify(['5+ years orbital welding', 'Pharmaceutical/cleanroom experience', 'ASME BPE knowledge', 'EN ISO 9606-1']), benefits: JSON.stringify(['Top market rates', 'Swiss quality standards', 'Cutting-edge equipment', 'International team']), certifications: JSON.stringify(['EN ISO 9606-1', 'ASME BPE']), isActive: 1, applicationCount: 12 },
  ];
  jobs.forEach((j) => push(s.jobs, j));

  console.log('LinkedWeldJobs store initialized: 5 seed jobs');
  return s;
}

function getStore(): Store {
  if (!store) store = initStore();
  return store;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export interface SimpleDB {
  insert(table: string, row: Record<string, any>): RunResult;
  findOne(table: string, predicate: (row: any) => boolean): any | undefined;
  findAll(table: string, predicate?: (row: any) => boolean): any[];
  update(table: string, predicate: (row: any) => boolean, updates: Record<string, any>): number;
  remove(table: string, predicate: (row: any) => boolean): number;
  count(table: string, predicate?: (row: any) => boolean): number;
}

export function getDb(): SimpleDB {
  const s = getStore();

  return {
    insert(table: string, row: Record<string, any>): RunResult {
      const t = s[table];
      if (!t) return { changes: 0, lastInsertRowid: 0 };
      const id = t.autoId++;
      const newRow = { id, created_at: now(), updated_at: now(), ...row };
      t.rows.push(newRow);
      return { changes: 1, lastInsertRowid: id };
    },

    findOne(table: string, predicate: (row: any) => boolean): any | undefined {
      const t = s[table];
      if (!t) return undefined;
      return t.rows.find(predicate);
    },

    findAll(table: string, predicate?: (row: any) => boolean): any[] {
      const t = s[table];
      if (!t) return [];
      return predicate ? t.rows.filter(predicate) : [...t.rows];
    },

    update(table: string, predicate: (row: any) => boolean, updates: Record<string, any>): number {
      const t = s[table];
      if (!t) return 0;
      let count = 0;
      t.rows.forEach((row, i) => {
        if (predicate(row)) {
          t.rows[i] = { ...row, ...updates, updated_at: now() };
          count++;
        }
      });
      return count;
    },

    remove(table: string, predicate: (row: any) => boolean): number {
      const t = s[table];
      if (!t) return 0;
      const before = t.rows.length;
      t.rows = t.rows.filter((row) => !predicate(row));
      return before - t.rows.length;
    },

    count(table: string, predicate?: (row: any) => boolean): number {
      const t = s[table];
      if (!t) return 0;
      return predicate ? t.rows.filter(predicate).length : t.rows.length;
    },
  };
}
