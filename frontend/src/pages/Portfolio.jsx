
import React, { useState, useEffect } from 'react';
import { ref, get, child } from "firebase/database"; 
import { db, auth } from '../firebase';

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      if (auth.currentUser) {
        const snapshot = await get(child(ref(db), `users/${auth.currentUser.uid}/investments`));
        if (snapshot.exists()) {
          // Convert the object of investments into an array
          setInvestments(Object.values(snapshot.val()));
        }
      }
      setLoading(false);
    };
    fetchInvestments();
  }, []);

  // Calculate totals for the "Awareness Stats"
  const totalKwh = investments.reduce((acc, inv) => acc + (inv.amount / 500000 * 120), 0);
  const totalCO2 = (totalKwh * 0.7).toFixed(1); // 0.7kg per kWh

  if (loading) return <p style={{textAlign:'center', marginTop:'50px'}}>Accessing your Green Assets...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2e7d32' }}>🌱 My Green Impact Dashboard</h1>
        <p>Tracking your Solar Winding and Vending progress in West Java.</p>
      </header>

      {/* TOP STATS: The Motivation for Investors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={statBox}>
          <div style={{fontSize: '2rem'}}>📈</div>
          <h3>{investments.length}</h3>
          <p>Total Shares</p>
        </div>
        <div style={statBox}>
          <div style={{fontSize: '2rem'}}>⚡</div>
          <h3>{totalKwh} kWh</h3>
          <p>Monthly Yield</p>
        </div>
        <div style={statBox}>
          <div style={{fontSize: '2rem'}}>☁️</div>
          <h3>{totalCO2} kg</h3>
          <p>CO2 Offset</p>
        </div>
      </div>

      {/* ASSET LIST: Showing Demo vs Actual */}
      <h3>My Active Solar Shares</h3>
      
      <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid #eee' }}>
        {investments.map((inv, i) => (
          <div key={i} style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>{inv.projectName}</strong>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Winding Date: {new Date(inv.date).toLocaleDateString()} | 
                <span style={{ color: inv.type === 'simulation' ? '#1976d2' : '#2e7d32', fontWeight: 'bold' }}>
                   {inv.type === 'simulation' ? ' [Virtual Demo]' : ' [Actual Asset]'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>+{(inv.amount / 500000 * 120).toFixed(0)} kWh/mo</div>
              <div style={{ fontSize: '0.75rem', background: '#e8f5e9', padding: '2px 8px', borderRadius: '10px' }}>Vending Live</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const statBox = { background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e0e0e0', textAlign: 'center' };