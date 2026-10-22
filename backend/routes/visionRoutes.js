const express = require("express");
const router = express.Router();
const vision = require("@google-cloud/vision");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer Storage Setup
const upload = multer({ dest: "uploads/" });

// 🟢 1. Check & Set Google Vision Key Path (Local vs Render)
const renderSecretPath = "/etc/secrets/google_vision_key.json";
const localKeyPath = path.join(__dirname, "../google-vision-key.json");

let clientOptions = {};

if (fs.existsSync(renderSecretPath)) {
  console.log("Using Render Secret File Key Path");
  clientOptions.keyFilename = renderSecretPath;
} else if (fs.existsSync(localKeyPath)) {
  console.log("Using Local Key Path");
  clientOptions.keyFilename = localKeyPath;
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  clientOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

// 🟢 2. Initialize Google Cloud Vision Client
const client = new vision.ImageAnnotatorClient(clientOptions);

// 🟢 3. Route to Analyze Image
router.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "একটি ছবি আপলোড করা আবশ্যক।" });
    }

    const imagePath = req.file.path;

    // Label Detection with Google Vision API
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations;

    // Temp file Cleanup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    if (!labels || labels.length === 0) {
      return res
        .status(404)
        .json({ error: "ছবিতে কোনো অবজেক্ট সনাক্ত করা যায়নি।" });
    }

    // Extract detected label descriptions
    const detectedLabels = labels.map((label) => label.description);

    res.status(200).json({
      success: true,
      labels: detectedLabels,
      primaryLabel: detectedLabels[0] || "",
    });
  } catch (error) {
    console.error("Google Vision API Error:", error);

    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error:
        "Google Vision AI দিয়ে ছবি বিশ্লেষণ করতে ব্যর্থ হয়েছে: " +
        error.message,
    });
  }
});

module.exports = router;
