import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer.jsx';
import Home from './pages/Home';
import Login from './pages/Login';
import Planner from './pages/Planner';
import Invest from './pages/Invest';
import Analysis from './pages/Analysis';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import SolarPanelExplanation from './components/SolarPanelExplanation.jsx';

import Checkout from './pages/Checkout.jsx';
import TopUp from './pages/TopUp.jsx';
import Receipt from './pages/Receipt.jsx';

import Articles from './pages/Articles';
import ArticleDetail from "./pages/ArticleDetail";
import ScrollToTop from './components/ScrollToTop';
import Portfolio from './pages/Portfolio.jsx';

import { LanguageProvider } from './context/LanguageContext';

function AppRoutes() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';
  const showFooter = location.pathname !== '/login';

  return (
    <>
      {showNavbar && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/solarExplanation" element={<SolarPanelExplanation />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="topUp"element={<TopUp />} />
        <Route path="/receipt" element={<Receipt />} />

        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
      <Route path="/portfolio" element={<Portfolio />} />

      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </BrowserRouter>
  );
}
