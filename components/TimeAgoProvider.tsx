"use client";

import { ReactNode, useEffect } from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

let isInitialized = false;

export default function TimeAgoProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isInitialized) {
      TimeAgo.addDefaultLocale(en);
      isInitialized = true;
    }
  }, []);

  return <>{children}</>;
}