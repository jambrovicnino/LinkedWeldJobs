import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, MapPin, Building2, Clock, Briefcase, Award, CheckCircle, Bookmark,
  DollarSign, Calendar, Users,
} from 'lucide-react';

const JOB_DATA = {
  id: 1,
  title: 'TIG Welder — Stainless Steel Piping',
  company: 'Nordic Welding Solutions',
  location: 'Oslo, Norway',
  country: 'Norway',
  jobType: 'Contract',
  experienceLevel: 'Senior',
  weldingTypes: ['TIG'],
  industry: 'Oil & Gas',
  salaryMin: 4000,
  salaryMax: 6000,
  currency: 'EUR',
  postedAt: '2 hours ago',
  expiresAt: '2026-04-15',
  applicationCount: 23,
  description: 'We are looking for an experienced TIG welder to join our team on a 6-month piping project at North Sea oil and gas facilities. The ideal candidate will have extensive experience with stainless steel piping systems and hold relevant certifications.',
  requirements: [
    'Minimum 5 years of TIG welding experience',
    'EN ISO 9606-1 certification required',
    'Experience with stainless steel piping (Schedule 10-80)',
    'Ability to read and interpret isometric drawings',
    'Valid offshore safety training (BOSIET/HUET preferred)',
    'Willingness to work on rotation schedules',
  ],
  benefits: [
    'Competitive daily rate (€200-€300/day)',
    'Accommodation provided',
    'Travel expenses covered',
    'Overtime opportunities',
    'Long-term contract potential',
    'Safety equipment provided',
  ],
  certifications: ['EN ISO 9606-1', 'ASME IX'],
};

export function JobDetailPage() {
  const { id } = useParams();

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
                <h1 className='text-2xl font-bold text-gray-900'>{JOB_DATA.title}</h1>
                <p className='text-gray-500'>{JOB_DATA.company}</p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500'>
              <span className='flex items-center gap-1'><MapPin className='h-4 w-4' />{JOB_DATA.location}</span>
              <span className='flex items-center gap-1'><Briefcase className='h-4 w-4' />{JOB_DATA.jobType}</span>
              <span className='flex items-center gap-1'><Clock className='h-4 w-4' />{JOB_DATA.postedAt}</span>
              <span className='flex items-center gap-1'><Users className='h-4 w-4' />{JOB_DATA.applicationCount} applicants</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>{JOB_DATA.experienceLevel}</Badge>
              <Badge variant='outline'>{JOB_DATA.industry}</Badge>
              {JOB_DATA.weldingTypes.map((w) => (
                <Badge key={w} variant='secondary'>{w}</Badge>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white px-8'>Apply Now</Button>
            <Button variant='outline' className='gap-2'><Bookmark className='h-4 w-4' /> Save</Button>
          </div>
        </div>

        {JOB_DATA.salaryMin && JOB_DATA.salaryMax && (
          <div className='mt-4 flex items-center gap-2 text-lg font-semibold text-emerald-600'>
            <DollarSign className='h-5 w-5' />
            &euro;{JOB_DATA.salaryMin.toLocaleString()} - &euro;{JOB_DATA.salaryMax.toLocaleString()} /month
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-800 mb-3'>Job Description</h2>
            <p className='text-gray-600 leading-relaxed'>{JOB_DATA.description}</p>
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-800 mb-3'>Requirements</h2>
            <ul className='space-y-2'>
              {JOB_DATA.requirements.map((r, i) => (
                <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                  <CheckCircle className='h-4 w-4 text-blue-500 mt-0.5 shrink-0' />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-800 mb-3'>Benefits</h2>
            <ul className='space-y-2'>
              {JOB_DATA.benefits.map((b, i) => (
                <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                  <CheckCircle className='h-4 w-4 text-emerald-500 mt-0.5 shrink-0' />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>Required Certifications</h3>
            <div className='space-y-2'>
              {JOB_DATA.certifications.map((c) => (
                <div key={c} className='flex items-center gap-2 text-sm'>
                  <Award className='h-4 w-4 text-blue-500' />
                  <span className='text-gray-600'>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>Job Details</h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Posted</span>
                <span className='text-gray-800'>{JOB_DATA.postedAt}</span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-gray-500'>Expires</span>
                <span className='text-gray-800'>{JOB_DATA.expiresAt}</span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-gray-500'>Applicants</span>
                <span className='text-gray-800'>{JOB_DATA.applicationCount}</span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-gray-500'>Industry</span>
                <span className='text-gray-800'>{JOB_DATA.industry}</span>
              </div>
            </div>
          </div>

          <Button className='w-full bg-blue-500 hover:bg-blue-600 text-white'>Apply Now</Button>
        </div>
      </div>
    </div>
  );
}
