import React, { useState, useEffect } from "react";
import { uploadImage, getImageUrl } from "../../services/cloudinary";
import { db, doc, setDoc } from "../../firebase/config";
import {
  Upload,
  Image as ImageIcon,
  Heart,
  Calendar,
  MapPin,
  Clock,
  User,
  Link2,
  CheckCircle2,
  Loader2,
  Trash2,
  Star,
  Plus,
  Camera,
  Sparkles,
} from "lucide-react";

export default function DetailsEditor({ weddingDetails, showToast }) {
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomStory, setGroomStory] = useState("");
  const [brideStory, setBrideStory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [timeMorning, setTimeMorning] = useState("");
  const [timeEvening, setTimeEvening] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  // Existing Cloudinary image IDs / URLs from Firestore
  const [groomImageId, setGroomImageId] = useState("");
  const [brideImageId, setBrideImageId] = useState("");

  // Pending files selected by user (deferred upload)
  const [groomFile, setGroomFile] = useState(null);
  const [groomFilePreview, setGroomFilePreview] = useState("");
  const [brideFile, setBrideFile] = useState(null);
  const [brideFilePreview, setBrideFilePreview] = useState("");

  // Cover images list: array of { id, type: 'existing' | 'new', url, file? }
  const [coverItems, setCoverItems] = useState([]);
  const [mainCoverId, setMainCoverId] = useState("");

  // Pre-Wedding gallery items
  const [preweddingItems, setPreweddingItems] = useState([]);

  // Ceremony gallery items
  const [ceremonyItems, setCeremonyItems] = useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (weddingDetails) {
      setGroomName(weddingDetails.groomName || "");
      setBrideName(weddingDetails.brideName || "");
      setGroomStory(weddingDetails.groomStory || "");
      setBrideStory(weddingDetails.brideStory || "");
      setEventDate(weddingDetails.eventDate || "");
      setLocation(weddingDetails.location || "");
      setTimeMorning(weddingDetails.timeMorning || "");
      setTimeEvening(weddingDetails.timeEvening || "");
      setMapUrl(weddingDetails.mapUrl || "");
      setGroomImageId(weddingDetails.groomImageId || "");
      setBrideImageId(weddingDetails.brideImageId || "");

      // 1. Cover Images
      const rawCovers = Array.isArray(weddingDetails.coverImages)
        ? weddingDetails.coverImages
        : weddingDetails.coverImageUrl
        ? [weddingDetails.coverImageUrl]
        : [];
      const initialCovers = rawCovers.map((url, idx) => ({
        id: `existing_cov_${idx}_${url}`,
        type: "existing",
        url,
      }));
      setCoverItems(initialCovers);
      const mainUrl = weddingDetails.coverImageUrl || rawCovers[0] || "";
      const foundMain = initialCovers.find((item) => item.url === mainUrl);
      setMainCoverId(foundMain ? foundMain.id : initialCovers[0]?.id || "");

      // 2. Pre-Wedding Gallery Images
      const rawPre = Array.isArray(weddingDetails.preweddingImages)
        ? weddingDetails.preweddingImages
        : [];
      setPreweddingItems(
        rawPre.map((url, idx) => ({
          id: `existing_pre_${idx}_${url}`,
          type: "existing",
          url,
        }))
      );

      // 3. Ceremony Gallery Images
      const rawCer = Array.isArray(weddingDetails.ceremonyImages)
        ? weddingDetails.ceremonyImages
        : [];
      setCeremonyItems(
        rawCer.map((url, idx) => ({
          id: `existing_cer_${idx}_${url}`,
          type: "existing",
          url,
        }))
      );
    }
  }, [weddingDetails]);

  // Handle local selection for Groom Image
  const handleSelectGroomImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGroomFile(file);
    setGroomFilePreview(URL.createObjectURL(file));
    if (showToast) showToast("បានជ្រើសរើសរូបភាពកូនកំលោះ! (សូមចុចរក្សាទុកដើម្បី Upload)", "info");
  };

  // Handle local selection for Bride Image
  const handleSelectBrideImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBrideFile(file);
    setBrideFilePreview(URL.createObjectURL(file));
    if (showToast) showToast("បានជ្រើសរើសរូបភាពកូនក្រមុំ! (សូមចុចរក្សាទុកដើម្បី Upload)", "info");
  };

  // Handle local selection for Cover Images
  const handleSelectCoverImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems = files.map((file, idx) => ({
      id: `new_cov_${Date.now()}_${idx}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));
    setCoverItems((prev) => {
      const updated = [...prev, ...newItems];
      if (!mainCoverId && updated.length > 0) {
        setMainCoverId(updated[0].id);
      }
      return updated;
    });
    if (showToast)
      showToast(
        `បានជ្រើសរើសរូបភាព Cover ចំនួន ${files.length} សន្លឹក!`,
        "info"
      );
  };

  // Handle local selection for Pre-Wedding Images
  const handleSelectPreweddingImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems = files.map((file, idx) => ({
      id: `new_pre_${Date.now()}_${idx}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));
    setPreweddingItems((prev) => [...prev, ...newItems]);
    if (showToast)
      showToast(
        `បានជ្រើសរើសរូបភាព Pre-Wedding ចំនួន ${files.length} សន្លឹក!`,
        "info"
      );
  };

  // Handle local selection for Ceremony Images
  const handleSelectCeremonyImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems = files.map((file, idx) => ({
      id: `new_cer_${Date.now()}_${idx}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));
    setCeremonyItems((prev) => [...prev, ...newItems]);
    if (showToast)
      showToast(
        `បានជ្រើសរើសរូបភាព Ceremony ចំនួន ${files.length} សន្លឹក!`,
        "info"
      );
  };

  // Remove items
  const handleRemoveCoverItem = (idToRemove) => {
    setCoverItems((prev) => {
      const updated = prev.filter((item) => item.id !== idToRemove);
      if (mainCoverId === idToRemove) {
        setMainCoverId(updated[0]?.id || "");
      }
      return updated;
    });
  };

  const handleRemovePreweddingItem = (idToRemove) => {
    setPreweddingItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleRemoveCeremonyItem = (idToRemove) => {
    setCeremonyItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleSetMainCover = (id) => {
    setMainCoverId(id);
    if (showToast) showToast("បានជ្រើសរើសជារូបភាព Cover ចម្បង!", "info");
  };

  const resolveUrl = (img) => {
    if (!img) return "";
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("data:") ||
      img.startsWith("blob:")
    ) {
      return img;
    }
    return getImageUrl(img);
  };

  // Batch Upload to Cloudinary & Save to Firestore on Save Button Click
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalGroomImageId = groomImageId;
      let finalBrideImageId = brideImageId;

      // 1. Upload Groom image
      if (groomFile) {
        const resGroom = await uploadImage(groomFile);
        finalGroomImageId = resGroom.public_id;
        setGroomImageId(finalGroomImageId);
        setGroomFile(null);
        setGroomFilePreview("");
      }

      // 2. Upload Bride image
      if (brideFile) {
        const resBride = await uploadImage(brideFile);
        finalBrideImageId = resBride.public_id;
        setBrideImageId(finalBrideImageId);
        setBrideFile(null);
        setBrideFilePreview("");
      }

      // 3. Upload Cover images
      const finalCoverUrls = [];
      let finalMainCoverUrl = "";
      for (const item of coverItems) {
        let urlToSave = item.url;
        if (item.type === "new" && item.file) {
          const res = await uploadImage(item.file);
          urlToSave = res.secure_url || res.public_id;
        }
        finalCoverUrls.push(urlToSave);
        if (item.id === mainCoverId) {
          finalMainCoverUrl = urlToSave;
        }
      }
      if (!finalMainCoverUrl && finalCoverUrls.length > 0) {
        finalMainCoverUrl = finalCoverUrls[0];
      }

      // 4. Upload Pre-Wedding images
      const finalPreweddingUrls = [];
      for (const item of preweddingItems) {
        let urlToSave = item.url;
        if (item.type === "new" && item.file) {
          const res = await uploadImage(item.file);
          urlToSave = res.secure_url || res.public_id;
        }
        finalPreweddingUrls.push(urlToSave);
      }

      // 5. Upload Ceremony images
      const finalCeremonyUrls = [];
      for (const item of ceremonyItems) {
        let urlToSave = item.url;
        if (item.type === "new" && item.file) {
          const res = await uploadImage(item.file);
          urlToSave = res.secure_url || res.public_id;
        }
        finalCeremonyUrls.push(urlToSave);
      }

      // 6. Save all to Firestore
      const docRef = doc(db, "wedding", "details");
      await setDoc(
        docRef,
        {
          groomName,
          brideName,
          groomStory,
          brideStory,
          eventDate,
          location,
          timeMorning,
          timeEvening,
          mapUrl,
          groomImageId: finalGroomImageId,
          brideImageId: finalBrideImageId,
          coverImageUrl: finalMainCoverUrl,
          coverUrl: finalMainCoverUrl,
          coverImages: finalCoverUrls,
          preweddingImages: finalPreweddingUrls,
          ceremonyImages: finalCeremonyUrls,
        },
        { merge: true }
      );

      // Re-normalize local state to 'existing'
      setCoverItems(
        finalCoverUrls.map((url, idx) => ({
          id: `existing_cov_${idx}_${url}`,
          type: "existing",
          url,
        }))
      );
      setPreweddingItems(
        finalPreweddingUrls.map((url, idx) => ({
          id: `existing_pre_${idx}_${url}`,
          type: "existing",
          url,
        }))
      );
      setCeremonyItems(
        finalCeremonyUrls.map((url, idx) => ({
          id: `existing_cer_${idx}_${url}`,
          type: "existing",
          url,
        }))
      );

      if (showToast)
        showToast(
          "បាន Upload រូបភាពទាំងអស់ និងរក្សាទុកព័ត៌មានមង្គលការដោយជោគជ័យ! 🎉",
          "success"
        );
    } catch (err) {
      console.error("Error saving details:", err);
      if (showToast)
        showToast(`មានបញ្ហាក្នុងការរក្សាទុក: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 font-semibold">
            Wedding Details & Media Management
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            ព័ត៌មាន & រូបភាពមង្គលការ (Wedding Info & Media)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            គ្រប់គ្រងរូបភាព Cover, Pre-Wedding, Ceremony និងព័ត៌មានពិធីការទាំងអស់
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveDetails} className="space-y-6">
        {/* SECTION 1: GROOM & BRIDE PROFILES */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Groom Profile Card */}
          <div className="rounded-3xl border border-amber-500/20 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  ព័ត៌មានកូនកំលោះ (Groom Profile)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  កូនកំលោះ
                </span>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  រូបភាពកូនកំលោះ
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {groomFilePreview ? (
                      <img
                        src={groomFilePreview}
                        alt="Groom Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : groomImageId ? (
                      <img
                        src={getImageUrl(groomImageId, {
                          width: 300,
                          height: 300,
                          crop: "fill",
                        })}
                        alt="Groom"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-semibold cursor-pointer transition border border-blue-200 dark:border-blue-500/30">
                      <Upload className="w-4 h-4" />
                      {groomFilePreview || groomImageId ? "ប្តូររូបភាពកូនកំលោះ" : "ជ្រើសរើសរូបភាព"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSelectGroomImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      {groomFile ? "✓ បានជ្រើសរើសរូបថ្មី (រង់ចាំ Save)" : "អនុញ្ញាត JPG, PNG, WEBP"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  ឈ្មោះកូនកំលោះ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ ពិជ័យ"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  ព័ត៌មានលម្អិតកូនកំលោះ (Detail / Bio)
                </label>
                <textarea
                  rows="3"
                  placeholder="ឧ. បញ្ចប់ការសិក្សាថ្នាក់បរិញ្ញាបត្រ..."
                  value={groomStory}
                  onChange={(e) => setGroomStory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Bride Profile Card */}
          <div className="rounded-3xl border border-amber-500/20 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-500" />
                  ព័ត៌មានកូនក្រមុំ (Bride Profile)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  កូនក្រមុំ
                </span>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  រូបភាពកូនក្រមុំ
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {brideFilePreview ? (
                      <img
                        src={brideFilePreview}
                        alt="Bride Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : brideImageId ? (
                      <img
                        src={getImageUrl(brideImageId, {
                          width: 300,
                          height: 300,
                          crop: "fill",
                        })}
                        alt="Bride"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-semibold cursor-pointer transition border border-rose-200 dark:border-rose-500/30">
                      <Upload className="w-4 h-4" />
                      {brideFilePreview || brideImageId ? "ប្តូររូបភាពកូនក្រមុំ" : "ជ្រើសរើសរូបភាព"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSelectBrideImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      {brideFile ? "✓ បានជ្រើសរើសរូបថ្មី (រង់ចាំ Save)" : "អនុញ្ញាត JPG, PNG, WEBP"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  ឈ្មោះកូនក្រមុំ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ឡេង ចាន់ថា"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  ព័ត៌មានលម្អិតកូនក្រមុំ (Detail / Bio)
                </label>
                <textarea
                  rows="3"
                  placeholder="ឧ. បញ្ចប់ការសិក្សាថ្នាក់បរិញ្ញាបត្រ..."
                  value={brideStory}
                  onChange={(e) => setBrideStory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: WEDDING LOCATION & TIME */}
        <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              កាលបរិច្ឆេទ ទីតាំង & ពេលវេលាពិធី (Event Location & Timing)
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                កាលបរិច្ឆេទពិធី *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. ថ្ងៃអាទិត្យ ទី១០ ខែមករា ឆ្នាំ២០២៦"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                ទីតាំងប្រារព្ធពិធី *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. ភូមិពោធិ៍រោង ឃុំជីផុច ស្រុកមេសាង ខេត្តព្រៃវែង"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                ម៉ោងហែកូនកំលោះ (ព្រឹក)
              </label>
              <input
                type="text"
                placeholder="ឧ. ៧:០០ ព្រឹក"
                value={timeMorning}
                onChange={(e) => setTimeMorning(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                ម៉ោងពិសាភោជនាហារ (ល្ងាច)
              </label>
              <input
                type="text"
                placeholder="ឧ. ៥:០០ រសៀល"
                value={timeEvening}
                onChange={(e) => setTimeEvening(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-emerald-500" />
              តំណភ្ជាប់ផែនទី (Google Maps Embed/Share URL)
            </label>
            <input
              type="url"
              placeholder="https://www.google.com/maps/embed?pb=..."
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono text-xs"
            />
          </div>
        </div>

        {/* SECTION 3: COVER BANNER IMAGES */}
        <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                ១. រូបភាព Cover Banner (Wedding Cover Banner)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                បង្ហាញនៅទំព័រដើមបង្អស់ និង Slideshow រំកិលរៀងរាល់ ៦ វិនាទីម្តង
              </p>
            </div>
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer transition shadow-md shrink-0">
              <Plus className="w-4 h-4" />
              ជ្រើសរើសរូបភាព Cover
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectCoverImages}
                className="hidden"
              />
            </label>
          </div>

          {coverItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              មិនទាន់មានរូបភាព Cover Banner នៅឡើយទេ
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {coverItems.map((item, idx) => {
                const isMain = mainCoverId === item.id || (idx === 0 && !mainCoverId);
                const isNew = item.type === "new";
                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-2xl overflow-hidden border-2 transition shadow-sm ${
                      isMain
                        ? "border-amber-500 ring-2 ring-amber-500/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-amber-400"
                    }`}
                  >
                    <img
                      src={resolveUrl(item.url)}
                      alt={`Cover Banner ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {isMain && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
                        <Star className="w-3 h-3 fill-white" /> រូបចម្បង
                      </span>
                    )}
                    {isNew && (
                      <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md z-10">
                        រូបថ្មី (រង់ចាំ Save)
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2 z-20">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMainCover(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-md"
                        >
                          <Star className="w-3 h-3" /> រូបចម្បង
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCoverItem(item.id)}
                        className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs transition shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: PRE-WEDDING GALLERY IMAGES */}
        <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                ២. រូបភាព Pre-Wedding (Pre-Wedding Gallery)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                បង្ហាញក្នុង Tab "Pre-Wedding" លើវិចិត្រសាលរូបភាពនៃធៀបការ
              </p>
            </div>
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer transition shadow-md shrink-0">
              <Plus className="w-4 h-4" />
              បន្ថែមរូប Pre-Wedding
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectPreweddingImages}
                className="hidden"
              />
            </label>
          </div>

          {preweddingItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              មិនទាន់មានរូបភាព Pre-Wedding នៅក្នុងបញ្ជីនៅឡើយទេ
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {preweddingItems.map((item, idx) => {
                const isNew = item.type === "new";
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition shadow-sm"
                  >
                    <img
                      src={resolveUrl(item.url)}
                      alt={`Pre-Wedding ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {isNew && (
                      <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md z-10">
                        រូបថ្មី (រង់ចាំ Save)
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 z-20">
                      <button
                        type="button"
                        onClick={() => handleRemovePreweddingItem(item.id)}
                        className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs transition shadow-md flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-4 h-4" /> ដករូបភាព
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 5: CEREMONY GALLERY IMAGES */}
        <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                ៣. រូបភាព Ceremony / ពិធីការ (Ceremony Gallery)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                បង្ហាញក្នុង Tab "Ceremony" លើវិចិត្រសាលរូបភាពនៃធៀបការ
              </p>
            </div>
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition shadow-md shrink-0">
              <Plus className="w-4 h-4" />
              បន្ថែមរូប Ceremony
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectCeremonyImages}
                className="hidden"
              />
            </label>
          </div>

          {ceremonyItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              មិនទាន់មានរូបភាព Ceremony នៅក្នុងបញ្ជីនៅឡើយទេ
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ceremonyItems.map((item, idx) => {
                const isNew = item.type === "new";
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition shadow-sm"
                  >
                    <img
                      src={resolveUrl(item.url)}
                      alt={`Ceremony ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {isNew && (
                      <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md z-10">
                        រូបថ្មី (រង់ចាំ Save)
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 z-20">
                      <button
                        type="button"
                        onClick={() => handleRemoveCeremonyItem(item.id)}
                        className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs transition shadow-md flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-4 h-4" /> ដករូបភាព
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAVE BUTTON BAR */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-6 py-4 font-bold text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition hover:scale-[1.005] active:scale-[0.995] disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុង Upload រូបភាពទាំងអស់ទៅ Cloudinary & រក្សាទុកទិន្នន័យ...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                រក្សាទុកព័ត៌មានមង្គលការទាំងអស់ (Save All Wedding Details)
              </>
            )}
          </button>
        </div>
      </form>
    </article>
  );
}
