import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import * as Icons from "lucide-react";
import {
  db,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "../../firebase/config";

export default function TimelineEditor({ events, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("flower-2");
  const [loading, setLoading] = useState(false);

  const renderIcon = (iconName) => {
    const pascalName = iconName
      ? iconName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")
      : "Flower2";

    const IconComponent = Icons[pascalName] || Icons[iconName] || Icons.Flower2;
    return <IconComponent className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setTime("");
    setDesc("");
    setIcon("flower-2");
    setModalOpen(true);
  };

  const openEditModal = (eventItem) => {
    setEditingId(eventItem.id);
    setTitle(eventItem.title || "");
    setTime(eventItem.time || "");
    setDesc(eventItem.desc || eventItem.description || "");
    setIcon(eventItem.icon || "flower-2");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title: title.trim(),
      time: time.trim(),
      desc: desc.trim(),
      description: desc.trim(),
      icon: icon.trim() || "flower-2",
      order: events.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), data);
        showToast("កម្មវិធីបានកែប្រែដោយជោគជ័យ", "success");
      } else {
        await addDoc(collection(db, "events"), data);
        showToast("កម្មវិធីបានបន្ថែមដោយជោគជ័យ", "success");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      showToast("មិនអាចរក្សាទុកកម្មវិធីបានទេ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបកម្មវិធីនេះ?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      showToast("កម្មវិធីបានលុបដោយជោគជ័យ", "success");
    } catch (err) {
      console.error(err);
      showToast("មិនអាចលុបកម្មវិធីបានទេ", "error");
    }
  };

  return (
    <article className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:col-span-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Timeline Management
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            កម្មវិធីតាមប្រពៃណី
          </h2>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> បន្ថែមកម្មវិធី
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-8">
            មិនមានកម្មវិធីទេ
          </div>
        ) : (
          events.map((ev, idx) => (
            <div
              key={ev.id}
              className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                    {renderIcon(ev.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {ev.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {ev.time}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                  #{idx + 1}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                {ev.desc || ev.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(ev)}
                  className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition"
                >
                  កែប្រែ
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 transition"
                >
                  លុប
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Adding / Editing Event */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingId ? "កែប្រែកម្មវិធី" : "បន្ថែមកម្មវិធី"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  ឈ្មោះកម្មវិធី
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ពិធីក្រុងពាលី"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  ម៉ោង
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ម៉ោង ២:០០ រសៀល"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  ការពិពណ៌នា
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="ឧ. ជួបជុំសាច់ញាតិ ដើម្បីសុំសេចក្តីសុខសេចក្តីចម្រើន។"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                ></textarea>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Icon (Lucide Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. flower-2, sparkles, gift"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
