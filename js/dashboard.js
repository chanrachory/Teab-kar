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

const docRef = doc(db, "wedding", "details");
const rsvpRef = collection(db, "rsvps");
const eventsRef = collection(db, "events");

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
  btnScanQr: document.getElementById("btn-scan-qr"),
  scannerModal: document.getElementById("scanner-modal"),
  closeScannerModal: document.getElementById("close-scanner-modal"),
  scannerResult: document.getElementById("scanner-result"),
  btnExportCsv: document.getElementById("btn-export-csv"),
  btnExportPdf: document.getElementById("btn-export-pdf"),
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
  // ...
  // ... skipping to renderCharts to update it ...
  function renderCharts(list) {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = Array(7).fill(0);
    list.forEach((entry) => {
      const date = entry.timestamp?.toDate
        ? entry.timestamp.toDate()
        : new Date(entry.timestamp || Date.now());
      const day = date.getDay();
      data[(day + 6) % 7] += 1;
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

    const attendingCount = list.filter(
      (item) => item.status !== "declined" && !item.checkedIn,
    ).length;
    const checkedInCount = list.filter((item) => item.checkedIn).length;
    const declinedCount = list.filter(
      (item) => item.status === "declined",
    ).length;

    if (typeChart) typeChart.destroy();
    typeChart = new Chart(document.getElementById("typeChart"), {
      type: "doughnut",
      data: {
        labels: ["Pending Check-In", "Checked In", "Declined"],
        datasets: [
          {
            data: [attendingCount, checkedInCount, declinedCount],
            backgroundColor: ["#3b82f6", "#10b981", "#ef4444"],
          },
        ],
      },
      options: { responsive: true },
    });
  }
  // ... skipping to export functions ...
  function exportToCSV() {
    const headers = ["Guest Name", "Type", "Status", "Checked In", "RSVP Date"];
    const rows = filteredRsvps.map((item) => [
      `"${item.displayName || ""}"`,
      item.type === "couple" ? "Couple" : "Single",
      item.status === "declined" ? "Declined" : "Attending",
      item.checkedIn ? "Yes" : "No",
      `"${formatDate(item.timestamp)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `guest_list_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Exported successfully", "success");
  }

  function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.text("Wedding Guest List", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Guests: ${filteredRsvps.length}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

    const tableColumn = ["Name", "Type", "Status", "Arrived", "Date"];
    const tableRows = [];

    filteredRsvps.forEach((item) => {
      const rowData = [
        item.displayName || "",
        item.type === "couple" ? "Couple" : "Single",
        item.status === "declined" ? "Declined" : "Attending",
        item.checkedIn ? "Yes" : "No",
        formatDate(item.timestamp),
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [245, 158, 11] }, // amber-500
    });

    doc.save(`guest_list_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast("PDF Exported successfully", "success");
  }
  // ... in attachEvents ...
  elements.btnExportCsv.addEventListener("click", exportToCSV);
  elements.btnExportPdf.addEventListener("click", exportToPDF);

  const colors = {
    info: "bg-slate-800 text-white",
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
  };
  const toast = document.createElement("div");
  toast.className = `rounded-2xl px-4 py-3 shadow-xl ${colors[tone]}`;
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
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function countByType(list, type, status) {
  return list.filter((item) => item.type === type && item.status === status)
    .length;
}

function renderStats(list) {
  const attending = list.filter((item) => item.status !== "declined");

  // Calculate total head count: singles = 1, couples = 2
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

  // Table estimation (assuming 10 people per table)
  elements.statTables.textContent = Math.ceil(totalHeadCount / 10);
}

function renderCharts(list) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = Array(7).fill(0);
  list.forEach((entry) => {
    const date = entry.timestamp?.toDate
      ? entry.timestamp.toDate()
      : new Date(entry.timestamp || Date.now());
    const day = date.getDay();
    data[(day + 6) % 7] += 1;
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
      let statusBadge = "";
      if (item.status === "declined") {
        statusBadge =
          '<span class="rounded-full px-2.5 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-100 ml-2">Declined</span>';
      } else {
        statusBadge =
          '<span class="rounded-full px-2.5 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100 ml-2">Attending</span>';
      }

      let checkInBadge = item.checkedIn
        ? '<span class="rounded-full px-2.5 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200 ml-2 border border-indigo-200 dark:border-indigo-500/30"><i data-lucide="check" class="w-3 h-3 inline"></i> Arrived</span>'
        : "";

      return `
    <tr>
      <td class="px-4 py-3"><div class="font-semibold text-slate-800 dark:text-slate-100 flex items-center">${item.displayName || "Guest"} ${statusBadge} ${checkInBadge}</div><div class="text-xs text-slate-500 dark:text-slate-300 mt-1">${item.name2 ? `${item.name1} & ${item.name2}` : item.name1 || ""}</div></td>
      <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs ${item.type === "couple" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-100" : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-100"}">${item.type === "couple" ? "Couple" : "Single"}</span></td>
      <td class="px-4 py-3 text-slate-500 dark:text-slate-300">${formatDate(item.timestamp)}</td>
      <td class="px-4 py-3 text-right"><button data-action="checkin" data-id="${item.id}" class="mr-2 rounded-xl border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10 ${item.checkedIn || item.status === "declined" ? "opacity-50 cursor-not-allowed" : ""}" ${item.checkedIn || item.status === "declined" ? "disabled" : ""}>Check In</button><button data-action="edit" data-id="${item.id}" class="mr-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit</button><button data-action="delete" data-id="${item.id}" class="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10">Delete</button></td>
    </tr>
  `;
    })
    .join("");

  lucide.createIcons();

  const buttons = [];
  for (let i = 1; i <= totalPages; i += 1) {
    buttons.push(
      `<button data-page="${i}" class="rounded-xl border px-3 py-1.5 text-sm ${i === currentPage ? "border-amber-400 bg-amber-500 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}">${i}</button>`,
    );
  }
  elements.pagination.innerHTML = buttons.join("");
}

function render() {
  renderStats(allRsvps);
  renderCharts(allRsvps);
  renderTable(allRsvps);
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

function startQrScanner() {
  elements.scannerModal.classList.remove("hidden");
  elements.scannerModal.classList.add("flex");

  if (!html5QrcodeScanner) {
    html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );
  }

  elements.scannerResult.classList.add("hidden");
  elements.scannerResult.textContent = "";

  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

async function onScanSuccess(decodedText, decodedResult) {
  // decodedText should be the RSVP document ID
  html5QrcodeScanner.clear();

  const guest = allRsvps.find((r) => r.id === decodedText);
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
      } catch (err) {
        elements.scannerResult.innerHTML = `<p class="text-red-600">Failed to check in. Error occurred.</p>`;
      }
    }
  } else {
    elements.scannerResult.innerHTML = `<i data-lucide="x-circle" class="w-6 h-6 mx-auto mb-2 text-red-500"></i><p class="text-red-600">Invalid QR Code. Guest not found.</p>`;
  }
  lucide.createIcons();
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning
}

function stopQrScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear();
  }
  elements.scannerModal.classList.add("hidden");
  elements.scannerModal.classList.remove("flex");
}

function attachEvents() {
  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      elements.loginError.classList.add("hidden");
    } catch (error) {
      console.error(error);
      elements.loginError.classList.remove("hidden");
    }
  });

  elements.logoutBtn.addEventListener("click", () => signOut(auth));
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
    const updated = {
      displayName: elements.editName.value.trim(),
      type: elements.editType.value,
      name1: elements.editName.value.trim(),
    };
    try {
      await updateDoc(doc(db, "rsvps", id), updated);
      closeEditModal();
      showToast("RSVP updated successfully", "success");
    } catch (error) {
      showToast("Unable to update RSVP", "error");
    }
  });

  elements.dashboardForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.loading.classList.remove("hidden");
    elements.successMsg.classList.add("hidden");
    elements.errorMsg.classList.add("hidden");
    try {
      await setDoc(docRef, {
        groomName: document.getElementById("groomName").value,
        brideName: document.getElementById("brideName").value,
        eventDate: document.getElementById("eventDate").value,
        location: document.getElementById("location").value,
        timeMorning: document.getElementById("timeMorning").value,
        timeEvening: document.getElementById("timeEvening").value,
        mapUrl: document.getElementById("mapUrl").value,
      });
      elements.loading.classList.add("hidden");
      elements.successMsg.classList.remove("hidden");
      setTimeout(() => elements.successMsg.classList.add("hidden"), 2500);
      showToast("Wedding details saved", "success");
    } catch (error) {
      elements.loading.classList.add("hidden");
      elements.errorMsg.classList.remove("hidden");
      showToast("Unable to save details", "error");
    }
  });

  elements.btnScanQr.addEventListener("click", startQrScanner);
  elements.closeScannerModal.addEventListener("click", stopQrScanner);
  elements.scannerModal.addEventListener("click", (event) => {
    if (event.target === elements.scannerModal) stopQrScanner();
  });

  elements.btnAddEvent.addEventListener("click", () => openEventModal());
  elements.closeEventModal.addEventListener("click", closeEventModal);
  elements.eventModal.addEventListener("click", (event) => {
    if (event.target === elements.eventModal) closeEventModal();
  });

  elements.eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const eventId = elements.eventId.value;
    const data = {
      title: elements.eventTitle.value.trim(),
      time: elements.eventTime.value.trim(),
      description: elements.eventDesc.value.trim(),
      icon: elements.eventIcon.value.trim() || "flower-2",
      order: allEvents.length,
    };

    try {
      if (eventId) {
        await updateDoc(doc(db, "events", eventId), data);
        showToast("កម្មវិធីបានកែប្រែដោយជោគជ័យ", "success");
      } else {
        await addDoc(eventsRef, data);
        showToast("កម្មវិធីបានបន្ថែមដោយជោគជ័យ", "success");
      }
      closeEventModal();
    } catch (error) {
      showToast("មិនអាចរក្សាទុកកម្មវិធីបានទេ", "error");
    }
  });

  elements.eventsContainer.addEventListener("click", async (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (!action || !id) return;

    if (action === "edit-event") {
      const eventData = allEvents.find((e) => e.id === id);
      if (eventData) openEventModal(eventData);
    } else if (action === "delete-event") {
      if (!window.confirm("លុបកម្មវិធីនេះ?")) return;
      try {
        await deleteDoc(doc(db, "events", id));
        showToast("កម្មវិធីបានលុបដោយជោគជ័យ", "success");
      } catch (error) {
        showToast("មិនអាចលុបកម្មវិធីបានទេ", "error");
      }
    }
  });
}

function closeEditModal() {
  elements.editModal.classList.add("hidden");
  elements.editModal.classList.remove("flex");
}

function closeEventModal() {
  elements.eventModal.classList.add("hidden");
  elements.eventModal.classList.remove("flex");
  elements.eventForm.reset();
  elements.eventId.value = "";
  elements.eventModalTitle.textContent = "បន្ថែមកម្មវិធី";
}

function openEventModal(eventData = null) {
  if (eventData) {
    elements.eventId.value = eventData.id;
    elements.eventTitle.value = eventData.title;
    elements.eventTime.value = eventData.time;
    elements.eventDesc.value = eventData.description;
    elements.eventIcon.value = eventData.icon || "flower-2";
    elements.eventModalTitle.textContent = "កែប្រែកម្មវិធី";
  } else {
    elements.eventForm.reset();
    elements.eventId.value = "";
    elements.eventIcon.value = "flower-2";
    elements.eventModalTitle.textContent = "បន្ថែមកម្មវិធី";
  }
  elements.eventModal.classList.remove("hidden");
  elements.eventModal.classList.add("flex");
}

async function renderEvents() {
  const container = elements.eventsContainer;
  if (!allEvents || allEvents.length === 0) {
    container.innerHTML =
      '<div class="col-span-full text-center text-slate-500 py-8">មិនមានកម្មវិធីទេ</div>';
    return;
  }

  const sorted = [...allEvents].sort((a, b) => {
    const timeA = a.time ? parseInt(a.time.match(/\d+/)?.[0] || 0) : 0;
    const timeB = b.time ? parseInt(b.time.match(/\d+/)?.[0] || 0) : 0;
    return timeA - timeB;
  });

  container.innerHTML = sorted
    .map(
      (event, idx) => `
    <div class="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-md hover:shadow-lg transition">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20">
            <i data-lucide="${event.icon || "flower-2"}" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">${event.title}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">${event.time}</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">#${idx + 1}</span>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">${event.description}</p>
      <div class="flex gap-2">
        <button data-action="edit-event" data-id="${event.id}" class="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30">កែប្រែ</button>
        <button data-action="delete-event" data-id="${event.id}" class="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30">លុប</button>
      </div>
    </div>
  `,
    )
    .join("");

  lucide.createIcons();
}

function listenToEvents() {
  const q = query(eventsRef, orderBy("order", "asc"));
  unsubscribeEvents = onSnapshot(q, (snapshot) => {
    allEvents = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    renderEvents();
  });
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "wedding-theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
}

function applyTheme() {
  const saved = localStorage.getItem("wedding-theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    elements.loginSection.classList.add("hidden");
    elements.dashboardSection.classList.remove("hidden");
    loadWeddingDetails();
    listenToRsvps();
    listenToEvents();
    showToast("Welcome back, admin!", "success");
  } else {
    elements.loginSection.classList.remove("hidden");
    elements.dashboardSection.classList.add("hidden");
    if (unsubscribeRsvps) unsubscribeRsvps();
    unsubscribeRsvps = null;
    if (unsubscribeEvents) unsubscribeEvents();
    unsubscribeEvents = null;
  }
});

lucide.createIcons();
applyTheme();
attachEvents();
