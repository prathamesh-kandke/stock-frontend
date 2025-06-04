
import axios from 'axios';

// Replace with your actual access token generated from the Authorization Token API
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5MDE1MDcwLCJpYXQiOjE3NDkwMTQ3NzAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImIyNDM4OTE2LWZmMTgtNDY3Zi04MWE3LTNhZTNiZTFhZmY5YyIsInN1YiI6InByYXRoYW1lc2hrYW5ka2U3MUBnbWFpbC5jb20ifSwiZW1haWwiOiJwcmF0aGFtZXNoa2FuZGtlNzFAZ21haWwuY29tIiwibmFtZSI6InByYXRobWVzaF9rYW5ka2UiLCJyb2xsTm8iOiIyMjUxMTUwMyIsImFjY2Vzc0NvZGUiOiJLUmpVVVUiLCJjbGllbnRJRCI6ImIyNDM4OTE2LWZmMTgtNDY3Zi04MWE3LTNhZTNiZTFhZmY5YyIsImNsaWVudFNlY3JldCI6IlJFS2pRZUZiZWNVYllqZWoifQ._Yvn5VuvdFEuN-5vlfmELWU5ouuO-8uZ0oSM5M_QxIA"; 

const API_BASE_URL = 'http://20.244.56.144/evaluation-service'; // [cite: 25]

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`, // [cite: 26]
    'Content-Type': 'application/json',
  },
});

export interface Stock {
  price: number;
  lastUpdatedAt: string;
}

export interface StocksList {
  stocks: { [key: string]: string }; // Map of stock name to ticker
}

export const getStocks = async (): Promise<StocksList> => {
  try {
    const response = await api.get<StocksList>('/stocks'); // [cite: 47]
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

export const getStockPriceHistory = async (ticker: string, minutes?: number): Promise<Stock[]> => {
  try {
    const url = minutes ? `/stocks/${ticker}?minutes=${minutes}` : `/stocks/${ticker}`; // [cite: 48]
    const response = await api.get<Stock[]>(url); // [cite: 48]
    return response.data;
  } catch (error) {
    console.error(`Error fetching price history for ${ticker}:`, error);
    throw error;
  }
};

export default api;