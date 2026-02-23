import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/router/routes';
import {
  Flame, ArrowRight, Briefcase, Search, FileText, UserCircle,
  Shield, Clock, CheckCircle, Star, Zap, Globe, MapPin, Award,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Search,
    title: 'Smart Job Search',
    desc: 'Find welding positions across Europe filtered by welding type, certification, location, and salary range.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: FileText,
    title: 'Easy Applications',
    desc: 'Apply to jobs with one click using your saved profile. Track all your applications in one dashboard.',
    color: 'bg-cyan-50 text-cyan-500',
  },
  {
    icon: UserCircle,
    title: 'Welder Profile',
    desc: 'Showcase your certifications, welding types, experience, and availability to employers across the EU.',
    color: 'bg-sky-50 text-sky-500',
  },
  {
    icon: Briefcase,
    title: 'Job Alerts',
    desc: 'Get notified when new positions match your skills and preferences. Never miss an opportunity.',
    color: 'bg-indigo-50 text-indigo-500',
  },
];

const STATS = [
  { value: '500+', label: 'Active Jobs' },
  { value: '200+', label: 'Companies Hiring' },
  { value: '28', label: 'EU Countries' },
  { value: '10k+', label: 'Welders Registered' },
];

export function LandingPage() {
  return (
    <div className='min-h-screen bg-white text-gray-800'>
      {/* Nav */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
              <Flame className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold text-gray-800'>LinkedWeldJobs</span>
          </Link>
          <nav className='hidden md:flex items-center gap-8'>
            <a href='#features' className='text-sm text-gray-500 hover:text-blue-500 transition-colors'>Features</a>
            <a href='#how-it-works' className='text-sm text-gray-500 hover:text-blue-500 transition-colors'>How It Works</a>
            <a href='#about' className='text-sm text-gray-500 hover:text-blue-500 transition-colors'>About</a>
          </nav>
          <div className='flex items-center gap-3'>
            <Link to={ROUTES.LOGIN}>
              <Button variant='ghost' className='text-gray-600 hover:text-blue-500'>Sign In</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button className='gap-2 bg-blue-500 hover:bg-blue-600 text-white'>
                Get Started Free <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-gradient-to-b from-blue-50 to-white'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl' />
          <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm mb-8'>
            <Zap className='h-4 w-4' />
            <span>The #1 job platform for welders in Europe</span>
          </div>
          <h1 className='text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900'>
            Your next welding career,{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500'>
              starts here.
            </span>
          </h1>
          <p className='mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed'>
            Browse hundreds of welding jobs across Europe. Create your profile, apply with one click, and let employers find you.
          </p>
          <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link to={ROUTES.REGISTER}>
              <Button size='lg' className='gap-2 text-lg px-8 py-6 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'>
                Start for Free <ArrowRight className='h-5 w-5' />
              </Button>
            </Link>
            <a href='#features'>
              <Button size='lg' variant='outline' className='text-lg px-8 py-6 border-gray-200 text-gray-600 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50'>
                See Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className='border-y border-gray-100 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            {STATS.map((s) => (
              <div key={s.label} className='text-center'>
                <p className='text-3xl sm:text-4xl font-bold text-blue-500'>{s.value}</p>
                <p className='text-sm text-gray-500 mt-1'>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id='features' className='py-20 sm:py-28'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>Everything you need to land your next welding job</h2>
            <p className='mt-4 text-gray-500 max-w-2xl mx-auto'>
              From job search to application tracking — LinkedWeldJobs makes your career move easy.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className='group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300'
              >
                <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className='h-6 w-6' />
                </div>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>{f.title}</h3>
                <p className='text-gray-500 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-20 border-y border-gray-100 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-6'>How It Works</h2>
          <p className='text-gray-500 max-w-2xl mx-auto mb-12'>
            Three simple steps to your next welding position.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
            <div className='p-6 rounded-xl bg-white border border-gray-100 shadow-sm'>
              <div className='h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3'>
                <UserCircle className='h-6 w-6 text-blue-500' />
              </div>
              <h4 className='font-semibold text-lg text-gray-800 mb-1'>1. Create Your Profile</h4>
              <p className='text-sm text-gray-500'>Add your welding certifications, experience, and preferences. It only takes a few minutes.</p>
            </div>
            <div className='p-6 rounded-xl bg-white border border-gray-100 shadow-sm'>
              <div className='h-12 w-12 rounded-xl bg-cyan-50 flex items-center justify-center mx-auto mb-3'>
                <Search className='h-6 w-6 text-cyan-500' />
              </div>
              <h4 className='font-semibold text-lg text-gray-800 mb-1'>2. Browse & Apply</h4>
              <p className='text-sm text-gray-500'>Search jobs by welding type, location, or salary. Apply with one click using your saved profile.</p>
            </div>
            <div className='p-6 rounded-xl bg-white border border-gray-100 shadow-sm'>
              <div className='h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center mx-auto mb-3'>
                <Award className='h-6 w-6 text-sky-500' />
              </div>
              <h4 className='font-semibold text-lg text-gray-800 mb-1'>3. Get Hired</h4>
              <p className='text-sm text-gray-500'>Track your applications, get interview invites, and land your next welding contract.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Trust */}
      <section id='about' className='py-20 sm:py-28'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>100% Free for Candidates</h2>
            <p className='mt-4 text-gray-500'>Start your job search today with no hidden fees.</p>
          </div>
          <div className='max-w-lg mx-auto'>
            <div className='relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300'>
              <h3 className='text-lg font-semibold text-gray-800'>Free Plan</h3>
              <div className='mt-4 flex items-baseline gap-1'>
                <span className='text-4xl font-bold text-gray-900'>&euro;0</span>
                <span className='text-gray-400'>/forever</span>
              </div>
              <p className='mt-2 text-sm text-gray-500'>Everything you need to find your next welding job</p>
              <ul className='mt-6 space-y-3'>
                {[
                  'Unlimited job applications',
                  'Full profile with certifications',
                  'Application tracking dashboard',
                  'Save & bookmark jobs',
                  'Job match notifications',
                  'Direct messaging with employers',
                ].map((f) => (
                  <li key={f} className='flex items-start gap-2 text-sm'>
                    <CheckCircle className='h-4 w-4 text-blue-500 mt-0.5 shrink-0' />
                    <span className='text-gray-600'>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={ROUTES.REGISTER} className='block mt-8'>
                <Button className='w-full bg-blue-500 hover:bg-blue-600 text-white'>
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-gray-100 py-12 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
                <Flame className='h-4 w-4 text-white' />
              </div>
              <span className='font-bold text-lg text-gray-800'>LinkedWeldJobs</span>
            </div>
            <p className='text-sm text-gray-400'>
              &copy; {new Date().getFullYear()} LinkedWeldJobs. Built for welding professionals.
            </p>
            <div className='flex items-center gap-6 text-sm text-gray-400'>
              <a href='#' className='hover:text-blue-500 transition-colors'>Privacy</a>
              <a href='#' className='hover:text-blue-500 transition-colors'>Terms</a>
              <a href='#' className='hover:text-blue-500 transition-colors'>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
