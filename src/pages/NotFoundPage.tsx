import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/router/routes';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center space-y-4'>
        <p className='text-6xl font-bold text-blue-500'>404</p>
        <h1 className='text-2xl font-bold text-gray-900'>Page Not Found</h1>
        <p className='text-gray-500'>The page you're looking for doesn't exist.</p>
        <Link to={ROUTES.HOME}>
          <Button className='gap-2 bg-blue-500 hover:bg-blue-600 text-white'>
            <ArrowLeft className='h-4 w-4' /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
