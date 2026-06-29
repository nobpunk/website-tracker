import { create } from "zustand";

export interface LivePrice {
  symbol: string;
  price: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
  lastUpdated: number;
  prevPrice?: number; // to detect direction for flash animations
}

interface MarketState {
  prices: Record<string, LivePrice>;
  setPrice: (symbol: string, data: Partial<LivePrice>) => void;
  setPrices: (pricesList: LivePrice[]) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  prices: {},
  setPrice: (symbol, data) => 
    set((state) => {
      const current = state.prices[symbol];
      const prevPrice = current ? current.price : undefined;
      
      // Only set prevPrice if the price actually changed
      const nextPrevPrice = data.price !== undefined && current && current.price !== data.price 
        ? current.price 
        : current?.prevPrice;

      return {
        prices: {
          ...state.prices,
          [symbol]: {
            ...current,
            ...data,
            prevPrice: nextPrevPrice,
            lastUpdated: Date.now(),
          } as LivePrice,
        },
      };
    }),
  setPrices: (pricesList) =>
    set((state) => {
      const nextPrices = { ...state.prices };
      pricesList.forEach((priceData) => {
        const current = nextPrices[priceData.symbol];
        const nextPrevPrice = current && current.price !== priceData.price 
          ? current.price 
          : current?.prevPrice;

        nextPrices[priceData.symbol] = {
          ...current,
          ...priceData,
          prevPrice: nextPrevPrice,
          lastUpdated: Date.now(),
        };
      });
      return { prices: nextPrices };
    }),
}));
