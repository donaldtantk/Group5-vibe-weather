
class WeatherInfographic extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get styles() {
        return /*css*/`
            .infographic-container {
                display: flex;
                justify-content: space-around;
                align-items: center;
                height: 100%;
                min-height: 200px;
                background-color: var(--card-background, #fff);
                border-radius: 1rem;
                padding: 1.5rem;
                box-shadow: inset 0 0 15px rgba(0,0,0,0.1);
            }
            .metric {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                width: 80px;
            }
            .icon {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            }
            .value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color, #007bff);
            }
            .label {
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--text-color, #333);
                opacity: 0.7;
            }
        `;
    }

    set data(weatherData) {
        this.render(weatherData);
    }

    render(data) {
        if (!data) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        const temp = Math.round(data.main.temp);
        const humidity = Math.round(data.main.humidity);
        const windSpeed = Math.round(data.wind.speed);

        this.shadowRoot.innerHTML = `
            <style>${WeatherInfographic.styles}</style>
            <div class="infographic-container">
                <div class="metric">
                    <div class="icon">&#x1F321;</div> <!-- Thermometer -->
                    <div class="value">${temp}°C</div>
                    <div class="label">Temp</div>
                </div>
                <div class="metric">
                    <div class="icon">&#x1F4A7;</div> <!-- Droplet -->
                    <div class="value">${humidity}%</div>
                    <div class="label">Humidity</div>
                </div>
                <div class="metric">
                    <div class="icon">&#x1F32C;</div> <!-- Wind -->
                    <div class="value">${windSpeed} m/s</div>
                    <div class="label">Wind</div>
                </div>
            </div>
        `;
    }
}

customElements.define('weather-infographic', WeatherInfographic);
