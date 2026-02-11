import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, get, child, update } from "firebase/database"; 
import { db, auth } from '../firebase';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState('simulation'); // 'simulation' or 'actual'

  const kwhReturn = (state?.amount / 500000 * 120).toFixed(0);
  const co2Offset = (state?.amount / 500000 * 45).toFixed(0);

  useEffect(() => {


  const syncBalance = async () => {
    if (auth.currentUser) {
      // Direct pull from the specific balance node
      const balanceRef = ref(db, `users/${auth.currentUser.uid}/walletBalance`);
      const snapshot = await get(balanceRef);
      
      if (snapshot.exists()) {
        console.log("Database Balance Found:", snapshot.val());
        setWalletBalance(snapshot.val()); // This updates the UI immediately
      }
    }
    setLoading(false);
  };

  syncBalance();
}, [auth.currentUser]); // Re-syncs if the user changest

 

  const handleProcessInvestment = async () => {
    if (checkoutMode === 'simulation' && walletBalance < state.amount) {
      alert("Insufficient Balance in Solar Wallet!");
      return;
    }

    setIsProcessing(true);
    const txnId = (checkoutMode === 'simulation' ? "SIM-" : "ACT-") + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    try {
      const updates = {};
      if (checkoutMode === 'simulation') {
        const newBal = walletBalance - state.amount;
        updates[`/users/${auth.currentUser.uid}/walletBalance`] = newBal;
      }
      
      updates[`/users/${auth.currentUser.uid}/investments/${txnId}`] = {
        projectName: state.projectName,
        amount: state.amount,
        type: checkoutMode,
        date: new Date().toISOString()
      };
      
      await update(ref(db), updates);

      setTimeout(() => {
        navigate('/receipt', { 
          state: { 
            transactionId: txnId,
            projectName: state.projectName,
            amount: state.amount,
            newBalance: checkoutMode === 'simulation' ? walletBalance - state.amount : 'N/A (External)',
            kwhReturn,
            date: new Date().toLocaleString(),
            userEmail: auth.currentUser?.email,
            isDemo: checkoutMode === 'simulation'
          } 
        });
      }, 1500);
    } catch (e) { 
      setIsProcessing(false); 
    }
  };

  const handleExternalNotify = (method) => {
    alert(`Redirecting to ${method}... \n\nNote: Third-party API integration will be avaliable soon. For this demo, please use 'Virtual Simulation' to see the credit logic.`);
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'50px'}}>Initializing Secure Gateway...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2e7d32', marginBottom: '10px' }}>Investment Portal</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Choose how you want to fund West Java's Solar Future.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* LEFT: PERKS & LOGIC (AWARENESS) */}
        <div style={{ padding: '30px', background: '#fff', border: '2px solid #ffd700', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#f57f17', marginTop: 0 }}>☀️ Solar Winding Benefits</h3>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>Investing in <strong>{state.projectName}</strong> converts your capital into a community asset.</p>
          
          <div style={{ display: 'flex', gap: '15px', margin: '25px 0' }}>
             <div style={{ flex: 1, textAlign: 'center', padding: '15px', background: '#fffde7', borderRadius: '12px', border: '1px solid #ffe082' }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <div style={{ fontWeight: 'bold' }}>{kwhReturn} kWh</div>
                <div style={{ fontSize: '0.7rem' }}>Monthly Yield</div>
             </div>
             <div style={{ flex: 1, textAlign: 'center', padding: '15px', background: '#e8f5e9', borderRadius: '12px', border: '1px solid #c8e6c9' }}>
                <span style={{ fontSize: '1.5rem' }}>🌿</span>
                <div style={{ fontWeight: 'bold' }}>{co2Offset} kg</div>
                <div style={{ fontSize: '0.7rem' }}>CO2 Offset</div>
             </div>
          </div>
          
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', fontSize: '0.85rem', borderLeft: '4px solid #2e7d32' }}>
            <strong>The Vending Model:</strong>
            <p style={{ margin: '5px 0' }}>The school vends surplus energy to the neighborhood. This revenue is returned to you as <b>Virtual Credits</b>.</p>
          </div>
        </div>

        {/* RIGHT: DYNAMIC PAYMENT SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', background: '#eee', padding: '5px', borderRadius: '12px' }}>
            <button onClick={() => setCheckoutMode('simulation')} style={{ ...tabStyle, background: checkoutMode === 'simulation' ? '#fff' : 'transparent', fontWeight: checkoutMode === 'simulation' ? 'bold' : 'normal' }}>Virtual Demo</button>
            <button onClick={() => setCheckoutMode('actual')} style={{ ...tabStyle, background: checkoutMode === 'actual' ? '#fff' : 'transparent', fontWeight: checkoutMode === 'actual' ? 'bold' : 'normal' }}>Actual Payment</button>
          </div>

          {checkoutMode === 'simulation' ? (
            /* SIMULATION SCREEN */
            <div style={{ padding: '25px', background: '#f1f8e9', borderRadius: '20px', border: '1px solid #2e7d32' }}>
              <h4 style={{ marginTop: 0 }}>Solar Wallet (Demo)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Wallet Balance:</span>
                <span>Rp {walletBalance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d32f2f', marginBottom: '10px' }}>
                <span>Deduction:</span>
                <span>- Rp {state.amount.toLocaleString()}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #a5d6a7' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '10px' }}>
                <span>New Balance:</span>
                <span style={{ color: '#2e7d32' }}>Rp {(walletBalance - state.amount).toLocaleString()}</span>
              </div>
              <button className="btn" onClick={handleProcessInvestment} disabled={isProcessing} style={payBtnStyle}>
                {isProcessing ? 'Updating Ledger...' : 'Confirm Demo Payment'}
              </button>
            </div>
          ) : (
            /* ACTUAL PAYMENT SCREEN */
            <div style={{ padding: '25px', background: '#f1f8e9', borderRadius: '20px', border: '1px solid #2196f3' }}>
              <h4 style={{ marginTop: 0 }}>External Payment Gateway</h4>
              <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '15px' }}>Payment for: <strong>{state.projectName}</strong></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['QRIS', 'GoPay', 'ShopeePay', 'Bank Transfer'].map(method => (
                  <button key={method} onClick={() => handleExternalNotify(method)} style={methodBtnStyle}>
                    <i className="bi bi-credit-card-2-front" style={{marginRight:'10px'}}></i> Pay with {method}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#1976d2' }}>
                <i className="bi bi-info-circle"></i> Redirects to secure third-party bank app.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tabStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: '0.3s' };
const payBtnStyle = { width: '100%', background: '#2e7d32', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' };
const methodBtnStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #bbfbe7', background: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' };