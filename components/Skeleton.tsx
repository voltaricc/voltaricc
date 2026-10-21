export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-800/80 rounded-xl ${className}`} />;
}