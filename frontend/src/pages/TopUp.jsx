import React, { useState, useEffect } from 'react';
import { ref, update, get, set, runTransaction } from "firebase/database";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function TopUp() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

const forceMassiveBalance = async () => {
  if (!user) return;
  setLoading(true);
  try {
    // This creates the 'users/UID/walletBalance' path perfectly
    const userRef = ref(db, `users/${user.uid}/walletBalance`);
    await set(userRef, 100000000000); 
    alert("Database Synced: 100 Billion IDR Assigned!");
    navigate("/invest");
  } catch (e) {
    alert("Error: " + e.message);
  }
  setLoading(false);
};

        

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ color: '#2e7d32' }}>🌱 Admin Control Panel</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Authorized tool to initialize "Institutional Winding Capital" for the network.
      </p>

      <div style={{ background: '#fff3e0', padding: '30px', borderRadius: '20px', border: '2px solid #ffb74d' }}>
        <h4 style={{ marginTop: 0 }}>Global Balance Reset</h4>
        <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
          Clicking below will synchronize 100 Billion IDR to <strong>every user</strong> on the platform.
        </p>
        
        <button 
          onClick={setMassiveBalanceForAll} 
          disabled={loading || !user}
          style={{ 
            padding: '15px 30px', 
            background: '#000', 
            color: '#fff', 
            borderRadius: '10px', 
            border: 'none', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? "Synchronizing..." : "🚀 Set 100B for ALL Users"}
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '15px', textAlign: 'left' }}>
        <strong>📊 Why 100 Billion?</strong>
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          This represents a state-level grant for <strong>Solar Winding</strong>. It allows us to demonstrate how the platform 
          processes massive capital to fund solar arrays across West Java schools, subsequently "vending" the energy to the community.
        </p>
      </div>
    </div>
  );
}