export default function PauseLoader({ className = "h-6" }: { className?: string }) {
    // We allow passing a custom height class (like h-4, h-8, etc.)
    return (
        <div className={`pause-loader ${className}`}>
            <div className="pause-bar bg-white"></div>
            <div className="pause-bar bg-blue-500"></div>
        </div>
    );
}
