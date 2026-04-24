import { ExploreSection } from '@/components/explore/ExploreSection';

export default function ExplorePage() {
  return (
    <div>
      <h1 className="mt-2.5 mb-10 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        Explore Your
        <span className="text-primary-100"> Fantasies</span>
      </h1>
      <ExploreSection />
    </div>
  );
}
