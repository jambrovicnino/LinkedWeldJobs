import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  UserCircle, Mail, Phone, MapPin, Award, Briefcase, Calendar,
  Globe, Edit, CheckCircle, Plus,
} from 'lucide-react';
import { WELDING_TYPES, CERTIFICATIONS, EU_COUNTRIES } from '@/lib/constants';

export function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Profile</h1>
          <p className='text-gray-500 mt-1'>Manage your welder profile visible to employers</p>
        </div>
        <Button className='gap-2 bg-blue-500 hover:bg-blue-600 text-white'>
          <Edit className='h-4 w-4' /> Edit Profile
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center'>
                <UserCircle className='h-12 w-12 text-blue-400' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>{user?.firstName} {user?.lastName}</h2>
                <p className='text-gray-500'>{user?.profileHeadline || 'Welding Professional'}</p>
                <Badge variant='outline' className='mt-1 text-xs border-blue-200 text-blue-600'>Free Plan</Badge>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Mail className='h-4 w-4 text-gray-400' /> {user?.email}
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <Phone className='h-4 w-4 text-gray-400' /> {user?.phone || 'Not provided'}
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <MapPin className='h-4 w-4 text-gray-400' /> {user?.location || 'Not set'}
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <Globe className='h-4 w-4 text-gray-400' /> {user?.nationality || 'Not set'}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>About</h3>
            <p className='text-sm text-gray-500'>{user?.bio || 'No bio added yet. Tell employers about your welding experience and career goals.'}</p>
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-semibold text-gray-800'>Welding Skills</h3>
              <Button variant='ghost' size='sm' className='text-blue-500 gap-1'><Plus className='h-4 w-4' /> Add</Button>
            </div>
            {(user?.weldingTypes && user.weldingTypes.length > 0) ? (
              <div className='flex flex-wrap gap-2'>
                {user.weldingTypes.map((w) => <Badge key={w} variant='secondary'>{w}</Badge>)}
              </div>
            ) : (
              <p className='text-sm text-gray-400'>No welding types added yet</p>
            )}
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-semibold text-gray-800'>Certifications</h3>
              <Button variant='ghost' size='sm' className='text-blue-500 gap-1'><Plus className='h-4 w-4' /> Add</Button>
            </div>
            {(user?.certifications && user.certifications.length > 0) ? (
              <div className='space-y-2'>
                {user.certifications.map((c) => (
                  <div key={c} className='flex items-center gap-2 text-sm'>
                    <Award className='h-4 w-4 text-blue-500' />
                    <span className='text-gray-600'>{c}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-400'>No certifications added yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>Profile Completeness</h3>
            <div className='w-full bg-gray-100 rounded-full h-3 mb-2'>
              <div className='bg-blue-500 h-3 rounded-full' style={{ width: '20%' }} />
            </div>
            <p className='text-xs text-gray-500'>20% complete</p>
            <Separator className='my-4' />
            <div className='space-y-2'>
              {[
                { label: 'Basic info', done: true },
                { label: 'Welding types', done: false },
                { label: 'Certifications', done: false },
                { label: 'Experience', done: false },
                { label: 'Preferences', done: false },
              ].map((item) => (
                <div key={item.label} className='flex items-center gap-2 text-sm'>
                  <CheckCircle className={`h-4 w-4 ${item.done ? 'text-emerald-500' : 'text-gray-300'}`} />
                  <span className={item.done ? 'text-gray-800' : 'text-gray-400'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-800 mb-3'>Availability</h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Available from</span>
                <span className='text-gray-800'>{user?.availableFrom || 'Immediately'}</span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-gray-500'>Willing to relocate</span>
                <span className='text-gray-800'>{user?.willingToRelocate ? 'Yes' : 'Not set'}</span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-gray-500'>Experience</span>
                <span className='text-gray-800'>{user?.experienceYears ? `${user.experienceYears} years` : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
