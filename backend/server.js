const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const OpenAI = require("openai");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const visionRoutes = require("./routes/visionRoutes"); // 🟢 Google Vision Route Import
const connectDB = require("./config/db");

const app = express();

// 🟢 CORS Fix for Vercel & Live Frontend
app.use(
  cors({
    origin: "*", // Vercel ও Localhost উভয় জায়গা থেকে রিকোয়েস্ট অ্যালাউ করবে
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// OpenAI SDK Initialization (lazy - only used when API key is present)
let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Static uploads directory — serve from root uploads/ folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB Connection
connectDB();

// 🟢 Health check route (Render-এ ব্যাকএন্ড লাইভ আছে কিনা দেখার জন্য)
app.get("/", (req, res) => {
  res.send("Campus Lost & Found API Server is Running!");
});

// Mount route files (handles /api/auth/*, /api/items/* and /api/vision/*)
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/vision", visionRoutes); // 🟢 Google Vision Route Mounting

// Message Schema (kept here since it's only used by server.js inline routes)
const messageSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    senderEmail: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

// Multer Setup (used by AI route below)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 🤖 [AI ROUTE] - OpenAI GPT-4o Image Vision Analysis
app.post(
  "/api/ai/generate-description",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "একটি ছবি আপলোড করা আবশ্যক।" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res
          .status(500)
          .json({ error: ".env ফাইলে OPENAI_API_KEY পাওয়া যায়নি!" });
      }

      const aiClient = getOpenAI();
      if (!aiClient) {
        return res
          .status(500)
          .json({ error: "OpenAI client not initialized!" });
      }

      // Read image file and convert to Base64
      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = req.file.mimetype || "image/jpeg";

      const prompt = `You are an AI assistant for a Campus Lost & Found web application. 
Analyze the provided image and generate details for the item.
Return ONLY a valid JSON object without any markdown formatting or codeblocks.
The JSON structure MUST be strictly as follows:
{
  "title": "Short title in Bengali (e.g. একটি কলম / একটি বই)",
  "category": "Choose one strictly from: [Electronics, Wallet, ID Card, Books, Keys, Clothing, Bag, Accessories, Other]",
  "description": "A clear, helpful description in Bengali detailing color, condition, and notable features of the item visible in the image."
}`;

      // Call OpenAI GPT-4o Vision
      const response = await aiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      // Temp file Cleanup
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      const rawContent = response.choices[0].message.content;
      const parsedData = JSON.parse(rawContent);

      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      console.error("OpenAI Error Details:", error);
      res.status(500).json({
        error: "AI থেকে বর্ণনা তৈরি করতে সমস্যা হয়েছে: " + error.message,
      });
    }
  },
);

// 💬 [CHAT ROUTES]

// ১. নির্দিষ্ট কোনো আইটেমের চ্যাট মেসেজ পাওয়ার এপিআই
app.get("/api/messages/:itemId", async (req, res) => {
  try {
    const messages = await Message.find({ itemId: req.params.itemId }).sort({
      createdAt: 1,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "মেসেজ নিয়ে আসতে সমস্যা হয়েছে!" });
  }
});

// ২. নতুন চ্যাট মেসেজ পাঠানোর এপিআই
app.post("/api/messages", async (req, res) => {
  try {
    const { itemId, senderEmail, text } = req.body;
    if (!itemId || !senderEmail || !text) {
      return res.status(400).json({ error: "সব ফিল্ড পূরণ করুন!" });
    }

    const newMessage = new Message({ itemId, senderEmail, text });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Message save error:", error);
    res.status(500).json({ error: "মেসেজ পাঠাতে সমস্যা হয়েছে!" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});
