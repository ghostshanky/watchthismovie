'use client';
import { useState, useRef } from 'react';
import { X, Check, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitRatingAndGetNext } from '@/app/actions';

interface Props {
    movie: { id: number; title: string; poster_path: string | null };
    userId: string;
    variant?: 'default' | 'mini'; // NEW: Control size
    onRate?: () => void; // NEW: Callback when done
}

export default function RatingSlider({ movie, userId, variant = 'default', onRate }: Props) {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'neutral' | 'liking' | 'disliking'>('neutral');
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Mini mode is smaller
    const height = variant === 'mini' ? 'h-10' : 'h-16';
    const iconSize = variant === 'mini' ? 'w-4 h-4' : 'w-6 h-6';
    const knobSize = variant === 'mini' ? 'w-8' : 'w-14';
    const MAX_DRAG = variant === 'mini' ? 60 : 120;

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const diff = clientX - (rect.left + centerX);

        // Clamp the drag
        const clamped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diff));
        setDragX(clamped);

        const threshold = MAX_DRAG * 0.5;
        if (clamped > threshold) setStatus('liking');
        else if (clamped < -threshold) setStatus('disliking');
        else setStatus('neutral');
    };

    const handleEnd = async () => {
        setIsDragging(false);

        if (status === 'liking' || status === 'disliking') {
            // 1. Snap to end visually
            setDragX(status === 'liking' ? MAX_DRAG : -MAX_DRAG);

            // 2. Call Server
            await submitRatingAndGetNext(userId, movie, status === 'liking');

            // 3. Trigger Parent Action (e.g., Load next movie)
            if (onRate) onRate();
            else router.refresh();

        } else {
            setDragX(0); // Snap back
        }
    };

    return (
        <div className={`w-full select-none touch-none ${variant === 'mini' ? 'mt-2 max-w-[140px] mx-auto' : 'max-w-sm mx-auto mt-6'}`}>

            {/* TRACK */}
            <div
                ref={containerRef}
                className={`relative ${height} rounded-full border transition-colors duration-300 overflow-hidden flex items-center justify-between px-3
           ${status === 'liking' ? 'bg-green-500/20 border-green-500/50' :
                        status === 'disliking' ? 'bg-red-500/20 border-red-500/50' :
                            'bg-white/10 border-white/10 backdrop-blur-md'
                    }
         `}
            >
                <X className={`${iconSize} transition-opacity ${status === 'disliking' ? 'text-red-500 opacity-100' : 'text-white/20 opacity-50'}`} />

                {variant === 'default' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 text-xs font-bold uppercase tracking-widest text-white/40">
                        {status === 'neutral' ? 'Slide to Rate' : status === 'liking' ? 'Like' : 'Dislike'}
                    </div>
                )}

                <Check className={`${iconSize} transition-opacity ${status === 'liking' ? 'text-green-500 opacity-100' : 'text-white/20 opacity-50'}`} />

                {/* KNOB */}
                <div
                    className={`absolute top-1 bottom-1 ${knobSize} bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20 transition-transform duration-75 ease-out`}
                    style={{
                        left: `calc(50% - ${variant === 'mini' ? '16px' : '28px'})`,
                        transform: `translateX(${dragX}px)`
                    }}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                >
                    {status === 'liking' ? <Check className={`${iconSize} text-green-600`} /> :
                        status === 'disliking' ? <X className={`${iconSize} text-red-600`} /> :
                            <div className="flex gap-0.5">
                                <ChevronsLeft className="w-3 h-3 text-gray-400" />
                                <ChevronsRight className="w-3 h-3 text-gray-400" />
                            </div>
                    }
                </div>
            </div>

            {/* DRAG OVERLAY */}
            {isDragging && (
                <div
                    className="fixed inset-0 z-50 cursor-grabbing"
                    onMouseMove={(e) => handleMove(e.clientX)}
                    onMouseUp={handleEnd}
                    onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                    onTouchEnd={handleEnd}
                />
            )}
        </div>
    );
}
