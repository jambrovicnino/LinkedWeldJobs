import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className='space-y-4 text-center'>
        <div className='mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center'>
          <Mail className='h-6 w-6 text-blue-500' />
        </div>
        <h2 className='text-2xl font-bold'>Check your email</h2>
        <p className='text-sm text-muted-foreground'>
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link to={ROUTES.LOGIN}>
          <Button variant='ghost' className='gap-2'>
            <ArrowLeft className='h-4 w-4' /> Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-bold'>Forgot password?</h2>
        <p className='text-sm text-muted-foreground'>Enter your email and we'll send a reset link</p>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='name@example.com' required />
      </div>
      <Button type='submit' variant='accent' className='w-full'>Send Reset Link</Button>
      <div className='text-center'>
        <Link to={ROUTES.LOGIN} className='text-sm text-accent-500 hover:underline'>Back to sign in</Link>
      </div>
    </form>
  );
}
