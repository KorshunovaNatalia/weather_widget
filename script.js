const apiKey = "5344d5a5b6c0d1b3a62fba6b28d66969"; // Замените на ваш API key
const cityNameElement = document.getElementById('city-name');
const cityInputElement = document.getElementById('city-input');
const updateCityButton = document.getElementById('update-city');

const currentIconElement = document.getElementById('current-icon');
const currentTempElement = document.getElementById('current-temp-value');
const currentWindElement = document.getElementById('current-wind');
const currentPressureElement = document.getElementById('current-pressure');
const currentHumidityElement = document.getElementById('current-humidity');
const hourlyForecastTodayElement = document.getElementById('hourly-forecast-today');
const hourlyForecastTomorrowElement = document.getElementById('hourly-forecast-tomorrow');
const tenDayContainerElement = document.getElementById('ten-day-container');

let city = "Moscow";

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

function displayCurrentWeather(data) {
    cityNameElement.textContent = data.name;
    const temperature = Math.round(data.main.temp);
    const iconCode = data.weather[0].icon;
    const windSpeed = data.wind.speed; //Скорость ветра
    const pressure = data.main.pressure; //Давление
    const humidity = data.main.humidity; //Влажность

    currentIconElement.innerHTML = `<img src="">`;
    currentTempElement.textContent = temperature;
    currentWindElement.textContent = `Ветер: ${windSpeed} м/с`;
    currentPressureElement.textContent = `Давление: ${pressure} гПа`;
    currentHumidityElement.textContent = `Влажность: ${humidity}%`;
}

function displayForecast(forecastList) {
    hourlyForecastTodayElement.innerHTML = "";
    hourlyForecastTomorrowElement.innerHTML = "";
    tenDayContainerElement.innerHTML = "";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayDate = today.toISOString().slice(0, 10);
    const tomorrowDate = tomorrow.toISOString().slice(0, 10);


    // Фильтрация данных для завтра (только определенное время)
    const tomorrowForecastFiltered = forecastList.filter(forecast => {
        const date = forecast.dt_txt.split(" ")[0];
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        return date === tomorrowDate && ["00:00", "06:00", "12:00", "18:00", "21:00"].includes(time);
    });

    // Отображение почасового прогноза на завтра (только отфильтрованные данные)
    tomorrowForecastFiltered.forEach(forecast => {
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        const iconCode = forecast.weather[0].icon;
        const temp = Math.round(forecast.main.temp);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${time}</p>
            <img src="" alt="Погода">
            <p>${temp}°C</p>
        `;
        hourlyForecastTomorrowElement.appendChild(forecastItem);
    });


    // Остальной код, отвечающий за другие блоки (сегодня и 10 дней) остается без изменений
    forecastList.forEach(forecast => {
        // ... (Код для отображения погоды на сегодня - БЕЗ ИЗМЕНЕНИЙ) ...
        const date = forecast.dt_txt.split(" ")[0];
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        if (date === todayDate) {
            const iconCode = forecast.weather[0].icon;
            const temp = Math.round(forecast.main.temp);

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <p>${time}</p>
                <img src="">
                <p>${temp}°C</p>
            `;
            hourlyForecastTodayElement.appendChild(forecastItem);
        }

    });

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
                icon: forecast.weather[0].icon, // Используем иконку первого прогноза на день
                dayName: `${dayName}, ${dayNumber}`
            };
        }
        dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, forecast.main.temp_min);
        dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, forecast.main.temp_max);
    });

    Object.keys(dailyForecasts).slice(0, 10).forEach(date => {
        const dayForecast = dailyForecasts[date];
        const tenDayItem = document.createElement('div');
        tenDayItem.classList.add('ten-day-item');
        tenDayItem.innerHTML = `
            <p>${dayForecast.dayName}</p>
            <img src="" alt="Погода">
            <p>Мин: ${Math.round(dayForecast.minTemp)}°C</p>
            <p>Макс: ${Math.round(dayForecast.maxTemp)}°C</p>
        `;
        tenDayContainerElement.appendChild(tenDayItem);
    });
}

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

updateCityButton.addEventListener('click', () => {
    const newCity = cityInputElement.value;
    if (newCity) {
        city = newCity;
        getWeather();
    }
});

getWeather();