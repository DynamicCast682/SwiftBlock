export type TradingInstrument = {
  id: string;
  symbol: string;
  name: string;
  type: 'currency' | 'futures';
  price: number;
  change24h: number;
};

export const mockTradingInstruments: TradingInstrument[] = [
  {
    id: '1',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    type: 'currency',
    price: 1.0856,
    change24h: 0.23,
  },
  {
    id: '2',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    type: 'currency',
    price: 1.2634,
    change24h: -0.15,
  },
  {
    id: '3',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    type: 'currency',
    price: 149.87,
    change24h: 0.42,
  },
  {
    id: '4',
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    type: 'currency',
    price: 0.6523,
    change24h: -0.08,
  },
  {
    id: '5',
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    type: 'currency',
    price: 1.3456,
    change24h: 0.11,
  },
  {
    id: '6',
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    type: 'currency',
    price: 0.8834,
    change24h: 0.19,
  },
  {
    id: '7',
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    type: 'currency',
    price: 0.5987,
    change24h: -0.31,
  },
  {
    id: '8',
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    type: 'currency',
    price: 0.8594,
    change24h: 0.05,
  },
  {
    id: '9',
    symbol: 'BTC',
    name: 'Bitcoin Futures',
    type: 'futures',
    price: 68432.50,
    change24h: 2.34,
  },
  {
    id: '10',
    symbol: 'ETH',
    name: 'Ethereum Futures',
    type: 'futures',
    price: 3456.78,
    change24h: 1.87,
  },
  {
    id: '11',
    symbol: 'CL',
    name: 'Crude Oil Futures',
    type: 'futures',
    price: 82.45,
    change24h: -0.92,
  },
  {
    id: '12',
    symbol: 'GC',
    name: 'Gold Futures',
    type: 'futures',
    price: 2034.60,
    change24h: 0.67,
  },
  {
    id: '13',
    symbol: 'SI',
    name: 'Silver Futures',
    type: 'futures',
    price: 24.83,
    change24h: 1.23,
  },
  {
    id: '14',
    symbol: 'ES',
    name: 'E-mini S&P 500 Futures',
    type: 'futures',
    price: 5234.75,
    change24h: 0.45,
  },
  {
    id: '15',
    symbol: 'NQ',
    name: 'E-mini Nasdaq 100 Futures',
    type: 'futures',
    price: 18234.50,
    change24h: 0.89,
  },
];
