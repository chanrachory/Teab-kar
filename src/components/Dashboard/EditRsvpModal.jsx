import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function EditRsvpModal({ item, onClose, onSave }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("single");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.displayName || "");
      setType(item.type || "single");
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(item.id, {
        displayName: name.trim(),
        name1: name.trim(),
        type,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Edit RSVP
          </h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Guest Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="single">Single</option>
              <option value="couple">Couple</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50 text-sm shadow-md"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
