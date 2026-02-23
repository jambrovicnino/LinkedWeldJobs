export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'candidate';
  subscription: 'free';
  profileHeadline?: string;
  bio?: string;
  location?: string;
  nationality?: string;
  weldingTypes?: string[];
  experienceYears?: number;
  certifications?: string[];
  availableFrom?: string;
  willingToRelocate?: boolean;
  preferredCountries?: string[];
  avatarUrl?: string;
  resumeUrl?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country: string;
  jobType: string;
  experienceLevel: string;
  weldingTypes: string[];
  industry: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  certifications: string[];
  postedAt: string;
  expiresAt?: string;
  isActive: boolean;
  applicationCount: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export interface Application {
  id: number;
  jobId: number;
  job?: Job;
  userId: number;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'rejected';
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: number;
  jobId: number;
  job?: Job;
  savedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'application_update' | 'new_job_match' | 'profile_reminder' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  savedJobs: number;
  profileCompleteness: number;
  matchingJobs: number;
}
