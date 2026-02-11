import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          
          {/* LEFT SECTION */}
          <div className="footer-brand">
            <h2>⚡ PowerWestJava</h2>
            <p>
              Empowering West Java with sustainable solar innovation.
              Building a cleaner, greener, and smarter energy future together.
            </p>
          </div>

          {/* MEMBERS */}
          <div className="footer-members">
            <h3>SunTrackers Team</h3>
            <ul>
              <li>Febian Nurwanto</li>
              <li>Shraddha Gajanan Desai</li>
              <li>Harsh Hublikar</li>
              <li>Isha Samanat</li>
              <li>Kim Seulkichan</li>
              <li>Kishore K</li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/articles">Awareness</a></li>
              <li><a href="/planner">Calculator</a></li>
              <li><a href="/invest">Invest</a></li>
              <li><a href="/analysis">Analysis</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} PowerWestJava : Built for Sustainable Future 🌱
        </div>
      </footer>

      <style>{`
        .footer {
          background: linear-gradient(135deg, #0f172a, #064e3b);
          color: #ffffff;
          padding: 60px 10% 20px 10%;
          margin-top: 80px;
        }

        .footer-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .footer h2 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #22c55e;
        }

        .footer h3 {
          margin-bottom: 15px;
          font-size: 18px;
          color: #f1f5f9;
        }

        .footer p {
          font-size: 14px;
          line-height: 1.6;
          color: #cbd5e1;
        }

        .footer-members ul,
        .footer-links ul {
          list-style: none;
          padding: 0;
        }

        .footer-members li,
        .footer-links li {
          margin-bottom: 8px;
          font-size: 14px;
          color: #cbd5e1;
        }

        .footer-links a {
          text-decoration: none;
          color: #cbd5e1;
          transition: 0.3s;
        }

        .footer-links a:hover {
          color: #22c55e;
        }

        .footer-bottom {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 13px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 50px 6% 20px 6%;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;