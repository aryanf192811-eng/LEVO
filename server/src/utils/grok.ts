import axios from 'axios';

interface WeatherData {
  description: string;
  temp: number;
  windSpeed: number;
  rainMm: number;
  humidity: number;
  city: string;
}

interface RiskAssessment {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  estimated_delay_hours: number;
  recommendation: string;
  proceed: boolean;
}

export async function assessWeatherRisk(
  source: string,
  sourceW: WeatherData,
  destination: string,
  destW: WeatherData,
): Promise<RiskAssessment | null> {
  if (!process.env.GROK_API_KEY) return null;

  const prompt = `You are a logistics operations assistant. Assess transport delay risk.

ROUTE: ${source} → ${destination}

SOURCE WEATHER (${source}):
- Condition: ${sourceW.description}
- Temperature: ${sourceW.temp}°C
- Wind Speed: ${sourceW.windSpeed} km/h
- Rainfall: ${sourceW.rainMm}mm/hr
- Humidity: ${sourceW.humidity}%

DESTINATION WEATHER (${destination}):
- Condition: ${destW.description}
- Temperature: ${destW.temp}°C
- Wind Speed: ${destW.windSpeed} km/h
- Rainfall: ${destW.rainMm}mm/hr
- Humidity: ${destW.humidity}%

RISK CRITERIA:
- HIGH: Rain >5mm/hr OR wind >60km/h OR visibility-reducing conditions (fog, storm, heavy rain)
- MEDIUM: Rain 2-5mm/hr OR wind 30-60km/h OR scattered showers
- LOW: Clear, light cloud, rain <2mm/hr, wind <30km/h

Respond ONLY with valid JSON, no markdown, no explanation:
{"risk_level":"LOW","estimated_delay_hours":0,"recommendation":"string under 100 chars","proceed":true}`;

  try {
    const { data } = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      },
    );

    return JSON.parse(data.choices[0].message.content.trim()) as RiskAssessment;
  } catch (err: any) {
    console.error('[Grok]', err.message);
    return null;
  }
}
