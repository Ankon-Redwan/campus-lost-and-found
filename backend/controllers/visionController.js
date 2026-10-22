const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "একটি ছবি আপলোড করা আবশ্যক।" });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Temp file Cleanup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const prompt =
      'Analyze this image for a Campus Lost and Found system. Extract details and return ONLY a JSON object with this structure: {"primaryLabel": "Short Item Name", "labels": ["Tag1", "Tag2", "Tag3"], "description": "Detailed visual description of the item including color, brand, condition, and notable features."}';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text);

    res.status(200).json({
      success: true,
      labels: parsedData.labels || [],
      primaryLabel: parsedData.primaryLabel || "",
      description: parsedData.description || "",
    });
  } catch (error) {
    console.error("Gemini Vision Error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "AI দিয়ে ছবি বিশ্লেষণ করতে ব্যর্থ হয়েছে: " + error.message,
    });
  }
};
