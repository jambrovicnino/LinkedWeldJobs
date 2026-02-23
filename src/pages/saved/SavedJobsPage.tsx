import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock, BookmarkCheck, Bookmark, Briefcase } from 'lucide-react';

const SAVED_JOBS = [
  {
    id: 2, title: 'MIG/MAG Welder — Shipyard', company: 'Baltic Shipworks',
    location: 'Gdansk, Poland', jobType: 'Full-time', weldingTypes: ['MIG'],
    salaryMin: 2500, salaryMax: 3500, savedAt: '2 days ago',
  },
];

export function SavedJobsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Saved Jobs</h1>
        <p className='text-gray-500 mt-1'>Jobs you've bookmarked for later</p>
      </div>

      {SAVED_JOBS.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-100 p-12 text-center'>
          <Bookmark className='h-12 w-12 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-800 mb-1'>No saved jobs</h3>
          <p className='text-sm text-gray-500 mb-4'>Bookmark jobs while browsing to see them here</p>
          <Link to={ROUTES.JOBS}>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white'>Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {SAVED_JOBS.map((job) => (
            <div key={job.id} className='bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all'>
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-2'>
                  <Link to={ROUTES.JOB_DETAIL(job.id)} className='text-lg font-semibold text-gray-800 hover:text-blue-500'>
                    {job.title}
                  </Link>
                  <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500'>
                    <span className='flex items-center gap-1'><Building2 className='h-3.5 w-3.5' />{job.company}</span>
                    <span className='flex items-center gap-1'><MapPin className='h-3.5 w-3.5' />{job.location}</span>
                  </div>
                  <div className='flex gap-2'>
                    <Badge variant='outline' className='text-xs'>{job.jobType}</Badge>
                    {job.weldingTypes.map((w) => <Badge key={w} variant='secondary' className='text-xs'>{w}</Badge>)}
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <p className='text-sm font-medium text-emerald-600'>
                      &euro;{job.salaryMin.toLocaleString()} - &euro;{job.salaryMax.toLocaleString()} /month
                    </p>
                  )}
                </div>
                <div className='flex flex-col gap-2 items-end'>
                  <button className='text-blue-500 hover:text-blue-600'>
                    <BookmarkCheck className='h-5 w-5' />
                  </button>
                  <Link to={ROUTES.JOB_DETAIL(job.id)}>
                    <Button size='sm' className='bg-blue-500 hover:bg-blue-600 text-white'>View</Button>
                  </Link>
                  <span className='text-xs text-gray-400'>Saved {job.savedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
