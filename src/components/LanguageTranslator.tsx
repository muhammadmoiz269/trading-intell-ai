"use client";
import React, { useState } from "react";
const apiKey = import.meta.env.VITE_GEMINI_KEY;
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(apiKey);

const LanguageTranslator: React.FC = () => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("urdu");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return alert("Please enter text to translate.");

    setLoading(true);
    setTranslatedText("");

    try {
      // 👇 You’ll replace this with your Gemini API call later
      // Example placeholder logic

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 5000,
        },
      });
      const prompt = `
      You are a professional translator. Follow these rules:
        1. Keep the translation accurate and natural.
        2. Do not add explanations, just translate.
      Translate the following text into ${language}: "${text}"
      `;
      const result = await model.generateContent(prompt);

      console.log("Res", result);
      const response = result.response.candidates[0]?.content?.parts[0]?.text;

      setTranslatedText(response || "Translation here...");
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Something went wrong while translating.");
    }

    setLoading(false);
  };

  const clear = () => {
    setText("");
    setTranslatedText("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-700">
        🌍 Language Translator
      </h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
        className="w-80 h-32 p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 resize-none"
      />

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-80 px-4 py-2 border border-gray-400 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
      >
        <option value="urdu">Urdu</option>
        <option value="german">German</option>
        <option value="french">French</option>
      </select>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        <button
          onClick={clear}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          {"Clear"}
        </button>
      </div>

      {translatedText && (
        <div className="w-80 p-3 border border-gray-300 rounded-lg bg-white shadow-sm text-gray-700">
          <p className="font-medium mb-1">Translated Text:</p>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default LanguageTranslator;
