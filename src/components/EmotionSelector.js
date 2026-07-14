import React, { useState, useEffect } from "react";

const emotions = [
  {
    name: "Calm",
    color: "#14b8a6",
    desc: "Feeling emotionally balanced"
  },

  {
    name: "Happy",
    color: "#22c55e",
    desc: "Positive and emotionally light"
  },

  {
    name: "Motivated",
    color: "#0ea5e9",
    desc: "Driven and focused"
  },

  {
    name: "Anxious",
    color: "#f59e0b",
    desc: "Experiencing worry or tension"
  },

  {
    name: "Stressed",
    color: "#ef4444",
    desc: "Emotionally overloaded"
  },

  {
    name: "Tired",
    color: "#8b5cf6",
    desc: "Mentally exhausted"
  },

  {
    name: "Lonely",
    color: "#64748b",
    desc: "Feeling emotionally disconnected"
  },

  {
    name: "Sad",
    color: "#3b82f6",
    desc: "Emotionally low"
  },

  {
    name: "Angry",
    color: "#dc2626",
    desc: "Frustrated or irritated"
  },

  {
    name: "Confused",
    color: "#6366f1",
    desc: "Mentally overwhelmed"
  }
];

function EmotionSelector() {

  const [selected, setSelected] = useState([]);

  // =================================================
  // LOAD SAVED EMOTIONS
  // =================================================

  useEffect(() => {

    const saved =
      JSON.parse(localStorage.getItem("selected_emotions"));

    if (saved) {
      setSelected(saved);
    }

  }, []);

  // =================================================
  // TOGGLE EMOTION
  // =================================================

  const toggle = async (emotion) => {

    let updated = [];

    if (selected.includes(emotion.name)) {

      updated =
        selected.filter((x) => x !== emotion.name);

    } else if (selected.length < 3) {

      updated = [...selected, emotion.name];
    }

    setSelected(updated);

    localStorage.setItem(
      "selected_emotions",
      JSON.stringify(updated)
    );

    // =================================================
    // SAVE TO DATABASE
    // =================================================

    try {

      await fetch(
        "http://127.0.0.1:5000/save-emotions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            email:
              localStorage.getItem("email"),

            emotions: updated,

            created_at:
              new Date().toISOString()
          })
        }
      );

    } catch (error) {

      console.log(
        "Emotion save failed"
      );
    }
  };

  return (
    <div className="card emotion-selector-card">

      <div className="emotion-header">

        <div>

          <h3 className="emotion-title">
            What are you feeling today?
          </h3>

          <p className="emotion-sub">
            Select up to 3 emotions that reflect your current emotional state
          </p>

        </div>

        <div className="emotion-counter">
          {selected.length}/3
        </div>

      </div>

      {/* GRID */}

      <div className="emotion-grid">

        {emotions.map((emotion) => {

          const active =
            selected.includes(emotion.name);

          return (

            <button
              key={emotion.name}

              className={`emotion-chip ${
                active ? "active" : ""
              }`}

              onClick={() => toggle(emotion)}

              style={{
                borderColor: active
                  ? emotion.color
                  : "rgba(255,255,255,0.4)"
              }}
            >

              <div
                className="emotion-indicator"
                style={{
                  background: emotion.color
                }}
              ></div>

              <div className="emotion-content">

                <div className="emotion-name">
                  {emotion.name}
                </div>

                <div className="emotion-desc">
                  {emotion.desc}
                </div>

              </div>

            </button>
          );
        })}

      </div>

      {/* SUMMARY */}

      {selected.length > 0 && (

        <div className="emotion-summary">

          <div className="summary-title">
            Current Emotional Pattern
          </div>

          <div className="summary-tags">

            {selected.map((emotion) => (

              <div
                key={emotion}
                className="summary-tag"
              >
                {emotion}
              </div>

            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default EmotionSelector;