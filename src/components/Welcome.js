import React, { useEffect, useState } from "react";
import "./templates/welcome.css";
import { useNavigate } from "react-router-dom";

import Journal from "../components/Journal";
import FloatingChatBot from "../components/FloatingChatBot";

function Welcome() {
  const navigate = useNavigate();

  const fullText = "How are you feeling today?";

  const [typedText, setTypedText] = useState("");
  const [index, setIndex] = useState(0);

  const [showJournal, setShowJournal] = useState(false);

  // Typing effect
  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 40);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  const handleChatbot = () => {
  navigate("/chatbot");
  };

  return (
    <div className="welcome-page">

      <div className="welcome-card">

        <h1>Welcome back</h1>

        <p className="typing-text">
          {typedText}
          <span className="cursor">|</span>
        </p>

        <p className="welcome-support">
          This is a calm space to pause, reflect,
          and understand how you've been feeling emotionally.
        </p>

        {/* OPTION 1 */}
        <button
          className="primary-btn"
          onClick={() => navigate("/questionnaire")}
        >
          Start Assessment
        </button>

        {/* OPTION 2 & 3 */}
        <div className="secondary-actions">

          <button
            onClick={() => setShowJournal(!showJournal)}
          >
            {showJournal ? "Close Journal" : "Open Journal"}
          </button>

          <button onClick={handleChatbot}>
            Talk to AI Support
          </button>

        </div>

        <div className="mini-wellness-box">
          <h3>Today's Reminder</h3>

          <p>
            You do not need to solve everything today.
            Small moments of rest and reflection matter too.
          </p>
        </div>

        <p className="footer-text">
          Take your time. There's no pressure.
        </p>

      </div>

      {/* JOURNAL */}
      {showJournal && (
        <div className="journal-section">
          <Journal />
        </div>
      )}

      <FloatingChatBot severity={0} />

    </div>
  );
}

export default Welcome;