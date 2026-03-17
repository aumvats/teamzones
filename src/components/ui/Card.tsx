import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
