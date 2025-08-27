"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { DJANGO_BASE_URL } from "../api/api";

type AutosaveOptions = {
  token?: string | null;
  isTokenValid?: () => boolean;
  enabled?: boolean;
  intervalMs?: number;
  /** If true, send immediately on mount; if false, wait for first interval */
  leading?: boolean;
};

export function useDraftAutosave<T extends object>(
  data: T,
  options: AutosaveOptions
) {
  const { token, isTokenValid, enabled = true, intervalMs = 30000, leading = false } = options;
  const latestDataRef = useRef<T>(data);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Either fire immediately (leading) or wait for the first interval
    if (leading) {
      sendPatch();
      timerRef.current = setInterval(sendPatch, intervalMs);
    } else {
      timeoutRef.current = setTimeout(() => {
        sendPatch();
        timerRef.current = setInterval(sendPatch, intervalMs);
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, isTokenValid, enabled, intervalMs, leading]);
}

/**
 * Delete a draft by its ID
 * @param draftId - The ID of the draft to delete
 * @param token - Authentication token
 * @returns Promise that resolves when the draft is deleted
 */
export async function deleteDraft(draftId: string | number, token: string): Promise<void> {
  try {
    await axios.delete(`${DJANGO_BASE_URL}/drafts/${draftId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting draft:", error);
    throw error;
  }
}


