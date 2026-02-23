export const WELDING_TYPES = [
  'TIG', 'MIG', 'Stick (SMAW)', 'Flux-Cored (FCAW)', 'SAW', 'Orbital', 'Plasma', 'Other',
] as const;

export const JOB_TYPES = [
  'Full-time', 'Contract', 'Part-time', 'Temporary', 'Freelance',
] as const;

export const EXPERIENCE_LEVELS = [
  'Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Expert',
] as const;

export const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
  'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
  'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
] as const;

export const INDUSTRIES = [
  'Oil & Gas', 'Shipbuilding', 'Construction', 'Automotive', 'Aerospace',
  'Power Generation', 'Pipeline', 'Manufacturing', 'Nuclear', 'Renewable Energy', 'Other',
] as const;

export const APPLICATION_STATUSES = [
  'applied', 'reviewing', 'interview', 'offer', 'hired', 'rejected',
] as const;

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
  interview: 'bg-purple-50 text-purple-700 border-purple-200',
  offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  hired: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export const CERTIFICATIONS = [
  'AWS CWI', 'CSWIP 3.1', 'CSWIP 3.2', 'EN ISO 9606-1', 'EN ISO 9606-2',
  'ASME IX', 'API 1104', 'EN 287-1', 'EN 15085', 'ISO 3834',
] as const;
