const apiKey = "5344d5a5b6c0d1b3a62fba6b28d66969"; 
const cityNameElement = document.getElementById('city-name');
const cityInputElement = document.getElementById('city-input');

const updateCityButton = document.getElementById('update-city');
const citySelectElement = document.getElementById('city-select');
const currentDateElement = document.getElementById('current-date');

// Получаем элементы
const cityInput = document.getElementById('city-input');
const dropdownArrow = document.querySelector('.dropdown-arrow');
const selectCity = document.querySelector('.select-city');
const cityOptions = document.querySelectorAll('.city-option');
const updateCityBtn = document.getElementById('update-city');

const currentIconElement = document.getElementById('current-icon');
const currentTempElement = document.getElementById('current-temp-value');
const currentWindElement = document.getElementById('current-wind');
const currentPressureElement = document.getElementById('current-pressure');
const currentHumidityElement = document.getElementById('current-humidity');
const hourlyForecastTodayElement = document.getElementById('hourly-forecast-today');
const hourlyForecastTomorrowElement = document.getElementById('hourly-forecast-tomorrow');

const tenDayContainerElement = document.getElementById('five-day-container');

const assistantIconElement = document.getElementById('assistant-icon');
const assistantAdviceElement = document.getElementById('assistant-advice');

let city = "Moscow"; 

// Функция для форматирования даты
function formatDate(date) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('ru-RU', options);
}

// Отображаем дату при загрузке страницы
window.onload = function() {
    const today = new Date();
    const formattedDate = formatDate(today);
    currentDateElement.textContent = formattedDate;
}

function getCustomIconPath(weatherCode, description) {
  switch (weatherCode) {
    case '01d':        return 'images/Sunny.svg';
    case '01n':        return 'images/Clear-night.svg';
    case '02d':        return 'images/Partly-cloudy.svg';
    case '02n':        return 'images/Partly-cloudy-night.svg';
    case '03d':        return 'images/Cloudy.svg';
    case '03n':        return 'images/Cloudy.svg';
    case '04d':        return 'images/Cloudy.svg';
    case '04n':        return 'images/Cloudy.svg';
    case '09d':        return 'images/rain.svg';
    case '09n':        return 'images/rain.svg';
    case '10d':        return 'images/small_rain.svg';
    case '10n':        return 'images/small_rain.svg';
    case '11d':        return 'images/thunderstorm.svg';
    case '11n':        return 'images/thunderstorm.svg';
    case '13d':        return 'images/Snow.svg';
    case '13n':        return 'images/Snow.svg';
    case '50d':        return 'images/mist.svg';
    case '50n':        return 'images/mist.svg';
    default:
  }
}

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
    const iconPath = getCustomIconPath(iconCode, data.weather[0].description);
    currentIconElement.innerHTML = `<img src="${iconPath}" alt="Погода">`;
    currentTempElement.textContent = temperature;
    currentWindElement.textContent = `Ветер: ${windSpeed} м/с`;
    currentPressureElement.textContent = `Давление: ${pressure} гПа`;
    currentHumidityElement.textContent = `Влажность: ${humidity}%`;

    setAssistantAdvice(data.weather[0].description, temperature);
}

function displayForecast(forecastList) {
    const now = new Date();
    const todayDate = now.toLocaleDateString('en-CA');
    hourlyForecastTodayElement.innerHTML = "";
    hourlyForecastTomorrowElement.innerHTML = "";
    tenDayContainerElement.innerHTML = "";

    // Все возможные временные слоты
    const targetTimes = ["09:00", "12:00", "15:00", "18:00", "21:00"];

    // Собираем реальные прогнозы на сегодня
    const todayForecasts = {};
    forecastList.forEach(forecast => {
        const [date, time] = forecast.dt_txt.split(" ");
        if (date === todayDate && targetTimes.includes(time.slice(0, 5))) {
            todayForecasts[time.slice(0, 5)] = {
                temp: Math.round(forecast.main.temp),
                icon: getCustomIconPath(forecast.weather[0].icon, forecast.weather[0].description),
                time: time.slice(0, 5)
            };
        }
    });

    // Находим последнюю актуальную температуру (для заглушек)
    let lastValidTemp = null;
    targetTimes.forEach(time => {
        if (todayForecasts[time] && new Date(`${todayDate}T${time}:00`) <= now) {
            lastValidTemp = todayForecasts[time].temp;
        }
    });

    // Рендерим все слоты для "Сегодня"
    targetTimes.forEach(time => {
        const forecast = todayForecasts[time];
        const slotTime = new Date(`${todayDate}T${time}:00`);
        const isPast = slotTime <= now;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        if (isPast) forecastItem.classList.add('past-forecast');

        // Если есть данные — показываем, иначе заглушку
        if (forecast) {
            forecastItem.innerHTML = `
                <p>${time}</p>
                <img src="${forecast.icon}" alt="Погода">
                <h4>${forecast.temp}°C</h4>
            `;
        } else {
            const temp = lastValidTemp !== null ? lastValidTemp - 1 : '--';
            forecastItem.innerHTML = `
                <p>${time}</p>
                <img src="images/Zaglushka.svg" alt="Нет данных">
                <h4>${temp}°C</h4>
            `;
        }
        hourlyForecastTodayElement.appendChild(forecastItem);
    });

    // Прогноз на завтра
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().slice(0, 10);
    const tomorrowForecast = forecastList.filter(forecast => {
        const [date, time] = forecast.dt_txt.split(" ");
        return date === tomorrowDate && targetTimes.includes(time.slice(0, 5));
    });

    tomorrowForecast.forEach(forecast => {
        const time = forecast.dt_txt.split(" ")[1].slice(0, 5);
        const iconPath = getCustomIconPath(forecast.weather[0].icon, forecast.weather[0].description);
        const temp = Math.round(forecast.main.temp);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${time}</p>
            <img src="${iconPath}" alt="Погода">
            <h4>${temp}°C</h4>
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
                description: forecast.weather[0].description,
                dayName: `${dayName}, ${dayNumber}`,
                date: date
            };
        }
        dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, forecast.main.temp_min);
        dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, forecast.main.temp_max);
    });

    // Получаем доступные даты
    const availableDates = Object.keys(dailyForecasts).slice(1);

    // Добавляем прогнозы для доступных дней
    availableDates.forEach(date => {
        const dayForecast = dailyForecasts[date];
        const forecastDate = new Date(date);
        const tenDayItem = document.createElement('div');
        tenDayItem.classList.add('five-day-item');
        
        if (forecastDate < new Date(now.toLocaleDateString('en-CA'))) {
            tenDayItem.classList.add('past-forecast');
        }
        
        tenDayItem.innerHTML = `
            <h4>${dayForecast.dayName}</h4>
            <img src="${getCustomIconPath(dayForecast.icon, dayForecast.description)}" alt="Погода">           
            <p>Мин: ${Math.round(dayForecast.minTemp)}°C</p>
            <p>Макс: ${Math.round(dayForecast.maxTemp)}°C</p>
        `;
        tenDayContainerElement.appendChild(tenDayItem);
    });

    // Добавляем заглушку для следующего дня, если нужно
    if (availableDates.length < 5) {
        // Берем последний доступный день или текущий, если нет данных
        const lastDate = availableDates.length > 0 ? 
            new Date(availableDates[availableDates.length - 1]) : 
            new Date(now);
        
        // Создаем дату для заглушки (последний день +1)
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 1);
        
        const dayName = nextDate.toLocaleDateString('ru-RU', { weekday: 'short' });
        const dayNumber = nextDate.toLocaleDateString('ru-RU', { day: 'numeric' });
        
        // Берем температуру последнего дня или используем 20°C по умолчанию
        const lastTemp = availableDates.length > 0 ? 
            dailyForecasts[availableDates[availableDates.length - 1]].maxTemp : 
            20;
        
        // Генерируем рандомную температуру в пределах ±3°C от последней
        const randomTemp = Math.round(lastTemp + (Math.random() * 6 - 3));
        
        const tenDayItem = document.createElement('div');
        tenDayItem.classList.add('five-day-item');
        tenDayItem.innerHTML = `
            <h4>${dayName}, ${dayNumber}</h4>
            <img src="images/Cloudy.svg" alt="Прогноз загружается">           
            <p>Мин: ${randomTemp - 2}°C</p>
            <p>Макс: ${randomTemp}°C</p>
        `;
        tenDayContainerElement.appendChild(tenDayItem);
    }
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
            getWeather();
        });
    } else {
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

// Обработчик клика по стрелке
dropdownArrow.addEventListener('click', function() {
  selectCity.classList.toggle('open');
});

// Обработчик выбора города из списка
cityOptions.forEach(option => {
  option.addEventListener('click', function() {
    cityInput.value = this.getAttribute('data-value');
    selectCity.classList.remove('open');
  });
});

// Закрываем выпадающий список при клике вне его
document.addEventListener('click', function(e) {
  if (!selectCity.contains(e.target)) {
    selectCity.classList.remove('open');
  }
});

// Обработчик обновления города
updateCityBtn.addEventListener('click', function() {
  if (cityInput.value) {
    city = cityInput.value;
    getWeather();
  }
});

// Обработчик нажатия Enter в поле ввода
cityInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    if (cityInput.value) {
      city = cityInput.value;
      getWeather();
    }
  }
});


// Функция для установки совета помощника
function setAssistantAdvice(weatherDescription, temperature) {
    let advice = "";
    const desc = weatherDescription.toLowerCase();
    if (desc.includes('солнечно') || desc.includes('ясно') || desc.includes('clear')) {
        advice = "Сегодня солнечно! Не забудьте солнцезащитный крем.";
    } else if (desc.includes('дождь') || desc.includes('rain')) {
        advice = "Ожидается дождь. Возьмите зонтик!";
    } else if (desc.includes('облачно') || desc.includes('cloud')) {
        advice = "Пасмурная погода. Можно взять зонт на всякий случай.";
    } else if (temperature < 2) {
        advice = "Будет холодно. Оденьтесь теплее.";
    } else if (temperature > 25) {
        advice = "Жарко! Одевайте легко и пейте больше воды.";
    } else {
        advice = "Хорошего дня!";
    }
    assistantAdviceElement.textContent = advice;
}

// Начальная загрузка погоды
getLocation();

