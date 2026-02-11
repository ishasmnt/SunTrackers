import React, { useState, useEffect, useContext } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import HowInvestmentWorks from '../components/HowInvestmentWorks.jsx';
import LanguageContext from '../context/LanguageContext';

import '../styles/Invest.css';

export default function Invest() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successProjectName, setSuccessProjectName] = useState('');
// Inside your Invest() function
const startSimulation = (project) => {
  // This navigates to a special "Awareness" flow
  navigate('/simulation-walkthrough', { 
    state: { 
      project, 
      isDemo: true,
      virtualCredits: 1000000 // Give them free demo credits
    } 
  });
};

// Inside your .map() function for projects, replace the button section:
<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <button 
    className="btn-demo" 
    onClick={() => startSimulation(project)}
    style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #2e7d32', padding: '10px', borderRadius: '5px' }}
  >
    🎮 Try Virtual Demo (Learn Logic)
  </button>

  <button className="btn" onClick={() => handleInvestClick(project.id)}>
    💳 Actual Investment (Rp 500k)
  </button>
</div>
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'SMA 1 Bandung',
      location: 'Bandung',
      target: 100000000,
      raised: 45000000,
      img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500',
    },
    {
      id: 2,
      name: 'SMK 3 Bekasi',
      location: 'Bekasi',
      target: 150000000,
      raised: 12000000,
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
    },
    {
      id: 3,
      name: 'SDN 2 Bogor',
      location: 'Bogor',
      target: 50000000,
      raised: 48000000,
      img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500',
    },
  ]);
  

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const doInvest = (id) => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2e7d32', '#ffd700', '#ffffff'],
      zIndex: 10050,
    });

    const proj = projects.find((p) => p.id === id);
    setSuccessProjectName(proj?.name || 'this project');

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, raised: p.raised + 500000 } : p))
    );

    setShowSuccessModal(true);
  };

  // const handleInvestClick = (id) => {
  //   if (!user) {
  //     setPendingProjectId(id);
  //     setShowAuthModal(true);
  //     return;
  //   }
  //   doInvest(id);
  // };

const handleInvestClick = (projectId) => {
  const project = projects.find(p => p.id === projectId);
  
  if (project) {
    navigate('/checkout', { 
      state: { 
        projectId: project.id, 
        projectName: project.name, 
        amount: 500000 // Fixed investment unit
      } 
    });
  }
};
  const goLogin = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  return (
    <div className="container">
      <h1 className='investTitle'>🤝 {t?.communityFinancing || "Community Financing"}</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        {t?.investSubtitle || "Invest in local solar projects and earn green returns."}
      </p>
      <HowInvestmentWorks />
      <div className="grid">
        {projects.map((project) => (
          <div key={project.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '150px', background: `url(${project.img}) center/cover` }} />

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{project.name}</h3>
                <span
                  style={{
                    fontSize: '0.8rem',
                    background: '#e8f5e9',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    color: '#2e7d32',
                  }}
                >
                  {project.location}
                </span>
              </div>

              <div style={{ marginTop: '15px', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                <span>{t?.raised || "Raised"}: Rp {(project.raised / 1000000).toFixed(1)} Juta</span>
                <span style={{ float: 'right' }}>{Math.round((project.raised / project.target) * 100)}%</span>
              </div>

              <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px' }}>
                <div
                  style={{
                    width: `${(project.raised / project.target) * 100}%`,
                    height: '100%',
                    background: '#2e7d32',
                    borderRadius: '5px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>

              <br />
              <button className="btn" onClick={() => handleInvestClick(project.id)}>
                {t?.investAmount || "Invest Rp 500.000"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAuthModal && (
        <div
          className="authModalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAuthModal(false)}
        >
          <div className="authModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="authModalClose"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close"
            >
              x
            </button>

            <h2 className="authModalTitle">Please sign in</h2>
            <p className="authModalText">
              You need to log in to invest in this project.
            </p>

            <div className="authModalActions">
              <button type="button" className="authBtn authBtnPrimary" onClick={goLogin}>
                Login
              </button>

              <button
                type="button"
                className="authBtn authBtnGhost"
                onClick={() => {
                  setShowAuthModal(false);
                  setPendingProjectId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div
          className="authModalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSuccessModal(false)}
        >
          <div className="authModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="authModalClose"
              onClick={() => setShowSuccessModal(false)}
              aria-label="Close"
            >
              x
            </button>

            <h2 className="authModalTitle">Investment confirmed</h2>
            <p className="authModalText">
              Thank you! You invested <b>Rp 500,000</b> in <b>{successProjectName}</b>.
            </p>

            <div className="authModalActions">
              <button
                type="button"
                className="authBtn authBtnPrimary"
                onClick={() => setShowSuccessModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}