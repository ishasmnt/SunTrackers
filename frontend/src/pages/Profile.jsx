import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import LanguageContext from '../context/LanguageContext';
import '../styles/Profile.css';

export default function Profile() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'settings'

  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate('/login');
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [navigate]);

  const displayEmail = user?.email || '';

  const userInitial = useMemo(() => {
    const ch = (user?.displayName?.trim()?.[0] || user?.email?.trim()?.[0] || 'U').toUpperCase();
    return ch;
  }, [user]);

  const investHistory = useMemo(
    () => [
            {
                id: 1,
                schoolName: 'SMA 1 Bandung',
                amount: 250000,
                date: '2026-01-01',
                image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500',
            },
            {
                id: 2,
                schoolName: 'SMK 3 Bekasi',
                amount: 500000,
                date: '2025-12-20',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
            },
        ],
    []
  );

  const resetMsg = () => {
    setInfo('');
    setError('');
  };

  const isValidEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  };

  const passwordMeetsRules = (pwd) => {
    const hasMin = pwd.length >= 8;
    const hasNum = /\d/.test(pwd);
    const hasSym = /[^A-Za-z0-9]/.test(pwd);
    return hasMin && hasNum && hasSym;
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!user) return;

    resetMsg();

    const email = newEmail.trim().toLowerCase();

    if (!email) {
      setError('New email is required.');
      return;
    }
    if (!isValidEmailFormat(email)) {
      setError('Invalid email format.');
      return;
    }
    if (email === (user.email || '').toLowerCase()) {
      setError('New email cannot be the same as the current email.');
      return;
    }

    setEmailLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods && methods.length > 0) {
        setError('This email address is already registered/in use. Please use another email address.');
        setEmailLoading(false);
        return;
      }
      await updateEmail(user, email);
      try {
        await sendEmailVerification(user);
        setInfo('Email successfully changed. Please check your inbox to verify your new email address.');
      } catch {
        setInfo('Email successfully changed.');
      }

      setNewEmail('');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/requires-recent-login') {
        setError('Please re-login first to change your email (for security reasons).');
      } else if (code === 'auth/email-already-in-use') {
        setError('The email is already in use.');
      } else if (code === 'auth/invalid-email') {
        setError('Email invalid.');
      } else {
        setError(err?.message || 'Failed to change email.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!user) return;

    resetMsg();

    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (!passwordMeetsRules(newPassword)) {
      setError('Password must be at least 8 characters, contain at least one number and one symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password does not match.');
      return;
    }

    setPassLoading(true);
    try {
      await updatePassword(user, newPassword);
      setInfo('Password successfully changed.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/requires-recent-login') {
        setError('Please re-login first to change your password (for security reasons).');
      } else {
        setError(err?.message || 'Failed to change password.');
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="profilePage">
      <div className="profileHeader">
        <h1 className="profileTitle">{t?.myProfile || "My Profile"}</h1>
      </div>

      <div className="profileBody">
        <div className="profileTop">
          <div className="profileAvatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User avatar" />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          <div className="profileMeta">
            <div className="profileEmailLabel">{t?.emailAddress || "email address"}</div>
            <div className="profileEmailValue">{displayEmail}</div>
          </div>
        </div>

        <div className="profileTabs">
          <button
            type="button"
            className={`profileTab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              resetMsg();
              setActiveTab('history');
            }}
          >
            {t?.investments || "Invest History"}
          </button>
          <button
            type="button"
            className={`profileTab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              resetMsg();
              setActiveTab('settings');
            }}
          >
            {t?.settings || "Settings"}
          </button>
        </div>

        {(info || error) && (
          <div className={`profileAlert ${error ? 'error' : 'info'}`}>
            {error || info}
          </div>
        )}

        {activeTab === 'history' ? (
          <div className="profileSection">
            {investHistory.length === 0 ? (
              <div className="emptyState">
                {t?.noHistory || "There is no history of investment/donation."}
              </div>
            ) : (
              <div className="historyList">
                {investHistory.map((it) => (
                  <div className="historyCard" key={it.id}>
                    <div className="historyLeft">
                      <div className="schoolThumb">
                        <img src={it.image} alt={it.schoolName} loading="lazy" />
                      </div>
                    </div>
                    <div className="historyRight">
                      <div className="schoolName">{it.schoolName}</div>
                      <div className="historyLine">
                        <span className="label">{t?.amountDonated || "Amount Donated (Rp)"}</span>
                        <span className="value">
                          {Number(it.amount || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="historyLine">
                        <span className="label">{t?.date || "Date"}</span>
                        <span className="value">{it.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="profileSection">
            <div className="settingsGrid">
              <div className="settingsCard">
                <h3 className="settingsTitle">{t?.changeEmail || "Change Email"}</h3>
                <form onSubmit={handleChangeEmail} className="settingsForm">
                  <label className="fieldLabel">{t?.currentEmail || "Current Email"}</label>
                  <input
                    className="fieldInput"
                    value={displayEmail}
                    readOnly
                  />

                  <label className="fieldLabel">{t?.newEmail || "New Email"}</label>
                  <input
                    className="fieldInput"
                    placeholder={t?.newEmailPlaceholder || "newemail@example.com"}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                  />

                  <button className="primaryBtn" type="submit" disabled={emailLoading}>
                    {emailLoading ? t?.updating || 'Updating...' : t?.updateEmail || 'Update Email'}
                  </button>

                  <div className="hint">
                    {t?.emailValidHint || "The email must be in a valid format. The new email cannot already be used for another account."}
                  </div>
                </form>
              </div>

              <div className="settingsCard">
                    <h3 className="settingsTitle">{t?.changePassword || "Change Password"}</h3>
                    <form onSubmit={handleChangePassword} className="settingsForm">
                        <label className="fieldLabel">{t?.newPassword || "New Password"}</label>
                        <input
                            className="fieldInput"
                            placeholder={t?.passwordHint || "Min 8 chars, 1 number, 1 symbol"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                        />

                        <label className="fieldLabel">{t?.confirmPassword || "Confirm Password"}</label>
                        <input
                            className="fieldInput"
                            placeholder={t?.confirmPassword || "Confirm new password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                        />

                        <button className="primaryBtn" type="submit" disabled={passLoading}>
                            {passLoading ? t?.updating || 'Updating...' : t?.updatePassword || 'Update Password'}
                        </button>

                        <div className="hint">
                            {t?.passwordHint || "Password must be at least 8 characters, must contain at least 1 number and 1 symbol."}
                        </div>
                    </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}