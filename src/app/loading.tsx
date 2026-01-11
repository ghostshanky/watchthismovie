import Image from "next/image";

export default function Loading() {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center z-[9999]">
      {/* Your Brand Animation */}
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <Image 
          src="/loader.gif" 
          alt="Loading..." 
          fill 
          className="object-contain"
          unoptimized // Crucial for GIFs to animate
        />
      </div>
      
      {/* Optional: Subtle pulsing text */}
      <p className="text-gray-500 text-xs font-medium tracking-[0.2em] mt-4 animate-pulse uppercase">
        Initializing AI...
      </p>
    </div>
  );
}