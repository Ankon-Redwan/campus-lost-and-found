import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-20 h-10 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-500 ${
        isDark
          ? "bg-slate-900 border border-slate-700"
          : "bg-sky-200 border border-sky-300"
      }`}
    >
      {/* 🌙 / ☀️ আইকন ব্যাকগ্রাউন্ড */}
      <div className="absolute inset-0 flex justify-between items-center px-2.5 text-xs select-none">
        <span
          className={`transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-0"}`}
        >
          🌙
        </span>
        <span
          className={`transition-opacity duration-300 ${isDark ? "opacity-0" : "opacity-100"}`}
        >
          ☀️
        </span>
      </div>

      {/* 🔘 অ্যানিমেটেড নবা (Animated Knob) */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center z-10 ${
          isDark
            ? "bg-gradient-to-tr from-indigo-500 to-purple-600 border border-indigo-400"
            : "bg-amber-400 border border-amber-200"
        }`}
        animate={{
          x: isDark ? 0 : 40,
          rotate: isDark ? 0 : 360,
        }}
      >
        {isDark ? (
          <div className="w-2 h-2 rounded-full bg-indigo-200/40 -mt-2 -ml-2" />
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-amber-100/60" />
        )}
      </motion.div>
    </button>
  );
}
