import React, { useState } from "react";
import { Heart } from "lucide-react";
import { db, collection, addDoc, query, where, getDocs } from "../../firebase/config";

export default function InitialOverlay({ onComplete, showToast, startMusic }) {
  const [selectionType, setSelectionType] = useState("");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [singleName, setSingleName] = useState("");
  const [declineName, setDeclineName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [tableEstimate, setTableEstimate] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSelectType = (type) => {
    setSelectionType(type);
    if (type === "couple") setGuestCount(2);
    else setGuestCount(1);
    startMusic();
  };

  const resetSelection = () => {
    setSelectionType("");
  };

  const alreadySubmitted = (name) => {
    const cacheKey = "wedding-rsvp-submitted";
    const existing = JSON.parse(localStorage.getItem(cacheKey) || "[]");
    const normalized = name.toLowerCase().trim();
    if (existing.includes(normalized)) {
      return true;
    }
    existing.push(normalized);
    localStorage.setItem(cacheKey, JSON.stringify(existing.slice(-20)));
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    let finalName = "";
    let guestData = { timestamp: new Date() };

    if (selectionType === "couple") {
      const n1 = name1.trim();
      const n2 = name2.trim();
      if (!n1 || !n2) {
        return showToast("សូមបំពេញឈ្មោះទាំងពីរ!", "error");
      }
      finalName = `${n1} & ${n2}`;
      guestData.type = "couple";
      guestData.name1 = n1;
      guestData.name2 = n2;
      guestData.displayName = finalName;
      guestData.guestCount = Math.max(1, Number(guestCount));
      guestData.tableEstimate = Math.max(1, Number(tableEstimate));
      guestData.status = "attending";
    } else if (selectionType === "single") {
      const n = singleName.trim();
      if (!n) {
        return showToast("សូមបញ្ចូលឈ្មោះរបស់អ្នក!", "error");
      }
      finalName = n;
      guestData.type = "single";
      guestData.name1 = n;
      guestData.displayName = finalName;
      guestData.guestCount = Math.max(1, Number(guestCount));
      guestData.tableEstimate = Math.max(1, Number(tableEstimate));
      guestData.status = "attending";
    } else if (selectionType === "decline") {
      const n = declineName.trim();
      if (!n) {
        return showToast("សូមបញ្ចូលឈ្មោះរបស់អ្នក!", "error");
      }
      finalName = n;
      guestData.type = "single";
      guestData.name1 = n;
      guestData.displayName = finalName;
      guestData.guestCount = Math.max(1, Number(guestCount));
      guestData.tableEstimate = Math.max(1, Number(tableEstimate));
      guestData.status = "declined";
    }

    if (alreadySubmitted(finalName)) {
      return showToast("អ្នកបានបញ្ជាក់រួចហើយ!", "error");
    }

    setLoading(true);

    try {
      // Server-side duplicate check
      const q = query(
        collection(db, "rsvps"),
        where("displayName", "==", finalName)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        localStorage.setItem("guestName", finalName);
        localStorage.setItem("guestSaved", "true");
        showToast("ឈ្មោះនេះបានបញ្ជាក់រួចហើយ — កំពុងបើកអញ្ជើញ", "success");
        onComplete(finalName, querySnapshot.docs[0].id);
        return;
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, "rsvps"), guestData);
      localStorage.setItem("guestName", finalName);
      localStorage.setItem("guestSaved", "true");

      let qrId = null;
      if (selectionType === "decline") {
        showToast("អរគុណសម្រាប់ការបញ្ជាក់! 🙏", "success");
      } else {
        qrId = docRef.id;
      }

      onComplete(finalName, qrId);
    } catch (error) {
      console.error("Error adding RSVP: ", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុក។ សូមព្យាយាមម្តងទៀត!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="initial-overlay" className="hero-bg px-4">
      <div className="max-w-md w-full glass-box p-8 sm:p-10 rounded-[2.5rem] text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white/10 rounded-full">
            <Heart className="text-pink-500 fill-pink-500 animate-pulse w-8 h-8" />
          </div>
        </div>

        <h3 className="font-moul sm:text-2xl gold-text mb-4">
          សូមស្វាគមន៍មកកាន់សិរីសួស្តី
        </h3>
        <p className="mb-8 text-gray-200 text-sm sm:text-base">
          សូមបញ្ជាក់ស្ថានភាពអ្នកពេលនេះ😒
        </p>

        {!selectionType && (
          <div className="space-y-4">
            <button
              onClick={() => handleSelectType("single")}
              className="w-full py-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 font-semibold text-white"
            >
              Single (គ្មានអ្នកយក😏)
            </button>

            <button
              onClick={() => handleSelectType("couple")}
              className="w-full py-4 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30 hover:bg-amber-600/30 transition-all duration-300 font-semibold"
            >
              មកជាមួយដៃគូរ😎
            </button>

            <button
              onClick={() => handleSelectType("decline")}
              className="w-full py-4 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/30 hover:bg-red-600/30 transition-all duration-300 font-semibold"
            >
              មិនអាចចូលរួមបានទេ 🙏
            </button>

            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  startMusic();
                  onComplete("ភ្ញៀវកិត្តិយស", null);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-amber-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                💌 បើកមើលធៀបការ (View Invitation)
              </button>
            </div>
          </div>
        )}

        {/* Form for Couple */}
        {selectionType === "couple" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 fade-in">
            <input
              type="text"
              placeholder="ឈ្មោះរបស់អ្នក"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
            <input
              type="text"
              placeholder="ឈ្មោះដៃគូ"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
            <label className="block text-left text-gray-300 text-xs mt-2 mb-1">
              ចំនួនភ្ញៀវ
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors mb-2"
            />
            <label className="block text-left text-gray-300 text-xs mb-1">
              លេខតុ
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={tableEstimate}
              onChange={(e) => setTableEstimate(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors mb-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-600 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "កំពុងរក្សាទុក..." : "រួចរាល់"}
            </button>
            <button
              type="button"
              onClick={resetSelection}
              className="text-sm text-gray-400 underline block w-full"
            >
              ត្រឡប់ក្រោយ
            </button>
          </form>
        )}

        {/* Form for Single */}
        {selectionType === "single" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 fade-in">
            <input
              type="text"
              placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
            <label className="block text-left text-gray-300 text-xs mt-2 mb-1">
              ចំនួនភ្ញៀវ
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors mb-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-600 rounded-xl font-bold hover:bg-amber-700 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "កំពុងរក្សាទុក..." : "រួចរាល់"}
            </button>
            <button
              type="button"
              onClick={resetSelection}
              className="text-sm text-gray-400 underline block w-full"
            >
              ត្រឡប់ក្រោយ
            </button>
          </form>
        )}

        {/* Form for Decline */}
        {selectionType === "decline" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 fade-in">
            <p className="text-sm text-gray-300">
              យើងខ្ញុំពិតជាសោកស្តាយ ដែលលោកអ្នកមិនអាចចូលរួមបាន។
            </p>
            <input
              type="text"
              placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
              value={declineName}
              onChange={(e) => setDeclineName(e.target.value)}
              className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-red-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "កំពុងរក្សាទុក..." : "បញ្ជាក់"}
            </button>
            <button
              type="button"
              onClick={resetSelection}
              className="text-sm text-gray-400 underline block w-full"
            >
              ត្រឡប់ក្រោយ
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
