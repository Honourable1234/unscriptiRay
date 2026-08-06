import { getTranslations } from 'next-intl/server';
import { ExploreSection } from '@/components/explore/ExploreSection';

export default async function ExplorePage() {
  const t = await getTranslations('ExplorePage');
  return (
    <div>
      <h1 className="mt-2.5 mb-10 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        {t('title')}
        <span className="text-primary-100">
          {' '}
          {t('title_highlight')}
        </span>
      </h1>
      <ExploreSection />
    </div>
  );
}
