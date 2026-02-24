import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Building2, Clock, Bookmark, BookmarkCheck, ExternalLink, Globe, RefreshCw, Wifi } from 'lucide-react';
import { WELDING_TYPES, EU_COUNTRIES, JOB_TYPES } from '@/lib/constants';
import type { Job } from '@/types';
import api from '@/lib/api';

// ──── Helpers ────
function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // if already "2 hours ago" etc
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ──── Loading Skeleton ────
function JobCardSkeleton() {
  return (
    <div className='bg-white rounded-xl border border-gray-100 p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 space-y-3'>
          <Skeleton className='h-5 w-3/4' />
          <div className='flex gap-3'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-20' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-5 w-16 rounded-full' />
            <Skeleton className='h-5 w-20 rounded-full' />
            <Skeleton className='h-5 w-14 rounded-full' />
          </div>
          <Skeleton className='h-4 w-36' />
        </div>
        <div className='flex flex-col items-end gap-2'>
          <Skeleton className='h-5 w-5 rounded' />
          <Skeleton className='h-8 w-24 rounded-md' />
        </div>
      </div>
    </div>
  );
}

// ──── MojeDelo Partner Card ────
function MojeDeloCard() {
  return (
    <a
      href='https://www.mojedelo.com/prosta-delovna-mesta'
      target='_blank'
      rel='noopener noreferrer'
      className='block bg-white rounded-xl border-l-4 border-l-orange-500 border border-gray-100 p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-200 group'
    >
      <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
        <div className='flex-1 space-y-2'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-bold text-orange-600 text-lg tracking-tight'>MojeDelo.com</span>
            <Badge className='bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-medium hover:bg-orange-100'>
              <Globe className='h-3 w-3 mr-1' />
              External Partner
            </Badge>
          </div>
          <p className='font-semibold text-gray-800 leading-snug'>
            More Welding Jobs on MojeDelo.com
          </p>
          <p className='text-sm text-gray-500 leading-relaxed'>
            Slovenia&apos;s largest job portal — thousands of verified openings updated daily.
          </p>
          <div className='flex items-center gap-1.5 mt-1'>
            <Search className='h-3.5 w-3.5 text-orange-500 flex-shrink-0' />
            <p className='text-xs text-orange-600 font-medium'>
              Search keyword: <span className='bg-orange-50 px-1.5 py-0.5 rounded font-semibold'>&quot;varilec&quot;</span> (welder)
            </p>
          </div>
        </div>
        <div className='flex flex-col items-start sm:items-end gap-2 sm:flex-shrink-0'>
          <Button className='bg-orange-500 hover:bg-orange-600 text-white gap-1.5 transition-colors shadow-sm'>
            Browse Jobs on MojeDelo
            <ExternalLink className='h-4 w-4' />
          </Button>
          <span className='text-[11px] text-gray-400 group-hover:text-orange-500 transition-colors'>
            Opens mojedelo.com in a new tab
          </span>
        </div>
      </div>
    </a>
  );
}

// ──── Job Card ────
function JobCard({ job, isSaved, onToggleSave }: { job: Job; isSaved: boolean; onToggleSave: () => void }) {
  const isExternal = job.source === 'jooble';

  const handleViewClick = () => {
    if (isExternal && job.externalLink) {
      window.open(job.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className='bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 space-y-2'>
          <div className='flex items-center gap-2'>
            {isExternal ? (
              <a href={job.externalLink || '#'} target='_blank' rel='noopener noreferrer' className='text-lg font-semibold text-gray-800 hover:text-blue-500 transition-colors'>
                {job.title}
              </a>
            ) : (
              <Link to={ROUTES.JOB_DETAIL(job.id)} className='text-lg font-semibold text-gray-800 hover:text-blue-500 transition-colors'>
                {job.title}
              </Link>
            )}
            {isExternal && (
              <Badge className='bg-blue-50 text-blue-600 border-blue-200 text-[10px] font-medium hover:bg-blue-50'>
                <Wifi className='h-2.5 w-2.5 mr-0.5' />Live
              </Badge>
            )}
          </div>
          <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500'>
            <span className='flex items-center gap-1'><Building2 className='h-3.5 w-3.5' />{job.company}</span>
            <span className='flex items-center gap-1'><MapPin className='h-3.5 w-3.5' />{job.location}</span>
            <span className='flex items-center gap-1'><Clock className='h-3.5 w-3.5' />{formatTimeAgo(job.postedAt)}</span>
          </div>
          <div className='flex flex-wrap gap-2 mt-2'>
            <Badge variant='outline' className='text-xs'>{job.jobType}</Badge>
            {job.experienceLevel && <Badge variant='outline' className='text-xs'>{job.experienceLevel}</Badge>}
            {(job.weldingTypes || []).map((w) => (
              <Badge key={w} variant='secondary' className='text-xs'>{w}</Badge>
            ))}
            {isExternal && job.sourceBoard && (
              <Badge variant='outline' className='text-[10px] text-gray-400 border-gray-200'>
                via {job.sourceBoard}
              </Badge>
            )}
          </div>
          {job.salaryMin && job.salaryMax ? (
            <p className='text-sm font-medium text-emerald-600 mt-1'>
              &euro;{job.salaryMin.toLocaleString()} - &euro;{job.salaryMax.toLocaleString()} /month
            </p>
          ) : job.salary ? (
            <p className='text-sm font-medium text-emerald-600 mt-1'>{job.salary}</p>
          ) : null}
        </div>
        <div className='flex flex-col items-end gap-2'>
          {!isExternal && (
            <button onClick={onToggleSave} className='text-gray-400 hover:text-blue-500 transition-colors'>
              {isSaved ? <BookmarkCheck className='h-5 w-5 text-blue-500' /> : <Bookmark className='h-5 w-5' />}
            </button>
          )}
          {isExternal ? (
            <Button size='sm' className='bg-blue-500 hover:bg-blue-600 text-white gap-1' onClick={handleViewClick}>
              View <ExternalLink className='h-3.5 w-3.5' />
            </Button>
          ) : (
            <Link to={ROUTES.JOB_DETAIL(job.id)}>
              <Button size='sm' className='bg-blue-500 hover:bg-blue-600 text-white'>View Details</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ──── Main Component ────
export function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<string>('');
  const [fetchedAt, setFetchedAt] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [weldingFilter, setWeldingFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('');

  const [savedJobs, setSavedJobs] = useState<Set<string | number>>(new Set());

  const fetchJobs = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get('/jobs/live');
      const resp = data.data || data;
      setJobs(resp.jobs || []);
      setSource(resp.source || '');
      setFetchedAt(resp.fetchedAt || '');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleSave = (id: string | number) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        const match = job.title.toLowerCase().includes(s)
          || job.company.toLowerCase().includes(s)
          || (job.description || '').toLowerCase().includes(s)
          || (job.location || '').toLowerCase().includes(s);
        if (!match) return false;
      }
      if (countryFilter && job.country && !job.country.toLowerCase().includes(countryFilter.toLowerCase())) return false;
      if (jobTypeFilter && job.jobType && !job.jobType.toLowerCase().includes(jobTypeFilter.toLowerCase())) return false;
      if (weldingFilter) {
        const types = job.weldingTypes || [];
        if (!types.some(t => t.toLowerCase().includes(weldingFilter.toLowerCase()))) return false;
      }
      return true;
    });
  }, [jobs, searchQuery, countryFilter, jobTypeFilter, weldingFilter]);

  const hasFilters = searchQuery || countryFilter || jobTypeFilter || weldingFilter;

  const clearFilters = () => {
    setSearchQuery('');
    setWeldingFilter('');
    setCountryFilter('');
    setJobTypeFilter('');
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Browse Jobs</h1>
          <p className='text-gray-500 mt-1'>
            {source === 'jooble' ? 'Live welding jobs across Europe' : 'Find welding positions across Europe'}
            {fetchedAt && <span className='text-xs text-gray-400'> &middot; Updated {formatTimeAgo(fetchedAt)}</span>}
          </p>
        </div>
        {!loading && (
          <Button variant='ghost' size='sm' onClick={fetchJobs} className='text-gray-400 hover:text-blue-500 gap-1'>
            <RefreshCw className='h-3.5 w-3.5' /><span className='hidden sm:inline text-xs'>Refresh</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border border-gray-100 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input placeholder='Search by title, company, keyword...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='pl-9' />
          </div>
          <Select value={weldingFilter} onValueChange={setWeldingFilter}>
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Welding Type' />
            </SelectTrigger>
            <SelectContent>
              {WELDING_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Country' />
            </SelectTrigger>
            <SelectContent>
              {EU_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className='w-full md:w-[160px]'>
              <SelectValue placeholder='Job Type' />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <div className='flex items-center gap-2 mt-3 pt-3 border-t border-gray-50'>
            <span className='text-xs text-gray-400'>Filters active</span>
            <Button variant='ghost' size='sm' onClick={clearFilters} className='text-xs text-blue-500 hover:text-blue-600 h-6 px-2'>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map(i => <JobCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className='bg-white rounded-xl border border-gray-100 p-8 text-center'>
          <p className='text-gray-500 mb-3'>Unable to load jobs right now.</p>
          <Button onClick={fetchJobs} className='bg-blue-500 hover:bg-blue-600 text-white gap-1'>
            <RefreshCw className='h-4 w-4' /> Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-500'>{filteredJobs.length} jobs found</p>
            {source === 'jooble' && (
              <Badge className='bg-green-50 text-green-600 border-green-200 text-[10px] font-medium hover:bg-green-50'>
                <Wifi className='h-2.5 w-2.5 mr-1' />Live from Jooble
              </Badge>
            )}
          </div>
          {filteredJobs.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-100 p-8 text-center'>
              <Search className='h-10 w-10 text-gray-200 mx-auto mb-3' />
              <p className='text-gray-500'>No jobs match your filters.</p>
              {hasFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters} className='text-blue-500 mt-2'>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <div key={job.id}>
                <JobCard
                  job={job}
                  isSaved={savedJobs.has(job.id)}
                  onToggleSave={() => toggleSave(job.id)}
                />
                {/* MojeDelo partner card after the 2nd job */}
                {index === 1 && (
                  <div className='mt-3'>
                    <MojeDeloCard />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
