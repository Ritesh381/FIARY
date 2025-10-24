const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY
});

async function callModel(prompt) {
  try {
    console.log(prompt)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
console.log("\n\n\n")
console.log(response.text)
console.log("\n\n\n")
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
    console.error("Error parsing JSON from AI response:", error);
    throw new Error("Failed to parse AI response as JSON.");
  }
}

module.exports = callModel;