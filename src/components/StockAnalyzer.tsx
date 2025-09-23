import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Search, AlertTriangle, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  PolygonService, 
  OpenAIService, 
  createMockStockData, 
  createMockRecommendation,
  type PolygonStockData,
  type OpenAIRecommendation 
} from "@/lib/api";

export default function StockAnalyzer() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<PolygonStockData | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<OpenAIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll use mock data
  // In production, you would get these from environment variables or user input
  const POLYGON_API_KEY = ""; // Add your Polygon API key here
  const OPENAI_API_KEY = ""; // Add your OpenAI API key here

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock ticker symbol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setStockData(null);
    setAiRecommendation(null);

    try {
      let stockDataResult: PolygonStockData;
      let aiRecommendationResult: OpenAIRecommendation;

      if (POLYGON_API_KEY && OPENAI_API_KEY) {
        // Use real APIs when keys are available
        const polygonService = new PolygonService(POLYGON_API_KEY);
        const openAIService = new OpenAIService(OPENAI_API_KEY);

        stockDataResult = await polygonService.getStockData(ticker);
        aiRecommendationResult = await openAIService.getStockRecommendation(stockDataResult);
      } else {
        // Use mock data for demonstration
        stockDataResult = createMockStockData(ticker);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        aiRecommendationResult = createMockRecommendation(stockDataResult);
      }

      setStockData(stockDataResult);
      setAiRecommendation(aiRecommendationResult);

      toast({
        title: "Analysis Complete",
        description: `Generated recommendation for ${stockDataResult.ticker}`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error instanceof Error ? error.message : "Failed to analyze stock. Please try again.");
      toast({
        title: "Analysis Failed",
        description: "Unable to fetch stock data or generate recommendation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec: OpenAIRecommendation["recommendation"]) => {
    switch (rec) {
      case "BUY": return "success";
      case "SELL": return "danger";
      case "HOLD": return "warning";
    }
  };

  const getRiskColor = (risk: OpenAIRecommendation["riskLevel"]) => {
    switch (risk) {
      case "LOW": return "success";
      case "MEDIUM": return "warning";
      case "HIGH": return "danger";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Stock Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get AI-powered buy, sell, or hold recommendations based on real-time market data and advanced analysis.
          </p>
        </div>

        {/* Input Section */}
        <Card className="glow-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Stock Analysis
            </CardTitle>
            <CardDescription>
              Enter a stock ticker symbol (e.g., MSFT, TSLA, AAPL) to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter stock ticker (e.g., MSFT, TSLA)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                variant="default"
                size="lg"
                className="px-8"
              >
                {loading ? "Analyzing..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-danger">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {stockData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stockData.ticker}</span>
                  <Badge variant={stockData.change >= 0 ? "default" : "destructive"}>
                    {stockData.change >= 0 ? "+" : ""}{stockData.changePercent.toFixed(2)}%
                  </Badge>
                </CardTitle>
                <CardDescription>Current Market Data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-2xl font-bold">${stockData.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className={`text-2xl font-bold flex items-center gap-1 ${
                      stockData.change >= 0 ? "text-success" : "text-danger"
                    }`}>
                      {stockData.change >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      {stockData.change >= 0 ? "+" : ""}{stockData.change}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="text-lg font-semibold">{stockData.volume.toLocaleString()}</p>
                  </div>
                  {stockData.marketCap && (
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="text-lg font-semibold">
                        ${(stockData.marketCap / 1000000000).toFixed(1)}B
                      </p>
                    </div>
                  )}
                  {stockData.open && (
                    <div>
                      <p className="text-sm text-muted-foreground">Open</p>
                      <p className="text-lg font-semibold">${stockData.open.toFixed(2)}</p>
                    </div>
                  )}
                  {stockData.high && stockData.low && (
                    <div>
                      <p className="text-sm text-muted-foreground">Day Range</p>
                      <p className="text-lg font-semibold">${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            {aiRecommendation && (
              <Card className={`border-${getRecommendationColor(aiRecommendation.recommendation)} glow-${getRecommendationColor(aiRecommendation.recommendation)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>AI Recommendation</span>
                    <Badge variant={getRecommendationColor(aiRecommendation.recommendation) as any}>
                      {aiRecommendation.recommendation}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Confidence: {aiRecommendation.confidence}% | Risk: {aiRecommendation.riskLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Analysis</p>
                    <p className="text-sm leading-relaxed">{aiRecommendation.reasoning}</p>
                  </div>
                  {aiRecommendation.priceTarget && (
                    <div>
                      <p className="text-sm text-muted-foreground">Price Target</p>
                      <p className="text-xl font-bold">${aiRecommendation.priceTarget.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Badge variant={getRiskColor(aiRecommendation.riskLevel) as any}>
                      {aiRecommendation.riskLevel} Risk
                    </Badge>
                    <Badge variant="outline">
                      {aiRecommendation.confidence}% Confidence
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* API Setup Notice */}
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning mb-2">API Configuration</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  To use real market data and AI analysis, configure your API keys:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span><strong>Polygon.io API Key:</strong> Real-time stock market data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span><strong>OpenAI API Key:</strong> AI-powered investment recommendations</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Current Mode:</strong> Demo with realistic mock data
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your API keys to the component to enable live data
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}