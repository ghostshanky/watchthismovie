import PauseLoader from '@/components/PauseLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="scale-150"> {/* Make it bigger */}
        <PauseLoader />
      </div>
    </div>
  );
}