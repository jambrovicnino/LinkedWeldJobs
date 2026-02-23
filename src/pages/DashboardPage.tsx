import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Briefcase, FileText, Bookmark, UserCircle, ArrowRight, Clock, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STAT_CARDS = [
  { label: 'Total Applications', value: '0', icon: FileText, color: 'bg-blue-50 text-blue-500', link: ROUTES.APPLICATIONS },
  { label: 'Active Applications', value: '0', icon: Clock, color: 'bg-emerald-50 text-emerald-500', link: ROUTES.APPLICATIONS },
  { label: 'Saved Jobs', value: '0', icon: Bookmark, color: 'bg-amber-50 text-amber-500', link: ROUTES.SAVED_JOBS },
  { label: 'Matching Jobs', value: '0', icon: Briefcase, color: 'bg-purple-50 text-purple-500', link: ROUTES.JOBS },
];

const SAMPLE_JOBS = [
  { id: 1, title: 'TIG Welder — Stainless Steel Piping', company: 'Nordic Welding Solutions', location: 'Oslo, Norway', type: 'Contract', postedAt: '2h ago' },
  { id: 2, title: 'MIG/MAG Welder — Shipyard', company: 'Baltic Shipworks', location: 'Gdansk, Poland', type: 'Full-time', postedAt: '5h ago' },
  { id: 3, title: 'Pipe Welder — Oil & Gas', company: 'EnergyFlow GmbH', location: 'Hamburg, Germany', type: 'Contract', postedAt: '1d ago' },
];

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className='space-y-6'>
      {/* Welcome */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Welcome back, {user?.firstName}!</h1>
        <p className='text-gray-500 mt-1'>Here&apos;s your job search overview.</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {STAT_CARDS.map((stat) => (
          <Link key={stat.label} to={stat.link} className='bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all'>
            <div className='flex items-center gap-4'>
              <div className={`h-11 w-11 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className='h-5 w-5' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                <p className='text-xs text-gray-500'>{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Profile completeness */}
      <div className='bg-white rounded-xl border border-gray-100 p-6'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='font-semibold text-gray-800'>Complete Your Profile</h2>
          <Link to={ROUTES.PROFILE}>
            <Button variant='ghost' size='sm' className='text-blue-500 gap-1'>
              Edit Profile <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
        <div className='w-full bg-gray-100 rounded-full h-2.5'>
          <div className='bg-blue-500 h-2.5 rounded-full' style={{ width: '20%' }} />
        </div>
        <p className='text-xs text-gray-500 mt-2'>20% complete — Add your certifications and experience to attract more employers.</p>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Link to={ROUTES.JOBS}
          className='flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all'>
          <div className='h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center'>
            <Briefcase className='h-5 w-5 text-blue-500' />
          </div>
          <div>
            <p className='font-medium text-gray-800'>Browse Jobs</p>
            <p className='text-xs text-gray-500'>Find your next position</p>
          </div>
        </Link>
        <Link to={ROUTES.PROFILE}
          className='flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all'>
          <div className='h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center'>
            <UserCircle className='h-5 w-5 text-emerald-500' />
          </div>
          <div>
            <p className='font-medium text-gray-800'>Update Profile</p>
            <p className='text-xs text-gray-500'>Add certifications & skills</p>
          </div>
        </Link>
        <Link to={ROUTES.APPLICATIONS}
          className='flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all'>
          <div className='h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center'>
            <FileText className='h-5 w-5 text-purple-500' />
          </div>
          <div>
            <p className='font-medium text-gray-800'>My Applications</p>
            <p className='text-xs text-gray-500'>Track your progress</p>
          </div>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className='bg-white rounded-xl border border-gray-100 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-semibold text-gray-800'>Latest Jobs For You</h2>
          <Link to={ROUTES.JOBS}>
            <Button variant='ghost' size='sm' className='text-blue-500 gap-1'>
              View All <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
        <div className='space-y-3'>
          {SAMPLE_JOBS.map((job) => (
            <div key={job.id} className='flex items-center justify-between p-4 rounded-lg border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all'>
              <div className='space-y-1'>
                <p className='font-medium text-gray-800'>{job.title}</p>
                <div className='flex items-center gap-3 text-xs text-gray-500'>
                  <span className='flex items-center gap-1'><Building2 className='h-3 w-3' />{job.company}</span>
                  <span className='flex items-center gap-1'><MapPin className='h-3 w-3' />{job.location}</span>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Badge variant='outline' className='text-xs'>{job.type}</Badge>
                <span className='text-xs text-gray-400'>{job.postedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
