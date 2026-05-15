
import './WeatherCard.js';

// --- DOM Elements ---
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const captureButton = document.getElementById('capture-icon-button');
const captureArea = document.getElementById('capture-area');
const weatherCard = document.querySelector('weather-card');

// --- API Configuration ---
const geocodingApiUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherByCoords, handleGeoLocationError);
    } else {
        alert("Geolocation is not supported by this browser. Please search for a city manually.");
        fetchWeatherByCity('Paris');
    }

    searchButton.addEventListener('click', () => {
        const city = locationInput.value;
        if (city) {
            fetchWeatherByCity(city);
        }
    });
    
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    captureButton.addEventListener('click', () => {
        html2canvas(captureArea).then(canvas => {
            canvas.toBlob(blob => {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                .then(() => alert('Weather card captured to clipboard!'))
                .catch(err => console.error('Could not copy to clipboard', err));
            });
        });
    });
});

// --- Geolocation Handlers ---
function fetchWeatherByCoords(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherData(latitude, longitude, "Current Location", "N/A");
}

function handleGeoLocationError(error) {
    console.error("Geolocation error:", error);
    alert("Could not determine your location. Showing weather for Paris instead.");
    fetchWeatherByCity('Paris');
}

// --- Weather Fetching ---
async function fetchWeatherByCity(city) {
    try {
        const geoResponse = await fetch(`${geocodingApiUrl}?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert(`Could not find city: ${city}. Please try again.`);
            return;
        }
        const { latitude, longitude, name, country_code } = geoData.results[0];
        fetchWeatherData(latitude, longitude, name, country_code);
    } catch (error) {
        console.error("Error fetching city coordinates:", error);
        alert("Could not fetch location data. Please check your connection and try again.");
    }
}

async function fetchWeatherData(latitude, longitude, name, country_code) {
    const url = `${weatherApiUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=ms`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const mappedData = mapOpenMeteoData(data, name, country_code);
        updateUI(mappedData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not fetch weather data. The service may be temporarily unavailable.");
    }
}

// --- Data Mapping & UI Updates ---
function mapOpenMeteoData(data, name, country_code) {
    const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = data.current;
    const { main, description } = getWeatherConditionFromWMO(weather_code);

    return {
        name: name,
        sys: { country: country_code },
        main: {
            temp: temperature_2m,
            humidity: relative_humidity_2m,
        },
        weather: [{ main, description }],
        wind: { speed: wind_speed_10m },
    };
}

function getWeatherConditionFromWMO(code) {
    const wmoMap = {
        0: { main: 'Clear', description: 'clear sky' },
        1: { main: 'Clear', description: 'mainly clear' },
        2: { main: 'Clouds', description: 'partly cloudy' },
        3: { main: 'Clouds', description: 'overcast' },
        45: { main: 'Clouds', description: 'fog' },
        48: { main: 'Clouds', description: 'depositing rime fog' },
        51: { main: 'Drizzle', description: 'light drizzle' },
        53: { main: 'Drizzle', description: 'moderate drizzle' },
        55: { main: 'Drizzle', description: 'dense drizzle' },
        61: { main: 'Rain', description: 'slight rain' },
        63: { main: 'Rain', description: 'moderate rain' },
        65: { main: 'Rain', description: 'heavy rain' },
        71: { main: 'Snow', description: 'slight snow fall' },
        73: { main: 'Snow', description: 'moderate snow fall' },
        75: { main: 'Snow', description: 'heavy snow fall' },
        80: { main: 'Rain', description: 'slight rain showers' },
        81: { main: 'Rain', description: 'moderate rain showers' },
        82: { main: 'Rain', description: 'violent rain showers' },
        95: { main: 'Thunderstorm', description: 'thunderstorm' },
        96: { main: 'Thunderstorm', description: 'thunderstorm with hail' },
        99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' },
    };
    return wmoMap[code] || { main: 'Default', description: 'unknown weather' };
}

function updateUI(data) {
    weatherCard.weatherData = data;
    updateTheme(data.weather[0].main);
}

function updateTheme(weatherCondition) {
    const root = document.documentElement;
    const themes = {
        Clear: { bg: '#87CEEB', text: '#333', primary: '#ff8c00', glow: 'rgba(255, 140, 0, 0.6)', texture: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)' },
        Clouds: { bg: '#B0C4DE', text: '#333', primary: '#6a89cc', glow: 'rgba(106, 137, 204, 0.6)', texture: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)' },
        Rain: { bg: '#4682B4', text: '#fff', primary: '#5d9cec', glow: 'rgba(93, 156, 236, 0.6)', texture: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)' },
        Drizzle: { bg: '#778899', text: '#fff', primary: '#5d9cec', glow: 'rgba(93, 156, 236, 0.6)', texture: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)' },
        Thunderstorm: { bg: '#2c3e50', text: '#fff', primary: '#f1c40f', glow: 'rgba(241, 196, 15, 0.6)', texture: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)' },
        Snow: { bg: '#FFFAFA', text: '#333', primary: '#00bfff', glow: 'rgba(0, 191, 255, 0.6)', texture: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)' },
        Default: { bg: '#f0f0f0', text: '#333', primary: '#007bff', glow: 'rgba(0, 123, 255, 0.5)', texture: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)' }
    };

    const theme = themes[weatherCondition] || themes.Default;
    root.style.setProperty('--background-color', theme.bg);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--background-texture', theme.texture);
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--button-glow', theme.glow);
}
