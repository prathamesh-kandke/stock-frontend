// src/components/StockChart.tsx
import React, { useMemo } from 'react';
import { Stock } from '../services/api';
import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';

interface StockChartProps {
  data: Stock[];
  stockTicker: string;
  timeInterval: number;
}

const StockChart: React.FC<StockChartProps> = ({ data, stockTicker, timeInterval }) => {
  const prices = useMemo(() => data.map(d => d.price), [data]);
  const timestamps = useMemo(() => data.map(d => new Date(d.lastUpdatedAt).toLocaleTimeString()), [data]);

  const averagePrice = useMemo(() => {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }, [prices]);

  // Basic SVG charting (for strict Material UI adherence)
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 50;

  const scaleY = (price: number) => {
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1; // Avoid division by zero
    if (maxPrice === minPrice) return chartHeight - padding; // Handle flat data
    return chartHeight - padding - ((price - minPrice) / (maxPrice - minPrice)) * (chartHeight - 2 * padding);
  };

  const scaleX = (index: number) => {
    if (prices.length <= 1) return padding; // Handle single or no data points
    return padding + (index / (prices.length - 1)) * (chartWidth - 2 * padding);
  };

  const pathD = useMemo(() => {
    if (prices.length === 0) return "";
    let d = `M ${scaleX(0)} ${scaleY(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
      d += ` L ${scaleX(i)} ${scaleY(prices[i])}`;
    }
    return d;
  }, [prices, scaleX, scaleY]);

  return (
    <Card sx={{ width: '100%', overflowX: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {stockTicker} Price History (Last {timeInterval} minutes)
        </Typography>
        {data.length > 0 ? (
          <Box sx={{ minWidth: chartWidth, height: chartHeight + padding }}>
            <svg width={chartWidth} height={chartHeight + padding}>
              {/* X-axis */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="black" />
              {/* Y-axis */}
              <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="black" />

              {/* Data points and line */}
              <path d={pathD} fill="none" stroke="blue" strokeWidth="2" />
              {prices.map((price, index) => (
                <Tooltip
                  key={index}
                  title={
                    <Box>
                      <Typography variant="caption">Time: {timestamps[index]}</Typography>
                      <Typography variant="caption">Price: {price.toFixed(2)}</Typography>
                    </Box>
                  }
                  arrow
                >
                  <circle
                    cx={scaleX(index)}
                    cy={scaleY(price)}
                    r="5" // Slightly larger radius for easier hovering
                    fill="blue"
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>
              ))}

              {/* Average line */}
              {prices.length > 0 && (
                <Tooltip title={`Average Price: ${averagePrice.toFixed(2)}`} arrow>
                  <line
                    x1={padding}
                    y1={scaleY(averagePrice)}
                    x2={chartWidth - padding}
                    y2={scaleY(averagePrice)}
                    stroke="red"
                    strokeDasharray="5,5"
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>
              )}

              {/* X-axis labels (simplified) */}
              {timestamps.map((timestamp, index) => (
                (index % Math.ceil(prices.length / 5) === 0 || index === prices.length - 1) && (
                  <text
                    key={`x-label-${index}`}
                    x={scaleX(index)}
                    y={chartHeight - padding + 20}
                    textAnchor="middle"
                    fontSize="12"
                  >
                    {timestamp}
                  </text>
                )
              ))}

              {/* Y-axis labels (simplified) */}
              {[Math.min(...prices), averagePrice, Math.max(...prices)].map((val, i) => (
                <text
                  key={`y-label-${i}`}
                  x={padding - 10}
                  y={scaleY(val)}
                  textAnchor="end"
                  fontSize="12"
                  dominantBaseline="middle"
                >
                  {val.toFixed(2)}
                </text>
              ))}

              {/* Average Price Label */}
              <text x={chartWidth - padding} y={scaleY(averagePrice) - 10} textAnchor="end" fill="red" fontSize="12">
                Avg: {averagePrice.toFixed(2)}
              </text>
            </svg>
          </Box>
        ) : (
          <Typography variant="body1">No data available for the selected stock and time interval.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;