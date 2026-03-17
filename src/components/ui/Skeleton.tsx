interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ width, height, className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-border/40 rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
}
