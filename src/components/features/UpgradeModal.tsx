"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { X, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] animate-fade-in" role="dialog" aria-modal="true" aria-label="Upgrade to Pro">
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-sm mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] text-center relative animate-scale-in">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1 hover:bg-bg rounded-md text-text-secondary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          <X size={18} />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Zap size={24} className="text-primary" />
          </div>
        </div>

        <h2 className="font-heading font-semibold text-lg mb-2">
          Upgrade to Pro
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          The free plan supports up to 3 team members. Upgrade to Pro for unlimited
          members and the meeting overlap finder.
        </p>

        <div className="flex flex-col gap-2">
          <Link href="/pricing">
            <Button className="w-full">View Plans — from $9/mo</Button>
          </Link>
          <Button variant="ghost" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
