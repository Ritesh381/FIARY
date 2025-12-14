const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY
});

async function callModel(prompt) {
  try {
    console.log(`\n\n\n\n${prompt}\n\n\n\n`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const responseText = response.text;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonString = jsonMatch[1];
      const parsedData = JSON.parse(jsonString);
      return parsedData;
    } else {
      const parsedData = JSON.parse(responseText);
      return parsedData;
    }

  } catch (error) {
    // Check if it's a 529 error (model busy/overloaded)
    if (error.status === 529 || error.message?.includes('529')) {
      console.error("Gemini API error 529: Model is busy");
      throw new Error("Model Busy: The AI model is currently overloaded. Please try again in a moment.");
    }
    console.error("Error parsing JSON from AI response:", error);
    throw new Error("Failed to parse AI response as JSON.");
  }
}

module.exports = callModel;