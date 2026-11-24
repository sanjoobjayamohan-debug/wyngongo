import { useState } from 'react';
import { Mountain } from 'lucide-react';

interface ResortImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ResortImage({ src, alt, className = '' }: ResortImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-emerald-100/80 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Mountain className="w-8 h-8 mb-2 text-emerald-300/70" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-emerald-100/90 line-clamp-2 max-w-[18ch]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
