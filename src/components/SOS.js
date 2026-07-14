import React, { useState } from "react";


function SOS() {

  const [showBreathing, setShowBreathing] = useState(false);

  const callHelpline = (number) => {
    window.location.href = `tel:${number}`;
  };

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  return (

    <div className="sos-overlay">

      <div className="sos-modal">

        <div className="sos-glow"></div>

        {/* HEADER */}
        <div className="sos-header">

          <div className="sos-pulse"></div>

          <div>

            <h2>You Are Not Alone Right Now</h2>

            <p>
              Your recent responses suggest intense emotional distress.
              Support is available, and this moment can pass safely.
            </p>

          </div>

        </div>

        {/* SUPPORT CARDS */}
        <div className="sos-support-grid">

          <div className="support-card">

            <h3>Pause For A Moment</h3>

            <p>
              Try taking one slow breath in and one slow breath out.
              You do not need to solve everything immediately.
            </p>

          </div>

          <div className="support-card">

            <h3>Reach Out To Someone Safe</h3>

            <p>
              A trusted person, therapist, counselor, or emergency support
              line can help you through this moment.
            </p>

          </div>

        </div>

        {/* HELPLINES */}
        <div className="sos-helplines">

          <div className="helpline-card">
            <span>India Helpline</span>

            <button onClick={() => callHelpline("18005990019")}>
              1800-599-0019
            </button>
          </div>

          <div className="helpline-card">
            <span>USA Support</span>

            <button onClick={() => callHelpline("988")}>
              988
            </button>
          </div>

          <div className="helpline-card">
            <span>Global Support</span>

            <button
              onClick={() =>
                openLink("https://findahelpline.com")
              }
            >
              findahelpline.com
            </button>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="sos-actions">

          <button
            className="sos-call"
            onClick={() => callHelpline("18005990019")}
          >
            Call Immediate Help
          </button>

          <button
            className="sos-safe"
            onClick={() => setShowBreathing(true)}
          >
            Calm Me Down
          </button>

        </div>

        {/* BREATHING BOX */}
        {showBreathing && (

          <div className="breathing-box">

            <div className="breathing-circle"></div>

            <h3>Slow Breathing Exercise</h3>

            <p>
              Inhale slowly for 4 seconds
            </p>

            <p>
              Hold gently for 4 seconds
            </p>

            <p>
              Exhale slowly for 6 seconds
            </p>

          </div>

        )}

        {/* FOOTER */}
        <div className="sos-footer">
          Support suggestions activated based on emotional indicators.
        </div>

      </div>

    </div>
  );
}

export default SOS;