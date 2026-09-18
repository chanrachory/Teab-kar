import React, { useState, useEffect } from "react";
import { uploadImage, getImageUrl } from "../../services/cloudinary";
import { db, doc, setDoc } from "../../firebase/config";
import { Upload, Image as ImageIcon } from "lucide-react";

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

  // Cloudinary image IDs / URLs
  const [groomImageId, setGroomImageId] = useState("");
  const [brideImageId, setBrideImageId] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [uploadingGroom, setUploadingGroom] = useState(false);
  const [uploadingBride, setUploadingBride] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
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
      setCoverImageUrl(weddingDetails.coverImageUrl || "");
    }
  }, [weddingDetails]);

  const handleUploadGroomImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingGroom(true);
    try {
      const res = await uploadImage(file);
      setGroomImageId(res.public_id);
      showToast("Uploaded groom image to Cloudinary!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload groom image", "error");
    } finally {
      setUploadingGroom(false);
    }
  };

  const handleUploadBrideImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBride(true);
    try {
      const res = await uploadImage(file);
      setBrideImageId(res.public_id);
      showToast("Uploaded bride image to Cloudinary!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload bride image", "error");
    } finally {
      setUploadingBride(false);
    }
  };

  const handleUploadCoverImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadImage(file);
      setCoverImageUrl(res.secure_url || res.public_id);
      showToast("Uploaded cover image to Cloudinary!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload cover image", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
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
          groomImageId,
          brideImageId,
          coverImageUrl,
        },
        { merge: true }
      );
      showToast("រក្សាទុកព័ត៌មានបានជោគជ័យ!", "success");
    } catch (err) {
      console.error(err);
      showToast("មានបញ្ហាក្នុងការរក្សាទុក", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
        Wedding details
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
        Editor
      </h2>
      <form onSubmit={handleSaveDetails} className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ឈ្មោះកូនកំលោះ
            </label>
            <input
              type="text"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ឈ្មោះកូនក្រមុំ
            </label>
            <input
              type="text"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              រូបកូនកំលោះ
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadGroomImage}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 text-sm"
            />
            {uploadingGroom && (
              <p className="text-xs text-amber-500 mt-1">Uploading...</p>
            )}
            {groomImageId && (
              <img
                src={getImageUrl(groomImageId, { width: 300, height: 300, crop: "fill" })}
                alt="Groom Preview"
                className="mt-2 h-28 w-28 object-cover rounded-xl border border-slate-200"
              />
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              រូបកូនក្រមុំ
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadBrideImage}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 text-sm"
            />
            {uploadingBride && (
              <p className="text-xs text-amber-500 mt-1">Uploading...</p>
            )}
            {brideImageId && (
              <img
                src={getImageUrl(brideImageId, { width: 300, height: 300, crop: "fill" })}
                alt="Bride Preview"
                className="mt-2 h-28 w-28 object-cover rounded-xl border border-slate-200"
              />
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ព័ត៌មានកូនកំលោះ (Detail)
            </label>
            <textarea
              rows="3"
              value={groomStory}
              onChange={(e) => setGroomStory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            ></textarea>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ព័ត៌មានកូនក្រមុំ (Detail)
            </label>
            <textarea
              rows="3"
              value={brideStory}
              onChange={(e) => setBrideStory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            ></textarea>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">កាលបរិច្ឆេទ</label>
          <input
            type="text"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">ទីតាំង</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ម៉ោងហែកូនកំលោះ
            </label>
            <input
              type="text"
              value={timeMorning}
              onChange={(e) => setTimeMorning(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ម៉ោងពិសាភោជនាហារ
            </label>
            <input
              type="text"
              value={timeEvening}
              onChange={(e) => setTimeEvening(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            តំណភ្ជាប់ផែនទី (Map URL)
          </label>
          <input
            type="url"
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            រូបភាព Cover
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-full sm:w-1/2">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCoverImage}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 text-sm"
              />
              {uploadingCover && (
                <p className="text-xs text-amber-500 mt-1">Uploading...</p>
              )}
            </div>
            <div className="w-full sm:w-1/2">
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover Preview"
                  className="h-32 w-full object-cover rounded-2xl border border-slate-200"
                />
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកព័ត៌មាន"}
        </button>
      </form>
    </article>
  );
}
