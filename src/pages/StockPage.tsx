// src/pages/StockPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box } from '@mui/material'; // [cite: 40]
import StockSelector from '../components/StockSelector';
import StockChart from '../components/StockChart';
import { getStocks, getStockPriceHistory, Stock } from '../services/api';

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<{ [key: string]: string }>({});
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [selectedTimeInterval, setSelectedTimeInterval] = useState<number>(30); // Default to 30 minutes
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await getStocks(); // [cite: 47]
        setStocks(response.stocks);
        if (Object.keys(response.stocks).length > 0) {
          setSelectedStock(Object.values(response.stocks)[0]); // Select the first stock by default
        }
      } catch (err) {
        setError('Failed to load stocks.');
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const fetchStockData = useCallback(async () => {
    if (selectedStock && selectedTimeInterval) {
      setLoading(true);
      setError(null);
      try {
        const data = await getStockPriceHistory(selectedStock, selectedTimeInterval); // [cite: 48]
        setStockData(data);
      } catch (err) {
        setError(`Failed to load data for ${selectedStock}.`);
        setStockData([]);
      } finally {
        setLoading(false);
      }
    }
  }, [selectedStock, selectedTimeInterval]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  const handleStockChange = (ticker: string) => {
    setSelectedStock(ticker);
  };

  const handleTimeIntervalChange = (minutes: number) => {
    setSelectedTimeInterval(minutes);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}> {/* [cite: 40] */}
      <Typography variant="h4" component="h1" gutterBottom> {/* [cite: 40] */}
        Stock Price Aggregation
      </Typography>

      {loading && <Typography>Loading stocks and data...</Typography>} {/* [cite: 40] */}
      {error && <Typography color="error">{error}</Typography>} {/* [cite: 40] */}

      {!loading && !error && (
        <Box> {/* [cite: 40] */}
          <StockSelector
            stocks={stocks}
            selectedStock={selectedStock}
            onStockChange={handleStockChange}
            selectedTimeInterval={selectedTimeInterval}
            onTimeIntervalChange={handleTimeIntervalChange}
          />
          <StockChart data={stockData} stockTicker={selectedStock} timeInterval={selectedTimeInterval} /> {/* [cite: 31] */}
        </Box>
      )}
    </Container>
  );
};

export default StockPage;