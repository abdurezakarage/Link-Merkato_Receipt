"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { DJANGO_BASE_URL } from "../api/api";
import { deleteDraft } from "./draftAutosave";

type DraftsPanelProps<T> = {
  token?: string | null;
  onSelectDraft: (draft: T) => void;
  title?: string;
};

export default function DraftsPanel<T extends { draft_id?: string; receipt_number?: string; updated_at?: string; [k: string]: any }>(
  { token, onSelectDraft, title = "Saved Drafts" }: DraftsPanelProps<T>
) {
  const [drafts, setDrafts] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchDrafts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${DJANGO_BASE_URL}/drafts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const results = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
        setDrafts(results as T[]);
      } catch (e) {
        setError("Failed to load drafts");
      } finally {
        setLoading(false);
      }
    };
    fetchDrafts();
  }, [token]);

  const handleDeleteDraft = async (draftId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the draft selection
    if (!token) return;
    
    // console.log("Deleting draft with ID:", draftId); // Log the draft ID
    
    try {
      await deleteDraft(draftId, token);
      // Remove the deleted draft from the local state
      setDrafts(prevDrafts => prevDrafts.filter(draft => (draft as any).draft_id !== draftId));
      console.log("Successfully deleted draft with ID:", draftId); // Log successful deletion
    } catch (error) {
      console.error("Failed to delete draft with ID:", draftId, error); // Log error with draft ID
      // Optionally show an error message to the user
    }
  };

  return (
    <>
      {/* Only show the panel if there are drafts or if still loading */}
      {(drafts.length > 0 || loading) && (
        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg w-full max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            <button
              type="button"
              onClick={() => {
                if (!token) return;
                // refetch
                (async () => {
                  try {
                    setLoading(true);
                    const res = await axios.get(`${DJANGO_BASE_URL}/drafts`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const results = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
                    setDrafts(results as T[]);
                  } catch (e) {
                    setError("Failed to load drafts");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-gray-200 rounded text-blue-600"
            >
              Refresh
            </button>
          </div>
          {loading && <p className="text-xs text-gray-500">Loading drafts...</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {!loading && drafts.length === 0 && (
            <p className="text-xs text-gray-500">No drafts found.</p>
          )}
          <div className="flex flex-col gap-2 max-h-48 overflow-auto">
            {drafts.map((draft, idx) => (
              <div
                key={(draft as any).draft_id ?? idx}
                className="relative group"
              >
                <button
                  type="button"
                  onClick={() => onSelectDraft(draft)}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 pr-8"
                >
                  <div className="text-sm font-medium text-gray-800">{(draft as any).receipt_number || `Draft ${idx + 1}`}</div>
                  {/* <div className="text-[11px] text-gray-500">ID: {(draft as any).draft_id ?? '—'}</div>
                  {(draft as any)?.updated_at && (
                    <div className="text-[11px] text-gray-500">Updated: {new Date((draft as any).updated_at).toLocaleString()}</div>
                  )} */}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteDraft((draft as any).draft_id, e)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete draft"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}


