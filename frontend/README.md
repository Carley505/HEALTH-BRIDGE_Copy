# Frontend - Health-bridge AI

React frontend for the Health-bridge AI preventive health coach.

## Directory Structure

```
frontend/
├── src/
│   ├── components/      # UI Components
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── PlanCard.jsx
│   │   ├── RiskSummary.jsx
│   │   └── LoadingIndicator.jsx
│   ├── features/        # Redux slices
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── profile/
│   │   └── plans/
│   ├── pages/           # Route pages
│   │   ├── HomePage.jsx
│   │   ├── ChatPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/        # API clients
│   │   ├── api.js
│   │   └── websocket.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Setup

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

## Tech Stack

- **React 18** + **Vite** for fast development
- **TailwindCSS** for styling
- **Redux Toolkit** for state management
- **Firebase Auth** for authentication
- **Axios** for API calls
