import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import LanguageContext from '../context/LanguageContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  const [user, setUser] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 720) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  const handleAnalysisClick = (e) => {
    if (!user) {
      e.preventDefault();
      setMenuOpen(false);
      setUserMenuOpen(false);
      setShowAuthModal(true);
    }
  };

  const goLogin = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  const userInitial =
    (user?.displayName?.trim()?.[0] || user?.email?.trim()?.[0] || 'U').toUpperCase();

  return (
    <>
      <nav className="navbar">
        <div className="navbarInner">
          <div className="logo" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="logoIcon">⚡ </span>
            <span className="logoText">PowerWestJava</span>
          </div>

          <button
            type="button"
            className="navToggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mainNav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="navToggleIcon" aria-hidden="true">☰</span>
          </button>

          <div
            className={`navOverlay ${menuOpen ? 'show' : ''}`}
            onMouseDown={() => {
              closeMenu();
              setUserMenuOpen(false);
            }}
            aria-hidden={!menuOpen}
          />

          <div id="mainNav" className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <button type="button" className="navClose" onClick={closeMenu} aria-label="Close menu">
              ✕
            </button>

            <NavLink to="/home" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              {t?.home || "HOME"}
            </NavLink>

            <NavLink to="/articles" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              {t?.awareness || "AWARENESS"}
            </NavLink>

            <NavLink to="/planner" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              {t?.calculator || "CALCULATOR"}
            </NavLink>

            <NavLink to="/invest" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              {t?.invest || "INVEST"}
            </NavLink>

            <NavLink to="/chat" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              {t?.chat || "CHAT"}
            </NavLink>

            <NavLink
              to="/analysis"
              onClick={(e) => {
                closeMenu();
                handleAnalysisClick(e);
              }}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {t?.analysis || "ANALYSIS"}
            </NavLink>
            
            {!user ? (
              <NavLink to="/login" onClick={closeMenu} className="nav-btn">
                {t?.login || "LOGIN"}
              </NavLink>
            ) : (
              <>
                <div className="mobileOnly">
                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {t?.profile || "PROFILE"}
                  </NavLink>

                  <button type="button" className="nav-link" onClick={handleLogout}>
                    {t?.logout || "LOGOUT"}
                  </button>
                </div>

                <div className="desktopOnly">
                  <div className="userMenuWrap" ref={userMenuRef}>
                    <button
                      type="button"
                      className="userIconBtn"
                      aria-label="Open user menu"
                      aria-expanded={userMenuOpen}
                      onClick={() => setUserMenuOpen((v) => !v)}
                    >
                      {user?.photoURL ? (
                        <img className="userAvatarImg" src={user.photoURL} alt="User avatar" />
                      ) : (
                        <span className="userAvatarFallback">{userInitial}</span>
                      )}
                    </button>

                    {userMenuOpen && (
                      <div className="userDropdown" role="menu" aria-label="User menu">
                        <button
                          type="button"
                          className="userDropdownItem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            setMenuOpen(false);
                            navigate('/profile');
                          }}
                          role="menuitem"
                        >
                          {t?.profile || "Profile"}
                        </button>

                        <div className="userDropdownDivider" />

                        <button
                          type="button"
                          className="userDropdownItem danger"
                          onClick={handleLogout}
                          role="menuitem"
                        >
                          {t?.logout || "Logout"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Language Toggle - Positioned at the end for better visibility */}
            <button
              type="button"
              className="langToggle"
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
              aria-label={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
            >
              <span className="langIcon">🌐</span>
              <span className="langLabel">{language === 'en' ? 'ID' : 'EN'}</span>
            </button>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <div
          className="authModalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Login required"
          onMouseDown={() => setShowAuthModal(false)}
        >
          <div className="authModal" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="authModalClose"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close"
            >
              x
            </button>

            <h3 className="authModalTitle">Please sign in</h3>
            <p className="authModalText">
              You need to log in to access <strong>Analysis</strong>.
            </p>

            <div className="authModalActions">
              <button type="button" className="authBtn authBtnPrimary" onClick={goLogin}>
                Login
              </button>
              <button
                type="button"
                className="authBtn authBtnGhost"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}