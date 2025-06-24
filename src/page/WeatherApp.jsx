import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { CiLocationOn } from "react-icons/ci";
import { IoSearch, IoEye } from "react-icons/io5";
import { GiWaterDrop } from "react-icons/gi";
import { FaWater } from "react-icons/fa6";
import { FaWind } from "react-icons/fa";

import clearSky from '../assets/weather/clear-sky.png';
import cloud from '../assets/weather/cloud.png';
import rain from '../assets/weather/rain.png';
import snow from '../assets/weather/snow.png';
import thunderstorm from '../assets/weather/thunderstorm.png';
import logo from '../assets/logo.png'

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');

  const apiKey = '4876c3497fb324cce4dc0a420837a777';

  const getWeatherByCity = async (cityName) => {
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`)
      ]);
      setWeather(weatherRes.data);
      setForecast(processForecast(forecastRes.data.list));
      setError('');
    } catch {
      setWeather(null);
      setForecast([]);
      setError('City not found. Try another one.');
    }
  };

  const getWeatherByCoords = async (lat, lon) => {
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
      ]);
      setWeather(weatherRes.data);
      setCity(weatherRes.data.name);
      setForecast(processForecast(forecastRes.data.list));
      setError('');
    } catch {
      setWeather(null);
      setForecast([]);
      setError('Unable to get weather for your location.');
    }
  };

  const processForecast = (list) => {
    const dailyMap = new Map();
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap.has(date) && item.dt_txt.includes('12:00:00')) {
        dailyMap.set(date, item);
      }
    });
    return Array.from(dailyMap.values()).slice(0, 5);
  };

  const getLocalDateString = (timezoneOffsetInSeconds) => {
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC.getTime() + timezoneOffsetInSeconds * 1000);
    return localTime.toLocaleDateString('en-PH', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    });
  };

  const getWeatherImage = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return clearSky;
    if (desc.includes('cloud')) return cloud;
    if (desc.includes('rain')) return rain;
    if (desc.includes('snow')) return snow;
    if (desc.includes('thunder')) return thunderstorm;
    return cloud;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => getWeatherByCoords(coords.latitude, coords.longitude),
        () => getWeatherByCity('Manila')
      );
    } else {
      getWeatherByCity('Manila');
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white/20 p-4 py-8 w-full md:max-w-2xl">

      <div className="flex gap-2 w-full justify-between items-center h-full">
        
        <div className='flex'>
          <img src={logo} alt="logo" className='h-16 w-20'/>
        </div>
        
        <div className="relative w-full ml-4">
          <input
            type="text"
            placeholder="City, Country"
            className="w-full pr-4 py-2 px-4 outline-2 outline-[#ab51e3] hover:outline-[#ab51e3] bg-white rounded-lg text-black focus:outline-2 focus:outline-[#ab51e3]"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getWeatherByCity(city)}
          />
          <IoSearch
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ab51e3] h-6 w-6 cursor-pointer"
            onClick={() => getWeatherByCity(city)}
          />
        </div>
      </div>

      {error && <p className="mt-8 text-red-500">{error}</p>}

      {weather && (
        <div className="mt-8 bg-purple-gradient rounded-4xl w-full shadow p-6 text-center text-white">
          <div className='flex justify-between'>

          <div className='flex flex-col justify-between'>
            <div className='flex'>
            <div className='flex bg-white px-4 py-1 pt-2 rounded-full'>
                <CiLocationOn className='text-black h-6 w-6' />
                <h2 className="text-md text-black text-nowrap font-semibold mb-1 ml-1">
                  {weather.name}, {weather.sys.country}
                </h2>
              </div>
            </div>

            <p className="text-[60px] text-start font-bold">
              {Math.round(weather.main.temp)}°C
            </p>

            <p className="text-start font-semibold">
              {getLocalDateString(weather.timezone)}
            </p>
          </div>

          <div className='flex flex-col justify-between'>
            <div></div>
            <div>
              <img
                src={getWeatherImage(weather.weather[0].description)}
                alt={weather.weather[0].description}
                className="w-24 md:w-48 h-24 md:h-48 mb-4"
              />
              <p className="capitalize font-semibold">{weather.weather[0].description}</p>
            </div>
          </div>
          </div>
        </div>
      )}

      {weather && (
        <div className="mt-6 w-full text-center text-white">
          <div className="text-sm mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-gradient shadow p-4 rounded-2xl w-full">
              <div className='flex items-center space-x-2'>
                <FaWater size={20}/>
                <p>HUMIDITY</p>
              </div>
              <p className="text-[48px] font-bold">{weather.main.humidity}<span className='text-sm'>%</span></p>
            </div>

            <div className="bg-purple-gradient shadow p-4 rounded-2xl w-full">
              <div className='flex items-center space-x-2'>
                <FaWind size={20}/>
                <p>WIND</p>
              </div>
              <p className="text-[48px] font-bold">{weather.wind.speed}<span className='text-sm'>m/s</span></p>
            </div>

            <div className="bg-purple-gradient shadow p-4 rounded-2xl w-full">
              <div className='flex items-center space-x-1'>
                <GiWaterDrop size={20}/>
                <p>PRECIPITATION</p>
              </div>
              <p className="text-[48px] font-bold">{weather.rain?.['1h'] ?? 0}<span className='text-sm'>mm</span></p>
            </div>

            <div className="bg-purple-gradient shadow p-4 rounded-2xl w-full">
              <div className='flex items-center space-x-2'>
                <IoEye size={20}/>
                <p>VISIBILITY</p>
              </div>
              <p className="text-[48px] font-bold">{(weather.visibility / 1000).toFixed(1)}<span className='text-sm'>km</span></p>
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="mt-8 w-full">
          <h3 className="text-xl font-bold text-black mb-4">5-Day Forecast</h3>
          
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
            {forecast.map((day, idx) => (
              <div
                key={idx}
                className={`min-w-[150px] flex-shrink-0 p-4 rounded-2xl shadow text-center ${
                  new Date(day.dt_txt).toDateString() === new Date().toDateString()
                    ? 'bg-purple-gradient text-white'
                    : 'bg-white'
                }`}
              >
                <p className="font-semibold">
                  {new Date(day.dt_txt).toLocaleDateString('en-PH', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <img
                  src={getWeatherImage(day.weather[0].description)}
                  alt={day.weather[0].description}
                  className="mx-auto w-16 h-16"
                />
                <p className="text-lg font-semibold">{Math.round(day.main.temp)}°C</p>
                <p className="capitalize text-sm mb-2">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
