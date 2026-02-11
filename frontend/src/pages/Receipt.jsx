import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Receipt() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div style={{padding: '50px', textAlign: 'center'}}>No Receipt Found.</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      {/* Receipt Card - This is what gets printed */}
      <div id="printable-receipt" style={{ 
        maxWidth: '600px', 
        margin: 'auto', 
        padding: '30px', 
        border: '2px solid #2e7d32', 
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#2e7d32', margin: '0' }}>PowerTrack</h1>
          <p style={{ color: '#666' }}>Official Green Investment Receipt</p>
        </div>

        <hr />

        <div style={{ padding: '20px 0' }}>
          <p><strong>Transaction ID:</strong> {state.transactionId}</p>
          <p><strong>Date:</strong> {state.date}</p>
          <p><strong>Investor:</strong> {state.userEmail}</p>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Project: {state.projectName}</h3>
            <h2 style={{ margin: '0', color: '#1b5e20' }}>Amount: Rp {state.amount.toLocaleString()}</h2>
          </div>

          {/* New Awareness Text on the Receipt */}
          <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#555', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
             <strong>Solar Vending Note:</strong> Your investment has successfully "wound up" your share. 
             You will receive energy credits proportional to the generation at {state.projectName}.
          </div>
        </div>
      </div>

      {/* Action Buttons - Hidden during print */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button 
          onClick={() => window.print()} 
          style={{ padding: '12px 25px', background: '#666', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Download / Print PDF
        </button>
        
        {/* THE LANDING BRIDGE: The User Lands on the Dashboard here */}
        <button 
          onClick={() => navigate('/portfolio')} 
          style={{ padding: '12px 25px', background: '#2e7d32', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          View My Solar Impact →
        </button>
      </div>

      <style>
        {`
          @media print {
            .no-print { display: none; }
            body { background: white; }
            #printable-receipt { border: none; box-shadow: none; }
          }
        `}
      </style>
    </div>
  );
}