import { useState, useEffect } from 'react';
import { ExternalLink, Newspaper, RefreshCw, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { NewsArticle } from '@/types';
import api from '@/lib/api';

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function NewsImageFallback({ className }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center ${className || ''}`}>
      <Newspaper className='h-8 w-8 text-blue-300' />
    </div>
  );
}

function ArticleImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <NewsImageFallback className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className || ''}`}
      onError={() => setError(true)}
      loading='lazy'
    />
  );
}

// ──── Loading Skeleton ────
function NewsLoadingSkeleton() {
  return (
    <div className='bg-white rounded-xl border border-gray-100 p-6'>
      <div className='flex items-center gap-2 mb-5'>
        <Skeleton className='h-5 w-5 rounded' />
        <Skeleton className='h-5 w-44' />
      </div>

      {/* Featured skeleton */}
      <Skeleton className='h-48 w-full rounded-xl mb-4' />
      <Skeleton className='h-5 w-3/4 mb-2' />
      <Skeleton className='h-4 w-full mb-1' />
      <Skeleton className='h-4 w-2/3 mb-3' />
      <div className='flex gap-2 mb-5'>
        <Skeleton className='h-5 w-20 rounded-full' />
        <Skeleton className='h-5 w-14' />
      </div>

      {/* Compact list skeletons */}
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex gap-3 items-start'>
            <Skeleton className='h-16 w-16 rounded-lg flex-shrink-0' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-3 w-3/4' />
              <div className='flex gap-2'>
                <Skeleton className='h-4 w-16 rounded-full' />
                <Skeleton className='h-4 w-12' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──── Featured Article (first/large) ────
function FeaturedArticle({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target='_blank'
      rel='noopener noreferrer'
      className='block rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-200 group mb-4'
    >
      <div className='relative h-48 sm:h-56 overflow-hidden'>
        <ArticleImage
          src={article.image}
          alt={article.title}
          className='w-full h-full transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h3 className='font-semibold text-white text-lg leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors'>
            {article.title}
          </h3>
        </div>
      </div>
      <div className='p-4'>
        <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{article.description}</p>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-xs font-normal'>
              <Globe className='h-3 w-3 mr-1' />
              {article.source}
            </Badge>
            <span className='text-xs text-gray-400'>{formatTimeAgo(article.publishedAt)}</span>
          </div>
          <ExternalLink className='h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors' />
        </div>
      </div>
    </a>
  );
}

// ──── Compact Article (list items) ────
function CompactArticle({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex gap-3 p-3 rounded-lg border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200 group'
    >
      <div className='h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0'>
        <ArticleImage
          src={article.image}
          alt={article.title}
          className='w-full h-full'
        />
      </div>
      <div className='flex-1 min-w-0 space-y-1'>
        <p className='font-medium text-sm text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug'>
          {article.title}
        </p>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-[10px] font-normal px-1.5 py-0'>
            {article.source}
          </Badge>
          <span className='text-[11px] text-gray-400'>{formatTimeAgo(article.publishedAt)}</span>
        </div>
      </div>
      <ExternalLink className='h-3.5 w-3.5 text-gray-200 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors' />
    </a>
  );
}

// ──── Main Component ────
export function WeldingNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<string>('');
  const [fetchedAt, setFetchedAt] = useState<string>('');

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get('/news');
      setArticles(data.data?.articles ?? []);
      setSource(data.data?.source ?? '');
      setFetchedAt(data.data?.fetchedAt ?? '');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) return <NewsLoadingSkeleton />;

  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-100 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Newspaper className='h-5 w-5 text-orange-500' />
            <h2 className='font-semibold text-gray-800'>Welding Industry News</h2>
          </div>
          <Button variant='ghost' size='sm' onClick={fetchNews} className='text-blue-500 gap-1 hover:text-blue-600'>
            <RefreshCw className='h-4 w-4' /> Retry
          </Button>
        </div>
        <div className='text-center py-8'>
          <Newspaper className='h-10 w-10 text-gray-200 mx-auto mb-3' />
          <p className='text-sm text-gray-500'>Unable to load news right now.</p>
          <p className='text-xs text-gray-400 mt-1'>Click retry to try again.</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className='bg-white rounded-xl border border-gray-100 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Newspaper className='h-5 w-5 text-orange-500' />
          <h2 className='font-semibold text-gray-800'>Welding Industry News</h2>
        </div>
        <div className='text-center py-8'>
          <Newspaper className='h-10 w-10 text-gray-200 mx-auto mb-3' />
          <p className='text-sm text-gray-500'>No news available at the moment.</p>
        </div>
      </div>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <div className='bg-white rounded-xl border border-gray-100 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center'>
            <Newspaper className='h-4.5 w-4.5 text-orange-500' />
          </div>
          <div>
            <h2 className='font-semibold text-gray-800'>Welding Industry News</h2>
            <p className='text-[11px] text-gray-400'>
              {source === 'rss' ? 'Live feed from The Fabricator' : source === 'gnews' ? 'Powered by GNews' : 'Curated articles'}
              {fetchedAt && <> &middot; Updated {formatTimeAgo(fetchedAt)}</>}
            </p>
          </div>
        </div>
        <Button variant='ghost' size='sm' onClick={fetchNews} className='text-gray-400 hover:text-blue-500 gap-1 transition-colors'>
          <RefreshCw className='h-3.5 w-3.5' />
          <span className='hidden sm:inline text-xs'>Refresh</span>
        </Button>
      </div>

      {/* Featured article */}
      <FeaturedArticle article={featured} />

      {/* Compact list */}
      {rest.length > 0 && (
        <div className='space-y-2'>
          {rest.map((article, idx) => (
            <CompactArticle key={idx} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
