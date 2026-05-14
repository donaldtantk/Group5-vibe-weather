
import './WeatherInfographic.js';

class WeatherCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get styles() {
        return /*css*/`
            :host {
                display: block;
            }
            .card-content {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1.5rem;
                background-color: var(--card-background, #ffffff);
                border-radius: 1.5rem;
                box-shadow: var(--card-shadow, 0 10px 30px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.08));
                padding: 2.5rem;
                color: var(--text-color, #333);
            }

            @media (min-width: 600px) {
                .card-content {
                    grid-template-columns: 1fr 1fr;
                    align-items: center;
                }
            }

            weather-infographic {
                width: 100%;
                height: 100%;
            }

            #text-content {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            h1 {
                font-size: 2.2rem;
                font-weight: 700;
                margin: 0;
            }

            p {
                font-size: 1.1rem;
                line-height: 1.6;
                margin: 0;
            }

            #flowery-description {
                font-size: 1.2rem;
                font-weight: 500;
                color: var(--primary-color, #007bff);
            }

            #poem-container {
                background-color: rgba(0,0,0,0.05);
                padding: 1.5rem;
                border-radius: 0.75rem;
                font-style: italic;
            }

            #voice-button {
                align-self: flex-start;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 2rem;
                background-color: var(--primary-color, #007bff);
                color: white;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                box-shadow: var(--button-glow, 0 0 10px rgba(0, 123, 255, 0.5));
                transition: transform 0.2s ease, box-shadow 0.3s ease;
            }

            #voice-button:hover {
                transform: scale(1.05);
                box-shadow: var(--button-glow), 0 4px 15px rgba(0, 123, 255, 0.4);
            }
        `;
    }

    set weatherData(data) {
        this.data = data;
        this.render(data);
    }

    render(data) {
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const poem = this.generatePoem(data);
        const floweryDescription = this.generateFloweryDescription(data);
        const city = data.name;
        
        this.shadowRoot.innerHTML = `
            <style>${WeatherCard.styles}</style>
            <div class="card-content">
                <weather-infographic id="weather-infographic"></weather-infographic>
                <div id="text-content">
                    <h1 id="location">${city}, ${data.sys.country}</h1>
                    <p id="weather-description">Currently ${temp}°C with ${description}.</p>
                    <p id="flowery-description">${floweryDescription}</p>
                    
                    <div id="poem-container">
                        <p id="poem">${poem.replace(/\n/g, '<br>')}</p>
                    </div>
                    <button id="voice-button">Speak the Poem</button>
                </div>
            </div>
        `;

        this.shadowRoot.getElementById('weather-infographic').data = data;
        this.shadowRoot.getElementById('voice-button').addEventListener('click', () => this.speakPoem());
    }
    
    generateFloweryDescription(data) {
        const condition = data.weather[0].main;
        const temp = Math.round(data.main.temp);

        const phrases = {
            Clear: `A canvas of endless blue, kissed by a radiant, golden sun. A perfect day to bask in warmth and light.`,
            Clouds: `The sky is a gentle masterpiece of soft, drifting clouds, painting a serene and tranquil scene overhead.`,
            Rain: `A gentle, rhythmic percussion of raindrops cleanses the world, bringing a fresh, renewing scent to the air.`,
            Drizzle: `A fine, misty veil descends, whispering secrets to the leaves and adding a touch of magic to the day.`,
            Thunderstorm: `The heavens command attention with a dramatic display of light and sound, a powerful and awe-inspiring spectacle.`,
            Snow: `A pristine blanket of white drapes the landscape, silencing the world in a beautiful, chilly embrace.`,
            Default: `The weather today is a unique chapter in this location's story, waiting to be experienced.`
        };

        let desc = phrases[condition] || phrases.Default;
        if (temp > 25) desc += " It's a truly warm day!";
        if (temp < 5) desc += " A brisk chill is in the air!";
        return desc;
    }

    generatePoem(data) {
        const city = data.name;
        const condition = data.weather[0].main;

        const poems = {
            Clear: `In ${city}, light does gleam,\nA waking, sunlit, golden dream.\nAzure skies, a joyful art,\nLifting every single heart.`,
            Clouds: `Above ${city}, soft and high,\nGrey-white galleons sailing by.\nA quiet peace, a gentle grace,\nReflected in this happy place.`,
            Rain: `The sky above ${city} weeps,\nWhile all the thirsty nature sleeps.\nEach drop a note in a sweet song,\nWhere life and growth are ever strong.`,
            Default: `In ${city}'s heart, the day awakes,\nA path of beauty it remakes.\nWith every breath of air we take,\nA lovely memory we make.`
        };
        return poems[condition] || poems.Default;
    }

    speakPoem() {
        const poemText = this.shadowRoot.getElementById('poem').innerText;
        if (poemText && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(poemText);
            speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser does not support text-to-speech.");
        }
    }
}

customElements.define('weather-card', WeatherCard);
