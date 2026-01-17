'use client';
import { motion } from 'framer-motion';
import { AnalyticsData } from '@/lib/analytics';
import { ThumbsUp, ThumbsDown, Activity } from 'lucide-react';

export default function CinephileAnalytics({ data }: { data: AnalyticsData }) {
    if (!data || data.sentiment.total === 0) return null;

    // Calculate max for bar scaling
    const maxActivity = Math.max(...data.activity.map(a => a.count), 5); // Minimum scale of 5

    // Donut Chart Calculations
    // Donut Chart Calculations
    const { likes, dislikes, skipped, total } = data.sentiment;

    // Percentages
    const likePct = total > 0 ? (likes / total) * 100 : 0;
    const dislikePct = total > 0 ? (dislikes / total) * 100 : 0;
    // Skipped is the remainder, or base

    const circumference = 2 * Math.PI * 40; // r=40

    // Calculate Offsets for SVG Stroke Dasharray
    // We stack them: Base (Gray) -> Dislike (Red) -> Like (Green)

    // Green (Likes)
    const likeStroke = (likePct / 100) * circumference;
    const likeOffset = circumference - likeStroke;

    // Red (Dislikes) - Starts where Green ends? No, let's rotate them.
    // Easier: 
    // Circle 1: Gray (Full)
    // Circle 2: Red (Starts at 0). Length = Dislike Pct.
    // Circle 3: Green (Starts at Dislike End). Length = Like Pct.

    const dislikeStroke = (dislikePct / 100) * circumference;
    const dislikeOffset = circumference - dislikeStroke;

    // Rotation for Green segment (starts after Red)
    // Red takes up (dislikePct/100) * 360 degrees
    const greenRotation = (dislikePct / 100) * 360 - 90; // -90 to compensate for initial SVG rotation

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">

            {/* 1. ACTIVITY CHART (Bars) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-lg">Watch Activity</h3>
                </div>

                <div className="flex items-end justify-between h-40 pt-4">
                    {data.activity.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 w-full h-full justify-end">
                            {/* Bar Container - flex-1 takes available space above label */}
                            <div className="w-full px-1 flex-1 flex items-end justify-center group relative">
                                <motion.div
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${(item.count / maxActivity) * 100}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1, type: "spring" }}
                                    className="w-full max-w-[20px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm relative min-h-[4px]"
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {item.count} Movies
                                    </div>
                                </motion.div>
                            </div>
                            {/* Label */}
                            <span className="text-[10px] text-gray-500 font-mono uppercase">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. SENTIMENT CHART (Donut) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative">
                <div className="self-start flex items-center gap-2 mb-4 w-full">
                    <ThumbsUp className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold text-lg">Taste Sentiment</h3>
                </div>

                <div className="relative w-48 h-48">
                    {/* SVG Donut */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* 1. Base Circle (Neutral/Skipped) - Gray */}
                        <circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="#374151" // Gray-700
                            strokeWidth="10"
                        />

                        {/* 2. Dislikes (Red) - Starts at -90deg (Top) */}
                        <motion.circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="#ef4444" // Red-500
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference} // Initial
                            whileInView={{ strokeDashoffset: dislikeOffset }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                        />

                        {/* 3. Likes (Green) - Starts after Red */}
                        <motion.circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="#22c55e" // Green-500
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference} // Initial
                            whileInView={{ strokeDashoffset: likeOffset }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            strokeLinecap="round"
                            transform={`rotate(${greenRotation} 50 50)`}
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-white">{Math.round(likePct)}%</span>
                        <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Positive</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-400 font-bold">{likes} Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-700" />
                        <span className="text-xs text-gray-400 font-bold">{skipped} Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-xs text-gray-400 font-bold">{dislikes} Negative</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
