import { ProfileSection } from '@/components/profile/ProfileSection';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <h1 className="text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">Profile</h1>
      <ProfileSection />
    </div>
  );
}
