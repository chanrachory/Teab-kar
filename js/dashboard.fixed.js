import {
  db,
  doc,
  getDoc,
  setDoc,
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  addDoc,
} from "../firebase/firebase-config.js";
import {
  getImageUrl,
  uploadImage,
  previewImage,
} from "../services/cloudinary.js";

const docRef = doc(db, "wedding", "details");
const rsvpRef = collection(db, "rsvps");
const eventRef = collection(db, "events");
const EVENTS_KEY = "dashboard-events";
const DEMO_ADMIN_EMAIL = "admin@teabkar.com";
const DEMO_ADMIN_PASSWORD = "admin1234";

let allRsvps = [];
let filteredRsvps = [];
let allEvents = [];
let currentPage = 1;
const rowsPerPage = 7;
let dailyChart;
let typeChart;
let unsubscribeRsvps = null;
let unsubscribeEvents = null;
let html5QrcodeScanner = null;

const elements = {
  loginSection: document.getElementById("login-section"),
  dashboardSection: document.getElementById("dashboard-section"),
  loginForm: document.getElementById("login-form"),
  loginError: document.getElementById("login-error"),
  logoutBtn: document.getElementById("logout-btn"),
  darkModeToggle: document.getElementById("dark-mode-toggle"),
  mobileDarkMode: document.getElementById("mobile-dark-mode"),
  guestSearch: document.getElementById("guest-search"),
  guestFilter: document.getElementById("guest-filter"),
  guestTableBody: document.getElementById("guest-table-body"),
  pagination: document.getElementById("pagination"),
  statTotal: document.getElementById("stat-total"),
  statCouple: document.getElementById("stat-couple"),
  statSingle: document.getElementById("stat-single"),
  statToday: document.getElementById("stat-today"),
  statTables: document.getElementById("stat-tables"),
  loading: document.getElementById("loading"),
  successMsg: document.getElementById("success-msg"),
  errorMsg: document.getElementById("error-msg"),
  toast: document.getElementById("toast"),
  editModal: document.getElementById("edit-modal"),
  closeEditModal: document.getElementById("close-edit-modal"),
  editForm: document.getElementById("edit-form"),
  editId: document.getElementById("edit-id"),
  editName: document.getElementById("edit-name"),
  editType: document.getElementById("edit-type"),
  dashboardForm: document.getElementById("dashboard-form"),
  coverImageInput: document.getElementById("cover-image-input"),
  coverImagePreview: document.getElementById("cover-image-preview"),
  groomPhotoInput: document.getElementById("groom-photo-input"),
  bridePhotoInput: document.getElementById("bride-photo-input"),
  groomPhotoPreview: document.getElementById("groom-photo-preview"),
  bridePhotoPreview: document.getElementById("bride-photo-preview"),
  groomBio: document.getElementById("groom-bio"),
  brideBio: document.getElementById("bride-bio"),
  // Media panel elements
  galleryInput: document.getElementById("gallery-input"),
  galleryPreviewList: document.getElementById("gallery-preview-list"),
  uploadGalleryBtn: document.getElementById("upload-gallery-btn"),
  galleryCategory: document.getElementById("gallery-category"),
  mediaCoverPreview: document.getElementById("media-cover-preview"),
  mediaCoverEmpty: document.getElementById("media-cover-empty"),
  mediaTotalCount: document.getElementById("media-total-count"),
  mediaLatestImg: document.getElementById("media-latest-img"),
  mediaLatestEmpty: document.getElementById("media-latest-empty"),
  mediaGrid: document.getElementById("media-grid"),
  mediaEmpty: document.getElementById("media-empty"),
  mediaGroomImg: document.getElementById("media-groom-img"),
  mediaGroomEmpty: document.getElementById("media-groom-empty"),
  mediaGroomName: document.getElementById("media-groom-name"),
  mediaGroomBio: document.getElementById("media-groom-bio"),
  mediaBrideImg: document.getElementById("media-bride-img"),
  mediaBrideEmpty: document.getElementById("media-bride-empty"),
  mediaBrideName: document.getElementById("media-bride-name"),
  mediaBrideBio: document.getElementById("media-bride-bio"),
  saveBtn:
    document.getElementById("dashboard-save-btn") ||
    document.querySelector("#dashboard-form button[type=submit]"),
  btnExportExcel: document.getElementById("btn-export-excel"),
  btnExportPdf: document.getElementById("btn-export-pdf"),
  btnScanQr: document.getElementById("btn-scan-qr"),
  scannerModal: document.getElementById("scanner-modal"),
  closeScannerModal: document.getElementById("close-scanner-modal"),
  scannerResult: document.getElementById("scanner-result"),
  eventsContainer: document.getElementById("events-container"),
  btnAddEvent: document.getElementById("btn-add-event"),
  eventModal: document.getElementById("event-modal"),
  closeEventModal: document.getElementById("close-event-modal"),
  eventForm: document.getElementById("event-form"),
  eventId: document.getElementById("event-id"),
  eventTitle: document.getElementById("event-title"),
  eventTime: document.getElementById("event-time"),
  eventDesc: document.getElementById("event-desc"),
  eventIcon: document.getElementById("event-icon"),
  eventModalTitle: document.getElementById("event-modal-title"),
};

function showToast(message, tone = "info") {
  const colors = {
    info: "bg-slate-800 text-white",
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
  };
  const toast = document.createElement("div");
  toast.className = `rounded-2xl px-4 py-3 shadow-xl ${colors[tone] || colors.info}`;
  toast.textContent = message;
  elements.toast.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return value.toDate().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function isToday(value) {
  if (!value) return false;
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toDateString() === new Date().toDateString();
}

function countByType(list, type, status) {
  return list.filter((item) => item.type === type && item.status === status)
    .length;
}

function renderStats(list) {
  const attending = list.filter((item) => item.status !== "declined");
  let totalHeadCount = 0;
  attending.forEach((item) => {
    totalHeadCount += item.type === "couple" ? 2 : 1;
  });
  elements.statTotal.textContent = totalHeadCount;
  elements.statCouple.textContent = countByType(list, "couple", "attending");
  elements.statSingle.textContent = countByType(list, "single", "attending");
  elements.statToday.textContent = list.filter((item) =>
    isToday(item.timestamp),
  ).length;
  elements.statTables.textContent = Math.max(1, Math.ceil(totalHeadCount / 10));
}

function renderCharts(list) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = Array(7).fill(0);
  list.forEach((entry) => {
    const date = entry.timestamp?.toDate
      ? entry.timestamp.toDate()
      : new Date(entry.timestamp || Date.now());
    data[(date.getDay() + 6) % 7] += 1;
  });
  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(document.getElementById("dailyChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Daily RSVPs",
          data,
          backgroundColor: "rgba(245, 158, 11, 0.7)",
          borderColor: "#f59e0b",
          borderWidth: 1,
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
  if (typeChart) typeChart.destroy();
  typeChart = new Chart(document.getElementById("typeChart"), {
    type: "doughnut",
    data: {
      labels: ["Couple", "Single", "Declined"],
      datasets: [
        {
          data: [
            countByType(list, "couple", "attending"),
            countByType(list, "single", "attending"),
            list.filter((item) => item.status === "declined").length,
          ],
          backgroundColor: ["#f59e0b", "#3b82f6", "#ef4444"],
        },
      ],
    },
    options: { responsive: true },
  });
}

function renderTable(list) {
  const search = (elements.guestSearch.value || "").toLowerCase();
  const typeFilter = elements.guestFilter.value || "all";
  const filtered = list.filter((item) => {
    const matchesSearch =
      item.displayName?.toLowerCase().includes(search) ||
      item.name1?.toLowerCase().includes(search);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });
  filteredRsvps = filtered;
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * rowsPerPage;
  const pageItems = filtered.slice(start, start + rowsPerPage);
  if (!pageItems.length) {
    elements.guestTableBody.innerHTML =
      '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">No RSVP records are available yet.</td></tr>';
    elements.pagination.innerHTML = "";
    return;
  }
  elements.guestTableBody.innerHTML = pageItems
    .map((item) => {
      const statusBadge =
        item.status === "declined"
          ? '<span class="rounded-full px-2.5 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-100 ml-2">Declined</span>'
          : '<span class="rounded-full px-2.5 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100 ml-2">Attending</span>';
      const checkInBadge = item.checkedIn
        ? '<span class="rounded-full px-2.5 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200 ml-2 border border-indigo-200 dark:border-indigo-500/30"><i data-lucide="check" class="w-3 h-3 inline"></i> Arrived</span>'
        : "";
      return `<tr><td class="px-4 py-3"><div class="font-semibold text-slate-800 dark:text-slate-100 flex items-center">${item.displayName || "Guest"} ${statusBadge} ${checkInBadge}</div><div class="text-xs text-slate-500 dark:text-slate-300 mt-1">${item.name2 ? `${item.name1} & ${item.name2}` : item.name1 || ""}</div></td><td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs ${item.type === "couple" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-100" : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-100"}">${item.type === "couple" ? "Couple" : "Single"}</span></td><td class="px-4 py-3 text-slate-500 dark:text-slate-300">${formatDate(item.timestamp)}</td><td class="px-4 py-3 text-right"><button data-action="checkin" data-id="${item.id}" class="mr-2 rounded-xl border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10 ${item.checkedIn || item.status === "declined" ? "opacity-50 cursor-not-allowed" : ""}" ${item.checkedIn || item.status === "declined" ? "disabled" : ""}>Check In</button><button data-action="edit" data-id="${item.id}" class="mr-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit</button><button data-action="delete" data-id="${item.id}" class="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10">Delete</button></td></tr>`;
    })
    .join("");
  lucide.createIcons();
  elements.pagination.innerHTML = Array.from(
    { length: totalPages },
    (_, index) =>
      `<button data-page="${index + 1}" class="rounded-xl border px-3 py-1.5 text-sm ${index + 1 === currentPage ? "border-amber-400 bg-amber-500 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}">${index + 1}</button>`,
  ).join("");
}

function render() {
  renderStats(allRsvps);
  renderCharts(allRsvps);
  renderTable(allRsvps);
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportToExcel() {
  const rows = filteredRsvps.length ? filteredRsvps : allRsvps;
  const header = ["Guest", "Type", "Status", "Checked In", "Timestamp"];
  const body = rows.map((item) => [
    item.displayName || item.name1 || "",
    item.type || "single",
    item.status || "attending",
    item.checkedIn ? "Yes" : "No",
    formatDate(item.timestamp),
  ]);
  const csv = [header, ...body]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  downloadFile("teabkar-rsvp-report.csv", csv, "text/csv;charset=utf-8;");
  showToast("Excel export ready", "success");
}

function exportToPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF library is unavailable", "error");
    return;
  }
  const rows = filteredRsvps.length ? filteredRsvps : allRsvps;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.text("Teab-Kar RSVP Report", 14, 16);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
  const body = rows.map((item) => [
    item.displayName || item.name1 || "",
    item.type || "single",
    item.status || "attending",
    item.checkedIn ? "Yes" : "No",
    formatDate(item.timestamp),
  ]);
  doc.autoTable({
    head: [["Guest", "Type", "Status", "Checked In", "Timestamp"]],
    body,
    startY: 32,
    theme: "grid",
  });
  doc.save("teabkar-rsvp-report.pdf");
  showToast("PDF export ready", "success");
}

async function loadWeddingDetails() {
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("groomName").value = data.groomName || "";
      document.getElementById("brideName").value = data.brideName || "";
      document.getElementById("eventDate").value = data.eventDate || "";
      document.getElementById("location").value = data.location || "";
      document.getElementById("timeMorning").value = data.timeMorning || "";
      document.getElementById("timeEvening").value = data.timeEvening || "";
      document.getElementById("mapUrl").value = data.mapUrl || "";
      document.getElementById("groom-bio").value = data.groomBio || "";
      document.getElementById("bride-bio").value = data.brideBio || "";
      if (data.coverImageUrl) {
        elements.coverImagePreview.src = data.coverImageUrl;
        elements.coverImagePreview.classList.remove("hidden");
      } else if (data.coverImageId) {
        elements.coverImagePreview.src = getImageUrl(data.coverImageId, {
          width: 600,
          height: 400,
          crop: "fill",
        });
        elements.coverImagePreview.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function listenToRsvps() {
  const q = query(rsvpRef, orderBy("timestamp", "desc"));
  unsubscribeRsvps = onSnapshot(q, (snapshot) => {
    allRsvps = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    render();
  });
}

function getStoredEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveStoredEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function listenToEvents() {
  if (localStorage.getItem("dashboard-demo-auth") === "true") {
    allEvents = getStoredEvents();
    renderEvents();
    return;
  }

  const q = query(eventRef, orderBy("createdAt", "desc"));
  unsubscribeEvents = onSnapshot(q, (snapshot) => {
    allEvents = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    // ensure consistent ordering by `order` when available
    allEvents.sort((a, b) => {
      if (typeof a.order === "number" && typeof b.order === "number")
        return a.order - b.order;
      const ta = a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : new Date(a.createdAt || 0).getTime();
      const tb = b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : new Date(b.createdAt || 0).getTime();
      return tb - ta; // fallback: newest first
    });
    renderEvents();
  });
}

function renderEvents() {
  if (!allEvents.length) {
    elements.eventsContainer.innerHTML =
      '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">No events yet. Click “បន្ថែមកម្មវិធី” to create one.</div>';
    return;
  }
  // Render events in order (by `order` then fallback to createdAt desc)
  const sorted = allEvents.slice().sort((a, b) => {
    if (typeof a.order === "number" && typeof b.order === "number")
      return a.order - b.order;
    const ta = a.createdAt?.toDate
      ? a.createdAt.toDate().getTime()
      : new Date(a.createdAt || 0).getTime();
    const tb = b.createdAt?.toDate
      ? b.createdAt.toDate().getTime()
      : new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });

  elements.eventsContainer.innerHTML = sorted
    .map((eventItem) => {
      return `<article class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/70"><div class="flex items-start justify-between gap-3"><div class="flex items-start gap-3"><div class="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"><i data-lucide="${eventItem.icon || "flower-2"}" class="h-5 w-5"></i></div><div><h3 class="text-lg font-semibold text-slate-900 dark:text-white">${eventItem.title}</h3><p class="text-sm text-amber-600 dark:text-amber-300">${eventItem.time}</p><p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${eventItem.desc}</p></div></div><div class="flex gap-2">
          <button data-action="move-up" data-id="${eventItem.id}" title="Move up" class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200">↑</button>
          <button data-action="move-down" data-id="${eventItem.id}" title="Move down" class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200">↓</button>
          <button data-action="edit-event" data-id="${eventItem.id}" class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit</button>
          <button data-action="delete-event" data-id="${eventItem.id}" class="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10">Delete</button>
        </div></div></article>`;
    })
    .join("");
  lucide.createIcons();
}

// Listen to wedding details document for realtime media and cover updates
let unsubscribeDetails = null;
function listenToDetails() {
  if (unsubscribeDetails) unsubscribeDetails();
  unsubscribeDetails = onSnapshot(docRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    // Update cover preview in media panel
    if (elements.mediaCoverPreview) {
      if (data.coverImageUrl) {
        elements.mediaCoverPreview.src = data.coverImageUrl;
        elements.mediaCoverPreview.classList.remove("hidden");
        elements.mediaCoverEmpty.classList.add("hidden");
      } else if (data.coverImageId) {
        elements.mediaCoverPreview.src = getImageUrl(data.coverImageId, {
          width: 1200,
          height: 800,
          crop: "fill",
        });
        elements.mediaCoverPreview.classList.remove("hidden");
        elements.mediaCoverEmpty.classList.add("hidden");
      } else {
        elements.mediaCoverPreview.classList.add("hidden");
        elements.mediaCoverEmpty.classList.remove("hidden");
      }
    }

    // Render gallery images
    const gallery = data.galleryImages || [];
    if (elements.mediaTotalCount)
      elements.mediaTotalCount.textContent = gallery.length;

    if (gallery.length) {
      const latest = gallery[gallery.length - 1];
      if (elements.mediaLatestImg) {
        elements.mediaLatestImg.src = latest.url || latest;
        elements.mediaLatestImg.classList.remove("hidden");
        elements.mediaLatestEmpty.classList.add("hidden");
      }
      // Populate grid
      if (elements.mediaGrid) {
        elements.mediaGrid.innerHTML = gallery
          .slice(-9)
          .reverse()
          .map(
            (img, idx) => `
            <div class="rounded-xl overflow-hidden h-24 relative group">
              <img src="${img.url || img}" class="w-full h-full object-cover" />
              <button data-index="${idx}" data-publicid="${img.publicId || ""}" class="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">🗑</button>
            </div>
          `,
          )
          .join("");
        elements.mediaEmpty.classList.add("hidden");
      }
    } else {
      if (elements.mediaLatestImg) {
        elements.mediaLatestImg.classList.add("hidden");
        elements.mediaLatestEmpty.classList.remove("hidden");
      }
      if (elements.mediaGrid) {
        elements.mediaGrid.innerHTML = "";
        elements.mediaEmpty.classList.remove("hidden");
      }
    }
    // Groom / Bride cards
    if (elements.mediaGroomImg) {
      if (data.groomPhotoUrl) {
        elements.mediaGroomImg.src = data.groomPhotoUrl;
        elements.mediaGroomImg.classList.remove("hidden");
        elements.mediaGroomEmpty.classList.add("hidden");
      } else if (data.groomPhotoId) {
        elements.mediaGroomImg.src = getImageUrl(data.groomPhotoId, {
          width: 600,
          height: 600,
          crop: "fill",
        });
        elements.mediaGroomImg.classList.remove("hidden");
        elements.mediaGroomEmpty.classList.add("hidden");
      } else {
        elements.mediaGroomImg.classList.add("hidden");
        elements.mediaGroomEmpty.classList.remove("hidden");
      }
      elements.mediaGroomName.textContent = data.groomName || "";
      elements.mediaGroomBio.textContent = data.groomBio || "";
    }
    if (elements.mediaBrideImg) {
      if (data.bridePhotoUrl) {
        elements.mediaBrideImg.src = data.bridePhotoUrl;
        elements.mediaBrideImg.classList.remove("hidden");
        elements.mediaBrideEmpty.classList.add("hidden");
      } else if (data.bridePhotoId) {
        elements.mediaBrideImg.src = getImageUrl(data.bridePhotoId, {
          width: 600,
          height: 600,
          crop: "fill",
        });
        elements.mediaBrideImg.classList.remove("hidden");
        elements.mediaBrideEmpty.classList.add("hidden");
      } else {
        elements.mediaBrideImg.classList.add("hidden");
        elements.mediaBrideEmpty.classList.remove("hidden");
      }
      elements.mediaBrideName.textContent = data.brideName || "";
      elements.mediaBrideBio.textContent = data.brideBio || "";
    }
  });
}

function openEventModal(mode = "add", eventItem = null) {
  elements.eventForm.reset();
  elements.eventId.value = "";
  if (mode === "edit" && eventItem) {
    elements.eventModalTitle.textContent = "កែប្រែកម្មវិធី";
    elements.eventId.value = eventItem.id;
    elements.eventTitle.value = eventItem.title || "";
    elements.eventTime.value = eventItem.time || "";
    elements.eventDesc.value = eventItem.desc || "";
    elements.eventIcon.value = eventItem.icon || "flower-2";
  } else {
    elements.eventModalTitle.textContent = "បន្ថែមកម្មវិធី";
    elements.eventIcon.value = "flower-2";
  }
  elements.eventModal.classList.remove("hidden");
  elements.eventModal.classList.add("flex");
}
function closeEventModal() {
  elements.eventModal.classList.add("hidden");
  elements.eventModal.classList.remove("flex");
}
function startQrScanner() {
  elements.scannerModal.classList.remove("hidden");
  elements.scannerModal.classList.add("flex");
  if (!html5QrcodeScanner)
    html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );
  elements.scannerResult.classList.add("hidden");
  elements.scannerResult.textContent = "";
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}
async function onScanSuccess(decodedText) {
  if (html5QrcodeScanner) await html5QrcodeScanner.clear();
  const guest = allRsvps.find((item) => item.id === decodedText);
  elements.scannerResult.classList.remove("hidden");
  if (guest) {
    if (guest.checkedIn) {
      elements.scannerResult.innerHTML = `<i data-lucide="info" class="w-6 h-6 mx-auto mb-2 text-amber-500"></i><p class="text-amber-600">Guest <strong>${guest.displayName}</strong> is already checked in!</p>`;
    } else {
      try {
        await updateDoc(doc(db, "rsvps", decodedText), {
          checkedIn: true,
          checkInTime: new Date(),
        });
        elements.scannerResult.innerHTML = `<i data-lucide="check-circle" class="w-6 h-6 mx-auto mb-2 text-emerald-500"></i><p class="text-emerald-600">Successfully checked in <strong>${guest.displayName}</strong>!</p>`;
        showToast(`Checked in ${guest.displayName}`, "success");
      } catch (error) {
        console.error(error);
        elements.scannerResult.innerHTML =
          '<p class="text-red-600">Failed to check in. Error occurred.</p>';
      }
    }
  } else {
    elements.scannerResult.innerHTML =
      '<i data-lucide="x-circle" class="w-6 h-6 mx-auto mb-2 text-red-500"></i><p class="text-red-600">Invalid QR Code. Guest not found.</p>';
  }
  lucide.createIcons();
}
function onScanFailure() {}
function stopQrScanner() {
  if (html5QrcodeScanner) html5QrcodeScanner.clear();
  elements.scannerModal.classList.add("hidden");
  elements.scannerModal.classList.remove("flex");
}

function enterDashboardMode() {
  elements.loginSection.classList.add("hidden");
  elements.dashboardSection.classList.remove("hidden");
  loadWeddingDetails();
  listenToRsvps();
  listenToEvents();
  listenToDetails();
}
function exitDashboardMode() {
  elements.loginSection.classList.remove("hidden");
  elements.dashboardSection.classList.add("hidden");
  if (unsubscribeRsvps) unsubscribeRsvps();
  if (unsubscribeEvents) unsubscribeEvents();
  unsubscribeRsvps = null;
  unsubscribeEvents = null;
}

function attachEvents() {
  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    elements.loginError.classList.add("hidden");
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      localStorage.setItem("dashboard-demo-auth", "true");
      showToast("Demo login successful", "success");
      enterDashboardMode();
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Login successful", "success");
    } catch (error) {
      console.error(error);
      elements.loginError.classList.remove("hidden");
      showToast("Email or password is incorrect", "error");
    }
  });
  elements.logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("dashboard-demo-auth");
      showToast("Logged out", "success");
      exitDashboardMode();
    }
  });
  elements.darkModeToggle.addEventListener("click", toggleTheme);
  elements.mobileDarkMode.addEventListener("click", toggleTheme);
  elements.guestSearch.addEventListener("input", () => {
    currentPage = 1;
    renderTable(allRsvps);
  });
  elements.guestFilter.addEventListener("change", () => {
    currentPage = 1;
    renderTable(allRsvps);
  });
  elements.pagination.addEventListener("click", (event) => {
    const page = event.target.dataset.page;
    if (page) {
      currentPage = Number(page);
      renderTable(allRsvps);
    }
  });
  elements.guestTableBody.addEventListener("click", async (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (!action || !id) return;
    const item = allRsvps.find((entry) => entry.id === id);
    if (!item) return;
    if (action === "delete") {
      if (!window.confirm("Delete this RSVP record?")) return;
      try {
        await deleteDoc(doc(db, "rsvps", id));
        showToast("RSVP deleted successfully", "success");
      } catch (error) {
        console.error(error);
        showToast("Unable to delete RSVP", "error");
      }
      return;
    }
    if (action === "checkin") {
      try {
        await updateDoc(doc(db, "rsvps", id), {
          checkedIn: true,
          checkInTime: new Date(),
        });
        showToast("Guest checked in manually", "success");
      } catch (error) {
        console.error(error);
        showToast("Unable to check in", "error");
      }
      return;
    }
    if (action === "edit") {
      elements.editId.value = id;
      elements.editName.value = item.displayName || "";
      elements.editType.value = item.type || "single";
      elements.editModal.classList.remove("hidden");
      elements.editModal.classList.add("flex");
    }
  });
  elements.closeEditModal.addEventListener("click", closeEditModal);
  elements.editModal.addEventListener("click", (event) => {
    if (event.target === elements.editModal) closeEditModal();
  });
  elements.editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = elements.editId.value;
    try {
      await updateDoc(doc(db, "rsvps", id), {
        displayName: elements.editName.value.trim(),
        type: elements.editType.value,
        name1: elements.editName.value.trim(),
      });
      closeEditModal();
      showToast("RSVP updated successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Unable to update RSVP", "error");
    }
  });
  elements.btnExportExcel?.addEventListener("click", exportToExcel);
  elements.btnExportPdf?.addEventListener("click", exportToPdf);
  // Use URL.createObjectURL for fast preview and revoke previous object URLs
  let currentPreviewUrl = null;
  elements.coverImageInput?.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
        currentPreviewUrl = null;
      }
      elements.coverImagePreview.classList.add("hidden");
      elements.coverImagePreview.src = "";
      return;
    }
    try {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      currentPreviewUrl = previewImage(file); // creates object URL
      elements.coverImagePreview.src = currentPreviewUrl;
      elements.coverImagePreview.classList.remove("hidden");
    } catch (err) {
      console.error("Preview failed:", err);
      elements.coverImagePreview.classList.add("hidden");
    }
  });

  // Groom/bride preview handling
  let groomPreviewUrl = null;
  let bridePreviewUrl = null;
  elements.groomPhotoInput?.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      if (groomPreviewUrl) {
        URL.revokeObjectURL(groomPreviewUrl);
        groomPreviewUrl = null;
      }
      elements.groomPhotoPreview.classList.add("hidden");
      elements.groomPhotoPreview.src = "";
      return;
    }
    try {
      if (groomPreviewUrl) URL.revokeObjectURL(groomPreviewUrl);
      groomPreviewUrl = previewImage(file);
      elements.groomPhotoPreview.src = groomPreviewUrl;
      elements.groomPhotoPreview.classList.remove("hidden");
    } catch (err) {
      console.error("Groom preview failed:", err);
      elements.groomPhotoPreview.classList.add("hidden");
    }
  });

  elements.bridePhotoInput?.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      if (bridePreviewUrl) {
        URL.revokeObjectURL(bridePreviewUrl);
        bridePreviewUrl = null;
      }
      elements.bridePhotoPreview.classList.add("hidden");
      elements.bridePhotoPreview.src = "";
      return;
    }
    try {
      if (bridePreviewUrl) URL.revokeObjectURL(bridePreviewUrl);
      bridePreviewUrl = previewImage(file);
      elements.bridePhotoPreview.src = bridePreviewUrl;
      elements.bridePhotoPreview.classList.remove("hidden");
    } catch (err) {
      console.error("Bride preview failed:", err);
      elements.bridePhotoPreview.classList.add("hidden");
    }
  });

  // Gallery preview handling (multiple files)
  let galleryPreviewUrls = [];
  elements.galleryInput?.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);
    // clear previous previews
    galleryPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    galleryPreviewUrls = [];
    elements.galleryPreviewList.innerHTML = "";
    if (!files.length) return;
    files.slice(0, 12).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      galleryPreviewUrls.push(url);
      const thumb = document.createElement("div");
      thumb.className =
        "relative rounded-xl overflow-hidden h-20 cursor-pointer";
      thumb.innerHTML = `<img src="${url}" class="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110" /><button data-idx="${idx}" class="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1 text-xs">✕</button>`;
      elements.galleryPreviewList.appendChild(thumb);
      // remove handler
      thumb.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        const input = elements.galleryInput;
        const dt = new DataTransfer();
        files.forEach((f, i) => {
          if (i !== idx) dt.items.add(f);
        });
        input.files = dt.files;
        // trigger change to refresh previews
        input.dispatchEvent(new Event("change"));
      });
    });
  });

  // Upload gallery button
  elements.uploadGalleryBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const files = Array.from(elements.galleryInput?.files || []);
    if (!files.length) return showToast("No images selected", "error");
    const category = elements.galleryCategory?.value || "prewedding";
    elements.uploadGalleryBtn.disabled = true;
    elements.uploadGalleryBtn.textContent = "Uploading...";
    try {
      const uploaded = [];
      for (const file of files) {
        try {
          const res = await uploadImage(file);
          uploaded.push({
            url: res.secure_url,
            publicId: res.public_id,
            category,
            uploadedAt: new Date().toISOString(),
          });
          console.info("Uploaded gallery image:", res.secure_url);
        } catch (err) {
          console.error("Failed to upload image:", err);
        }
      }
      if (uploaded.length) {
        // merge into Firestore document
        const snap = await getDoc(docRef);
        const existing = snap.exists() ? snap.data().galleryImages || [] : [];
        const merged = [...existing, ...uploaded];
        await setDoc(docRef, {
          ...(snap.exists() ? snap.data() : {}),
          galleryImages: merged,
        });
        showToast(`Uploaded ${uploaded.length} images`, "success");
        // clear input & previews
        elements.galleryInput.value = "";
        elements.galleryPreviewList.innerHTML = "";
      } else {
        showToast("No images were uploaded", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Gallery upload failed", "error");
    } finally {
      elements.uploadGalleryBtn.disabled = false;
      elements.uploadGalleryBtn.textContent = "Upload";
    }
  });

  elements.dashboardForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Disable save and show loading
    const saveBtn = elements.saveBtn;
    if (saveBtn) saveBtn.disabled = true;
    elements.loading.classList.remove("hidden");
    elements.successMsg.classList.add("hidden");
    elements.errorMsg.classList.add("hidden");

    try {
      const existingSnap = await getDoc(docRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : {};

      // If a new file is selected, upload first
      const file = elements.coverImageInput?.files?.[0];
      let coverImageUrl = existingData.coverImageUrl || "";
      let coverImageId = existingData.coverImageId || "";

      if (file) {
        try {
          console.info("Uploading cover image...");
          const uploadResult = await uploadImage(file); // uses default unsigned preset
          coverImageUrl = uploadResult.secure_url || coverImageUrl;
          coverImageId = uploadResult.public_id || coverImageId;
          console.info("Upload result:", uploadResult);
        } catch (err) {
          console.error("Image upload failed", err);
          throw new Error(err.message || "Image upload failed");
        }
      }

      // groom/bride image uploads (optional)
      const groomFile = elements.groomPhotoInput?.files?.[0];
      let groomPhotoUrl = existingData.groomPhotoUrl || "";
      let groomPhotoId = existingData.groomPhotoId || "";
      if (groomFile) {
        try {
          const res = await uploadImage(groomFile);
          groomPhotoUrl = res.secure_url || groomPhotoUrl;
          groomPhotoId = res.public_id || groomPhotoId;
        } catch (err) {
          console.error("Groom image upload failed", err);
        }
      }

      const brideFile = elements.bridePhotoInput?.files?.[0];
      let bridePhotoUrl = existingData.bridePhotoUrl || "";
      let bridePhotoId = existingData.bridePhotoId || "";
      if (brideFile) {
        try {
          const res = await uploadImage(brideFile);
          bridePhotoUrl = res.secure_url || bridePhotoUrl;
          bridePhotoId = res.public_id || bridePhotoId;
        } catch (err) {
          console.error("Bride image upload failed", err);
        }
      }

      // Save wedding details with coverImageUrl (secure) and public id
      await setDoc(docRef, {
        groomName: document.getElementById("groomName").value,
        brideName: document.getElementById("brideName").value,
        groomBio: document.getElementById("groom-bio").value || "",
        brideBio: document.getElementById("bride-bio").value || "",
        eventDate: document.getElementById("eventDate").value,
        location: document.getElementById("location").value,
        timeMorning: document.getElementById("timeMorning").value,
        timeEvening: document.getElementById("timeEvening").value,
        mapUrl: document.getElementById("mapUrl").value,
        coverImageUrl: coverImageUrl || "",
        coverImageId: coverImageId || "",
        groomPhotoUrl: groomPhotoUrl || "",
        groomPhotoId: groomPhotoId || "",
        bridePhotoUrl: bridePhotoUrl || "",
        bridePhotoId: bridePhotoId || "",
      });

      elements.loading.classList.add("hidden");
      elements.successMsg.classList.remove("hidden");
      setTimeout(() => elements.successMsg.classList.add("hidden"), 2500);
      showToast("Wedding details saved", "success");
    } catch (error) {
      console.error(error);
      elements.loading.classList.add("hidden");
      elements.errorMsg.classList.remove("hidden");
      showToast(error.message || "Unable to save details", "error");
    } finally {
      if (elements.saveBtn) elements.saveBtn.disabled = false;
    }
  });
  elements.btnScanQr.addEventListener("click", startQrScanner);
  elements.closeScannerModal.addEventListener("click", stopQrScanner);
  elements.scannerModal.addEventListener("click", (event) => {
    if (event.target === elements.scannerModal) stopQrScanner();
  });
  elements.btnAddEvent.addEventListener("click", () => openEventModal("add"));
  elements.closeEventModal.addEventListener("click", closeEventModal);
  elements.eventModal.addEventListener("click", (event) => {
    if (event.target === elements.eventModal) closeEventModal();
  });
  elements.eventsContainer.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    const action = btn?.dataset.action;
    const id = btn?.dataset.id;
    if (!action || !id) return;
    const item = allEvents.find((entry) => entry.id === id);
    if (!item) return;
    if (action === "delete-event") {
      if (!window.confirm("Delete this event?")) return;
      if (localStorage.getItem("dashboard-demo-auth") === "true") {
        allEvents = allEvents.filter((entry) => entry.id !== id);
        saveStoredEvents(allEvents);
        renderEvents();
        showToast("Event deleted", "success");
        return;
      }
      try {
        await deleteDoc(doc(db, "events", id));
        showToast("Event deleted", "success");
      } catch (error) {
        console.error(error);
        showToast("Unable to delete event", "error");
      }
      return;
    }
    if (action === "edit-event") openEventModal("edit", item);
    if (action === "move-up" || action === "move-down") {
      // find index in the current sorted order
      const sorted = allEvents.slice().sort((a, b) => {
        if (typeof a.order === "number" && typeof b.order === "number")
          return a.order - b.order;
        const ta = a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt || 0).getTime();
        const tb = b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });
      const idx = sorted.findIndex((e) => e.id === id);
      if (idx === -1) return;
      const swapWith = action === "move-up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= sorted.length) return;
      // swap order values
      const a = sorted[idx];
      const b = sorted[swapWith];
      const aOrder =
        typeof a.order === "number"
          ? a.order
          : a.createdAt?.toDate
            ? a.createdAt.toDate().getTime()
            : new Date(a.createdAt || 0).getTime();
      const bOrder =
        typeof b.order === "number"
          ? b.order
          : b.createdAt?.toDate
            ? b.createdAt.toDate().getTime()
            : new Date(b.createdAt || 0).getTime();
      if (localStorage.getItem("dashboard-demo-auth") === "true") {
        // update local allEvents order fields
        allEvents = allEvents.map((ev) => {
          if (ev.id === a.id) return { ...ev, order: bOrder };
          if (ev.id === b.id) return { ...ev, order: aOrder };
          return ev;
        });
        saveStoredEvents(allEvents);
        renderEvents();
        showToast("Event order updated", "success");
        return;
      }
      try {
        await updateDoc(doc(db, "events", a.id), { order: bOrder });
        await updateDoc(doc(db, "events", b.id), { order: aOrder });
        showToast("Event order updated", "success");
      } catch (err) {
        console.error(err);
        showToast("Unable to update event order", "error");
      }
      return;
    }
  });
  // Media grid deletion (remove from Firestore galleryImages array)
  elements.mediaGrid?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const publicId = btn.dataset.publicid;
    const idx = Number(btn.dataset.index);
    if (!window.confirm("Remove this image from gallery?")) return;
    try {
      const snap = await getDoc(docRef);
      const existing = snap.exists() ? snap.data().galleryImages || [] : [];
      // Remove by publicId if available, otherwise remove by matching index from end
      let updated = existing.filter((item) => {
        if (publicId && item.publicId) return item.publicId !== publicId;
        return true;
      });
      // If publicId not matched and idx provided, try removing by position
      if (updated.length === existing.length && !publicId) {
        // remove the (idx)th item in the displayed reversed slice
        const slice = existing.slice(-9).reverse();
        const itemToRemove = slice[idx];
        if (itemToRemove) {
          updated = existing.filter((it) => it !== itemToRemove);
        }
      }
      await setDoc(docRef, {
        ...(snap.exists() ? snap.data() : {}),
        galleryImages: updated,
      });
      showToast("Image removed from gallery", "success");
    } catch (err) {
      console.error(err);
      showToast("Unable to remove image", "error");
    }
  });
  elements.eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = elements.eventId.value;
    const payload = {
      title: elements.eventTitle.value.trim(),
      time: elements.eventTime.value.trim(),
      desc: elements.eventDesc.value.trim(),
      icon: elements.eventIcon.value.trim() || "flower-2",
      updatedAt: new Date(),
    };
    try {
      if (localStorage.getItem("dashboard-demo-auth") === "true") {
        if (id) {
          allEvents = allEvents.map((entry) =>
            entry.id === id ? { ...entry, ...payload } : entry,
          );
        } else {
          // assign incremental order value
          const maxOrder = allEvents.reduce(
            (m, e) => Math.max(m, typeof e.order === "number" ? e.order : 0),
            0,
          );
          const newEvent = {
            id: `event-${Date.now()}`,
            ...payload,
            createdAt: new Date(),
            order: maxOrder + 1,
          };
          allEvents = [...allEvents, newEvent];
        }
        saveStoredEvents(allEvents);
        renderEvents();
        closeEventModal();
        showToast(id ? "Event updated" : "Event added", "success");
        return;
      }
      if (id) await updateDoc(doc(db, "events", id), payload);
      else {
        // compute order based on current events (fetching max order is best-effort)
        let orderVal = 1;
        try {
          const snap = await getDoc(docRef);
          // don't rely on docRef; instead try to derive from local allEvents
          const maxOrder = allEvents.reduce(
            (m, e) => Math.max(m, typeof e.order === "number" ? e.order : 0),
            0,
          );
          orderVal = maxOrder + 1;
        } catch (_) {}
        await addDoc(eventRef, {
          ...payload,
          createdAt: new Date(),
          order: orderVal,
        });
      }
      closeEventModal();
      showToast(id ? "Event updated" : "Event added", "success");
    } catch (error) {
      console.error(error);
      showToast("Unable to save event", "error");
    }
  });
}

function closeEditModal() {
  elements.editModal.classList.add("hidden");
  elements.editModal.classList.remove("flex");
}
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "wedding-theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
}
function applyTheme() {
  if (localStorage.getItem("wedding-theme") === "dark")
    document.documentElement.classList.add("dark");
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    enterDashboardMode();
    showToast("Welcome back, admin!", "success");
    return;
  }
  if (localStorage.getItem("dashboard-demo-auth") === "true") {
    enterDashboardMode();
    return;
  }
  exitDashboardMode();
});

lucide.createIcons();
applyTheme();
attachEvents();
