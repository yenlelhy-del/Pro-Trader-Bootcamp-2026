export interface TradeLog {
  id: string;
  timestamp: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number; // Entry price in VND
  exitPrice?: number | null; // Exit price in VND, null if open
  profit: number; // Positive for gain, negative for loss
  drawdownPercentage: number; // Drawdown from peak balance caused by this trade (or running)
  comment: string;
  weightPercentage: number; // Percent of total capital invested in this single asset
  status: 'OPEN' | 'CLOSED';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  style: 'Voi' | 'Thỏ'; // 'Voi' (Stable/Elephant), 'Thỏ' (Agile/Rabbit)
  winRate: number; // percentage
  totalTrades: number;
  profitGrowth: number; // percentage growth e.g., +12.4%
  maxDrawdown: number; // percentage e.g., 3.8%
  passed: boolean;
  avatarUrl: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'thể_lệ' | 'quản_trị' | 'kỹ_thuật' | 'khác';
}

export interface AccountState {
  initialBalance: number;
  currentBalance: number;
  peakBalance: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  dailyDrawdown: number;
  isCompliant: {
    maxDailyDrawdown: boolean; // -4%
    maxTotalDrawdown: boolean; // -8%
    diversification: boolean; // Single trade <= 40%
    consistency: boolean; // Single trade profit <= 40% of target
    liquidity: boolean; // Traded tickers are compliant
  };
}
