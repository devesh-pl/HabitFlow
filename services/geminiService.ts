import { GoogleGenAI, Type } from "@google/genai";
import { HabitStatus } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

interface ParsedHabitData {
  habitName: string;
  status: HabitStatus;
  date: string;
  confidence: number;
}

export const parseNaturalLanguageHabit = async (input: string): Promise<ParsedHabitData | null> => {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract habit details from the following user text: "${input}". 
      If the user says they did something, status is 'Done'. If they say they didn't do it or need to do it, status is 'Not Done'.
      Format the date as YYYY-MM-DD. Use today's date (${new Date().toISOString().split('T')[0]}) if not specified.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            habitName: {
              type: Type.STRING,
              description: "The concise name of the habit (e.g. 'Drink Water', 'Run 5k')",
            },
            status: {
              type: Type.STRING,
              enum: ["Done", "Not Done"],
              description: "Completion status of the habit",
            },
            date: {
              type: Type.STRING,
              description: "Date of the habit in YYYY-MM-DD format",
            },
            confidence: {
              type: Type.NUMBER,
              description: "A score from 0 to 1 indicating how confident the AI is that this is a valid habit entry.",
            }
          },
          required: ["habitName", "status", "date", "confidence"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ParsedHabitData;
      return data;
    }
    return null;

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw error;
  }
};

export const getHabitMotivation = async (habitName: string, status: HabitStatus): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user just tracked a habit: "${habitName}" with status "${status}". 
      Give a very short, punchy, 1-sentence motivation or reaction. 
      If 'Done', celebrate. If 'Not Done', encourage gently.`,
    });
    return response.text || "Keep going!";
  } catch (error) {
    return "Great job tracking your habits!";
  }
};