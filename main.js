
import './WeatherCard.js';
import './WeatherInfographic.js';

// --- DOM Elements ---
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const weatherCard = document.querySelector('weather-card');
const backgroundAudio = document.getElementById('background-audio');

// --- API Configuration ---
const geocodingApiUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherByCoords, handleGeoLocationError);
    } else {
        alert("Geolocation is not supported by this browser. Please search for a city manually.");
        fetchWeatherByCity('Tokyo');
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
});

// --- Geolocation Handlers ---
function fetchWeatherByCoords(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherData(latitude, longitude);
}

function handleGeoLocationError(error) {
    console.error("Geolocation error:", error);
    let message = "Could not determine your location. Showing weather for Paris instead.";

    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "Geolocation permission was denied. Please enable it in your browser settings to see local weather, or search for a city manually. Showing weather for Paris as a default.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Your location information is currently unavailable. Please check your device settings. Showing weather for Paris as a default.";
            break;
        case error.TIMEOUT:
            message = "The request to get your location timed out. Please try again. Showing weather for Paris as a default.";
            break;
    }
    
    alert(message);
    fetchWeatherByCity('Paris');
}

// --- Weather Fetching ---
async function fetchWeatherByCity(city) {
    weatherCard.style.opacity = 0;
    try {
        const geoResponse = await fetch(`${geocodingApiUrl}?name=${city}&count=1&language=en&format=json`);
        if (!geoResponse.ok) throw new Error(`Geocoding error! status: ${geoResponse.status}`);
        
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert(`Could not find city: ${city}. Please try again.`);
            weatherCard.style.opacity = 1;
            return;
        }

        const { latitude, longitude, name, country_code } = geoData.results[0];
        fetchWeatherData(latitude, longitude, name, country_code);

    } catch (error) {
        console.error("Error fetching city coordinates:", error);
        alert("Could not fetch location data. Please check your connection and try again.");
        weatherCard.style.opacity = 1;
    }
}

async function fetchWeatherData(latitude, longitude, name = 'Current Location', country_code = 'N/A') {
    weatherCard.style.opacity = 0;
    const url = `${weatherApiUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=ms`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const mappedData = mapOpenMeteoData(data, name, country_code);
        updateUI(mappedData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not fetch weather data. The service may be temporarily unavailable.");
        weatherCard.style.opacity = 1;
    }
}

// --- Data Mapping & Content Generation ---
function mapOpenMeteoData(data, name, country_code) {
    const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = data.current;
    const { main, description, icon } = getWeatherConditionFromWMO(weather_code);

    return {
        name: name,
        sys: { country: country_code },
        main: {
            temp: temperature_2m,
            humidity: relative_humidity_2m,
        },
        weather: [{ main, description, icon }],
        wind: { speed: wind_speed_10m },
    };
}

function getWeatherConditionFromWMO(code) {
    const wmoMap = {
        0: { main: 'Clear', description: 'Clear sky', icon: '01d' },
        1: { main: 'Clouds', description: 'Mainly clear', icon: '02d' },
        2: { main: 'Clouds', description: 'Partly cloudy', icon: '03d' },
        3: { main: 'Clouds', description: 'Overcast', icon: '04d' },
        45: { main: 'Clouds', description: 'Fog', icon: '50d' },
        48: { main: 'Clouds', description: 'Depositing rime fog', icon: '50d' },
        51: { main: 'Drizzle', description: 'Light drizzle', icon: '09d' },
        53: { main: 'Drizzle', description: 'Moderate drizzle', icon: '09d' },
        55: { main: 'Drizzle', description: 'Dense drizzle', icon: '09d' },
        61: { main: 'Rain', description: 'Slight rain', icon: '10d' },
        63: { main: 'Rain', description: 'Moderate rain', icon: '10d' },
        65: { main: 'Rain', description: 'Heavy rain', icon: '10d' },
        71: { main: 'Snow', description: 'Slight snow fall', icon: '13d' },
        73: { main: 'Snow', description: 'Moderate snow fall', icon: '13d' },
        75: { main: 'Snow', description: 'Heavy snow fall', icon: '13d' },
        80: { main: 'Rain', description: 'Slight rain showers', icon: '09d' },
        81: { main: 'Rain', description: 'Moderate rain showers', icon: '09d' },
        82: { main: 'Rain', description: 'Violent rain showers', icon: '09d' },
        95: { main: 'Thunderstorm', description: 'Thunderstorm', icon: '11d' },
        96: { main: 'Thunderstorm', description: 'Thunderstorm with hail', icon: '11d' },
        99: { main: 'Thunderstorm', description: 'Thunderstorm with heavy hail', icon: '11d' },
    };
    return wmoMap[code] || { main: 'Default', description: 'Unknown weather', icon: '50d' };
}

// --- UI Updates ---
function updateUI(data) {
    weatherCard.weatherData = data;
    updateTheme(data.weather[0].main);
    playBackgroundAudio(data);
    weatherCard.style.opacity = 1; // Fade in new card
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

function playBackgroundAudio(data) {
    const country = data.sys.country;
    const weather = data.weather[0].main;

    const audioMap = {
        Rain: "gentle-rain-and-soft-piano.mp3",
        Clear: {
            US: "light-acoustic-guitar.mp3",
            JP: "koto-and-nature-sounds.mp3",
            IN: "sitar-melody.mp3",
            BR: "bossa-nova-lounge.mp3",
            Default: "upbeat-instrumental.mp3"
        },
        Clouds: "ambient-and-airy-pads.mp3",
        Snow: "celesta-and-strings.mp3",
        Thunderstorm: "distant-thunder-and-low-drones.mp3",
        Drizzle: "gentle-rain-and-soft-piano.mp3",
        Default: "calm-background-music.mp3"
    };

    let audioFile = audioMap.Default;

    if (audioMap[weather]) {
        if (typeof audioMap[weather] === 'object') {
            audioFile = audioMap[weather][country] || audioMap[weather].Default;
        } else {
            audioFile = audioMap[weather];
        }
    }

    console.log(`INFO: Would play audio file: 'sounds/${audioFile}'`);
    // backgroundAudio.src = `sounds/${audioFile}`;
    // backgroundAudio.play().catch(e => console.error("Audio playback failed:", e));
}
