const express = require("express");
const router = express.Router();
const { analyzeImage } = require("../controllers/visionController");

router.post("/analyze-image", analyzeImage);

module.exports = router;
