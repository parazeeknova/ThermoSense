> [!NOTE]
> This project was developed as part of an internship task, I won't be maintaining it actively. Feel free to fork and contribute!

> [!WARNING]
> This project contains a nextjs app with a electron wrapper (pretty janky setup ik) but it works. The app is not meant to be run in production. Also the build files does not work properly, so you will have to run the app in development mode. The app is not meant to be run in production. Also the build files does not work properly, so you will have to run the app in development mode.

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

> An intelligent thermal management system that helps users understand how ambient weather affects their device's thermal state, predict overheating risks, and take preventive actions through AI-powered insights built with electron.

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
- **Electron Wrapper:**
  Provides a desktop application experience with system-level access for real-time monitoring and notifications.
- **Many more features...**

## Setup & Installation

### Environment Variables - Required for AI & Weather (Can be configured in the app itself)

Create a `.env.local` file in the root directory:

```bash
# Required for AI features
GEMINI_API_KEY=your_google_gemini_api_key_here
# Required for weather data
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```
### Running in development mode
```bash
# (to build the nextjs app)
npm run build
# (to build the electron app)
npm run build:electron
# (to run the app)
npm run electron:dev
```

## Screenshots (old)

|          Dashboard Overview          |              Analytics               |                 More Analytics                 |           Draggable Cards            |
| :----------------------------------: | :----------------------------------: | :--------------------------------------------: | :----------------------------------: |
| ![Dashboard](./assets/dashboard.png) | ![Analytics](./assets/analytics.png) | ![Analytics More](./assets/analytics-more.png) | ![Draggable](./assets/draggable.png) |

---

**Built with ❤️ for Thermal Intelligence**

_Developed as part of internship application for UI/UX Design Engineer Position - showcasing web development, AI integration, and system programming capabilities._
