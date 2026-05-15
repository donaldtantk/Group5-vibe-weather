# Weather App Blueprint

## Overview

This application displays the current weather for a user-provided or geolocated city. It features a dynamic, immersive UI that changes its theme based on the weather. A key feature is the dynamic generation of a data-rich infographic to visualize the weather data, creating a clear and engaging user experience.

## Features

### Core Functionality
- **Geolocation:** Automatically detects the user's location on startup.
- **Location Search:** Allows users to manually search for any city.
- **Weather Data:** Fetches current weather from the free, keyless Open-Meteo API.

### Dynamic Content
- **Weather Infographic:** A dedicated web component (`<weather-infographic>`) that visualizes key weather metrics (Temperature, Humidity, Wind Speed) in a clean, easy-to-read format with icons.
- **Flowery Weather Description:** A creative, evocative description of the weather conditions.
- **AI-Generated Poem:** A short, positive poem reflecting the weather and location.
- **Text-to-Speech:** A "Speak the Poem" button reads the generated poem aloud using the browser's Web Speech API.
- **Ambient Audio:** Context-aware background audio that matches the weather and cultural context of the location (Note: Currently logged to console, not played).
- **Capture Weather Card:** A dedicated button that allows users to capture a snapshot of the weather card.
- **Snapshot to Clipboard:** Uses the `html2canvas` library to generate a visual snapshot of the weather data and copies it to the user's clipboard for easy sharing.

### Design and UX
- **Dynamic Theming:** The application's color palette, fonts, and background texture adapt to the current weather conditions (e.g., a warm, sunny theme vs. a cool, rainy theme).
- **Modern & Bold Aesthetics:** The UI is clean, visually balanced, and uses modern design principles, including expressive typography, a vibrant color palette, and multi-layered drop shadows for depth.
- **Responsive Design:** The layout is fully responsive, ensuring a seamless experience on both mobile and desktop devices.
- **Web Components:** The application is highly modular, using a `WeatherCard` component to structure the content and a `WeatherInfographic` component for data visualization.

## Current Implementation Details

- **Weather API:** The app uses the **Open-Meteo API**, a free and open-source service, for both weather forecasting and geocoding. This removes the need for API key management.
- **Infographic Data Flow:**
    1.  After weather data is fetched and processed in `main.js`, the complete data object is passed to the `weatherData` property of the `WeatherCard` component.
    2.  The `WeatherCard` component, in its `render` method, creates a `<weather-infographic>` element.
    3.  The weather data is passed to the `data` property of the `weather-infographic` component.
    4.  The `WeatherInfographic` component then uses this data to render the visual display of temperature, humidity, and wind speed.
- **Component-Based Architecture:** The project is structured with clear separation of concerns. `main.js` handles data fetching and global UI state. `WeatherCard.js` acts as the main container for the weather display. `WeatherInfographic.js` is a specialized, reusable component for visualizing specific data points.
