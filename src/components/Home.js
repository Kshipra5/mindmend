
import React, { useEffect } from "react";
import "./templates/style.css";
import { Link } from "react-router-dom";
import { FaPenToSquare, FaChartLine, FaBrain } from "react-icons/fa6";

function Home() {

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <div className="page">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-light">Mind</span>{" "}
          <span className="logo-bold">Mend</span>
        </div>

        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="btn">Sign Up</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero reveal">
        <div className="hero-inner">
          <h1>Take a Moment for Yourself</h1>
          <p>
            Mind Mend is your gentle companion for mental well-being.
            Pause, breathe, and reflect — no pressure, just understanding.
          </p>
          <Link to="/signup" className="primary-btn">
            Start Check-in
          </Link>
        </div>
      </section>

      {/* AWARENESS */}
      <section className="awareness">

        <div className="section-head reveal">
          <h2>Why mental health check-ins matter</h2>
          <p>
            Mental health changes daily. These check-ins help you notice patterns
            before they become overwhelming.
          </p>
        </div>

        <div className="awareness-block reveal">
          <div className="text">
            <h3>Stress & Burnout</h3>
            <p>
              Stress builds quietly through responsibilities and pressure.
              Burnout is long-term exhaustion, not weakness.
            </p>
            <ul>
              <li>Constant fatigue even after rest</li>
              <li>Lack of motivation</li>
              <li>Tasks feel heavier than usual</li>
            </ul>
            <div className="quote">
              “When was the last time you truly rested without guilt?”
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1527137342181-19aab11a8ee8"
            alt="stress"
          />
        </div>

        <div className="awareness-block reverse reveal">
          <div className="text">
            <h3>Anxiety & Overthinking</h3>
            <p>
              Anxiety keeps your mind stuck in “what if” loops even when
              nothing is wrong.
            </p>
            <ul>
              <li>Racing thoughts</li>
              <li>Sleep difficulty</li>
              <li>Constant worry</li>
            </ul>
            <div className="quote">
              “Not every thought deserves your attention.”
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1507537297725-24a1c029d3ca"
            alt="anxiety"
          />
        </div>

      </section>

      {/* HOW */}
      <section className="how">
        <h2 className="section-title reveal">How Mind Mend works</h2>

        <div className="grid">

          <div className="card reveal">
            <FaPenToSquare className="icon" />
            <div className="card-number">01</div>
            <h3>Answer questions</h3>
            <p>Simple guided questions help you express how you feel.</p>
          </div>

          <div className="card reveal">
            <FaChartLine className="icon" />
            <div className="card-number">02</div>
            <h3>See patterns</h3>
            <p>Your responses reveal emotional patterns over time.</p>
          </div>

          <div className="card reveal">
            <FaBrain className="icon" />
            <div className="card-number">03</div>
            <h3>Get clarity</h3>
            <p>You receive gentle insights to understand yourself better.</p>
          </div>

        </div>
      </section>


      {/* WHY */}
      <section className="why reveal">
        <h2 className="section-title">Why Mind Mend exists</h2>
        <div className="why-box">
          <p>Students today face constant mental overload.</p>
          <p>Overthinking has become a daily habit.</p>
          <p>There are very few tools to track emotions simply.</p>
          <div className="quote">
            “Understanding yourself should be simple, not overwhelming.”
          </div>
        </div>
      </section>

      {/* SEEK HELP */}
      <section className="seek-help reveal">
        <h2 className="section-title">When to seek help</h2>
        <div className="help-box">
          <ul>
            <li>When stress becomes constant</li>
            <li>When your sleep is regularly disturbed</li>
            <li>When thoughts feel overwhelming</li>
          </ul>
          <p className="note">
            Reaching out is a strong and important step.
          </p>
        </div>
      </section>
      {/* DAILY CHECK */}
      <section className="daily-check reveal">
        <h2 className="section-title">Daily Mind Check-in</h2>
        <div className="check-box">
          <p>Take just 60 seconds to understand yourself better.</p>
          <ul>
            <li>Track your mood today</li>
            <li>Notice emotional patterns</li>
            <li>Reflect without pressure</li>
          </ul>
          <Link to="/signup" className="primary-btn">
            Start 60-second Check-in
          </Link>
        </div>
      </section>


      {/* SUPPORT */}
      <section className="support reveal">
        <div className="support-box">
          <h2>If you're feeling overwhelmed</h2>
          <p>
            You don’t have to handle everything alone.
            Reaching out is a strong step.
          </p>

          <div className="helpline-row">
            <span className="line">AASRA: +91 9820466726</span>
            <span className="line">Tele-MANAS: 14416</span>
            <span className="line">Emergency: 112</span>
          </div>

          <p className="note">
            Support is always available.
          </p>
        </div>
      </section>

      <footer>
        © 2026 Mind Mend — Built with care
      </footer>

    </div>
  );
}

export default Home;