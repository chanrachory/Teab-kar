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
} from "./firebase-config.js";

const docRef = doc(db, "wedding", "details");
const rsvpRef = collection(db, "rsvps");

let allRsvps = [];
let filteredRsvps = [];
let currentPage = 1;
const rowsPerPage = 7;
let dailyChart;
let typeChart;
let unsubscribeRsvps = null;

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
};

function showToast(message, tone = "info") {
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

function countByType(list, type) {
  return list.filter((item) => item.type === type).length;
}

function renderStats(list) {
  elements.statTotal.textContent = list.length;
  elements.statCouple.textContent = countByType(list, "couple");
  elements.statSingle.textContent = countByType(list, "single");
  elements.statToday.textContent = list.filter((item) => isToday(item.timestamp)).length;
}

function renderCharts(list) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = Array(7).fill(0);
  list.forEach((entry) => {
    const date = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp || Date.now());
    const day = date.getDay();
    data[(day + 6) % 7] += 1;
  });

  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(document.getElementById("dailyChart"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Daily RSVPs", data, backgroundColor: "rgba(245, 158, 11, 0.7)", borderColor: "#f59e0b", borderWidth: 1 }] },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });

  if (typeChart) typeChart.destroy();
  typeChart = new Chart(document.getElementById("typeChart"), {
    type: "doughnut",
    data: {
      labels: ["Couple", "Single"],
      datasets: [{ data: [countByType(list, "couple"), countByType(list, "single")], backgroundColor: ["#f59e0b", "#3b82f6"] }],
    },
    options: { responsive: true },
  });
}

function renderTable(list) {
  const search = (elements.guestSearch.value || "").toLowerCase();
  const typeFilter = elements.guestFilter.value || "all";
  const filtered = list.filter((item) => {
    const matchesSearch = item.displayName?.toLowerCase().includes(search) || item.name1?.toLowerCase().includes(search);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  filteredRsvps = filtered;
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;
  const pageItems = filtered.slice(start, start + rowsPerPage);

  if (!pageItems.length) {
    elements.guestTableBody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">No RSVP records are available yet.</td></tr>';
    elements.pagination.innerHTML = "";
    return;
  }

  elements.guestTableBody.innerHTML = pageItems.map((item) => `
    <tr>
      <td class="px-4 py-3"><div class="font-semibold text-slate-800 dark:text-slate-100">${item.displayName || "Guest"}</div><div class="text-xs text-slate-500 dark:text-slate-300">${item.name2 ? `${item.name1} & ${item.name2}` : item.name1 || ""}</div></td>
      <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs ${item.type === "couple" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-100" : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-100"}">${item.type === "couple" ? "Couple" : "Single"}</span></td>
      <td class="px-4 py-3 text-slate-500 dark:text-slate-300">${formatDate(item.timestamp)}</td>
      <td class="px-4 py-3 text-right"><button data-action="edit" data-id="${item.id}" class="mr-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit</button><button data-action="delete" data-id="${item.id}" class="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10">Delete</button></td>
    </tr>
  `).join("");

  const buttons = [];
  for (let i = 1; i <= totalPages; i += 1) {
    buttons.push(`<button data-page="${i}" class="rounded-xl border px-3 py-1.5 text-sm ${i === currentPage ? "border-amber-400 bg-amber-500 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}">${i}</button>`);
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
}

function closeEditModal() {
  elements.editModal.classList.add("hidden");
  elements.editModal.classList.remove("flex");
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("wedding-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
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
    showToast("Welcome back, admin!", "success");
  } else {
    elements.loginSection.classList.remove("hidden");
    elements.dashboardSection.classList.add("hidden");
    if (unsubscribeRsvps) unsubscribeRsvps();
    unsubscribeRsvps = null;
  }
});

lucide.createIcons();
applyTheme();
attachEvents();
