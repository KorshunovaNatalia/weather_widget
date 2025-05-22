const apiKey = "5344d5a5b6c0d1b3a62fba6b28d66969"; // Замените на ваш API key
const cityNameElement = document.getElementById('city-name');
const cityInputElement = document.getElementById('city-input');
const updateCityButton = document.getElementById('update-city');
const citySelectElement = document.getElementById('city-select');

const currentIconElement = document.getElementById('current-icon');
const currentTempElement = document.getElementById('current-temp-value');
const currentWindElement = document.getElementById('current-wind');
const currentPressureElement = document.getElementById('current-pressure');
const currentHumidityElement = document.getElementById('current-humidity');
const hourlyForecastTodayElement = document.getElementById('hourly-forecast-today');
const hourlyForecastTomorrowElement = document.getElementById('hourly-forecast-tomorrow');
const tenDayContainerElement = document.getElementById('five-day-container');
let city = "Moscow"; // Начальный город

// Функция для получения погоды
function getWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`)
        .then(response => response.json())
        .then(data => {
            console.log("Current weather data:", data);
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Ошибка получения текущей погоды:', error);
            displayError();
        });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`)
        .then(response => response.json())
        .then(data => {
            console.log("Forecast data:", data);
            displayForecast(data.list);
        })
        .catch(error => {
            console.error('Ошибка получения прогноза:', error);
            displayError();
        });
}


// Функция для отображения текущей погоды
function displayCurrentWeather(data) {
    cityNameElement.textContent = data.name;
    const temperature = Math.round(data.main.temp);
    const iconCode = data.weather[0].icon;
    const windSpeed = data.wind.speed; 
    const pressure = data.main.pressure; 
    const humidity = data.main.humidity; 
    currentIconElement.innerHTML = `<img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Погода">`;
    currentTempElement.textContent = temperature;
    currentWindElement.textContent = `Ветер: ${windSpeed} м/с`;
    currentPressureElement.textContent = `Давление: ${pressure} гПа`;
    currentHumidityElement.textContent = `Влажность: ${humidity}%`;
}

// Функция для отображения прогноза
function displayForecast(forecastList) {
    const today = new Date(Date.now());
    const todayDate = today.toLocaleDateString('en-CA');
    hourlyForecastTodayElement.innerHTML = "";
    hourlyForecastTomorrowElement.innerHTML = "";
    tenDayContainerElement.innerHTML = "";
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().slice(0, 10);

    // Прогноз на сегодня
    const targetTimes = ["00:00", "06:00", "12:00", "18:00", "21:00"];
    const todayForecastFiltered = forecastList.filter(forecast => {
        const date = forecast.dt_txt.split(" ")[0];
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        console.log(`Date: ${date}, Time: ${time}`); // Отладка
        return date === todayDate && targetTimes.includes(time);
    });

    console.log(forecastList); // Отладка
    console.log("Текущая дата:", todayDate);
    console.log("Прогноз:", forecastList);

    todayForecastFiltered.forEach(forecast => {
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        const iconCode = forecast.weather[0].icon;
        const temp = Math.round(forecast.main.temp);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${time}</p>
            <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Погода">
            <p>${temp}°C</p>
        `;
        hourlyForecastTodayElement.appendChild(forecastItem);
    });

    // Прогноз на завтра
    const tomorrowForecastFiltered = forecastList.filter(forecast => {
        const [date, time] = forecast.dt_txt.split(" ");
        return date === tomorrowDate && targetTimes.includes(time.slice(0, 5));
    });

    tomorrowForecastFiltered.forEach(forecast => {
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        const iconCode = forecast.weather[0].icon;
        const temp = Math.round(forecast.main.temp);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${time}</p>
            <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Погода">
            <p>${temp}°C</p>
        `;
        hourlyForecastTomorrowElement.appendChild(forecastItem);
    });

    // Прогноз на 5 дней
    const dailyForecasts = {};
    forecastList.forEach(forecast => {
        const date = forecast.dt_txt.split(" ")[0];
        if (!dailyForecasts[date]) {
            const forecastDate = new Date(forecast.dt * 1000);
            const dayName = forecastDate.toLocaleDateString('ru-RU', { weekday: 'short' });
            const dayNumber = forecastDate.toLocaleDateString('ru-RU', { day: 'numeric' });

            dailyForecasts[date] = {
                minTemp: Infinity,
                maxTemp: -Infinity,
                icon: forecast.weather[0].icon,
                dayName: `${dayName}, ${dayNumber}`
            };
        }
        dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, forecast.main.temp_min);
        dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, forecast.main.temp_max);
    });

    Object.keys(dailyForecasts).slice(1, 6).forEach(date => {
        const dayForecast = dailyForecasts[date];
        const tenDayItem = document.createElement('div');
        tenDayItem.classList.add('five-day-item');
        tenDayItem.innerHTML = `
            <p>${dayForecast.dayName}</p>
            <img src="http://openweathermap.org/img/wn/${dayForecast.icon}.png" alt="Погода">
            <p>Мин: ${Math.round(dayForecast.minTemp)}°C</p>
            <p>Макс: ${Math.round(dayForecast.maxTemp)}°C</p>
        `;
        tenDayContainerElement.appendChild(tenDayItem);
    });
}

// Функция для отображения ошибок
function displayError() {
    cityNameElement.textContent = "Ошибка получения данных";
    currentIconElement.innerHTML = "";
    currentTempElement.textContent = "";
    currentWindElement.textContent = "";
    currentPressureElement.textContent = "";
    currentHumidityElement.textContent = "";
    hourlyForecastTodayElement.innerHTML = "";
    hourlyForecastTomorrowElement.innerHTML = "";
    tenDayContainerElement.innerHTML = "";
}

// Функция для получения геолокации
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`)
                .then(response => response.json())
                .then(data => {
                    city = data.name;
                    getWeather();
                })
                .catch(error => {
                    console.error('Ошибка получения данных по геолокации:', error);
                });
        }, () => {
            // Если пользователь отклоняет геолокацию, загружаем погоду для города по умолчанию
            getWeather();
        });
    } else {
        // Геолокация не поддерживается
        getWeather();
    }
}

// Слушатель события для обновления города
updateCityButton.addEventListener('click', () => {
    const newCity = cityInputElement.value;
    if (newCity) {
        city = newCity;
        getWeather();
    }
});

// Начальная загрузка погоды
getLocation();