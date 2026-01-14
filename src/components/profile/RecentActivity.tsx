import Link from 'next/link';
import Image from 'next/image';

interface RecentActivityProps {
    movies: {
        id: number;
        title: string;
        poster_path: string | null;
    }[];
}

export default function RecentActivity({ movies }: RecentActivityProps) {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {movies.map((movie) => (
                <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="relative w-24 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:scale-105"
                    title={movie.title}
                >
                    {movie.poster_path ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-500 text-center p-1">
                            {movie.title}
                        </div>
                    )}
                </Link>
            ))}
        </div>
    );
}
