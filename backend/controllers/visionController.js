const vision = require("@google-cloud/vision");

// Google Vision Client ইনিশিয়ালাইজ করা
const client = new vision.ImageAnnotatorClient();

const analyzeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is required" });
    }

    // Google Cloud Vision-এ ইমেজ অ্যানালাইসিস রিকোয়েস্ট পাঠানো
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations;

    if (!labels || labels.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No labels found for this image" });
    }

    // শুধু লেবেলের নামগুলো নিয়ে একটি অ্যারে বানানো
    const tags = labels.map((label) => label.description);

    res.status(200).json({
      success: true,
      suggestedTags: tags, // যেমন: ["Wallet", "Leather", "Red"]
      suggestedTitle: tags.slice(0, 2).join(" "), // প্রথম ২টা ট্যাগ দিয়ে টাইটেল আইডিয়া
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    res.status(500).json({
      success: false,
      message: "AI Analysis failed",
      error: error.message,
    });
  }
};

module.exports = { analyzeImage };
