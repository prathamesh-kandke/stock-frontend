// src/components/Heatmap.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Typography, Box, Slider, Tooltip } from '@mui/material';
import { getStockPriceHistory, getStocks, Stock } from '../services/api';

interface HeatmapProps {
  initialTimeInterval: number;
}

interface CorrelationData {
  ticker1: string;
  ticker2: string;
  correlation: number;
  avg1?: number;
  stdDev1?: number;
  avg2?: number;
  stdDev2?: number;
}

// Helper function to calculate mean
const calculateMean = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Helper function to calculate standard deviation
const calculateStandardDeviation = (arr: number[], mean: number): number => {
  if (arr.length === 0) return 0;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

// Helper function to calculate covariance
const calculateCovariance = (arr1: number[], arr2: number[], mean1: number, mean2: number): number => {
  if (arr1.length === 0 || arr2.length === 0 || arr1.length !== arr2.length) return 0;
  let covariance = 0;
  for (let i = 0; i < arr1.length; i++) {
    covariance += (arr1[i] - mean1) * (arr2[i] - mean2);
  }
  return covariance / arr1.length;
};

// Helper function to calculate Pearson's Correlation Coefficient
const calculatePearsonCorrelation = (
  arr1: number[],
  arr2: number[],
  mean1: number,
  mean2: number,
  stdDev1: number,
  stdDev2: number
): number => {
  if (stdDev1 === 0 || stdDev2 === 0) return 0; // Avoid division by zero
  const covariance = calculateCovariance(arr1, arr2, mean1, mean2);
  return covariance / (stdDev1 * stdDev2);
};

const Heatmap: React.FC<HeatmapProps> = ({ initialTimeInterval }) => {
  const [timeInterval, setTimeInterval] = useState<number>(initialTimeInterval);
  const [allStocksData, setAllStocksData] = useState<{ [ticker: string]: Stock[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stockTickers, setStockTickers] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllStocksAndData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stocksListResponse = await getStocks();
        const tickers = Object.values(stocksListResponse.stocks);
        setStockTickers(tickers);

        const newAllStocksData: { [ticker: string]: Stock[] } = {};
        const fetchPromises = tickers.map(async (ticker) => {
          try {
            const data = await getStockPriceHistory(ticker, timeInterval);
            newAllStocksData[ticker] = data;
          } catch (err) {
            console.error(`Error fetching data for ${ticker}:`, err);
            // We'll proceed even if some stock data fails to fetch
          }
        });
        await Promise.all(fetchPromises);
        setAllStocksData(newAllStocksData);
      } catch (err) {
        setError('Failed to fetch stock data for heatmap.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocksAndData();
  }, [timeInterval]);

  const correlationMatrix = useMemo(() => {
    const matrix: CorrelationData[][] = [];
    const availableTickers = stockTickers.filter(ticker => allStocksData[ticker] && allStocksData[ticker].length > 0);

    for (let i = 0; i < availableTickers.length; i++) {
      const row: CorrelationData[] = [];
      const ticker1 = availableTickers[i];
      const prices1 = allStocksData[ticker1].map(d => d.price);
      const mean1 = calculateMean(prices1);
      const stdDev1 = calculateStandardDeviation(prices1, mean1);

      for (let j = 0; j < availableTickers.length; j++) {
        const ticker2 = availableTickers[j];
        const prices2 = allStocksData[ticker2].map(d => d.price);
        const mean2 = calculateMean(prices2);
        const stdDev2 = calculateStandardDeviation(prices2, mean2);

        let correlation = 0;
        if (ticker1 === ticker2) {
          correlation = 1; // A stock is perfectly correlated with itself
        } else if (prices1.length > 1 && prices2.length > 1) { // Need at least 2 data points for meaningful std dev/correlation
          // Align data points by timestamp if necessary for accurate correlation.
          // For simplicity here, we assume timestamps are roughly aligned or handle cases where they are not.
          // A more robust solution would involve interpolating or aligning timestamps.
          correlation = calculatePearsonCorrelation(prices1, prices2, mean1, mean2, stdDev1, stdDev2);
        }

        row.push({
          ticker1,
          ticker2,
          correlation: isNaN(correlation) ? 0 : correlation, // Handle NaN if stdDev is 0
          avg1: mean1,
          stdDev1: stdDev1,
          avg2: mean2,
          stdDev2: stdDev2
        });
      }
      matrix.push(row);
    }
    return matrix;
  }, [allStocksData, stockTickers]);

  // Function to get color based on correlation value
  const getCorrelationColor = (correlation: number): string => {
    // Green for strong positive, Red for strong negative, White/Grey for neutral
    const absCorrelation = Math.abs(correlation);
    let r, g, b;

    if (correlation > 0) { // Positive correlation (Green shades)
      r = Math.round(255 * (1 - absCorrelation));
      g = 255;
      b = Math.round(255 * (1 - absCorrelation));
    } else if (correlation < 0) { // Negative correlation (Red shades)
      r = 255;
      g = Math.round(255 * (1 - absCorrelation));
      b = Math.round(255 * (1 - absCorrelation));
    } else { // No correlation (Grey)
      r = 200;
      g = 200;
      b = 200;
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const timeIntervalMarks = [
    { value: 1, label: '1 min' },
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '60 min' },
  ];

  return (
    <Card sx={{ width: '100%', mt: 4, overflowX: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stock Correlation Heatmap
        </Typography>

        <Box sx={{ width: '80%', mx: 'auto', mb: 4 }}>
          <Typography gutterBottom>
            Select Time Interval (minutes)
          </Typography>
          <Slider
            aria-label="Time Interval"
            defaultValue={initialTimeInterval}
            value={timeInterval}
            onChange={(_event, newValue) => setTimeInterval(newValue as number)}
            valueLabelDisplay="auto"
            step={null} // Only allow marks
            marks={timeIntervalMarks}
            min={1}
            max={60}
          />
        </Box>

        {loading && <Typography>Loading heatmap data...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && correlationMatrix.length > 0 ? (
          <Box sx={{ minWidth: `${(stockTickers.length + 1) * 60}px`, p: 1 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', minWidth: '50px' }}></th>
                  {stockTickers.filter(ticker => allStocksData[ticker] && allStocksData[ticker].length > 0).map((ticker) => (
                    <th
                      key={`th-${ticker}`}
                      style={{ border: '1px solid #ddd', padding: '8px', minWidth: '50px', cursor: 'pointer' }}
                    >
                      <Tooltip
                        title={
                          <Box>
                            <Typography variant="caption">Ticker: {ticker}</Typography>
                            <Typography variant="caption">Avg Price: {calculateMean(allStocksData[ticker]?.map(d => d.price) || []).toFixed(2)}</Typography>
                            <Typography variant="caption">Std Dev: {calculateStandardDeviation(allStocksData[ticker]?.map(d => d.price) || [], calculateMean(allStocksData[ticker]?.map(d => d.price) || [])).toFixed(2)}</Typography>
                          </Box>
                        }
                      >
                        <Typography>{ticker}</Typography>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}>
                      <Tooltip
                        title={
                          <Box>
                            <Typography variant="caption">Ticker: {row[0].ticker1}</Typography>
                            <Typography variant="caption">Avg Price: {row[0].avg1?.toFixed(2)}</Typography>
                            <Typography variant="caption">Std Dev: {row[0].stdDev1?.toFixed(2)}</Typography>
                          </Box>
                        }
                      >
                        <Typography>{row[0].ticker1}</Typography>
                      </Tooltip>
                    </th>
                    {row.map((cell, colIndex) => (
                      <td
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={{
                          border: '1px solid #ddd',
                          padding: '8px',
                          textAlign: 'center',
                          backgroundColor: getCorrelationColor(cell.correlation),
                          color: Math.abs(cell.correlation) > 0.7 ? 'white' : 'black',
                        }}
                      >
                        <Tooltip title={`Correlation: ${cell.correlation.toFixed(2)}`}>
                          <Typography variant="body2">
                            {cell.correlation.toFixed(2)}
                          </Typography>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Typography variant="body2">Correlation Strength Legend: </Typography>
              <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(0,255,0)' }} />
              <Typography variant="body2">Strong Positive (1)</Typography>
              <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(200,200,200)' }} />
              <Typography variant="body2">No Correlation (0)</Typography>
              <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(255,0,0)' }} />
              <Typography variant="body2">Strong Negative (-1)</Typography>
            </Box>
          </Box>
        ) : (
            !loading && <Typography>No correlation data available for the selected time interval.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default Heatmap;