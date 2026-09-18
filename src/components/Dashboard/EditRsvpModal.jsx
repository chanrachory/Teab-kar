import React, { useState, useEffect } from "react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Edit RSVP
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="single">Single</option>
            <option value="couple">Couple</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
