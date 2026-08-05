import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";
import Benchmark from "./pages/Benchmark";

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated background */}
      <div className="aura-bg" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/benchmark" element={<Benchmark />} />
      </Routes>
    </BrowserRouter>
  );
}
