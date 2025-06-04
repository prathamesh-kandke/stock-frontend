// src/pages/HeatmapPage.tsx
import React from 'react';
import { Container, Typography } from '@mui/material'; // [cite: 40]
import Heatmap from '../components/Heatmap';

const HeatmapPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}> {/* [cite: 40] */}
      <Typography variant="h4" component="h1" gutterBottom> {/* [cite: 40] */}
        Stock Correlation Heatmap
      </Typography>
      <Heatmap initialTimeInterval={15} /> {/* Default time interval for heatmap */} {/* [cite: 33] */}
    </Container>
  );
};

export default HeatmapPage;