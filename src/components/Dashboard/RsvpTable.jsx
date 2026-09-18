import React, { useState } from "react";
import { Check, Link as LinkIcon, Share2, Plus, Copy } from "lucide-react";
import { db, collection, addDoc } from "../../firebase/config";

export default function RsvpTable({
  rsvps,
  onCheckIn,
  onEdit,
  onDelete,
  formatDate,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [customGuestName, setCustomGuestName] = useState("");
  const [customGuestType, setCustomGuestType] = useState("single");
  const [addingSaving, setAddingSaving] = useState(false);

  const rowsPerPage = 7;

  const filtered = rsvps.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.displayName?.toLowerCase().includes(search) ||
      item.name1?.toLowerCase().includes(search);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * rowsPerPage;
  const pageItems = filtered.slice(start, start + rowsPerPage);

  const fallbackCopyTextToClipboard = (text, guestName) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful && showToast) {
        showToast(`បានចម្លងតំណភ្ជាប់អញ្ជើញសម្រាប់ "${guestName}"!`, "success");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      if (showToast) showToast("មិនអាចចម្លង Link បានទេ (សូមចម្លងដោយដៃ)", "error");
    }
  };

  const copyGuestLink = (guestName, guestId = null) => {
    if (!guestName || !guestName.trim()) {
      if (showToast) showToast("សូមបញ្ចូលឈ្មោះភ្ញៀវជាមុនសិន!", "error");
      return false;
    }
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/?to=${encodeURIComponent(guestName.trim())}`;
    if (guestId) {
      url += `&id=${guestId}`;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          if (showToast)
            showToast(`បានចម្លងតំណភ្ជាប់អញ្ជើញសម្រាប់ "${guestName}"!`, "success");
        })
        .catch((err) => {
          console.error("Clipboard write error:", err);
          fallbackCopyTextToClipboard(url, guestName);
        });
    } else {
      fallbackCopyTextToClipboard(url, guestName);
    }
    return true;
  };

  const handleSaveAndCopyLink = async () => {
    const name = customGuestName.trim();
    if (!name) {
      if (showToast) showToast("សូមបញ្ចូលឈ្មោះភ្ញៀវជាមុនសិន!", "error");
      return;
    }

    setAddingSaving(true);
    try {
      const guestData = {
        displayName: name,
        name1: name,
        type: customGuestType,
        status: "attending",
        guestCount: customGuestType === "couple" ? 2 : 1,
        tableEstimate: 1,
        timestamp: new Date(),
      };

      const docRef = await addDoc(collection(db, "rsvps"), guestData);
      copyGuestLink(name, docRef.id);
      setCustomGuestName("");
    } catch (err) {
      console.error("Error saving guest:", err);
      const errMsg = err?.message || "";
      if (errMsg.includes("permission-denied")) {
        if (showToast) showToast("បរាជ័យ: ខ្វះសិទ្ធិ (Firebase Security Rules block read/write)", "error");
      } else {
        if (showToast) showToast(`មានបញ្ហាក្នុងការរក្សាទុក: ${err.message}`, "error");
      }
    } finally {
      setAddingSaving(false);
    }
  };

  return (
    <article className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      {/* Personalized Invitation Link Generator */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/5 border border-amber-500/20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Share2 className="w-5 h-5" /> បង្កើត និងចម្លងតំណភ្ជាប់អញ្ជើញភ្ញៀវ (Personalized Guest Link Generator)
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
          បញ្ចូលឈ្មោះភ្ញៀវ រួចចុចចម្លង Link ផ្ញើទៅភ្ញៀវតាម Telegram ឬ Facebook Messenger។ ភ្ញៀវចុចលើ Link នឹងចូលដល់ប័ណ្ណអញ្ជើញដែលមានឈ្មោះភ្ញៀវភ្លាមៗ!
        </p>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="បញ្ចូលឈ្មោះភ្ញៀវ (ឧ. លោក សុខ ពិជ័យ)"
            value={customGuestName}
            onChange={(e) => setCustomGuestName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            value={customGuestType}
            onChange={(e) => setCustomGuestType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="single">Single (ភ្ញៀវទោល)</option>
            <option value="couple">Couple (ភ្ញៀវគូ)</option>
          </select>

          <button
            onClick={() => {
              if (copyGuestLink(customGuestName)) {
                setCustomGuestName("");
              }
            }}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Copy className="w-4 h-4" /> ចម្លង Link ភ្លាមៗ
          </button>

          <button
            onClick={handleSaveAndCopyLink}
            disabled={addingSaving}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> រក្សាទុក & ចម្លង Link
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Guest management
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            Live RSVP list
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search guest name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All guests</option>
            <option value="couple">Couple</option>
            <option value="single">Single</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Guest</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No RSVP records are available yet.
                </td>
              </tr>
            ) : (
              pageItems.map((item) => {
                const isDeclined = item.status === "declined";
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                        {item.displayName || "Guest"}
                        {isDeclined ? (
                          <span className="rounded-full px-2.5 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-100 ml-2">
                            Declined
                          </span>
                        ) : (
                          <span className="rounded-full px-2.5 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100 ml-2">
                            Attending
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                        {item.name2
                          ? `${item.name1} & ${item.name2}`
                          : item.name1 || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          item.type === "couple"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-100"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-100"
                        }`}
                      >
                        {item.type === "couple" ? "Couple" : "Single"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          copyGuestLink(item.displayName || item.name1, item.id)
                        }
                        title="Copy direct invitation link for this guest"
                        className="mr-2 rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
                      >
                        <LinkIcon className="w-3 h-3 inline mr-1" />
                        Copy Link
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="mr-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`rounded-xl border px-3 py-1.5 text-sm ${
                p === page
                  ? "border-amber-400 bg-amber-500 text-white"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
