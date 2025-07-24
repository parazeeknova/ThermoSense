<div align="center">

<img src="./assets/thermosense.png" alt="thermosense-banner" width="100%">

</div>

---

[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-EBE9DF?style=for-the-badge&logo=next.js&logoColor=EBE9DF)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-EBE9DF?style=for-the-badge&logo=react&logoColor=EBE9DF)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-EBE9DF?style=for-the-badge&logo=typescript&logoColor=EBE9DF)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-EBE9DF?style=for-the-badge&logo=tailwindcss&logoColor=EBE9DF)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-EBE9DF?style=for-the-badge&logo=docker&logoColor=EBE9DF)](https://www.docker.com/)
[![Self-Hostable](https://img.shields.io/badge/Self--Hostable-✓-EBE9DF?style=for-the-badge&logo=homeassistant&logoColor=EBE9DF)](https://github.com)

> An intelligent thermal management system that helps users understand how ambient weather affects their device's thermal state, predict overheating risks, and take preventive actions through AI-powered insights.

> [!NOTE]
>  The reason this project isn't deployed is because it requires access to local system information and battery details. Hosting it on Vercel would consume edge requests and function invocations. On the other hand, self-hosting it on my VPS would only show the weather, since VPS machines don't have batteries and both Vercel and VPS environments are typically restrictive about exposing system-level details, likely due to their use of virtualization platforms like Proxmox.

## Project Overview

ThermoSense is **ambient-aware battery health advisor** that bridges the gap between environmental conditions and device thermal management. The application provides real-time monitoring, predictive analytics, and AI-powered recommendations to optimize device performance and battery longevity.

## Features
- **Real-Time Device Monitoring:**
Continuously tracks CPU temperature, battery status, and system load, updating every 2 seconds for instant feedback.
- **Ambient-Aware Analytics:**
Integrates live weather data to correlate environmental conditions with device thermal state.
- **Advanced Heat Risk Assessment:**
Uses a weighted scoring algorithm to evaluate overheating risk, factoring in device and ambient temperatures, CPU load, humidity, and time of day.
- **AI-Powered Recommendations:**
Leverages Google Gemini AI to provide actionable, context-aware tips for thermal management, battery health, and performance optimization.
- **Predictive Analytics:**
Forecasts future device temperature trends and risk levels, helping users take proactive measures.
- **Customizable Dashboard:**
Modular, drag-and-drop interface lets users personalize their monitoring and analytics layout.
- **Historical Data Visualization:**
Displays trends and patterns over time, enabling users to analyze past device performance and environmental impacts.
- **Notification Center:**
Centralized hub for AI recommendations, alerts, and actionable insights.
- **Responsive & Modern UI:**
Built with React, Next.js, and Tailwind CSS for a seamless experience across devices.
- **Easy Deployment:**
Docker-ready and simple to configure for local or cloud hosting.

## Setup & Installation

### Prerequisites
**Node.js**: Version 18.0 or higher |
**Bun**: Latest version (recommended) or npm/yarn |
**System Access**: Permission to read hardware information

### Environment Variables - Required for AI & Weather
Create a `.env.local` file in the root directory:

```bash
# Required for AI features
GEMINI_API_KEY=your_google_gemini_api_key_here
# Required for weather data
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Installation Steps
```bash
git clone https://github.com/parazeeknova/thermosense.git
cd thermosense

# Using Bun (recommended)
bun install
# Or using npm
npm install

# Start development server with Turbopack
bun run dev

# Server will start at http://localhost:3000
```

### Production Build
```bash
# Build for production
bun run build

# Start production server
bun start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t thermosense .

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

## Key Code Snippets

### Risk Assessment Algorithm
The heat risk calculation uses a weighted scoring system:

```typescript
// Risk factors with weights
const weights = {
  tempDiff: 0.3,      // Device vs ambient temperature
  absoluteTemp: 0.25,  // Absolute device temperature
  cpuLoad: 0.2,       // Current CPU utilization
  trend: 0.15,        // Temperature trend direction
  humidity: 0.05,     // Environmental humidity
  timeOfDay: 0.05     // Peak usage hours
}
```

## Screenshots

| Dashboard Overview | Analytics | More Analytics | Draggable Cards |
|:------------------:|:---------:|:--------------:|:--------------:|
| ![Dashboard](./assets/dashboard.png) | ![Analytics](./assets/analytics.png) | ![Analytics More](./assets/analytics-more.png) | ![Draggable](./assets/draggable.png) |

### 1. Real-Time Device Monitoring Hook
This React hook serves as the backbone for continuous device hardware monitoring in the ThermoSense application. The `useDeviceInfo` function leverages TanStack Query to automatically fetch device information every 2 seconds, ensuring users receive real-time updates on CPU temperature, battery status, and system load. The hook implements sophisticated caching strategies with configurable stale time and garbage collection periods to optimize performance while maintaining data freshness. It includes robust error handling with exponential backoff retry logic, attempting up to 3 retries with increasing delays to handle temporary network issues gracefully. Additionally, the hook coordinates with other data sources through cache invalidation, automatically triggering updates to historical data when new device information arrives, ensuring all dashboard components remain synchronized.

```typescript
// src/hooks/use-device-info.ts
export function useDeviceInfo() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: deviceInfoKeys.current(),
    queryFn: fetchDeviceInfo,
    refetchInterval: 2000,
    staleTime: 1000,
    gcTime: 5000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Coordinate cache invalidation
  useEffect(() => {
    if (query.data?.timestamp) {
      queryClient.invalidateQueries({
        queryKey: ['historical-data'],
        exact: false,
      })
    }
  }, [query.data?.timestamp, queryClient])

  return query
}
```

### 2. AI-Powered Recommendations Service
The `generateRecommendations` method represents the core AI integration that transforms raw sensor data into actionable thermal management insights. This service constructs detailed prompts for Google Gemini AI, incorporating current device metrics such as temperature, battery level, CPU usage, and ambient weather conditions. The AI is specifically instructed to focus on four key areas: immediate thermal risks and solutions, battery health optimization strategies, performance versus temperature trade-offs, and environmental adaptation suggestions. The service sends structured requests to the Gemini API and processes the responses to return parsed recommendations with different alert levels and specific actions. This intelligent system adapts its advice based on real-time conditions, providing users with contextually relevant suggestions that help prevent overheating and optimize device performance based on current environmental and usage patterns.

```typescript
// src/lib/gemini-service.ts
async generateRecommendations(context: DeviceContext): Promise<AIRecommendation[]> {
  const prompt = `
You are a thermal management AI advisor. Based on the following data, generate 2-4 actionable recommendations:

Device Data:
- Device Temperature: ${context.deviceTemp}°C
- Battery Level: ${context.batteryLevel}%
- Ambient Temperature: ${context.weatherTemp}°C
- CPU Usage: ${context.cpuUsage}%

Focus on:
1. Immediate thermal risks and solutions
2. Battery health optimization
3. Performance vs. temperature trade-offs
4. Environmental adaptation suggestions
`

  const response = await this.callGemini(prompt)
  return this.parseRecommendations(response)
}
```

### 3. Advanced Heat Risk Calculation (core)
The `calculateAdvancedRisk` function implements a multi-factor risk assessment algorithm, This algorithm analyzes the relationship between device temperature and ambient conditions, calculates trends from historical data points, and applies a weighted scoring system where different factors contribute proportionally to the overall risk assessment. The temperature difference between device and ambient environment carries the highest weight at 30%, followed by absolute device temperature at 25%, CPU load at 20%, temperature trends at 15%, and environmental factors like humidity and time of day contributing smaller but significant portions. The algorithm also incorporates temporal patterns, recognizing that peak hours between 12 PM and 6 PM typically present higher thermal stress. The function returns a comprehensive risk calculation that includes categorical risk levels (low, medium, high, critical), numerical scores, detailed breakdowns of contributing factors, and predictive temperature estimates for the next hour, providing users with both immediate risk awareness and forward-looking thermal intelligence.

```typescript
// src/components/dashboard/cards/heat-risk-meter.tsx
const calculateAdvancedRisk = (
  deviceTemp: number,
  ambientTemp: number,
  cpuLoad: number = 50,
  history: TemperatureHistory[] = [],
  humidity: number = 50,
): RiskCalculation => {
  const tempDiff = deviceTemp - ambientTemp

  // Calculate trend from historical data
  let trend = 0
  if (history.length >= 3) {
    const recent = history.slice(-3)
    const tempTrend = (recent[2].temperature - recent[0].temperature) / 2
    trend = Math.max(-10, Math.min(10, tempTrend))
  }

  // Risk factors calculation
  const factors: RiskFactors = {
    tempDifference: Math.min(100, Math.max(0, (tempDiff / 35) * 100)),
    absoluteTemp: Math.min(100, Math.max(0, (deviceTemp - 20) / 60 * 100)),
    cpuLoad,
    trend: Math.min(100, Math.max(0, (trend + 10) / 20 * 100)),
    humidity,
    timeOfDay: currentHour >= 12 && currentHour <= 18 ? 20 : 0,
  }

  // Weighted scoring system
  const weights = {
    tempDiff: 0.3,
    absoluteTemp: 0.25,
    cpuLoad: 0.2,
    trend: 0.15,
    humidity: 0.05,
    timeOfDay: 0.05,
  }

  const totalRisk = Object.entries(factors).reduce((sum, [key, value]) => {
    return sum + (value * weights[key as keyof typeof weights])
  }, 0)

  return {
    risk: totalRisk < 25 ? 'low' : totalRisk < 50 ? 'medium' : totalRisk < 75 ? 'high' : 'critical',
    value: Math.round(totalRisk),
    breakdown: factors,
    prediction: deviceTemp + (trend * 0.5)
  }
}
```

## Project Structure

```
ThermoSense/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Backend API routes
│   │   │   ├── ai/           # AI service endpoints
│   │   │   ├── device/       # Device information APIs
│   │   │   └── weather/      # Weather data APIs
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   │   ├── cards/        # Individual dashboard cards
│   │   │   └── sidebar-navigation.tsx
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React contexts
│   │   └── location-context.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── use-device-info.ts
│   │   ├── use-weather.ts
│   │   └── use-historical-data.ts
│   ├── lib/                  # Utility libraries
│   │   ├── gemini-service.ts # AI service
│   │   └── weather-service.ts
│   ├── providers/            # Context providers
│   ├── types/                # TypeScript type definitions
│   └── env.ts                # Environment configuration
├── components.json           # Shadcn/ui configuration
├── docker-compose.yml        # Docker deployment
├── Dockerfile                # Container configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies
└── tailwind.config.js        # Styling configuration
```

---
**Built with ❤️ for Thermal Intelligence**

*Developed as part of internship application for UI/UX Design Engineer Position - showcasing web development, AI integration, and system programming capabilities.*
