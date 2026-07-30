import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import ReportItem from "./pages/ReportItem";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

const DIU_CENTER = [23.937, 90.267];

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Protected Route Component: লগইন না থাকলে সিস্টেমের কোনো ফিচারেই ঢুকতে দেবে না
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function NavigationBar({ user, handleLogout }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <motion.div className="text-center mb-8">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide">
          Daffodil Lost and Found System 🔍
        </h1>
      </motion.div>
    );
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex flex-col sm:flex-row justify-between items-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 mb-10 shadow-lg gap-4">
      <Link
        to="/"
        className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500"
      >
        Daffodil Lost and Found System 🔍
      </Link>
      <div className="flex gap-5 text-xs font-black uppercase tracking-widest items-center">
        <Link
          to="/"
          className={`transition-colors ${
            isActive("/")
              ? "text-cyan-400"
              : "text-slate-300 hover:text-cyan-400"
          }`}
        >
          Home
        </Link>

        <Link
          to="/report"
          className={`transition-colors ${
            isActive("/report")
              ? "text-cyan-400"
              : "text-slate-300 hover:text-cyan-400"
          }`}
        >
          Report Item 📝
        </Link>

        <Link
          to="/dashboard"
          className={`transition-colors ${
            isActive("/dashboard")
              ? "text-cyan-400"
              : "text-slate-300 hover:text-cyan-400"
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/about"
          className={`transition-colors ${
            isActive("/about")
              ? "text-cyan-400"
              : "text-slate-300 hover:text-cyan-400"
          }`}
        >
          About
        </Link>

        {user && (
          <div className="flex items-center gap-3 bg-white/5 pl-3 pr-1 py-1 rounded-xl border border-white/10">
            <span className="text-[10px] text-cyan-400 lowercase font-normal">
              @{user.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Logout 👋
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function HomePageContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://campus-lost-and-found-kijc.onrender.com/api/items",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const lostCount = items.filter((item) => item.status === "Lost").length;
  const recoveredCount = items.filter(
    (item) => item.status === "Found" || item.status === "Resolved",
  ).length;

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getImageUrl = (item) => {
    const path = item?.imageUrl || item?.image || item?.img;

    if (!path)
      return "https://placehold.co/600x600/0f172a/22d3ee?text=No+Image";
    if (path.startsWith("http")) return path;

    const safePath = path.startsWith("/") ? path : `/${path}`;
    return `https://campus-lost-and-found-kijc.onrender.com${safePath}`;
  };

  return (
    <>
      {/* লাইভ অ্যাক্টিভিটি ম্যাপ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5 mb-10 shadow-2xl"
      >
        <h2 className="text-lg font-black text-center mb-4 text-cyan-400 tracking-wide uppercase flex items-center justify-center gap-2">
          📡 Live Campus Activity Map (Lost vs Found)
        </h2>
        <div className="w-full h-80 rounded-2xl overflow-hidden border border-white/5 shadow-inner relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-cyan-400 animate-pulse bg-slate-950/50">
              Loading Map...⏳
            </div>
          ) : (
            <MapContainer
              center={DIU_CENTER}
              zoom={15}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              />
              {items.map((item, index) => {
                if (!item.location || !item.location.includes(",")) return null;
                const coords = item.location.split(",").map(Number);
                if (isNaN(coords[0]) || isNaN(coords[1])) return null;

                return (
                  <Marker
                    key={item._id || index}
                    position={coords}
                    icon={item.status === "Lost" ? redIcon : greenIcon}
                  >
                    <Popup>
                      <div className="text-slate-900 p-1 font-sans">
                        <h4 className="font-extrabold text-sm mb-1 text-indigo-950">
                          {item.title}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 font-bold rounded-full text-white ${
                            item.status === "Lost"
                              ? "bg-rose-500"
                              : "bg-emerald-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </motion.div>

      {/* ওয়ান-ক্লিক স্ট্যাটাস বার */}
      <div className="bg-white/5 backdrop-blur-xl py-4 px-6 rounded-3xl mb-10 border border-white/10 max-w-6xl mx-auto grid grid-cols-2 gap-6">
        <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 text-center">
          <p className="text-2xl font-black text-rose-500">{lostCount}</p>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Lost Items
          </p>
        </div>
        <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 text-center">
          <p className="text-2xl font-black text-emerald-500">
            {recoveredCount}
          </p>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Recovered
          </p>
        </div>
      </div>

      {/* ই-কমার্স সার্চ ও ফিল্টার */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl mb-10 border border-white/10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-wide">
              📦 ক্যাম্পাস ক্যাটালগ
            </h2>
            <p className="text-xs text-slate-400">
              আপনার হারিয়ে যাওয়া বা খুঁজে পাওয়া জিনিসটি গ্যালারি থেকে ফিল্টার
              করুন
            </p>
          </div>
          <input
            type="text"
            placeholder="🔍 সার্চ করুন (যেমন: HP Laptop, Wallet)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 rounded-xl border border-white/10 p-3 bg-slate-900/60 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 border-t border-white/5 pt-4">
          {[
            { id: "All", label: "All Products 🌐" },
            { id: "Electronics", label: "Electronics 💻" },
            { id: "Documents", label: "Documents 📄" },
            { id: "Clothing", label: "Clothing 👕" },
            { id: "Keys", label: "Keys 🔑" },
            { id: "Others", label: "Others 📦" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase border transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 scale-105 border-transparent"
                  : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* গ্যালারি গ্রিড */}
      <div>
        {loading ? (
          <div className="text-center p-20 text-cyan-400 animate-pulse font-mono tracking-widest">
            LOADING CATALOG...⏳
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center p-16 bg-white/5 border border-white/5 rounded-3xl text-slate-400 font-medium">
            ক্যাটালগে কোনো পণ্য বা নোটিশ খুঁজে পাওয়া যায়নি! 📥
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id || index}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedItemDetails(item)}
                className="group bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl cursor-pointer hover:border-cyan-500/40 transition-all duration-300 relative"
              >
                <div className="w-full h-48 bg-slate-950/80 overflow-hidden relative border-b border-white/5 flex items-center justify-center">
                  <span
                    className={`absolute top-3 left-3 z-10 text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-lg text-white shadow-lg ${
                      item.status === "Lost" ? "bg-rose-600" : "bg-emerald-600"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="absolute top-3 right-3 z-10 text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-black/60 text-slate-300 backdrop-blur-sm">
                    {item.category}
                  </span>

                  {item.imageUrl || item.image || item.img ? (
                    <img
                      src={getImageUrl(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/600x600/0f172a/22d3ee?text=Image+Not+Found";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        No Preview Available
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      Quick View / কুইক ভিউ ⚡
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">
                      📍 Pinned Location
                    </span>
                    <span className="text-cyan-400 font-bold group-hover:underline">
                      Details →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* কুইক ভিউ মডাল */}
      <AnimatePresence>
        {selectedItemDetails && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 bg-black flex items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-white/10 relative">
                <span
                  className={`absolute top-4 left-4 z-10 text-xs uppercase tracking-widest font-black px-3 py-1 rounded-xl text-white shadow-xl ${
                    selectedItemDetails.status === "Lost"
                      ? "bg-rose-600"
                      : "bg-emerald-600"
                  }`}
                >
                  STATUS: {selectedItemDetails.status}
                </span>

                {selectedItemDetails.imageUrl ||
                selectedItemDetails.image ||
                selectedItemDetails.img ? (
                  <img
                    src={getImageUrl(selectedItemDetails)}
                    alt={selectedItemDetails.title}
                    className="w-full h-full object-contain max-h-[450px]"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/600x600/0f172a/22d3ee?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <span className="text-5xl text-slate-700">🖼️</span>
                )}
              </div>

              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase bg-cyan-500/10 text-cyan-400 font-black px-2.5 py-1 rounded-md border border-cyan-500/20">
                      {selectedItemDetails.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-wide border-b border-white/5 pb-2">
                    {selectedItemDetails.title}
                  </h3>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <strong>📋 বিবরণ:</strong>
                    <br />
                    {selectedItemDetails.description ||
                      "No description provided."}
                  </p>

                  <div className="text-xs text-slate-400 mb-4 font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-cyan-400 font-bold mb-1 text-[10px] uppercase tracking-wider">
                      📍 জিনিসের ম্যাপ লোকেশন:
                    </p>
                    <p className="text-[12px] text-slate-200 mb-2 capitalize">
                      {selectedItemDetails.location &&
                      selectedItemDetails.location.includes(",")
                        ? "DIU Campus Coordinates"
                        : selectedItemDetails.location || "Not Specified"}
                    </p>

                    {selectedItemDetails.location && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          selectedItemDetails.location,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all w-full justify-center shadow-md mt-1"
                      >
                        🧭 গেট ডিরেকশন (Google Maps Route) →
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    📩 ভেরিফাইড ইমেইলের মাধ্যমে যোগাযোগ করুন:
                  </p>
                  <p className="text-xs font-mono text-center text-slate-200 bg-slate-950 p-3 rounded-xl border border-white/5 break-all mb-3 select-all">
                    {selectedItemDetails.contactEmail}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedItemDetails.contactEmail,
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        copied
                          ? "bg-emerald-600 text-white"
                          : "bg-cyan-500 text-slate-950 hover:bg-cyan-600"
                      }`}
                    >
                      {copied ? "Copied! ✓" : "Copy Email 📋"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItemDetails(null);
                        setCopied(false);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 py-3 px-4 rounded-xl text-xs font-black uppercase border border-white/5 tracking-wider cursor-pointer"
                    >
                      Close / বন্ধ করুন
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // সম্পূর্ণ সেশন ডেটা মুছে ফেলবে
    setUser(null);
    alert("সফলভাবে লগ আউট হয়েছে! 👋");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-950 py-12 px-4 text-slate-100 antialiased">
      <div className="max-w-6xl mx-auto">
        <NavigationBar user={user} handleLogout={handleLogout} />
        <Routes>
          {/* পাবলিক পেজসমূহ (লগইন ও রেজিস্ট্রেশন) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* প্রটেক্টেড পেজসমূহ (লগইন ছাড়া ব্যবহার করা যাবে না) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePageContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />

          {/* ভুল কোনো ইউআরএলে গেলে রিডাইরেক্ট */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
