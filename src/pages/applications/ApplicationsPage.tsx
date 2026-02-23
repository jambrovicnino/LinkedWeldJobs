import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, Clock, ArrowRight, FileText } from 'lucide-react';
import { APPLICATION_STATUS_COLORS } from '@/lib/constants';

const SAMPLE_APPLICATIONS = [
  {
    id: 1, jobTitle: 'TIG Welder — Stainless Steel Piping', company: 'Nordic Welding Solutions',
    location: 'Oslo, Norway', status: 'reviewing' as const, appliedAt: '2026-02-20', jobType: 'Contract',
  },
  {
    id: 2, jobTitle: 'Pipe Welder — Oil & Gas', company: 'EnergyFlow GmbH',
    location: 'Hamburg, Germany', status: 'applied' as const, appliedAt: '2026-02-18', jobType: 'Contract',
  },
  {
    id: 3, jobTitle: 'Structural Welder', company: 'BuildRight SA',
    location: 'Lisbon, Portugal', status: 'interview' as const, appliedAt: '2026-02-10', jobType: 'Full-time',
  },
];

export function ApplicationsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>My Applications</h1>
        <p className='text-gray-500 mt-1'>Track the status of your job applications</p>
      </div>

      <Tabs defaultValue='all' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='all'>All ({SAMPLE_APPLICATIONS.length})</TabsTrigger>
          <TabsTrigger value='active'>Active (2)</TabsTrigger>
          <TabsTrigger value='interviews'>Interviews (1)</TabsTrigger>
          <TabsTrigger value='closed'>Closed (0)</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-3'>
          {SAMPLE_APPLICATIONS.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-100 p-12 text-center'>
              <FileText className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-800 mb-1'>No applications yet</h3>
              <p className='text-sm text-gray-500 mb-4'>Start applying to welding jobs to see them here</p>
              <Link to={ROUTES.JOBS}>
                <Button className='bg-blue-500 hover:bg-blue-600 text-white'>Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            SAMPLE_APPLICATIONS.map((app) => (
              <div key={app.id} className='bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-2'>
                    <p className='text-lg font-semibold text-gray-800'>{app.jobTitle}</p>
                    <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500'>
                      <span className='flex items-center gap-1'><Building2 className='h-3.5 w-3.5' />{app.company}</span>
                      <span className='flex items-center gap-1'><MapPin className='h-3.5 w-3.5' />{app.location}</span>
                      <span className='flex items-center gap-1'><Clock className='h-3.5 w-3.5' />Applied {app.appliedAt}</span>
                    </div>
                    <div className='flex gap-2'>
                      <Badge variant='outline' className='text-xs'>{app.jobType}</Badge>
                      <Badge className={`text-xs border ${APPLICATION_STATUS_COLORS[app.status]}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' className='text-blue-500 gap-1'>
                    Details <ArrowRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value='active' className='space-y-3'>
          <p className='text-sm text-gray-500'>Active applications will appear here.</p>
        </TabsContent>
        <TabsContent value='interviews' className='space-y-3'>
          <p className='text-sm text-gray-500'>Interview invitations will appear here.</p>
        </TabsContent>
        <TabsContent value='closed' className='space-y-3'>
          <p className='text-sm text-gray-500'>Closed applications will appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
