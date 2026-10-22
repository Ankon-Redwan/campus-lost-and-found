const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeImage } = require("../controllers/visionController");

// Multer Storage Setup
const upload = multer({ dest: "uploads/" });

// POST /api/vision/analyze-image
router.post("/analyze-image", upload.single("image"), analyzeImage);

module.exports = router;
