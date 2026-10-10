// /pages/index.tsx -> ini yang jadi route "/"
import "./landing.css";
import { useEffect } from "react";
import { initLanding } from "./landing"; // logic dari landing.ts lu

export default function LandingRoute() {
  useEffect(() => {
    initLanding(); // panggil function vanilla lu
  }, []);

  // copy-paste isi <body> dari landing.html lu kesini
  return (
    <>
      <div id="redirecting" className="redirecting">
        <div className="redirecting-box">
          <div className="spinner"></div>
          <span>Redirecting to dashboard...</span>
        </div>
      </div>

      <div className="landing">
        <aside className="panel-left">
          <div className="brand"><div className="brand-logo">A</div><span>AUMO FINANCE</span></div>
          <div className="hero">
            <h1>Operations,<br/> neatly<br/> organized.</h1>
            <p>Matte, tenang, tanpa distraksi.</p>
            <div className="features">
              <div className="feature-row"><span>01</span><span>Revenues & Expenses</span></div>
              <div className="feature-row"><span>02</span><span>Tracking</span></div>
              <div className="feature-row"><span>03</span><span>Finance & Costings</span></div>
            </div>
          </div>
          <div className="footer-left"><span>© rdmmoonlight 2026</span><span>COOKIE AUTH • AUMO SYSTEM</span></div>
        </aside>
        <main className="panel-right">
          <div className="welcome"><h2>Selamat Datang</h2><p>Silakan masuk atau buat akun baru.</p></div>
          <div className="actions">
            <button id="btn-login" className="btn btn-primary"><span id="login-text">Sign In</span></button>
            <button id="btn-register" className="btn btn-secondary">Register</button>
          </div>
        </main>
      </div>

      <div id="modal-overlay" className="overlay">
        <div className="modal">
          <div className="modal-head"><h3 id="modal-title">Sign In to Aumo</h3><button id="modal-close">✕</button></div>
          <div className="modal-body">
            <div id="google-btn-container"></div>
            <div className="divider"><span>or</span></div>
            <div id="auth-form-container"></div>
          </div>
        </div>
      </div>
    </>
  );
}
