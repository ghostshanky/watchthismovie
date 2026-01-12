export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Skeleton */}
      <div className="h-[80vh] w-full bg-gray-900 animate-pulse relative">
        <div className="absolute bottom-12 left-6 md:left-12 space-y-4 max-w-2xl w-full">
          <div className="h-4 w-32 bg-gray-800 rounded"></div>
          <div className="h-12 w-3/4 bg-gray-800 rounded"></div>
          <div className="flex gap-4">
             <div className="h-10 w-32 bg-gray-800 rounded-full"></div>
             <div className="h-10 w-32 bg-gray-800 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
           <div className="h-40 bg-gray-900 rounded-2xl animate-pulse"></div>
           <div className="flex gap-4 overflow-hidden">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-32 h-32 rounded-full bg-gray-900 animate-pulse flex-shrink-0"></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}