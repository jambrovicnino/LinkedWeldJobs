import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, MapPin, Building2, Clock, Briefcase, Award, CheckCircle, Bookmark,
  DollarSign, Calendar, Users, RefreshCw,
} from 'lucide-react';
import type { Job } from '@/types';
import api from '@/lib/api';

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function DetailSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-5 w-32' />
      <div className='bg-white rounded-xl border border-gray-100 p-6 space-y-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-14 w-14 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-80' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-4 w-24' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-6 w-20 rounded-full' />
          <Skeleton className='h-6 w-24 rounded-full' />
          <Skeleton className='h-6 w-16 rounded-full' />
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <Skeleton className='h-5 w-36 mb-3' />
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        </div>
        <div className='bg-white rounded-xl border border-gray-100 p-6'>
          <Skeleton className='h-5 w-36 mb-3' />
          <Skeleton className='h-4 w-full mb-2' />
          <Skeleton className='h-4 w-full mb-2' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </div>
    </div>
  );
}

export function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    api.get(`/jobs/${id}`)
      .then(({ data }) => {
        const j = data.data || data;
        setJob(j);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !job) {
    return (
      <div className='space-y-6'>
        <Link to={ROUTES.JOBS} className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors'>
          <ArrowLeft className='h-4 w-4' /> Back to jobs
        </Link>
        <div className='bg-white rounded-xl border border-gray-100 p-8 text-center'>
          <p className='text-gray-500 mb-3'>Unable to load this job.</p>
          <Link to={ROUTES.JOBS}>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white'>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Link to={ROUTES.JOBS} className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors'>
        <ArrowLeft className='h-4 w-4' /> Back to jobs
      </Link>

      <div className='bg-white rounded-xl border border-gray-100 p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center'>
                <Building2 className='h-7 w-7 text-blue-500' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{job.title}</h1>
                <p className='text-gray-500'>{job.company}</p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500'>
              <span className='flex items-center gap-1'><MapPin className='h-4 w-4' />{job.location}</span>
              <span className='flex items-center gap-1'><Briefcase className='h-4 w-4' />{job.jobType}</span>
              <span className='flex items-center gap-1'><Clock className='h-4 w-4' />{formatTimeAgo(job.postedAt)}</span>
              {job.applicationCount > 0 && (
                <span className='flex items-center gap-1'><Users className='h-4 w-4' />{job.applicationCount} applicants</span>
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              {job.experienceLevel && <Badge variant='outline'>{job.experienceLevel}</Badge>}
              {job.industry && <Badge variant='outline'>{job.industry}</Badge>}
              {(job.weldingTypes || []).map((w) => (
                <Badge key={w} variant='secondary'>{w}</Badge>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white px-8'>Apply Now</Button>
            <Button variant='outline' className='gap-2'><Bookmark className='h-4 w-4' /> Save</Button>
          </div>
        </div>

        {job.salaryMin && job.salaryMax ? (
          <div className='mt-4 flex items-center gap-2 text-lg font-semibold text-emerald-600'>
            <DollarSign className='h-5 w-5' />
            &euro;{job.salaryMin.toLocaleString()} - &euro;{job.salaryMax.toLocaleString()} /month
          </div>
        ) : job.salary ? (
          <div className='mt-4 flex items-center gap-2 text-lg font-semibold text-emerald-600'>
            <DollarSign className='h-5 w-5' />
            {job.salary}
          </div>
        ) : null}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-800 mb-3'>Job Description</h2>
            <p className='text-gray-600 leading-relaxed whitespace-pre-line'>{job.description}</p>
          </div>

          {(job.requirements || []).length > 0 && (
            <div className='bg-white rounded-xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-800 mb-3'>Requirements</h2>
              <ul className='space-y-2'>
                {job.requirements.map((r, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-blue-500 mt-0.5 shrink-0' />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(job.benefits || []).length > 0 && (
            <div className='bg-white rounded-xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-800 mb-3'>Benefits</h2>
              <ul className='space-y-2'>
                {job.benefits.map((b, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-emerald-500 mt-0.5 shrink-0' />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className='space-y-6'>
          {(job.certifications || []).length > 0 && (
            <div className='bg-white rounded-xl border border-gray-100 p-6'>
              <h3 className='font-semibold text-gray-800 mb-3'>Required Certifications</h3>
              <div className='space-y-2'>
                {job.certifications.map((c) => (
                  <div key={c} className='flex items-center gap-2 text-sm'>
                    <Award className='h-4 w-4 text-blue-500' />
                    <span className='text-gray-600'>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>Job Details</h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Posted</span>
                <span className='text-gray-800'>{formatTimeAgo(job.postedAt)}</span>
              </div>
              <Separator />
              {job.expiresAt && (
                <>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Expires</span>
                    <span className='text-gray-800'>{job.expiresAt}</span>
                  </div>
                  <Separator />
                </>
              )}
              {job.applicationCount > 0 && (
                <>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Applicants</span>
                    <span className='text-gray-800'>{job.applicationCount}</span>
                  </div>
                  <Separator />
                </>
              )}
              {job.industry && (
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Industry</span>
                  <span className='text-gray-800'>{job.industry}</span>
                </div>
              )}
              {job.country && (
                <>
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Country</span>
                    <span className='text-gray-800'>{job.country}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button className='w-full bg-blue-500 hover:bg-blue-600 text-white'>Apply Now</Button>
        </div>
      </div>
    </div>
  );
}
