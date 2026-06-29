import { OpenAI } from "openai";
import { CandleData } from "@/lib/market/binance";

// Simple calculations to feed the AI (and for mock analysis)
export interface TechnicalIndicators {
  rsi: number;
  sma20: number;
  sma50: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  support: number[];
  resistance: number[];
}

export function calculateIndicators(candles: CandleData[]): TechnicalIndicators {
  if (candles.length < 50) {
    return {
      rsi: 50,
      sma20: candles[candles.length - 1]?.close || 0,
      sma50: candles[candles.length - 1]?.close || 0,
      macd: { macdLine: 0, signalLine: 0, histogram: 0 },
      support: [],
      resistance: [],
    };
  }

  const prices = candles.map(c => c.close);
  const latestPrice = prices[prices.length - 1];

  // 1. RSI (14)
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - 14; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rs = gains / (losses || 1);
  const rsi = 100 - (100 / (1 + rs));

  // 2. SMA 20 & 50
  const sma20 = prices.slice(-20).reduce((sum, p) => sum + p, 0) / 20;
  const sma50 = prices.slice(-50).reduce((sum, p) => sum + p, 0) / 50;

  // 3. Simple Support / Resistance (Local Min/Max)
  const support: number[] = [];
  const resistance: number[] = [];
  for (let i = 5; i < prices.length - 5; i++) {
    const p = prices[i];
    const isMin = prices.slice(i - 5, i + 6).every(val => val >= p);
    const isMax = prices.slice(i - 5, i + 6).every(val => val <= p);
    
    if (isMin && support.length < 2) support.push(p);
    if (isMax && resistance.length < 2) resistance.push(p);
  }

  // Fallbacks if no local pivots found
  if (support.length === 0) support.push(latestPrice * 0.95, latestPrice * 0.92);
  if (resistance.length === 0) resistance.push(latestPrice * 1.05, latestPrice * 1.08);

  return {
    rsi: Math.round(rsi),
    sma20: parseFloat(sma20.toFixed(2)),
    sma50: parseFloat(sma50.toFixed(2)),
    macd: {
      macdLine: parseFloat((sma20 - sma50).toFixed(2)),
      signalLine: parseFloat(((sma20 - sma50) * 0.9).toFixed(2)),
      histogram: parseFloat(((sma20 - sma50) * 0.1).toFixed(2)),
    },
    support: support.map(s => parseFloat(s.toFixed(2))),
    resistance: resistance.map(r => parseFloat(r.toFixed(2))),
  };
}

export async function generateAIAnalysis(
  symbol: string,
  candles: CandleData[],
  prompt?: string
): Promise<{ analysis: string; signal: "bullish" | "bearish" | "neutral" }> {
  const latestCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  
  if (!latestCandle) {
    return {
      analysis: "No market data available for analysis.",
      signal: "neutral",
    };
  }

  const indicators = calculateIndicators(candles);
  const priceChange24h = ((latestCandle.close - candles[0].close) / candles[0].close) * 100;
  
  // Check if API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  const isMock = !apiKey || apiKey === "mock_openai_api_key";

  if (isMock) {
    // Generate high-quality mock analysis based on real indicators
    return generateMockAnalysis(symbol, latestCandle.close, priceChange24h, indicators, prompt);
  }

  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const openai = new OpenAI({ 
    apiKey,
    baseURL
  });

  const systemMessage = `
    You are an expert AI financial analyst and trading co-pilot.
    Analyze the provided asset market data and technical indicators.
    Provide a professional, structured, and concise analysis.
    
    CRITICAL RULES:
    1. DO NOT give any promises of profit or guaranteed returns.
    2. Add a clear disclaimer at the end stating this is for informational purposes and not financial advice.
    3. Determine a clear market signal: "BULLISH", "BEARISH", or "NEUTRAL".
    4. Return your output in JSON format with two keys:
       - "signal": "bullish" | "bearish" | "neutral"
       - "analysis": "Your detailed analysis in Markdown format"
  `;

  const userMessage = `
    Asset: ${symbol}
    Current Price: $${latestCandle.close}
    24h Price Change: ${priceChange24h.toFixed(2)}%
    Volume: ${latestCandle.volume}
    
    Technical Indicators:
    - RSI (14): ${indicators.rsi}
    - SMA 20: $${indicators.sma20}
    - SMA 50: $${indicators.sma50}
    - MACD Line: ${indicators.macd.macdLine}
    - Signal Line: ${indicators.macd.signalLine}
    - Support Levels: ${indicators.support.join(", ")}
    - Resistance Levels: ${indicators.resistance.join(", ")}
    
    User Query/Custom Prompt: ${prompt || "Analyze the current market condition, trend, support/resistance, and find possible entry/exit points."}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        analysis: parsed.analysis,
        signal: parsed.signal.toLowerCase() as "bullish" | "bearish" | "neutral",
      };
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
  }

  // Fallback to mock if API call fails
  return generateMockAnalysis(symbol, latestCandle.close, priceChange24h, indicators, prompt);
}

function generateMockAnalysis(
  symbol: string,
  price: number,
  change24h: number,
  ind: TechnicalIndicators,
  userPrompt?: string
): { analysis: string; signal: "bullish" | "bearish" | "neutral" } {
  const isRsiOverbought = ind.rsi > 70;
  const isRsiOversold = ind.rsi < 30;
  
  let trend = "Neutral / Ranging";
  let signal: "bullish" | "bearish" | "neutral" = "neutral";
  let outlook = "";

  if (price > ind.sma20 && ind.sma20 > ind.sma50) {
    trend = "Strong Bullish";
    signal = "bullish";
    outlook = "The asset is trading above both the 20-period and 50-period Simple Moving Averages, indicating a well-established uptrend. Buyers are firmly in control.";
  } else if (price < ind.sma20 && ind.sma20 < ind.sma50) {
    trend = "Strong Bearish";
    signal = "bearish";
    outlook = "Price action remains under pressure below key moving averages. The 20 SMA has crossed below the 50 SMA, confirming a bearish trend.";
  } else {
    outlook = "Price is currently consolidating between the 20 and 50 SMAs. Momentum is neutral as the market awaits a breakout.";
  }

  if (isRsiOverbought) {
    outlook += " **Warning: RSI is currently overbought (${ind.rsi}), suggesting potential exhaustion and a short-term pullback.**";
  } else if (isRsiOversold) {
    outlook += " **Note: RSI is oversold (${ind.rsi}), indicating that the selling pressure might be overextended and a technical bounce is likely.**";
  }

  const entryExit = signal === "bullish" 
    ? `- **Potential Entry:** Near support level of $${ind.support[0]} or on a confirmed breakout above resistance at $${ind.resistance[0]}.
- **Potential Exit:** Near major resistance at $${ind.resistance[1]} or if price closes below the 50 SMA ($${ind.sma50}).`
    : signal === "bearish"
    ? `- **Potential Entry (Short):** On a pullback towards the 20 SMA at $${ind.sma20}.
- **Potential Exit/Cover:** Near support levels at $${ind.support[0]} or $${ind.support[1]}.`
    : `- **Range Trading strategy:** Buy near support at $${ind.support[0]}, sell near resistance at $${ind.resistance[0]}.`;

  const mdAnalysis = `### Market Analysis for **${symbol}** (Mock AI Co-Pilot)

#### 📊 Market Condition & Trend
- **Current Price:** $${price.toLocaleString()} (${change24h.toFixed(2)}% last 24h)
- **Market Trend:** **${trend}**
- ${outlook}

#### 📈 Technical Indicators
- **Relative Strength Index (RSI 14):** \`${ind.rsi}\` (${isRsiOverbought ? "Overbought" : isRsiOversold ? "Oversold" : "Neutral"})
- **Moving Averages:** 20 SMA is at \`$${ind.sma20}\`, 50 SMA is at \`$${ind.sma50}\`
- **MACD:** MACD Line is \`${ind.macd.macdLine}\`, Signal Line is \`${ind.macd.signalLine}\` (Histogram: \`${ind.macd.histogram}\`)

#### 🛑 Key Levels
- **Support Levels:** $${ind.support.join(", ")}
- **Resistance Levels:** $${ind.resistance.join(", ")}

#### 🎯 Possible Entry & Exit Points
${entryExit}

---
*Disclaimer: This analysis is automatically generated by an AI model for educational and informational purposes only. It does not constitute financial, investment, or trading advice. Never risk capital you cannot afford to lose.*`;

  return {
    analysis: mdAnalysis,
    signal,
  };
}
