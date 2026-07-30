import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ডাটাবেজ থেকে ডাটা লোড করার ফাংশন
  const fetchItems = async () => {
    try {
      const res = await fetch(
        "https://campus-lost-and-found-kijc.onrender.com/api/items",
      );
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 🗑️ ডিলিট করার ফাংশন
  const handleDelete = async (id) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই নোটিশটি ডিলিট করতে চান? 😮")) {
      try {
        const res = await fetch(
          `https://campus-lost-and-found-kijc.onrender.com/api/items/${id}`,
          {
            method: "DELETE",
          },
        );
        if (res.ok) {
          alert("নোটিশটি সফলভাবে ডিলিট করা হয়েছে! 🗑️");
          fetchItems(); // লিস্ট রিফ্রেশ করার জন্য
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // 🔄 স্ট্যাটাস Resolved করার ফাংশন
  const handleResolve = async (id) => {
    try {
      const res = await fetch(
        `https://campus-lost-and-found-kijc.onrender.com/api/items/${id}`,
        {
          method: "PUT",
        },
      );
      if (res.ok) {
        alert("অভিনন্দন! জিনিসটি সফলভাবে ওনারের কাছে ফিরে এসেছে। 🎉");
        fetchItems(); // লিস্ট রিফ্রেশ করার জন্য
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* প্রোফাইল সেকশন */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl text-center py-8 mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto flex items-center justify-center text-2xl mb-3 shadow-lg">
          👨‍🎓
        </div>
        <h2 className="text-2xl font-black text-white">Student Dashboard 📊</h2>
        <p className="text-slate-400 text-xs mt-1">
          আপনার দেওয়া নোটিশগুলো এখান থেকে কন্ট্রোল করুন
        </p>
      </div>

      {/* নোটিশ লিস্ট সেকশন */}
      <div>
        <h3 className="text-xl font-black text-slate-200 mb-6 uppercase tracking-wider">
          আমার সক্রিয় নোটিশসমূহ
        </h3>

        {loading ? (
          <div className="text-center p-10 text-cyan-400">লোড হচ্ছে...⏳</div>
        ) : items.length === 0 ? (
          <div className="text-center p-12 bg-white/5 rounded-3xl text-slate-500 border border-dashed border-white/10">
            কোনো নোটিশ খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div
                key={item._id || index}
                className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition-all"
                style={{
                  borderLeft: `4px solid ${item.status === "Lost" ? "#f43f5e" : item.status === "Found" ? "#10b981" : "#a855f7"}`,
                }}
              >
                <div>
                  <div className="flex justify-between mb-2">
                    <span
                      className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded uppercase ${item.status === "Lost" ? "text-rose-400 bg-rose-500/10" : item.status === "Found" ? "text-emerald-400 bg-emerald-500/10" : "text-purple-400 bg-purple-500/10"}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* 💬 অ্যানোনিমাস লাইভ চ্যাট বক্স সেকশন */}
                  <ChatBox
                    itemId={item._id}
                    currentUserEmail={item.contactEmail || "user@gmail.com"}
                  />
                </div>

                {/* অ্যাকশন বাটন সমূহ */}
                <div className="border-t border-white/5 pt-3 mt-4 flex gap-2">
                  {item.status !== "Resolved" && (
                    <button
                      onClick={() => handleResolve(item._id)}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                    >
                      ✅ Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
