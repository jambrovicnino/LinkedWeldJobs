import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Bell, Shield, CheckCircle } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
        <p className='text-gray-500 mt-1'>Manage your account settings and preferences</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          {/* Account */}
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <User className='h-5 w-5 text-gray-500' />
              <h2 className='font-semibold text-gray-800'>Account Information</h2>
            </div>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <Label>First Name</Label>
                  <Input defaultValue={user?.firstName} />
                </div>
                <div className='space-y-2'>
                  <Label>Last Name</Label>
                  <Input defaultValue={user?.lastName} />
                </div>
              </div>
              <div className='space-y-2'>
                <Label>Email</Label>
                <Input defaultValue={user?.email} type='email' />
              </div>
              <div className='space-y-2'>
                <Label>Phone</Label>
                <Input defaultValue={user?.phone || ''} placeholder='+386 ...' />
              </div>
              <Button className='bg-blue-500 hover:bg-blue-600 text-white'>Save Changes</Button>
            </div>
          </div>

          {/* Notifications */}
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Bell className='h-5 w-5 text-gray-500' />
              <h2 className='font-semibold text-gray-800'>Notification Preferences</h2>
            </div>
            <div className='space-y-3'>
              {[
                { label: 'New job matches', desc: 'Get notified when new jobs match your profile' },
                { label: 'Application updates', desc: 'Updates on your submitted applications' },
                { label: 'Profile reminders', desc: 'Reminders to complete your profile' },
              ].map((pref) => (
                <div key={pref.label} className='flex items-center justify-between p-3 rounded-lg border border-gray-50'>
                  <div>
                    <p className='text-sm font-medium text-gray-800'>{pref.label}</p>
                    <p className='text-xs text-gray-500'>{pref.desc}</p>
                  </div>
                  <input type='checkbox' defaultChecked className='h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500' />
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Shield className='h-5 w-5 text-gray-500' />
              <h2 className='font-semibold text-gray-800'>Security</h2>
            </div>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Current Password</Label>
                <Input type='password' placeholder='Enter current password' />
              </div>
              <div className='space-y-2'>
                <Label>New Password</Label>
                <Input type='password' placeholder='Enter new password' />
              </div>
              <Button variant='outline'>Change Password</Button>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className='space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>Your Plan</h3>
            <div className='flex items-center gap-2 mb-2'>
              <Badge className='bg-blue-50 text-blue-700 border-blue-200'>Free Plan</Badge>
            </div>
            <p className='text-sm text-gray-500 mb-4'>You&apos;re on the free plan with full access to all candidate features.</p>
            <ul className='space-y-2 mb-4'>
              {[
                'Unlimited job applications',
                'Full profile',
                'Job match alerts',
                'Application tracking',
                'Save & bookmark jobs',
              ].map((f) => (
                <li key={f} className='flex items-center gap-2 text-xs text-gray-600'>
                  <CheckCircle className='h-3.5 w-3.5 text-blue-500' /> {f}
                </li>
              ))}
            </ul>
            <Separator className='my-4' />
            <p className='text-xs text-gray-400'>LinkedWeldJobs is free for all candidates. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
