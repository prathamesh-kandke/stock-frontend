// src/components/StockSelector.tsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'; // [cite: 40]

interface StockSelectorProps {
  stocks: { [key: string]: string };
  selectedStock: string;
  onStockChange: (ticker: string) => void;
  selectedTimeInterval: number;
  onTimeIntervalChange: (minutes: number) => void;
}

const timeIntervals = [1, 5, 15, 30, 60]; // Example time intervals in minutes

const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedStock,
  onStockChange,
  selectedTimeInterval,
  onTimeIntervalChange,
}) => {
  const handleStockChange = (event: SelectChangeEvent<string>) => {
    onStockChange(event.target.value as string);
  };

  const handleTimeIntervalChange = (event: SelectChangeEvent<number>) => {
    onTimeIntervalChange(event.target.value as number);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      <FormControl sx={{ minWidth: 200 }}> {/* [cite: 40] */}
        <InputLabel id="stock-select-label">Select Stock</InputLabel> {/* [cite: 40] */}
        <Select
          labelId="stock-select-label"
          id="stock-select"
          value={selectedStock}
          label="Select Stock"
          onChange={handleStockChange}
        >
          {Object.entries(stocks).map(([name, ticker]) => (
            <MenuItem key={ticker} value={ticker}> {/* [cite: 40] */}
              {name} ({ticker})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}> {/* [cite: 40] */}
        <InputLabel id="time-interval-select-label">Time Interval (minutes)</InputLabel> {/* [cite: 40] */}
        <Select
          labelId="time-interval-select-label"
          id="time-interval-select"
          value={selectedTimeInterval}
          label="Time Interval (minutes)"
          onChange={handleTimeIntervalChange}
        >
          {timeIntervals.map((interval) => (
            <MenuItem key={interval} value={interval}> {/* [cite: 40] */}
              Last {interval} min
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default StockSelector;