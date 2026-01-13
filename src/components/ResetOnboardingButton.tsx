'use client';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function ResetOnboardingButton() {
  const router = useRouter();

  const handleReset = () => {
    if (confirm("This will reset your language preferences. Continue?")) {
      router.push('/onboarding');
    }
  };

  return (
    <button 
      onClick={handleReset}
      className="px-4 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-200 flex items-center gap-2 transition-colors"
    >
      <RefreshCw className="w-4 h-4" /> Reset
    </button>
  );
}