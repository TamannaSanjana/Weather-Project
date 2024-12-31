const API_KEY = '4caab57809644116f53f4165a1fc8c17';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location-input');
const currentLocation = document.getElementById('current-location');
const currentTemp = document.getElementById('current-temp');
const currentDescription = document.getElementById('current-description');
const hourlyForecast = document.getElementById('hourly-forecast');

async function getWeatherData(location) {
    try {
        const currentWeatherResponse = await fetch(`${BASE_URL}/weather?q=${location}&units=metric&appid=${API_KEY}`);
        const currentWeatherData = await currentWeatherResponse.json();

        const { lat, lon } = currentWeatherData.coord;
        const oneCallResponse = await fetch(`${BASE_URL}/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${API_KEY}`);
        const oneCallData = await oneCallResponse.json();

        return { current: currentWeatherData, forecast: oneCallData };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}

function updateCurrentWeather(data) {
    document.getElementById('location').textContent = data.current.name;
    document.getElementById('current-temp').textContent = `${Math.round(data.current.main.temp)}°C`;
    document.getElementById('feels-like').textContent = `Feels like ${Math.round(data.current.main.feels_like)}°C`;
    document.getElementById('weather-description').textContent = data.current.weather[0].description;
    document.getElementById('wind-speed').textContent = `${data.current.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.current.main.humidity}%`;
    document.getElementById('cloud-cover').textContent = `${data.current.clouds.all}%`;
    document.getElementById('rain-amount').textContent = `${data.current.rain ? data.current.rain['1h'] : 0} mm`;

    const iconCode = data.current.weather[0].icon;
    const iconName = getFeatherIconName(iconCode);
    feather.replace({
        'id': 'weather-icon',
        'data-feather': iconName
    });
}

function updateHourlyForecast(hourlyData) {
    hourlyForecast.innerHTML = '';
    hourlyData.slice(1, 25).forEach(hour => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        
        const date = new Date(hour.dt * 1000);
        const hourString = date.getHours().toString().padStart(2, '0') + ':00';
        
        hourlyItem.innerHTML = `
            <div class="time">${hourString}</div>
            <div class="icon" data-feather="${getWeatherIcon(hour.weather[0].icon)}"></div>
            <div class="temp">${Math.round(hour.temp)}°C</div>
            <div class="wind">${Math.round(hour.wind_speed)} km/h</div>
        `;
        
        hourlyForecast.appendChild(hourlyItem);
    });
    feather.replace();
}

function updateSevenDayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    data.forecast.daily.forEach((day, index) => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        const date = new Date(day.dt * 1000);
        const dayString = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const iconCode = day.weather[0].icon;
        const iconName = getFeatherIconName(iconCode);
        
        forecastItem.innerHTML = `
            <span>${dayString}</span>
            <i data-feather="${iconName}"></i>
            <span>${Math.round(day.temp.max)}°C</span>
            <span>${Math.round(day.temp.min)}°C</span>
        `;
        forecastContainer.appendChild(forecastItem);
    });
    feather.replace();
}

function getFeatherIconName(iconCode) {
    const iconMap = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud',
        '02n': 'cloud',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud',
        '04n': 'cloud',
        '09d': 'cloud-drizzle',
        '09n': 'cloud-drizzle',
        '10d': 'cloud-rain',
        '10n': 'cloud-rain',
        '11d': 'cloud-lightning',
        '11n': 'cloud-lightning',
        '13d': 'cloud-snow',
        '13n': 'cloud-snow',
        '50d': 'wind',
        '50n': 'wind'
    };
    
    return iconMap[iconCode] || 'help-circle';
}

async function updateWeather(location) {
    const weatherData = await getWeatherData(location);
    if (weatherData) {
        updateCurrentWeather(weatherData);
        updateHourlyForecast(weatherData);
        updateSevenDayForecast(weatherData);
    }
}

searchBtn.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        updateWeather(location);
    }
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Initial weather update for a default location
updateWeather('Sylhet');

// Initialize Feather Icons
feather.replace();