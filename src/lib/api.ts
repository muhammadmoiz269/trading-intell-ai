// API Integration utilities for Polygon and OpenAI

// Types
export interface PolygonStockData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
}

export interface OpenAIRecommendation {
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  priceTarget?: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

// Polygon API Integration
export class PolygonService {
  private apiKey: string;
  private baseUrl = "https://api.polygon.io";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getStockData(ticker: string): Promise<PolygonStockData> {
    try {
      // Get current quote
      const quoteResponse = await fetch(
        `${this.baseUrl}/v2/last/nbbo/${ticker}?apikey=${this.apiKey}`
      );
      
      // Get previous close
      const prevCloseResponse = await fetch(
        `${this.baseUrl}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apikey=${this.apiKey}`
      );

      if (!quoteResponse.ok || !prevCloseResponse.ok) {
        throw new Error(`Failed to fetch data for ${ticker}`);
      }

      const quoteData = await quoteResponse.json();
      const prevCloseData = await prevCloseResponse.json();

      const currentPrice = quoteData.results?.last?.price || 0;
      const previousClose = prevCloseData.results?.[0]?.c || 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose ? (change / previousClose) * 100 : 0;

      return {
        ticker: ticker.toUpperCase(),
        price: currentPrice,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: prevCloseData.results?.[0]?.v || 0,
        open: prevCloseData.results?.[0]?.o,
        high: prevCloseData.results?.[0]?.h,
        low: prevCloseData.results?.[0]?.l,
        previousClose,
      };
    } catch (error) {
      console.error("Polygon API Error:", error);
      throw new Error(`Failed to fetch stock data for ${ticker}`);
    }
  }
}

// OpenAI API Integration
export class OpenAIService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getStockRecommendation(stockData: PolygonStockData): Promise<OpenAIRecommendation> {
    try {
      const prompt = `
Analyze the following stock data and provide a recommendation:

Stock: ${stockData.ticker}
Current Price: $${stockData.price}
Change: ${stockData.change >= 0 ? "+" : ""}${stockData.change} (${stockData.changePercent >= 0 ? "+" : ""}${stockData.changePercent}%)
Volume: ${stockData.volume.toLocaleString()}
${stockData.open ? `Open: $${stockData.open}` : ""}
${stockData.high ? `High: $${stockData.high}` : ""}
${stockData.low ? `Low: $${stockData.low}` : ""}
${stockData.previousClose ? `Previous Close: $${stockData.previousClose}` : ""}

Please provide:
1. A recommendation (BUY, SELL, or HOLD)
2. Confidence level (60-100%)
3. Brief reasoning (2-3 sentences)
4. Risk level (LOW, MEDIUM, HIGH)
5. Price target (optional)

Format your response as JSON with the following structure:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": number,
  "reasoning": "string",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "priceTarget": number (optional)
}
`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional stock analyst providing investment recommendations based on market data. Always respond with valid JSON format."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      const recommendation = JSON.parse(content);
      
      // Validate the response structure
      if (!recommendation.recommendation || !recommendation.confidence || !recommendation.reasoning) {
        throw new Error("Invalid response format from OpenAI");
      }

      return {
        recommendation: recommendation.recommendation,
        confidence: Math.min(Math.max(recommendation.confidence, 60), 100), // Ensure 60-100 range
        reasoning: recommendation.reasoning,
        riskLevel: recommendation.riskLevel || "MEDIUM",
        priceTarget: recommendation.priceTarget,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate AI recommendation");
    }
  }
}

// Mock services for development/demo
export const createMockStockData = (ticker: string): PolygonStockData => {
  const basePrice = Math.random() * 500 + 50;
  const change = (Math.random() - 0.5) * 20;
  
  return {
    ticker: ticker.toUpperCase(),
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.random() * 1000000000000,
    open: parseFloat((basePrice * 0.98).toFixed(2)),
    high: parseFloat((basePrice * 1.05).toFixed(2)),
    low: parseFloat((basePrice * 0.95).toFixed(2)),
    previousClose: parseFloat((basePrice - change).toFixed(2)),
  };
};

export const createMockRecommendation = (stockData: PolygonStockData): OpenAIRecommendation => {
  const recommendations: OpenAIRecommendation["recommendation"][] = ["BUY", "SELL", "HOLD"];
  const riskLevels: OpenAIRecommendation["riskLevel"][] = ["LOW", "MEDIUM", "HIGH"];
  
  return {
    recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
    confidence: Math.floor(Math.random() * 40 + 60), // 60-100%
    reasoning: `Based on current market conditions and ${stockData.ticker}'s recent performance showing ${stockData.changePercent >= 0 ? "positive" : "negative"} momentum of ${stockData.changePercent.toFixed(2)}%, this recommendation considers technical indicators, trading volume of ${stockData.volume.toLocaleString()}, and fundamental analysis. The stock shows ${stockData.change >= 0 ? "upward" : "downward"} pressure with current volatility.`,
    priceTarget: parseFloat((stockData.price * (1 + (Math.random() - 0.5) * 0.3)).toFixed(2)),
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
  };
};