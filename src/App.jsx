import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Invitation from "./pages/Invitation";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Invitation />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
