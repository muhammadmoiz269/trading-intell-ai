import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  AlertTriangle,
  Settings,
  Plus,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  PolygonService,
  OpenAIService,
  createMockStockData,
  createMockRecommendation,
  type PolygonStockData,
  type OpenAIRecommendation,
} from "@/lib/api";

export default function StockAnalyzer() {
  const [ticker, setTicker] = useState("");
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    Array<{
      stockData: PolygonStockData;
      aiRecommendation: OpenAIRecommendation;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll use mock data
  // In production, you would get these from environment variables or user input

  const addTicker = () => {
    if (!ticker.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock ticker symbol",
        variant: "destructive",
      });
      return;
    }

    const upperTicker = ticker.toUpperCase();
    if (tickers.includes(upperTicker)) {
      toast({
        title: "Error",
        description: "Ticker already added",
        variant: "destructive",
      });
      return;
    }

    setTickers([...tickers, upperTicker]);
    setTicker("");
    toast({
      title: "Ticker Added",
      description: `${upperTicker} added to analysis list`,
    });
  };

  const removeTicker = (tickerToRemove: string) => {
    setTickers(tickers.filter((t) => t !== tickerToRemove));
  };

  const handleAnalyze = async () => {
    if (tickers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one stock ticker",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const analysisResults = [];

      for (const tickerSymbol of tickers) {
        let stockDataResult: PolygonStockData;
        let aiRecommendationResult: OpenAIRecommendation;

        if (
          process.env.VITE_POLYGON_API_KEY &&
          process.env.VITE_OPENAI_API_KEY
        ) {
          // Use real APIs when keys are available
          const polygonService = new PolygonService(
            process.env.VITE_POLYGON_API_KEY
          );
          const openAIService = new OpenAIService(
            process.env.VITE_OPENAI_API_KEY
          );

          stockDataResult = await polygonService.getStockData(tickerSymbol);
          aiRecommendationResult = createMockRecommendation(stockDataResult);
          // aiRecommendationResult = await openAIService.createMockRecommendation(
          //   stockDataResult
          // );
        } else {
          // Use mock data for demonstration
          stockDataResult = createMockStockData(tickerSymbol);
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          aiRecommendationResult = createMockRecommendation(stockDataResult);
        }

        analysisResults.push({
          stockData: stockDataResult,
          aiRecommendation: aiRecommendationResult,
        });
      }

      setResults(analysisResults);

      toast({
        title: "Analysis Complete",
        description: `Generated recommendations for ${tickers.length} stock${
          tickers.length > 1 ? "s" : ""
        }`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to analyze stocks. Please try again."
      );
      toast({
        title: "Analysis Failed",
        description: "Unable to fetch stock data or generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (
    rec: OpenAIRecommendation["recommendation"]
  ) => {
    switch (rec) {
      case "BUY":
        return "success";
      case "SELL":
        return "danger";
      case "HOLD":
        return "warning";
    }
  };

  const getRiskColor = (risk: OpenAIRecommendation["riskLevel"]) => {
    switch (risk) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "danger";
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
            Get AI-powered buy, sell, or hold recommendations based on real-time
            market data and advanced analysis.
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
              Enter stock ticker symbols (e.g., MSFT, TSLA, AAPL) to add them to
              your analysis list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter stock ticker (e.g., MSFT, TSLA)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && addTicker()}
              />
              <Button
                onClick={addTicker}
                variant="outline"
                size="default"
                className="px-4"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Display added tickers */}
            {tickers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Added tickers:</p>
                <div className="flex flex-wrap gap-2">
                  {tickers.map((tickerSymbol) => (
                    <Badge
                      key={tickerSymbol}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {tickerSymbol}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTicker(tickerSymbol)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={loading || tickers.length === 0}
              variant="default"
              size="lg"
              className="w-full"
            >
              {loading
                ? "Analyzing..."
                : `Generate Report${tickers.length > 1 ? "s" : ""} (${
                    tickers.length
                  })`}
            </Button>
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
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Analysis Results</h2>
            <div className="grid grid-cols-1 gap-8">
              {results.map(({ stockData, aiRecommendation }, index) => (
                <div
                  key={stockData.ticker}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Stock Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{stockData.ticker}</span>
                        <Badge
                          variant={
                            stockData.change >= 0 ? "default" : "destructive"
                          }
                        >
                          {stockData.change >= 0 ? "+" : ""}
                          {stockData.changePercent.toFixed(2)}%
                        </Badge>
                      </CardTitle>
                      <CardDescription>Current Market Data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Price
                          </p>
                          <p className="text-2xl font-bold">
                            ${stockData.price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Change
                          </p>
                          <p
                            className={`text-2xl font-bold flex items-center gap-1 ${
                              stockData.change >= 0
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {stockData.change >= 0 ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                            {stockData.change >= 0 ? "+" : ""}
                            {stockData.change}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Volume
                          </p>
                          <p className="text-lg font-semibold">
                            {stockData.volume.toLocaleString()}
                          </p>
                        </div>
                        {stockData.marketCap && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Market Cap
                            </p>
                            <p className="text-lg font-semibold">
                              ${(stockData.marketCap / 1000000000).toFixed(1)}B
                            </p>
                          </div>
                        )}
                        {stockData.open && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Open
                            </p>
                            <p className="text-lg font-semibold">
                              ${stockData.open.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {stockData.high && stockData.low && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Day Range
                            </p>
                            <p className="text-lg font-semibold">
                              ${stockData.low.toFixed(2)} - $
                              {stockData.high.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Recommendation */}
                  <Card
                    className={`border-${getRecommendationColor(
                      aiRecommendation.recommendation
                    )} glow-${getRecommendationColor(
                      aiRecommendation.recommendation
                    )}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>AI Recommendation</span>
                        <Badge
                          variant={
                            getRecommendationColor(
                              aiRecommendation.recommendation
                            ) as any
                          }
                        >
                          {aiRecommendation.recommendation}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Confidence: {aiRecommendation.confidence}% | Risk:{" "}
                        {aiRecommendation.riskLevel}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Analysis
                        </p>
                        <p className="text-sm leading-relaxed">
                          {aiRecommendation.reasoning}
                        </p>
                      </div>
                      {aiRecommendation.priceTarget && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Price Target
                          </p>
                          <p className="text-xl font-bold">
                            ${aiRecommendation.priceTarget.toFixed(2)}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            getRiskColor(aiRecommendation.riskLevel) as any
                          }
                        >
                          {aiRecommendation.riskLevel} Risk
                        </Badge>
                        <Badge variant="outline">
                          {aiRecommendation.confidence}% Confidence
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Setup Notice */}
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning mb-2">
                  API Configuration
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  To use real market data and AI analysis, configure your API
                  keys:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>
                      <strong>Polygon.io API Key:</strong> Real-time stock
                      market data
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>
                      <strong>OpenAI API Key:</strong> AI-powered investment
                      recommendations
                    </span>
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
