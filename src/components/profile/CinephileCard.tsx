import Image from 'next/image';
import { User } from 'lucide-react';

interface CardProps {
    username: string;
    fullName?: string; // New Prop
    level: string;
    avatarUrl?: string;
    stats: { watched: number; hours: number };
    joinDate: string;
    tags?: string[];
}

export default function CinephileCard({ username, fullName, level, avatarUrl, stats, joinDate, tags = [] }: CardProps) {
    const profileUrl = `http://watchthismovie.online/cinephile/${username}`;
    // Using QR Server API for dynamic QR code generation
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}&bgcolor=255-255-255&color=0-0-0&margin=2`;

    return (
        <div className="relative w-full max-w-[400px] aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500 perspective-1000 group cursor-pointer">

            {/* 1. DYNAMIC HOLOGRAPHIC BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#000000] to-[#1e1b4b] z-0" />
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* Animated Gradient Orbs */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-purple-500/10 to-transparent rotate-45 animate-pulse" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />

            {/* 2. CARD CONTENT (Glass Layer) */}
            <div className="relative z-10 h-full flex flex-col justify-between p-6 border border-white/10 rounded-3xl backdrop-blur-sm bg-white/5 shadow-inner">

                {/* TOP ROW: Header & Level */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="relative w-8 h-8">
                            <Image src="/wtm.svg" alt="WTM" fill className="object-contain" />
                        </div>
                        <div>
                            <div className="text-lg font-black tracking-tighter text-white leading-none">WatchThisMovie</div>
                            <div className="text-[8px] uppercase tracking-[0.2em] text-white/50 font-medium">Official Member</div>
                        </div>
                    </div>

                    {/* Level Badge */}
                    <div className="px-3 py-1 rounded-full border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        {level}
                    </div>
                </div>

                {/* MIDDLE ROW: Identity & Tags */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                        {/* Avatar (Main Focus) */}
                        <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt={username} fill className="object-cover" />
                                ) : (
                                    <User className="w-6 h-6 m-auto mt-4 text-gray-500" />
                                )}
                            </div>
                        </div>

                        {/* Name & Tags */}
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-wide">{fullName || username}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* REAL QR CODE */}
                    <div className="p-1 bg-white rounded-lg shadow-lg">
                        <Image
                            src={qrCodeUrl}
                            alt="Scan Profile"
                            width={48}
                            height={48}
                            className="mix-blend-multiply"
                            unoptimized // External API
                        />
                    </div>
                </div>

                {/* BOTTOM ROW: Footer & Join Date */}
                <div className="flex items-end justify-between mt-auto">
                    <div className="text-[10px] text-gray-500 font-mono">
                        ID: @{username}
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest">Member Since</div>
                        <div className="text-xs font-bold text-white font-mono">{joinDate}</div>
                    </div>
                </div>

            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 skew-x-12 pointer-events-none mix-blend-overlay" />
        </div>
    );
}
