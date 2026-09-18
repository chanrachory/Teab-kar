import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Flower2,
  Sparkles,
  Heart,
  Gift,
  Music,
  Sun,
  Moon,
  Utensils,
  Users,
  GlassWater,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import * as Icons from "lucide-react";
import {
  db,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "../../firebase/config";

const PRESET_CEREMONIES = [
  {
    title: "ពិធីក្រុងពាលី",
    time: "ម៉ោង ០៧:០០ ព្រឹក",
    desc: "ពិធីរៀបចំសែនព្រេនសុំសេចក្តីសុខសេចក្តីចម្រើនពីម្ចាស់ទឹកម្ចាស់ដី។",
    icon: "Flower2",
  },
  {
    title: "ពិធីហែជំនូន (ពិសាស្លាដក់)",
    time: "ម៉ោង ០៨:០០ ព្រឹក",
    desc: "ពិធីហែជំនូនផ្លែឈើ និងគ្រឿងអំណោយសិរីមង្គលចូលគេហដ្ឋានកូនក្រមុំ។",
    icon: "Gift",
  },
  {
    title: "ពិធីកាត់សក់បង្កក់សិរី",
    time: "ម៉ោង 10:00 ព្រឹក",
    desc: "ពិធីកាត់សក់ជម្រះរឿងមិនល្អ និងជ័យមង្គលជូនកូនប្រុសកូនស្រី។",
    icon: "Sparkles",
  },
  {
    title: "ពិធីផ្ទឹម & ចងដៃសុំពរជ័យ",
    time: "ម៉ោង ០៤:០០ រសៀល",
    desc: "ពិធីសែនព្រេនបុព្វបុរស ចងដៃអបអរសាទរ និងសុំពរជ័យពីចាស់ទុំ។",
    icon: "Heart",
  },
  {
    title: "ពិធីពិសាភោជនីយអាហារ",
    time: "ម៉ោង ០៥:០០ រសៀល",
    desc: "ពិធីទទួលភ្ញៀវកិត្តិយសពិសាអាហារសិរីមង្គល និងពិសារភេសជ្ជៈ។",
    icon: "Utensils",
  },
];

const PRESET_ICONS = [
  { name: "Flower2", label: "ផ្កា" },
  { name: "Sparkles", label: "ពន្លឺសិរី" },
  { name: "Heart", label: "បេះដូង" },
  { name: "Gift", label: "ជំនូន" },
  { name: "Utensils", label: "អាហារ" },
  { name: "Music", label: "តន្ត្រី" },
  { name: "Sun", label: "ព្រឹក" },
  { name: "Moon", label: "យប់" },
  { name: "GlassWater", label: "ភេសជ្ជៈ" },
  { name: "Users", label: "ភ្ញៀវ" },
  { name: "Calendar", label: "ប្រតិទិន" },
];

export default function TimelineEditor({ events, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("Flower2");
  const [loading, setLoading] = useState(false);

  const renderIcon = (iconName) => {
    let name = iconName || "Flower2";
    if (name.includes("-")) {
      name = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    }

    const IconComponent = Icons[name] || Icons.Flower2;
    return <IconComponent className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setTime("");
    setDesc("");
    setIcon("Flower2");
    setModalOpen(true);
  };

  const openEditModal = (eventItem) => {
    setEditingId(eventItem.id);
    setTitle(eventItem.title || "");
    setTime(eventItem.time || "");
    setDesc(eventItem.desc || eventItem.description || "");
    setIcon(eventItem.icon || "Flower2");
    setModalOpen(true);
  };

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setTime(preset.time);
    setDesc(preset.desc);
    setIcon(preset.icon);
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
      icon: icon.trim() || "Flower2",
      order: editingId ? events.find((e) => e.id === editingId)?.order || 0 : events.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), data);
        if (showToast) showToast("កម្មវិធីបានកែប្រែដោយជោគជ័យ", "success");
      } else {
        await addDoc(collection(db, "events"), data);
        if (showToast) showToast("កម្មវិធីបានបន្ថែមដោយជោគជ័យ", "success");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("មិនអាចរក្សាទុកកម្មវិធីបានទេ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកប្រាកដជាចង់លុបកម្មវិធីនេះមែនទេ?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      if (showToast) showToast("កម្មវិធីបានលុបដោយជោគជ័យ", "success");
    } catch (err) {
      console.error(err);
      if (showToast) showToast("មិនអាចលុបកម្មវិធីបានទេ", "error");
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const currentEvent = events[index];
    const targetEvent = events[targetIndex];

    try {
      await updateDoc(doc(db, "events", currentEvent.id), {
        order: targetIndex,
      });
      await updateDoc(doc(db, "events", targetEvent.id), {
        order: index,
      });
      if (showToast) showToast("បានផ្លាស់ប្តូរលំដាប់កម្មវិធី!", "success");
    } catch (err) {
      console.error(err);
      if (showToast) showToast("មិនអាចផ្លាស់ប្តូរលំដាប់បានទេ", "error");
    }
  };

  return (
    <article className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:col-span-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 font-semibold">
            Timeline Management
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" /> កម្មវិធីតាមប្រពៃណី (Traditional Ceremony Schedule)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            គ្រប់គ្រងកាលវិភាគពេលវេលានៃពិធីអាពាហ៍ពិពាហ៍តាមប្រពៃណីខ្មែរសម្រាប់បង្ហាញលើធៀបការ
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> បន្ថែមកម្មវិធីថ្មី
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">មិនទាន់មានកម្មវិធីនៅឡើយទេ</p>
            <p className="text-xs text-slate-400 mt-1">ចុចប៊ូតុង "បន្ថែមកម្មវិធីថ្មី" ដើម្បីចាប់ផ្តើមរៀបចំ</p>
          </div>
        ) : (
          events.map((ev, idx) => (
            <div
              key={ev.id}
              className="p-5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-amber-500/5 dark:from-slate-900 dark:via-slate-900 dark:to-amber-500/10 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                      {renderIcon(ev.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {ev.title}
                      </h3>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" /> {ev.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveOrder(idx, -1)}
                      disabled={idx === 0}
                      title="ឡើងលើ"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveOrder(idx, 1)}
                      disabled={idx === events.length - 1}
                      title="ចុះក្រោម"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md ml-1">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                  {ev.desc || ev.description}
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(ev)}
                  className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 transition"
                >
                  កែប្រែ
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20 transition"
                >
                  លុប
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Adding / Editing Event */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  {editingId ? "កែប្រែកម្មវិធីប្រពៃណី" : "បន្ថែមកម្មវិធីប្រពៃណីថ្មី"}
                </h3>
                <button
                  onClick={closeModal}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Presets Bar */}
              {!editingId && (
                <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                    ✨ ជ្រើសរើសគំរូកម្មវិធីប្រពៃណីលឿនៗ (Quick Presets)៖
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CEREMONIES.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-500 hover:text-white transition font-medium"
                      >
                        + {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ឈ្មោះកម្មវិធី *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ពិធីក្រុងពាលី"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ម៉ោង / ពេលវេលា *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ម៉ោង ០៧:០០ ព្រឹក"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ការពិពណ៌នា / ព័ត៌មានលម្អិត *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="ឧ. ជួបជុំសាច់ញាតិ ដើម្បីសុំសេចក្តីសុខសេចក្តីចម្រើន..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  ></textarea>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ជ្រើសរើសរូបតំណាង (Icon)
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                    {PRESET_ICONS.map((ic) => {
                      const isSelected = icon === ic.name;
                      return (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setIcon(ic.name)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                              : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {renderIcon(ic.name)}
                          <span className="text-[10px]">{ic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុកកម្មវិធី"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}
