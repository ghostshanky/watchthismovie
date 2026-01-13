'use client';

interface TasteAccuracyProps {
  ratingCount: number;
}

export default function TasteAccuracy({ ratingCount }: TasteAccuracyProps) {
  const progress = Math.min((ratingCount / 20) * 100, 100); // Assuming 20 ratings for 100%

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white">Taste Accuracy</h2>
        <span className="text-sm text-gray-400">{ratingCount}/20 rated</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Rate more movies to improve your recommendations
      </p>
    </div>
  );
}
