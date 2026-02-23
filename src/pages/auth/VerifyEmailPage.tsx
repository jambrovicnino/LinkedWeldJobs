import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flame, Loader2 } from 'lucide-react';
import { ROUTES } from '@/router/routes';

export function VerifyEmailPage() {
  const { verifyEmail, verificationCode, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifyEmail(code);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4'>
      <div className='w-full max-w-md'>
        <div className='flex items-center justify-center gap-2 mb-8'>
          <div className='h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
            <Flame className='h-6 w-6 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-800'>LinkedWeldJobs</h1>
        </div>
        <div className='bg-white rounded-xl border border-gray-200 shadow-xl shadow-blue-500/5 p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2 text-center'>
              <h2 className='text-2xl font-bold'>Verify your email</h2>
              <p className='text-sm text-muted-foreground'>Enter the verification code to continue</p>
            </div>
            {verificationCode && (
              <Alert>
                <AlertDescription>
                  Your verification code: <strong className='font-mono text-lg'>{verificationCode}</strong>
                </AlertDescription>
              </Alert>
            )}
            {error && <Alert variant='destructive'><AlertDescription>{error}</AlertDescription></Alert>}
            <div className='space-y-2'>
              <Label htmlFor='code'>Verification Code</Label>
              <Input id='code' value={code} onChange={(e) => setCode(e.target.value)} placeholder='Enter 6-digit code' className='text-center text-lg tracking-widest' maxLength={6} />
            </div>
            <Button type='submit' variant='accent' className='w-full' disabled={isLoading || code.length < 6}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Verify & Continue
            </Button>
            <div className='text-center'>
              <button type='button' onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
                className='text-sm text-muted-foreground hover:text-accent-500'>
                Sign in with a different account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
