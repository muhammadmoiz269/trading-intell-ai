"use client";
import React, { useState } from "react";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// AIzaSyDEUE8_DTO512V1d9VF_1N7bjs12kaGc9A
// const openai = new OpenAI({
//   dangerouslyAllowBrowser: true,
//   apiKey:
//     "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",
// });

const genAI = new GoogleGenerativeAI("AIzaSyDEUE8_DTO512V1d9VF_1N7bjs12kaGc9A");

const ImageGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=" +
        "AIzaSyDEUE8_DTO512V1d9VF_1N7bjs12kaGc9A",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `Create an image based on: ${prompt}` }],
            },
          ],
        }),
      }
    );

    const result = await response.json();
    console.log(result);

    const b64 = result?.candidates?.[0]?.content?.parts?.[1]?.inlineData?.data;
    console.log("b64", b64);

    if (b64) {
      const url = `data:image/png;base64,${b64}`;
      setImageUrl(url);
    } else {
      console.error("No image found in response", result);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 space-y-6">
      {/* Image Display */}
      <div className="w-80 h-80 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated"
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="text-gray-400 text-sm">No image generated yet</p>
        )}
      </div>

      {/* Prompt Input */}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your image prompt..."
        className="w-80 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 shadow-sm"
      />

      {/* Generate Button */}
      <button
        onClick={handleGenerateImage}
        disabled={loading || !prompt}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
    </div>
  );
};

export default ImageGeneration;
