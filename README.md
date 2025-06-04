# Stock Price Aggregation Dashboard

This project is a React-based frontend web application designed to visualize stock prices and their correlations using a provided test server API. It features a dedicated page for charting individual stock prices over time and a heatmap to display correlations between multiple stocks.

## Features

* **Stock Price Charting:**
    * View historical price data for individual stocks.
    * Select different time intervals (e.g., last 1, 5, 15, 30, 60 minutes).
    * Displays the average price over the selected interval.
    * Detailed stock information (timestamp, price) on data point hover.
* **Stock Correlation Heatmap:**
    * Visualize Pearson correlation coefficients between all available stocks.
    * Select the time interval (`m` minutes) for correlation calculation.
    * Color-coded heatmap for easy interpretation of correlation strength (Green for positive, Red for negative, Grey for neutral).
    * Display average and standard deviation of stock prices on hover over stock labels.
* **Responsive UI:** Designed to adapt to different screen sizes.
* **API Integration:** Consumes data from a secure test server API.

## Technology Stack

* **Frontend Framework:** React (with TypeScript)
* **Styling:** Material UI
* **API Client:** Axios
* **Routing:** React Router DOM
