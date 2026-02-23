import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/router/routes';
import { LayoutDashboard, Briefcase, FileText, Bookmark, Menu } from 'lucide-react';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'Jobs', icon: Briefcase, path: ROUTES.JOBS },
  { label: 'Applications', icon: FileText, path: ROUTES.APPLICATIONS },
  { label: 'Saved', icon: Bookmark, path: ROUTES.SAVED_JOBS },
  { label: 'More', icon: Menu, path: ROUTES.SETTINGS },
];

export function MobileNav() {
  const location = useLocation();
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden'>
      <div className='flex justify-around'>
        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link key={item.path} to={item.path}
              className={cn('flex flex-col items-center gap-1 py-2 px-3 text-xs', isActive ? 'text-primary-600' : 'text-gray-400')}>
              <item.icon className='h-5 w-5' /><span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
