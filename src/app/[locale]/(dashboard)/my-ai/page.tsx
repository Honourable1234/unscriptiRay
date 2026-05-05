import { MyAiSection } from '@/components/my-ai/MyAiSection';

export default function MyAiPage() {
  return (
    <div className="space-y-6 py-6">
      <h1 className="text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        My
        {' '}
        <span className="text-primary-100">AI</span>
      </h1>
      <MyAiSection />
    </div>
  );
}
