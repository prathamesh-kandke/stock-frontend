// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'; // [cite: 40]
import StockPage from './pages/StockPage';
import HeatmapPage from './pages/HeatmapPage';

function App() {
  return (
    <Router>
      <AppBar position="static"> {/* [cite: 40] */}
        <Toolbar> {/* [cite: 40] */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> {/* [cite: 40] */}
            AffordMed Stock Dashboard
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}> {/* [cite: 40] */}
            <Button color="inherit" component={Link} to="/"> {/* [cite: 40] */}
              Stock Prices
            </Button>
            <Button color="inherit" component={Link} to="/heatmap"> {/* [cite: 40] */}
              Correlation Heatmap
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
      </Routes>
    </Router>
  );
}

export default App;