const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "একটি ছবি আপলোড করা আবশ্যক।" });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;

    // Temp File Cleanup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this image for a Campus Lost and Found system. Extract details and return ONLY a JSON object with this structure: {"primaryLabel": "Short Item Name", "labels": ["Tag1", "Tag2", "Tag3"], "description": "Detailed visual description of the item including color, brand, condition, and notable features."}',
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      success: true,
      labels: parsedData.labels || [],
      primaryLabel: parsedData.primaryLabel || "",
      description: parsedData.description || "",
    });
  } catch (error) {
    console.error("OpenAI Vision Error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "AI দিয়ে ছবি বিশ্লেষণ করতে ব্যর্থ হয়েছে: " + error.message,
    });
  }
};
