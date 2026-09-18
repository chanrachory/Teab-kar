import React, { useState, useEffect } from "react";
import {
  auth,
  onAuthStateChanged,
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "../firebase/config";
import jsPDF from "jspdf";
import "jspdf-autotable";

import LoginForm from "../components/Dashboard/LoginForm";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import StatCards from "../components/Dashboard/StatCards";
import RsvpTable from "../components/Dashboard/RsvpTable";
import EditRsvpModal from "../components/Dashboard/EditRsvpModal";
import AnalyticsCharts from "../components/Dashboard/AnalyticsCharts";
import DetailsEditor from "../components/Dashboard/DetailsEditor";
import TimelineEditor from "../components/Dashboard/TimelineEditor";
import Toast from "../components/Invitation/Toast";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'guests' | 'timeline' | 'settings'

  const [rsvps, setRsvps] = useState([]);
  const [events, setEvents] = useState([]);
  const [weddingDetails, setWeddingDetails] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        showToast("Welcome back, admin!", "success");
      }
    });
    return () => unsubscribe();
  }, []);

  // Theme Initializer & Toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem("wedding-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("wedding-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("wedding-theme", "light");
      }
      return next;
    });
  };

  // Listen to RSVPs collection
  useEffect(() => {
    if (!user) return;
    const rsvpRef = collection(db, "rsvps");
    const q = query(rsvpRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setRsvps(list);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to Events collection
  useEffect(() => {
    if (!user) return;
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setEvents(list);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to Wedding Details
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "wedding", "details");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setWeddingDetails(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [user]);

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      const d = value.toDate ? value.toDate() : new Date(value);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(value);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Guest Name", "Type", "Status", "RSVP Date"];
    const rows = rsvps.map((item) => [
      `"${item.displayName || ""}"`,
      item.type === "couple" ? "Couple" : "Single",
      item.status === "declined" ? "Declined" : "Attending",
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
      `guest_list_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Exported successfully", "success");
  };

  // Export PDF
  const handleExportPDF = () => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.text("Wedding Guest List", 14, 20);
    pdfDoc.setFontSize(10);
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.text(`Total Guests: ${rsvps.length}`, 14, 28);
    pdfDoc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

    const tableColumn = ["Name", "Type", "Status", "Date"];
    const tableRows = rsvps.map((item) => [
      item.displayName || "",
      item.type === "couple" ? "Couple" : "Single",
      item.status === "declined" ? "Declined" : "Attending",
      formatDate(item.timestamp),
    ]);

    pdfDoc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [245, 158, 11] },
    });

    pdfDoc.save(`guest_list_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast("PDF Exported successfully", "success");
  };

  const handleSaveEdit = async (id, updatedFields) => {
    try {
      await updateDoc(doc(db, "rsvps", id), updatedFields);
      showToast("RSVP updated successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Unable to update RSVP", "error");
    }
  };

  const handleDeleteRsvp = async (id) => {
    if (!window.confirm("Delete this RSVP record?")) return;
    try {
      await deleteDoc(doc(db, "rsvps", id));
      showToast("RSVP deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Unable to delete RSVP", "error");
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-kantumruy">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm showToast={showToast} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT SIDEBAR NAVBAR */}
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 w-full">
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === "overview" && (
            <div className="space-y-6 fade-in">
              {/* Overview Welcome Banner */}
              <div className="rounded-3xl border border-white/60 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-600/5 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold">
                      Live Dashboard Status
                    </p>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    សួស្តី Admin! ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងអាពាហ៍ពិពាហ៍
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    តាមដានវត្តមានភ្ញៀវ ទិន្នន័យ RSVP និងដំណើរការនៃការរៀបចំកម្មវិធីក្នុងពេលជាក់ស្តែង។
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">ភ្ញៀវបញ្ជាក់វត្តមាន</p>
                    <p className="text-xl font-bold text-amber-500">
                      {rsvps.filter((r) => r.status !== "declined").length} RSVPs
                    </p>
                  </div>
                </div>
              </div>

              <StatCards rsvps={rsvps} />
              <AnalyticsCharts rsvps={rsvps} />
            </div>
          )}

          {/* TAB 2: GUESTS RSVP LIST & LINK GENERATOR */}
          {activeTab === "guests" && (
            <div className="space-y-6 fade-in">
              <StatCards rsvps={rsvps} />
              <RsvpTable
                rsvps={rsvps}
                onEdit={(item) => setEditingItem(item)}
                onDelete={handleDeleteRsvp}
                formatDate={formatDate}
                showToast={showToast}
              />
            </div>
          )}

          {/* TAB 3: TIMELINE SCHEDULE */}
          {activeTab === "timeline" && (
            <div className="fade-in">
              <TimelineEditor events={events} showToast={showToast} />
            </div>
          )}

          {/* TAB 4: WEDDING SETTINGS & MEDIA */}
          {activeTab === "settings" && (
            <div className="fade-in">
              <DetailsEditor weddingDetails={weddingDetails} showToast={showToast} />
            </div>
          )}
        </main>
      </div>

      {/* Edit RSVP Modal */}
      {editingItem && (
        <EditRsvpModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
