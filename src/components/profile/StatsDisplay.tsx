import { Trophy, Clock, Film, ThumbsUp, ThumbsDown, Activity } from 'lucide-react';

interface StatsDisplayProps {
    watchedCount: number;
    likedCount?: number;
    dislikedCount?: number;
}

export default function StatsDisplay({ watchedCount, likedCount = 0, dislikedCount = 0 }: StatsDisplayProps) {
    // Logic from taste.ts (mirrored for UI consistency)
    let level = "Novice Watcher";
    if (watchedCount > 10) level = "Film Enthusiast";
    if (watchedCount > 50) level = "Cinema Addict";
    if (watchedCount > 100) level = "Certified Critic";
    if (watchedCount > 500) level = "God Tier";

    const hours = Math.round(watchedCount * 1.8); // Avg 1.8 hours per movie

    const totalInteractions = likedCount + dislikedCount;
    const likeRatio = totalInteractions > 0 ? Math.round((likedCount / totalInteractions) * 100) : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* 1. RANK (Double-width on mobile?) */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Trophy className="w-5 h-5 text-yellow-500 mb-2" />
                <div className="text-sm font-bold text-white mt-1 mb-1 leading-tight">{level}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Rank</div>
            </div>

            {/* 2. LIKES (New) */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                <ThumbsUp className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-xl font-bold text-white">{likedCount}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Liked</div>
            </div>

            {/* 3. RATIO (New) */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                <Activity className="w-5 h-5 text-pink-400 mb-2" />
                <div className="text-xl font-bold text-white">{likeRatio}%</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Match Rate</div>
            </div>
        </div>
    );
}
