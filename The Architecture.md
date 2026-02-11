The Architecture





code/

├── backend/                       <-- NODE.JS SERVER (API)

│   ├── node\_modules/              (Created automatically by npm install)

│   ├── package.json               (Dependencies: express, cors, etc.)

│   ├── package-lock.json

│   └── index.js                  (Backend)

│

├── frontend/                      <-- REACT APP (User Interface)

│   ├── node\_modules/              (Created automatically by npm install)

│   ├── public/                    (Static Files - accessible by browser)

│   │   ├── vite.svg

│   │   ├── dashboard-school.png   (For your Analysis Page Hack)

│   │   └── dashboard-admin.png    (For your Analysis Page Hack)

│   │

│   ├── src/                       (All your React Code)

│   │   ├── assets/                (React logos/icons)

│   │   │

│   │   ├── components/            (Reusable parts)

│   │   │   └── Navbar.jsx         (The Green Top Bar)

│   │   │

│   │   ├── pages/                 (The Main Screens)

│   │   │   ├── Login.jsx          (Firebase Auth)

│   │   │   ├── Home.jsx           (Dashboard Hub)

│   │   │   ├── Planner.jsx        (Solar Calculator)

│   │   │   ├── Invest.jsx         (Marketplace)

│   │   │   └── Analysis.jsx       (PowerBI Dashboard)

│   │   │

│   │   ├── services/              (Connection to Backend)

│   │   │   └── api.js             (Fetch functions)

│   │   │

│   │   ├── App.css                (The Manual CSS Styles)

│   │   ├── App.jsx                (Routing/Navigation Logic)

│   │   ├── firebase.js            (Firebase Configuration)

│   │   ├── index.css              (Global Styles)

│   │   └── main.jsx               (React Entry Point)

│   │

│   ├── .eslintrc.cjs              (Linting rules - ignore this)

│   ├── index.html                 (The main HTML file)

│   ├── package.json               (Dependencies: react, router, firebase)

│   ├── package-lock.json

│   └── vite.config.js             (Vite Settings)

│

└── README.md                      (Optional: Documentation)







cmd frontend 



npm create vite@latest . -- --template react

npm install firebase

npm install react-router-dom

npm install canvas-confetti

npm run dev







cmd backend

npm init -y

npm install express mongoose cors dotenv openai

**npm install -D nodemon**

npm install groq-sdk

node index.js



**# ⚡ PowerWestJava - Frontend**



**\*\*PowerWestJava\*\* is a unified platform designed to democratize renewable energy in West Java. It connects schools, local investors, and the government to accelerate solar adoption.**



**## 🚀 Features**

**1.  \*\*☀️ Solar Planner (AI-Powered):\*\* Calculates solar potential, costs, and savings for schools based on local irradiance data.**

**2.  \*\*💰 Community Investment:\*\* A gamified marketplace allowing locals to fund solar projects with micro-investments.**

**3.  \*\*📊 Impact Analytics:\*\* Real-time dashboards (PowerBI integration) tracking carbon reduction and energy transition progress.**

**4.  \*\*🔐 Secure Authentication:\*\* Full user management via Firebase (Email/Password \& Google Auth).**



**## 🛠️ Tech Stack**

**\* \*\*Framework:\*\* React (Vite)**

**\* \*\*Styling:\*\* Custom CSS (No frameworks)**

**\* \*\*Authentication:\*\* Firebase Auth**

**\* \*\*Visualization:\*\* PowerBI Embeds \& Canvas Confetti**

**\* \*\*Backend Connection:\*\* Node.js/Express API**



**## 📦 Installation \& Setup**



**1.  \*\*Clone the repository\*\***

    **```bash**

    **git clone \[https://github.com/your-username/power-west-java.git](https://github.com/your-username/power-west-java.git)**

    **cd power-west-java/frontend**

    **```**



**2.  \*\*Install Dependencies\*\***

    **```bash**

    **npm install**

    **```**



**3.  \*\*Run the App\*\***

    **```bash**

    **npm run dev**

    **```**

    **The app will open at `http://localhost:5173`.**



**\*Built for the YDFCT  2025.\***





