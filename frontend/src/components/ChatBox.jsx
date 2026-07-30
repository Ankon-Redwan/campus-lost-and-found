import React, { useState, useEffect } from "react";

export default function ChatBox({ itemId, currentUserEmail }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // মেসেজ লোড করার ফাংশন
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `https://campus-lost-and-found-kijc.onrender.com/api/messages/${itemId}`,
      );
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // প্রতি ৩ সেকেন্ড পরপর নতুন মেসেজ আছে কিনা চেক করবে (Polling)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [itemId]);

  // মেসেজ সেন্ড করার ফাংশন
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserEmail) {
      alert("মেসেজ পাঠাতে অনুগ্রহ করে ইমেইল দিন!");
      return;
    }

    try {
      const res = await fetch(
        "https://campus-lost-and-found-kijc.onrender.com/api/messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: itemId,
            senderEmail: currentUserEmail,
            text: newMessage,
          }),
        },
      );

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl mt-4">
      <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
        💬 Anonymous Live Chat
      </h3>

      {/* মেসেজ লিস্ট এলাকা */}
      <div className="h-60 overflow-y-auto bg-slate-950 p-3 rounded-lg flex flex-col gap-2 border border-slate-800">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-500 text-center my-auto">
            এখনও কোনো কথা হয়নি। প্রথম মেসেজটি আপনি পাঠান!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === currentUserEmail;
            return (
              <div
                key={msg._id}
                className={`max-w-[80%] p-2.5 rounded-xl text-xs ${
                  isMe
                    ? "bg-cyan-600 text-white ml-auto rounded-br-none"
                    : "bg-slate-800 text-slate-200 mr-auto rounded-bl-none border border-slate-700"
                }`}
              >
                <p className="font-semibold text-[10px] opacity-75 mb-0.5">
                  {isMe ? "You" : msg.senderEmail.split("@")[0]}
                </p>
                <p className="text-sm">{msg.text}</p>
              </div>
            );
          })
        )}
      </div>

      {/* মেসেজ টাইপ করার ইনপুট বক্স */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="মেসেজ লিখুন..."
          className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}
