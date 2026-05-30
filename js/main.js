import {
  db,
  doc,
  onSnapshot,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "../firebase/firebase-config.js";
import {
  getImageUrl,
  preWeddingImages,
  ceremonyImages,
} from "../services/cloudinary.js";

// Global Icons
lucide.createIcons();

// --- TOAST NOTIFICATION ---
window.showToast = function (message, type = "info") {
  const container = document.getElementById("toast");
  if (!container) return;
  const toast = document.createElement("div");
  const bgClass =
    type === "error"
      ? "bg-red-600"
      : type === "success"
        ? "bg-emerald-600"
        : "bg-amber-600";
  toast.className = `px-4 py-3 rounded-xl shadow-lg text-white ${bgClass} transform transition-all duration-300 translate-y-4 opacity-0`;
  toast.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="${type === "error" ? "alert-circle" : type === "success" ? "check-circle" : "info"}" class="w-5 h-5"></i><span>${message}</span></div>`;
  container.appendChild(toast);
  lucide.createIcons();

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  });

  // Remove after 3s
  setTimeout(() => {
    toast.classList.add("translate-y-4", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// --- GALLERY & LIGHTBOX ---
let currentGalleryTab = "prewedding";
let galleryFromFirestore = [];

window.switchGalleryTab = function (tab) {
  currentGalleryTab = tab;
  document.getElementById("tab-prewedding").className =
    tab === "prewedding"
      ? "px-6 py-2 rounded-full border border-amber-500 bg-amber-500 text-white font-kantumruy transition-colors duration-300"
      : "px-6 py-2 rounded-full border border-amber-500 bg-transparent text-amber-600 font-kantumruy transition-colors duration-300 hover:bg-amber-50";
  document.getElementById("tab-ceremony").className =
    tab === "ceremony"
      ? "px-6 py-2 rounded-full border border-amber-500 bg-amber-500 text-white font-kantumruy transition-colors duration-300"
      : "px-6 py-2 rounded-full border border-amber-500 bg-transparent text-amber-600 font-kantumruy transition-colors duration-300 hover:bg-amber-50";
  loadGallery();
};

window.openLightbox = function (src) {
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  img.src = src;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  // Trigger animation
  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");
    img.classList.remove("scale-95");
  });
};

window.closeLightbox = function () {
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  modal.classList.add("opacity-0");
  img.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    img.src = "";
  }, 300);
};

function loadGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return;
  // Prefer gallery from Firestore when available
  let images = [];
  if (galleryFromFirestore && galleryFromFirestore.length) {
    images = galleryFromFirestore.filter(
      (g) => g.category === currentGalleryTab,
    );
  } else {
    images =
      currentGalleryTab === "prewedding"
        ? preWeddingImages.map((id) => ({
            url: getImageUrl(id, { width: 800, height: 800, crop: "fill" }),
          }))
        : ceremonyImages.map((id) => ({
            url: getImageUrl(id, { width: 800, height: 800, crop: "fill" }),
          }));
  }

  const galleryHTML = images
    .map((item) => {
      const imageUrl = item.url || item;
      return `
      <div onclick="openLightbox('${imageUrl}')" class="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-md group cursor-pointer relative">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10 flex items-center justify-center">
          <i data-lucide="zoom-in" class="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8"></i>
        </div>
        <img 
          src="${imageUrl}" 
          alt="Wedding Memory" 
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
      </div>
    `;
    })
    .join("");

  container.innerHTML = galleryHTML;
  lucide.createIcons();
}

// State
let selectionType = "";
const audio = document.getElementById("bgMusic");
const musicBtn = document.getElementById("music-control");
if (audio) audio.volume = 0.5;

let weddingDateStr = "2030-02-04T00:00:00"; // Fallback date
let countdownInterval;

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const weddingDate = new Date(weddingDateStr).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      document.getElementById("countdown-days").innerText = "00";
      document.getElementById("countdown-hours").innerText = "00";
      document.getElementById("countdown-minutes").innerText = "00";
      document.getElementById("countdown-seconds").innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown-days").innerText = days
      .toString()
      .padStart(2, "0");
    document.getElementById("countdown-hours").innerText = hours
      .toString()
      .padStart(2, "0");
    document.getElementById("countdown-minutes").innerText = minutes
      .toString()
      .padStart(2, "0");
    document.getElementById("countdown-seconds").innerText = seconds
      .toString()
      .padStart(2, "0");
  }, 1000);
}

window.shareTo = function (platform) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(
    "សូមគោរពអញ្ជើញចូលរួមពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ",
  );

  if (platform === "telegram") {
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  } else if (platform === "facebook") {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
  } else if (platform === "copy") {
    navigator.clipboard.writeText(window.location.href).then(() => {
      window.showToast("បានចម្លងតំណភ្ជាប់ជោគជ័យ!", "success");
    });
  }
};

window.startMusic = function () {
  if (!audio) return;
  audio
    .play()
    .then(() => {
      musicBtn.style.display = "flex";
      musicBtn.classList.add("music-playing");
    })
    .catch((e) => console.log("Waiting for user interaction..."));
};

window.selectType = function (type) {
  selectionType = type;
  window.startMusic();
  document.getElementById("type-selector").classList.add("hidden");
  if (type === "couple") {
    document.getElementById("input-fields").classList.remove("hidden");
  } else if (type === "single") {
    document.getElementById("single-confirm").classList.remove("hidden");
  } else if (type === "decline") {
    document.getElementById("decline-confirm").classList.remove("hidden");
  }
};

window.resetSelection = function () {
  document.getElementById("type-selector").classList.remove("hidden");
  document.getElementById("input-fields").classList.add("hidden");
  document.getElementById("single-confirm").classList.add("hidden");
  document.getElementById("decline-confirm").classList.add("hidden");
};

window.showMainContent = function (finalName, guestId = null) {
  document.getElementById("final-guest-name").innerText = finalName;

  if (guestId) {
    const qrContainer = document.getElementById("qr-code-container");
    qrContainer.classList.remove("hidden");
    const qrcodeDiv = document.getElementById("qrcode");
    qrcodeDiv.innerHTML = ""; // Clear existing
    new QRCode(qrcodeDiv, {
      text: guestId,
      width: 128,
      height: 128,
      colorDark: "#d4af37",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }

  document
    .getElementById("initial-overlay")
    .classList.add("opacity-0", "pointer-events-none");

  setTimeout(() => {
    document.getElementById("initial-overlay").style.display = "none";
    document.getElementById("main-content").classList.remove("hidden");
    window.scrollTo(0, 0);
  }, 800);
};

window.toggleMusic = function () {
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    musicBtn.classList.add("music-playing");
  } else {
    audio.pause();
    musicBtn.classList.remove("music-playing");
  }
};

function alreadySubmitted(name) {
  const cacheKey = "wedding-rsvp-submitted";
  const existing = JSON.parse(localStorage.getItem(cacheKey) || "[]");
  const normalized = name.toLowerCase().trim();
  if (existing.includes(normalized)) {
    return true;
  }
  existing.push(normalized);
  localStorage.setItem(cacheKey, JSON.stringify(existing.slice(-20)));
  return false;
}

window.generateCard = async function () {
  // Prevent duplicate submission from same browser session
  const savedFlag = localStorage.getItem("guestSaved");
  const storedName = localStorage.getItem("guestName");
  if (savedFlag === "true" && storedName) {
    // Already saved from this browser: open invitation directly
    window.showToast("សូមស្វាគមន៍វិញ — ទិន្នន័យរួចរាល់", "success");
    window.showMainContent(storedName);
    return;
  }
  let finalName = "";
  let type = selectionType;
  let guestData = { timestamp: new Date() };

  const btnCouple = document.getElementById("btn-couple-submit");
  const btnSingle = document.getElementById("btn-single-submit");
  const btnDecline = document.getElementById("btn-decline-submit");
  if (btnCouple) btnCouple.disabled = true;
  if (btnSingle) btnSingle.disabled = true;
  if (btnDecline) btnDecline.disabled = true;

  const guestCountInput = document.getElementById(`guest-count-${type}`);
  const tableInput = document.getElementById(`table-estimate-${type}`);
  const guestCount = Math.max(1, Number(guestCountInput?.value || 1));
  const tableEstimate = Math.max(
    1,
    Number(tableInput?.value || Math.ceil(guestCount / 10)),
  );

  if (type === "couple") {
    const n1 = document.getElementById("name1").value.trim();
    const n2 = document.getElementById("name2").value.trim();
    if (!n1 || !n2) {
      if (btnCouple) btnCouple.disabled = false;
      return window.showToast("សូមបំពេញឈ្មោះទាំងពីរ!", "error");
    }
    finalName = n1 + " & " + n2;
    guestData.type = "couple";
    guestData.name1 = n1;
    guestData.name2 = n2;
    guestData.displayName = finalName;
    guestData.guestCount = guestCount;
    guestData.tableEstimate = tableEstimate;
    guestData.status = "attending";
  } else if (type === "single") {
    const n = document.getElementById("single-name").value.trim();
    if (!n) {
      if (btnSingle) btnSingle.disabled = false;
      return window.showToast("សូមបញ្ចូលឈ្មោះរបស់អ្នក!", "error");
    }
    finalName = n;
    guestData.type = "single";
    guestData.name1 = n;
    guestData.displayName = finalName;
    guestData.guestCount = guestCount;
    guestData.tableEstimate = tableEstimate;
    guestData.status = "attending";
  } else if (type === "decline") {
    const n = document.getElementById("decline-name").value.trim();
    if (!n) {
      if (btnDecline) btnDecline.disabled = false;
      return window.showToast("សូមបញ្ចូលឈ្មោះរបស់អ្នក!", "error");
    }
    finalName = n;
    guestData.type = "single"; // Treat decline as single count, but status declined
    guestData.name1 = n;
    guestData.displayName = finalName;
    guestData.guestCount = guestCount;
    guestData.tableEstimate = tableEstimate;
    guestData.status = "declined";
  }

  if (alreadySubmitted(finalName)) {
    if (btnCouple) btnCouple.disabled = false;
    if (btnSingle) btnSingle.disabled = false;
    if (btnDecline) btnDecline.disabled = false;
    return window.showToast("អ្នកបានបញ្ជាក់រួចហើយ!", "error");
  }

  try {
    // Server-side duplicate check
    const q = query(
      collection(db, "rsvps"),
      where("displayName", "==", finalName),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // If server already has this name, mark session as saved so this browser won't try again,
      // but still allow the guest to view the invitation.
      if (btnCouple) btnCouple.disabled = false;
      if (btnSingle) btnSingle.disabled = false;
      if (btnDecline) btnDecline.disabled = false;
      alreadySubmitted(finalName); // cache locally
      localStorage.setItem("guestName", finalName);
      localStorage.setItem("guestSaved", "true");
      window.showToast("ឈ្មោះនេះបានបញ្ជាក់រួចហើយ — កំពុងបើកអញ្ជើញ", "success");
      return window.showMainContent(finalName);
    }

    // Save to Firebase
    const docRef = await addDoc(collection(db, "rsvps"), guestData);
    alreadySubmitted(finalName); // cache success
    // Mark session as saved to prevent duplicates from this browser
    localStorage.setItem("guestName", finalName);
    localStorage.setItem("guestSaved", "true");

    let qrId = null;
    if (type === "decline") {
      window.showToast("អរគុណសម្រាប់ការបញ្ជាក់! 🙏", "success");
    } else {
      qrId = docRef.id;
    }
    window.showMainContent(finalName, qrId);
  } catch (error) {
    console.error("Error adding RSVP: ", error);
    window.showToast("មានបញ្ហាក្នុងការរក្សាទុក។ សូមព្យាយាមម្តងទៀត!", "error");
    if (btnCouple) btnCouple.disabled = false;
    if (btnSingle) btnSingle.disabled = false;
    if (btnDecline) btnDecline.disabled = false;
  }
};

// Allow guest to change name: clear session keys and reload
window.logoutGuest = function () {
  localStorage.removeItem("guestName");
  localStorage.removeItem("guestSaved");
  // keep local cache of submitted list for protection, do not clear 'wedding-rsvp-submitted'
  window.location.reload();
};

// Add click listeners to buttons to avoid inline onclick with modules
const btnCoupleSubmit = document.getElementById("btn-couple-submit");
if (btnCoupleSubmit)
  btnCoupleSubmit.addEventListener("click", window.generateCard);

const btnSingleSubmit = document.getElementById("btn-single-submit");
if (btnSingleSubmit)
  btnSingleSubmit.addEventListener("click", window.generateCard);

const btnDeclineSubmit = document.getElementById("btn-decline-submit");
if (btnDeclineSubmit)
  btnDeclineSubmit.addEventListener("click", window.generateCard);

const docRef = doc(db, "wedding", "details");

onSnapshot(docRef, (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();

    if (data.groomName)
      document.getElementById("groom-name-display").innerText = data.groomName;
    if (data.brideName)
      document.getElementById("bride-name-display").innerText = data.brideName;

    // Profile Section
    const profileGroomName = document.getElementById("profile-groom-name");
    if (profileGroomName && data.groomName)
      profileGroomName.innerText = data.groomName;

    const profileBrideName = document.getElementById("profile-bride-name");
    if (profileBrideName && data.brideName)
      profileBrideName.innerText = data.brideName;

    const profileGroomStory = document.getElementById("profile-groom-story");
    if (profileGroomStory && data.groomStory)
      profileGroomStory.innerText = data.groomStory;

    const profileBrideStory = document.getElementById("profile-bride-story");
    if (profileBrideStory && data.brideStory)
      profileBrideStory.innerText = data.brideStory;

    const profileGroomImg = document.getElementById("profile-groom-img");
    if (profileGroomImg && data.groomImageId) {
      profileGroomImg.src = getImageUrl(data.groomImageId, {
        width: 500,
        height: 500,
        crop: "fill",
      });
    }

    const profileBrideImg = document.getElementById("profile-bride-img");
    if (profileBrideImg && data.brideImageId) {
      profileBrideImg.src = getImageUrl(data.brideImageId, {
        width: 500,
        height: 500,
        crop: "fill",
      });
    }

    const eventDateDisplay = document.getElementById("event-date-display");
    if (eventDateDisplay && data.eventDate) {
      eventDateDisplay.innerText = data.eventDate;
    }

    const locationDisplay = document.getElementById("location-display");
    if (locationDisplay && data.location) {
      locationDisplay.innerText = data.location;
    }

    const timeMorningDisplay = document.getElementById("time-morning-display");
    if (timeMorningDisplay && data.timeMorning) {
      timeMorningDisplay.innerText = data.timeMorning;
    }

    const timeEveningDisplay = document.getElementById("time-evening-display");
    if (timeEveningDisplay && data.timeEvening) {
      timeEveningDisplay.innerText = data.timeEvening;
    }

    if (data.mapUrl) {
      const iframe = document.getElementById("map-iframe-display");
      if (iframe && iframe.src !== data.mapUrl) {
        iframe.src = data.mapUrl;
      }
      const container = document.getElementById("map-container");
      if (container) container.classList.remove("hidden");
    } else {
      const container = document.getElementById("map-container");
      if (container) container.classList.add("hidden");
    }
    // Cover image: prefer secure URL then public id
    const cover =
      data.coverImageUrl ||
      (data.coverImageId
        ? getImageUrl(data.coverImageId, {
            width: 2000,
            height: 1200,
            crop: "fill",
          })
        : null);
    if (cover) {
      // Update all hero background elements
      document.querySelectorAll(".hero-bg").forEach((el) => {
        el.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${cover}')`;
      });
    }

    // Gallery updates
    galleryFromFirestore = data.galleryImages || [];
    loadGallery();
  }
});

// Auto-open invitation when guestName is present in localStorage
(function autoOpenGuestSession() {
  try {
    const storedName = localStorage.getItem("guestName");
    if (storedName) {
      // small delay to allow page resources to render
      setTimeout(() => {
        window.showMainContent(storedName);
        window.showToast("សូមស្វាគមន៍វិញ!", "success");
      }, 240);
    }
  } catch (err) {
    console.error("Auto-open guest session failed", err);
  }
})();

function loadTimelineEvents() {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const eventRef = collection(db, "events");
  onSnapshot(eventRef, (snapshot) => {
    let events = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

    events.sort((a, b) => {
      if (typeof a.order === "number" && typeof b.order === "number")
        return a.order - b.order;
      const ta = a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : new Date(a.createdAt || 0).getTime();
      const tb = b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });

    if (events.length === 0) {
      events = [
        {
          title: "ពិធីក្រុងពាលី",
          time: "ម៉ោង ២:០០ រសៀល",
          desc: "ជួបជុំសាច់ញាតិ ដើម្បីសុំសេចក្តីសុខសេចក្តីចម្រើន។",
          icon: "flower-2",
        },
        {
          title: "ពិធីសូត្រមន្ត",
          time: "ម៉ោង ៤:០០ រសៀល",
          desc: "និមន្តព្រះសង្ឃចម្រើនព្រះបរិត្ត។",
          icon: "sparkles",
        },
        {
          title: "ពិធីហែជំនូន",
          time: "ម៉ោង ៧:០០ ព្រឹក (ថ្ងៃបន្ទាប់)",
          desc: "ដង្ហែរជំនូនចូលរោងជ័យ។",
          icon: "gift",
        },
        {
          title: "ពិធីកាត់សក់",
          time: "ម៉ោង ៩:០០ ព្រឹក",
          desc: "កាត់សក់បង្កក់សិរី និងបណ្ដេញឧបទ្រពចង្រៃ។",
          icon: "scissors",
        },
        {
          title: "ពិធីចងដៃ",
          time: "ម៉ោង ១០:៣០ ព្រឹក",
          desc: "សាច់ញាតិចាស់ទុំចងដៃជូនពរជ័យសិរីសួស្តី។",
          icon: "gem",
        },
        {
          title: "ពិធីពិសាភោជនាហារ",
          time: "ម៉ោង ៤:០០ រសៀល",
          desc: "សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយសទាំងអស់ពិសាភោជនាហារ។",
          icon: "utensils-crossed",
        },
      ];
    }

    container.innerHTML = events
      .map(
        (ev) => `
      <div class="relative pl-10 md:pl-16 group">
        <div class="absolute -left-[11px] bg-amber-500 w-5 h-5 rounded-full border-4 border-white shadow group-hover:scale-125 transition-transform duration-300"></div>
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow flex gap-4 items-start">
          <div class="bg-amber-50 p-3 rounded-xl text-amber-600 hidden sm:block">
            <i data-lucide="${ev.icon || "flower-2"}" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="font-moul text-lg text-amber-700 mb-2">${ev.title}</h4>
            <p class="text-amber-600 font-bold mb-2">${ev.time}</p>
            <p class="text-gray-600 text-sm">${ev.desc}</p>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    if (window.lucide) {
      lucide.createIcons();
    }
  });
}

// Initialize countdown
startCountdown();

// Initialize gallery
loadGallery();

// Initialize timeline
loadTimelineEvents();
