"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { DJANGO_BASE_URL } from "../api/api";

type AutosaveOptions = {
  token?: string | null;
  isTokenValid?: () => boolean;
  enabled?: boolean;
  intervalMs?: number;
};

export function useDraftAutosave<T extends object>(
  data: T,
  options: AutosaveOptions
) {
  const { token, isTokenValid, enabled = true, intervalMs = 15000 } = options;
  const latestDataRef = useRef<T>(data);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest data reference updated
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!enabled) return;

    const canAuth = Boolean(token && (!isTokenValid || isTokenValid()));
    if (!canAuth) return;

    const sendPatch = async () => {
      try {
        await axios.patch(
          `${DJANGO_BASE_URL}/drafts`,
          latestDataRef.current,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (err) {
        // Silent fail; drafts are best-effort
        // console.error("Autosave error", err);
      }
    };

    // Fire immediately on mount/change, then on interval
    sendPatch();
    timerRef.current = setInterval(sendPatch, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token, isTokenValid, enabled, intervalMs]);
}


