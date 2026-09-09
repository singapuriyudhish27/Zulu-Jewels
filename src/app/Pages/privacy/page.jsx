import PolicyPageContent from '@/components/legal/PolicyPageContent';

export const metadata = {
  title: 'Privacy Policy | Zulu Jewels',
  description: 'Understand how Zulu Jewels protects and handles your personal data and privacy.',
};

export default function PrivacyPage() {
  return <PolicyPageContent slug="privacy" fallbackTitle="Privacy Policy" />;
}
