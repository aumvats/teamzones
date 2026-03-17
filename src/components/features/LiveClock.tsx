"use client";

import { useEffect, useState } from "react";
import { formatLocalTime } from "@/lib/timezone";

interface LiveClockProps {
  timezone: string;
  className?: string;
}

export default function LiveClock({ timezone, className = "" }: LiveClockProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(formatLocalTime(timezone));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!time) return <span className={className}>--:--</span>;

  return <span className={className}>{time}</span>;
}
