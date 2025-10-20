import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDEUE8_DTO512V1d9VF_1N7bjs12kaGc9A");

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
    });
    const prompt = "Write a funny poem about JavaScript developers.";
    const result = await model.generateContent(prompt);
    console.log("✅ Gemini response:\n", result.response.text());
  } catch (err) {
    console.error("❌ Gemini API error:", err);
  }
}

async function listModels() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: {
        "x-goog-api-key": "GEM_KEY",
      },
    }
  );

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

// listModels();

test();
