export interface BrandConfig {
  id: 'lion' | 'tiger';
  name: string;
  subName: string;
  themeClass: string;
  hotline: string;
  zaloLink: string;
  discordLink: string;
  communityText: string;
  excelSuccessText: string;
  webhookUrl: string;
}

export const BRANDS: Record<'lion' | 'tiger', BrandConfig> = {
  lion: {
    id: 'lion',
    name: 'PRO TRADER',
    subName: 'BOOTCAMP 2026 by Lion Invest',
    themeClass: 'theme-lion',
    hotline: '0563 959 999',
    zaloLink: 'https://zalo.me/g/lionfinpeace', // Placeholder Zalo group for Lion Finpeace
    discordLink: 'https://discord.gg/vAB8rCSYZa',
    communityText: 'CỘNG ĐỒNG: LION FINPEACE DISCORD',
    excelSuccessText: 'Link tải file Excel Quản trị rủi ro & Nhật ký giao dịch đã được hệ thống tự động chuẩn bị để gửi tới Zalo của bạn.',
    webhookUrl: 'https://script.google.com/macros/s/AKfycbwFTuZBCLk6FyM8jQtWd3PVL8XFzD5yvUDyd4oKf1LZm45hzhZlWwg1tzmk1FRXl5W5Pw/exec',
  },
  tiger: {
    id: 'tiger',
    name: 'PRO TRADER',
    subName: 'BOOTCAMP 2026 by Tiger Invest',
    themeClass: 'theme-tiger',
    hotline: '0398 992 555',
    zaloLink: 'https://zalo.me/g/tigerinvest', // Placeholder Zalo group for Tiger Invest
    discordLink: 'https://discord.gg/SKft9ac8fS',
    communityText: 'CỘNG ĐỒNG: TIGER INVEST DISCORD',
    excelSuccessText: 'Link tải file Excel Quản trị rủi ro & Nhật ký giao dịch đã được hệ thống gửi tới số Zalo đăng ký.',
    webhookUrl: 'https://script.google.com/macros/s/AKfycbwq3MjcDyvH0MrphB7PRAmSy5XcYqEl-w8aAt_1bM5_ryWmO3y_UNIN2gXQS0cmwGE4/exec',
  }
};

export function getActiveBrand(): BrandConfig {
  // Allow quick testing via URL params: e.g., localhost:3000/?brand=tiger or localhost:3000/?brand=lion
  const params = new URLSearchParams(window.location.search);
  const brandParam = params.get('brand');
  if (brandParam === 'tiger' || brandParam === 'lion') {
    return BRANDS[brandParam];
  }
  
  const hostname = window.location.hostname;
  if (hostname.includes('tigerinvest') || hostname.includes('tiger')) {
    return BRANDS.tiger;
  }
  
  // Default to lion since they said they completed the yellow version on lion.finpeace.cloud
  return BRANDS.lion;
}
