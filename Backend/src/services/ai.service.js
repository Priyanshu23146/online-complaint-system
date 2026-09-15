import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
// Ensure your .env file has GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const parseScheduleImage = async (mimeType, imageBuffer) => {
    try {
        // Using gemini-1.5-flash as it is super fast for multimodal parsing
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const prompt = `
      You are an expert data extraction assistant for a B2B SaaS platform (Apna Desk).
      Analyze the provided image (which could be a college timetable or a hospital shift roster).
      Extract the schedule and return a STRICT JSON array of objects. 
      Do NOT include markdown formatting like \`\`\`json or \`\`\`. Just return the raw JSON array.
      
      Each object in the array must follow this exact structure:
      [
        {
          "title": "Subject Name or Duty Name (e.g., Computer Networks, Morning ICU Shift)",
          "dayOfWeek": "Monday",
          "startTime": "10:00 AM",
          "endTime": "11:00 AM"
        }
      ]
    `;
        const imageParts = [
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType,
                },
            },
        ];
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        console.log("GEMINI KA ASLI JAWAB:", responseText);
        // Clean the response in case Gemini adds markdown codeblocks
        const cleanJsonString = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleanJsonString);
    }
    catch (error) {
        console.error("Gemini AI Parsing Error:", error);
        throw new Error("Failed to parse schedule from image");
    }
};
//# sourceMappingURL=ai.service.js.map