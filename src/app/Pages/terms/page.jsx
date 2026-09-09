import PolicyPageContent from '@/components/legal/PolicyPageContent';

export const metadata = {
  title: 'Terms & Conditions | Zulu Jewels',
  description: 'Review the official terms and conditions for purchasing certified fine diamond jewelry at Zulu Jewels.',
};

export default function TermsPage() {
  return <PolicyPageContent slug="terms" fallbackTitle="Terms & Conditions" />;
}
