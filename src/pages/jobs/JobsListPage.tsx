import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Building2, Clock, Bookmark, BookmarkCheck, Filter } from 'lucide-react';
import { WELDING_TYPES, EU_COUNTRIES, JOB_TYPES } from '@/lib/constants';

const SAMPLE_JOBS = [
  {
    id: 1, title: 'TIG Welder — Stainless Steel Piping', company: 'Nordic Welding Solutions',
    location: 'Oslo, Norway', country: 'Norway', jobType: 'Contract', experienceLevel: 'Senior',
    weldingTypes: ['TIG'], industry: 'Oil & Gas', salaryMin: 4000, salaryMax: 6000,
    postedAt: '2 hours ago', description: 'Join our team for a 6-month piping project in the North Sea facilities...',
    isSaved: false,
  },
  {
    id: 2, title: 'MIG/MAG Welder — Shipyard', company: 'Baltic Shipworks',
    location: 'Gdansk, Poland', country: 'Poland', jobType: 'Full-time', experienceLevel: 'Mid-Level',
    weldingTypes: ['MIG'], industry: 'Shipbuilding', salaryMin: 2500, salaryMax: 3500,
    postedAt: '5 hours ago', description: 'Full-time position at our modern shipyard facility...',
    isSaved: true,
  },
  {
    id: 3, title: 'Pipe Welder — Oil & Gas', company: 'EnergyFlow GmbH',
    location: 'Hamburg, Germany', country: 'Germany', jobType: 'Contract', experienceLevel: 'Senior',
    weldingTypes: ['TIG', 'Stick (SMAW)'], industry: 'Oil & Gas', salaryMin: 5000, salaryMax: 7000,
    postedAt: '1 day ago', description: 'Seeking experienced pipe welders for refinery maintenance...',
    isSaved: false,
  },
  {
    id: 4, title: 'Structural Welder — Construction', company: 'SteelFrame EU',
    location: 'Vienna, Austria', country: 'Austria', jobType: 'Full-time', experienceLevel: 'Mid-Level',
    weldingTypes: ['MIG', 'Flux-Cored (FCAW)'], industry: 'Construction', salaryMin: 3000, salaryMax: 4500,
    postedAt: '2 days ago', description: 'We are building the future of European infrastructure...',
    isSaved: false,
  },
  {
    id: 5, title: 'Orbital Welder — Pharmaceutical', company: 'CleanPipe Systems',
    location: 'Zurich, Switzerland', country: 'Switzerland', jobType: 'Contract', experienceLevel: 'Expert',
    weldingTypes: ['Orbital', 'TIG'], industry: 'Manufacturing', salaryMin: 6000, salaryMax: 8500,
    postedAt: '3 days ago', description: 'Orbital welding specialist needed for pharmaceutical piping...',
    isSaved: false,
  },
];

export function JobsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set([2]));

  const toggleSave = (id: number) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Browse Jobs</h1>
        <p className='text-gray-500 mt-1'>Find welding positions across Europe</p>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border border-gray-100 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input placeholder='Search by title, company, keyword...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='pl-9' />
          </div>
          <Select>
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Welding Type' />
            </SelectTrigger>
            <SelectContent>
              {WELDING_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Country' />
            </SelectTrigger>
            <SelectContent>
              {EU_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className='w-full md:w-[160px]'>
              <SelectValue placeholder='Job Type' />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className='space-y-3'>
        <p className='text-sm text-gray-500'>{SAMPLE_JOBS.length} jobs found</p>
        {SAMPLE_JOBS.map((job) => (
          <div key={job.id} className='bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1 space-y-2'>
                <Link to={ROUTES.JOB_DETAIL(job.id)} className='text-lg font-semibold text-gray-800 hover:text-blue-500 transition-colors'>
                  {job.title}
                </Link>
                <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500'>
                  <span className='flex items-center gap-1'><Building2 className='h-3.5 w-3.5' />{job.company}</span>
                  <span className='flex items-center gap-1'><MapPin className='h-3.5 w-3.5' />{job.location}</span>
                  <span className='flex items-center gap-1'><Clock className='h-3.5 w-3.5' />{job.postedAt}</span>
                </div>
                <div className='flex flex-wrap gap-2 mt-2'>
                  <Badge variant='outline' className='text-xs'>{job.jobType}</Badge>
                  <Badge variant='outline' className='text-xs'>{job.experienceLevel}</Badge>
                  {job.weldingTypes.map((w) => (
                    <Badge key={w} variant='secondary' className='text-xs'>{w}</Badge>
                  ))}
                </div>
                {job.salaryMin && job.salaryMax && (
                  <p className='text-sm font-medium text-emerald-600 mt-1'>
                    &euro;{job.salaryMin.toLocaleString()} - &euro;{job.salaryMax.toLocaleString()} /month
                  </p>
                )}
              </div>
              <div className='flex flex-col items-end gap-2'>
                <button onClick={() => toggleSave(job.id)} className='text-gray-400 hover:text-blue-500 transition-colors'>
                  {savedJobs.has(job.id) ? <BookmarkCheck className='h-5 w-5 text-blue-500' /> : <Bookmark className='h-5 w-5' />}
                </button>
                <Link to={ROUTES.JOB_DETAIL(job.id)}>
                  <Button size='sm' className='bg-blue-500 hover:bg-blue-600 text-white'>View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
