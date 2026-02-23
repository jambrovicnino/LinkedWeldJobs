import { Bell, Briefcase, FileText, UserCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1, title: 'New job match', message: 'A new TIG welding position in Norway matches your profile.',
    type: 'new_job_match' as const, isRead: false, createdAt: '2 hours ago',
  },
  {
    id: 2, title: 'Application update', message: 'Nordic Welding Solutions is reviewing your application.',
    type: 'application_update' as const, isRead: false, createdAt: '5 hours ago',
  },
  {
    id: 3, title: 'Complete your profile', message: 'Add your certifications to get more job matches.',
    type: 'profile_reminder' as const, isRead: true, createdAt: '1 day ago',
  },
];

const iconMap = {
  new_job_match: { icon: Briefcase, color: 'bg-blue-50 text-blue-500' },
  application_update: { icon: FileText, color: 'bg-emerald-50 text-emerald-500' },
  profile_reminder: { icon: UserCircle, color: 'bg-amber-50 text-amber-500' },
  system: { icon: Bell, color: 'bg-gray-50 text-gray-500' },
};

export function NotificationsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Notifications</h1>
          <p className='text-gray-500 mt-1'>Stay updated on your job search</p>
        </div>
        <Button variant='outline' size='sm' className='gap-2'>
          <Check className='h-4 w-4' /> Mark all read
        </Button>
      </div>

      <div className='space-y-2'>
        {SAMPLE_NOTIFICATIONS.map((n) => {
          const { icon: Icon, color } = iconMap[n.type];
          return (
            <div key={n.id} className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${n.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'}`}>
              <div className='flex items-start gap-3'>
                <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon className='h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <p className='font-medium text-gray-800'>{n.title}</p>
                    <span className='text-xs text-gray-400'>{n.createdAt}</span>
                  </div>
                  <p className='text-sm text-gray-500 mt-0.5'>{n.message}</p>
                </div>
                {!n.isRead && <div className='h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0' />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
