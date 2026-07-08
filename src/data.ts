import { LeaderboardEntry, FAQItem, TradeLog } from './types';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Phạm Thế Hiển",
    style: "Voi",
    winRate: 68.2,
    totalTrades: 42,
    profitGrowth: 14.5,
    maxDrawdown: 3.2,
    passed: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 2,
    name: "Nguyễn Minh Thư",
    style: "Thỏ",
    winRate: 59.4,
    totalTrades: 118,
    profitGrowth: 12.8,
    maxDrawdown: 5.1,
    passed: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 3,
    name: "Trần Việt Hoàng",
    style: "Voi",
    winRate: 72.1,
    totalTrades: 28,
    profitGrowth: 9.6,
    maxDrawdown: 2.1,
    passed: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 4,
    name: "Lê Thanh Sơn",
    style: "Thỏ",
    winRate: 54.8,
    totalTrades: 154,
    profitGrowth: 11.2,
    maxDrawdown: 6.4,
    passed: false,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 5,
    name: "Vũ Khánh Linh",
    style: "Voi",
    winRate: 64.0,
    totalTrades: 35,
    profitGrowth: 8.4,
    maxDrawdown: 3.0,
    passed: true,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 6,
    name: "Đặng Hoàng Nam",
    style: "Thỏ",
    winRate: 61.2,
    totalTrades: 89,
    profitGrowth: 7.9,
    maxDrawdown: 4.8,
    passed: false,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 7,
    name: "Ngô Quốc Bảo",
    style: "Voi",
    winRate: 58.3,
    totalTrades: 48,
    profitGrowth: 6.5,
    maxDrawdown: 3.5,
    passed: false,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 8,
    name: "Hoàng Thu Trang",
    style: "Thỏ",
    winRate: 52.1,
    totalTrades: 210,
    profitGrowth: 10.5,
    maxDrawdown: 7.2,
    passed: false,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_TRADE_LOGS: TradeLog[] = [
  {
    id: "t1",
    timestamp: "2026-06-15 09:30",
    ticker: "FPT",
    action: "BUY",
    quantity: 1000,
    price: 135000,
    exitPrice: 137400,
    profit: 2400000,
    drawdownPercentage: 0.8,
    comment: "Giao dịch breakout vượt kháng cự VN100, thanh khoản tốt.",
    weightPercentage: 27.0,
    status: "CLOSED"
  },
  {
    id: "t2",
    timestamp: "2026-06-18 14:15",
    ticker: "TCB",
    action: "BUY",
    quantity: 2000,
    price: 24500,
    exitPrice: 23900,
    profit: -1200000,
    drawdownPercentage: 2.4,
    comment: "Mở vị thế tại hỗ trợ MA20, chạm stop loss ngày.",
    weightPercentage: 32.6,
    status: "CLOSED"
  },
  {
    id: "t3",
    timestamp: "2026-06-22 10:45",
    ticker: "HPG",
    action: "BUY",
    quantity: 1500,
    price: 28200,
    exitPrice: 29433,
    profit: 1850000,
    drawdownPercentage: 1.1,
    comment: "Giao dịch theo xu hướng ngành thép, chốt lời 50% vị thế.",
    weightPercentage: 28.2,
    status: "CLOSED"
  },
  {
    id: "t4",
    timestamp: "2026-06-25 11:00",
    ticker: "VNM",
    action: "SELL",
    quantity: 800,
    price: 67000,
    exitPrice: 66375,
    profit: 500000,
    drawdownPercentage: 0.5,
    comment: "Bán chốt lời ngắn hạn khi gặp cản kháng cự VN30.",
    weightPercentage: 10.7,
    status: "CLOSED"
  },
  {
    id: "t5",
    timestamp: "2026-07-02 13:30",
    ticker: "MWG",
    action: "BUY",
    quantity: 1200,
    price: 61500,
    exitPrice: 62708,
    profit: 1450000,
    drawdownPercentage: 1.5,
    comment: "Mua gom tích lũy nền giá tại hỗ trợ cứng.",
    weightPercentage: 14.8,
    status: "CLOSED"
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: "faq1",
    question: "Số tiền nạp tối thiểu 10 triệu VND là gì?",
    answer: "Đây là điều kiện cần tối thiểu để bắt đầu tham gia Chặng 1 (Thử thách kỷ luật). Số tiền này nạp vào tài khoản cá nhân của chính bạn tại Công ty Chứng khoán (CTCK) chỉ định. Bạn giữ toàn quyền sở hữu và rút tiền, không phải đóng phí cho Bootcamp. Mục đích là để đảm bảo tính thực tế và cam kết kỷ luật giao dịch.",
    category: "thể_lệ"
  },
  {
    id: "faq2",
    question: "Quy tắc Sụt giảm Ngày Tối đa (-4.0% NAV) hoạt động như thế nào?",
    answer: "Sụt giảm ngày tối đa được tính dựa trên Giá trị Tài sản ròng (NAV) cao nhất tại thời điểm bắt đầu ngày giao dịch (hoặc cuối ngày hôm trước). Nếu trong ngày, tổng lỗ thực tế cộng với lỗ chưa thực hiện (giao dịch đang mở) vượt quá -4.0% NAV bắt đầu ngày, tài khoản sẽ vi phạm quy tắc kỷ luật rủi ro.",
    category: "quản_trị"
  },
  {
    id: "faq3",
    question: "Cách tính Sụt giảm Tổng Tối đa (-8.0% NAV) là gì?",
    answer: "Tổng giá trị sụt giảm lũy kế của tài khoản không được phép vượt quá -8.0% so với số vốn nạp ban đầu ở bất kỳ thời điểm nào. Ví dụ, với số vốn nạp 50 triệu VND, giá trị NAV tài sản của bạn không bao giờ được thấp hơn 46 triệu VND. Nếu rơi xuống dưới mức này, bạn sẽ bị dừng thử thách để bảo toàn vốn.",
    category: "quản_trị"
  },
  {
    id: "faq4",
    question: "Đa dạng hóa mã đơn lẻ (Max 40% NAV) có nghĩa là gì?",
    answer: "Để giảm thiểu rủi ro tập trung, bạn không được phân bổ quá 40% tổng tài sản (NAV) vào một mã cổ phiếu duy nhất tại bất kỳ thời điểm nào. Đồng thời, quy tắc nhất quán yêu cầu lợi nhuận từ một mã duy nhất không được đóng góp quá 40% mục tiêu lợi nhuận tổng thể.",
    category: "quản_trị"
  },
  {
    id: "faq5",
    question: "Làm thế nào để thăng hạng từ Vòng 1 lên Vòng 2?",
    answer: "Bạn cần giao dịch tối thiểu trong 2 tháng, đạt mục tiêu lãi lũy kế ≥ 5% NAV, và TUYỆT ĐỐI không vi phạm bất kỳ quy tắc quản trị rủi ro nào (Sụt giảm ngày, Sụt giảm tổng, Đa dạng hóa, Tính nhất quán và Bộ lọc thanh khoản VN100). Khi hoàn thành, bạn sẽ được thăng hạng lên Vòng 2 và nhận hạn mức giao dịch x10 lần vốn.",
    category: "thể_lệ"
  },
  {
    id: "faq6",
    question: "Cơ chế chia sẻ lợi nhuận 80% hoạt động ra sao?",
    answer: "Ở Vòng 2 (Tăng trưởng chuyên nghiệp), bạn được cấp hạn mức giao dịch gấp 10 lần vốn tự có. Lợi nhuận phát sinh từ hạn mức giao dịch này sẽ được chia sẻ theo tỷ lệ: Bạn nhận 80% lợi nhuận (áp dụng giới hạn chia thưởng cho Top 10 Performance tốt nhất), 20% còn lại giữ làm quỹ vận hành. Lợi nhuận được đối soát và giải ngân dựa trên kết quả review định kỳ 2 tháng một lần.",
    category: "thể_lệ"
  },
  {
    id: "faq7",
    question: "Bộ lọc thanh khoản VN100 / >200k là gì?",
    answer: "Để tránh rủi ro thao túng giá và mất thanh khoản, học viên chỉ được phép giao dịch các mã cổ phiếu nằm trong rổ VN100 (100 cổ phiếu vốn hóa lớn nhất thị trường sàn HOSE) có khối lượng giao dịch trung bình 20 phiên đạt trên 200.000 cổ phiếu/phiên.",
    category: "kỹ_thuật"
  }
];
