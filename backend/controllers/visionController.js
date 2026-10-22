const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res
        .status(400)
        .json({ success: false, error: "Image data is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this image for a Campus Lost and Found system. Extract details and return ONLY a JSON object with this structure: {"title": "Short Item Name", "category": "One of: Electronics, Documents, Clothing, Keys, Others", "description": "Detailed visual description of the item including color, brand, condition, and notable features."}',
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    return res.status(200).json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Vision AI Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to analyze image with AI" });
  }
};
