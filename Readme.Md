# SunTrackers - PowerWestJava 🌞

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)

**PowerWestJava** is a unified platform designed to democratize renewable energy in West Java, Indonesia. It connects schools, local investors, and the government to accelerate solar adoption through AI-powered planning, community investment opportunities, and real-time impact analytics.

## 🚀 Features

### ☀️ Solar Planner (AI-Powered)
- Calculate solar potential, costs, and savings for schools based on local irradiance data
- AI-powered advisor for personalized recommendations
- Interactive calculator for different scenarios

### 💰 Community Investment
- Gamified marketplace allowing locals to fund solar projects with micro-investments
- Track investment progress and returns
- Support local educational institutions

### 📊 Impact Analytics
- Real-time dashboards tracking carbon reduction and energy transition progress
- Visual analytics for schools, investors, and government stakeholders
- Performance metrics and reporting

### 🔐 Secure Authentication
- Full user management via Firebase Authentication
- Support for Email/Password and Google OAuth
- Secure session management

### 🤖 AI Chat Assistant
- Intelligent advisor powered by GROQ API
- Help with solar planning and investment decisions
- Real-time support and guidance

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with Vite
- **Routing**: React Router DOM v7.10.1
- **Authentication**: Firebase v12.7.0
- **Styling**: Custom CSS (No frameworks)
- **Visual Effects**: Canvas Confetti v1.9.4
- **Build Tool**: Vite v7.2.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Integration**: GROQ SDK & Google Generative AI
- **CORS**: Cross-Origin Resource Sharing enabled
- **Data Parsing**: Body Parser

### APIs & Services
- **GROQ API**: AI chat functionality
- **Google Generative AI**: Enhanced AI capabilities
- **Firebase**: Authentication and user management

## 📦 Project Structure

```
SunTrackers/
├── YDCT_36_SunTrackers/         # Main project directory
    ├── Readme.Md                     # ✅ Main comprehensive README (with team names)
    ├── The Architecture.md           # Architecture documentation
    ├── package.json                  # Root package config
    ├── package-lock.json
    │
    ├── backend/                      # Node.js Express API
    │   ├── index.js                  # Main server file
    │   ├── package.json              # Backend dependencies
    │   └── package-lock.json
    │
    └── frontend/                     # React application
        ├── README.md                 # Default Vite template (basic)
        ├── package.json              # Frontend dependencies
        ├── package-lock.json
        ├── vite.config.js
        ├── eslint.config.js
        ├── index.html
        ├── public/                   # Static assets
        │   ├── vite.svg
        │   ├── dashboard-admin.png
        │   └── dashboard-school.png
        └── src/                      # React source code
            ├── main.jsx              # Entry point
            ├── App.jsx               # Main app with routing
            ├── App.css               # Global styles
            ├── index.css             # Global CSS
            ├── firebase.js           # Firebase config
            ├── assets/               # React assets
            ├── components/           # Reusable components
            │   └── Navbar.jsx
            ├── pages/                # Main application pages
            │   ├── Home.jsx
            │   ├── Login.jsx
            │   ├── Planner.jsx
            │   ├── Invest.jsx
            │   ├── Analysis.jsx
            │   └── Chat.jsx
            ├── services/             # API utilities
            │   └── api.js
            ├── advisor/              # AI advisor
            │   └── advisor.js
            └── styles/               # Page-specific CSS
                ├── Invest.css
                ├── Login.css
                └── Planner.css
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account for authentication
- GROQ API key for AI functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/febbyvnr/YDCT_36_SunTrackers
   cd YDCT_36_SunTrackers
   ```

2. **Install backend dependencies**
   ```bash
   cd YDCT_36_SunTrackers/backend
   npm install
   npm install groq-sdk
   node index.js
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Environment Setup**
   
   **Backend (.env file in backend directory):**
   ```
   GROQ_API_KEY=GROK_API_KEY
   PORT=5001
   ```

   **Frontend (.env file in frontend directory):**
   (No need to setup frontend .env)
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:5001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev  # or npm start
   ```
   Server will run on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

## 📋 Usage Guide

### Getting Started
1. **Login**: Use Firebase authentication (Email/Password or Google OAuth)
2. **Dashboard**: Access the home page to see all available features
3. **Solar Planning**: Use the calculator to estimate solar potential and costs
4. **Investment**: Browse and fund community solar projects
5. **Analytics**: View impact dashboards and progress tracking
6. **AI Chat**: Get personalized advice from the AI advisor

### Key Pages
- **Home** (`/home`) - Main dashboard with feature overview
- **Planner** (`/planner`) - Solar calculation tool
- **Invest** (`/invest`) - Community investment marketplace
- **Analysis** (`/analysis`) - Impact analytics dashboard
- **Chat** (`/chat`) - AI-powered advisor interface

## 🔧 API Documentation

### Backend Endpoints

#### Health Check
```http
GET /
```
Returns server status.

#### Get Projects
```http
GET /api/projects
```
Returns list of available solar projects for investment.

#### AI Chat
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What are the benefits of solar energy for schools?"
    }
  ]
}
```
Returns AI-powered response from GROQ API.

## 🧪 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (development)

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration provided
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent formatting

## 🌟 Key Features Deep Dive

### Solar Planning Engine
- Location-based solar irradiance calculations
- Cost estimation including installation and maintenance
- ROI calculations and payback period analysis
- Environmental impact assessment

### Investment Platform
- Micro-investment opportunities starting from small amounts
- Gamified progress tracking with visual rewards
- Project progress updates and milestone celebrations
- Community building features

### Analytics Dashboard
- Real-time energy generation tracking
- Carbon footprint reduction metrics
- Financial performance indicators
- Community impact visualization

## 🔒 Security

- Firebase Authentication for secure user management
- CORS configuration for API security
- Environment variables for sensitive data
- Secure API key management

## 📊 Performance

- Vite for fast development and optimized builds
- React 19 for improved performance
- Efficient API design with minimal latency
- Optimized bundle size and lazy loading

## 🌍 Environmental Impact

This project aims to accelerate renewable energy adoption in West Java by:
- Reducing carbon emissions through solar adoption
- Making renewable energy accessible to educational institutions
- Creating economic opportunities through community investment
- Building awareness about clean energy benefits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Developed for the **YDCT SL2 with Meta 2025** competition as part of efforts to democratize renewable energy in Indonesia.

### Team Members:
- **Shraddha Desai**
- **Isha Samant**
- **Febian Nurwanto**
- **Harsh Hublikar**
- **Kim Seulkichan**
- **Kishore K**

## 🤝 Support

For support, discord : shraddha_3176 or join our community discussions on discord.

## 🗺️ Roadmap

- [ ] Mobile application development
- [ ] Integration with local solar installation companies
- [ ] Advanced analytics with machine learning
- [ ] Multi-language support (Indonesian/English)
- [ ] Government dashboard for policy makers
- [ ] Integration with utility companies for grid management

---

**Built with 💚 for a sustainable future in West Java**
