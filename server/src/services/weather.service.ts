import axios from 'axios';
import { assessWeatherRisk } from '../utils/grok';

interface CityWeather {
  city: string;
  description: string;
  temp: number;
  windSpeed: number;
  rainMm: number;
  humidity: number;
  icon: string;
}

// ── getWeatherForCity ─────────────────────────────────────────────────────────
export async function getWeatherForCity(city: string): Promise<CityWeather | null> {
  if (!process.env.OPENWEATHER_API_KEY) return null;

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: { q: city.trim(), appid: process.env.OPENWEATHER_API_KEY, units: 'metric' },
        timeout: 5000,
      },
    );

    return {
      city:        data.name,
      description: data.weather[0]?.description ?? 'unknown',
      temp:        Math.round(data.main.temp),
      windSpeed:   Math.round((data.wind?.speed ?? 0) * 3.6), // m/s → km/h
      rainMm:      data.rain?.['1h'] ?? 0,
      humidity:    data.main.humidity,
      icon:        data.weather[0]?.icon ?? '',
    };
  } catch (err: any) {
    console.error('[Weather]', city, err.message);
    return null;
  }
}

// ── assessTripWeather ─────────────────────────────────────────────────────────
export async function assessTripWeather(source: string, destination: string) {
  const [sourceWeather, destWeather] = await Promise.all([
    getWeatherForCity(source),
    getWeatherForCity(destination),
  ]);

  if (!sourceWeather && !destWeather) {
    return {
      available: false,
      reason: 'Weather service not configured or city not found',
    };
  }

  const risk =
    sourceWeather && destWeather
      ? await assessWeatherRisk(source, sourceWeather, destination, destWeather)
      : null;

  return {
    available:   true,
    source:      sourceWeather,
    destination: destWeather,
    risk, // null if Grok unavailable — frontend handles gracefully
  };
}
