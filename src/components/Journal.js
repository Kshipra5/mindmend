import React, { useEffect, useState } from "react";
import "./templates/result.css";

function Journal() {
  const [text, setText] = useState("");
  const [savedEntries, setSavedEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Premium rotating prompts
  const prompts = [
    "What made you feel this way today?",
    "What thoughts have been repeating lately?",
    "What emotionally drained you today?",
    "What brought you even a little peace today?",
    "What are you trying to process right now?",
    "What is something your mind needs right now?",
    "What are you avoiding emotionally?",
    "What would you say to yourself kindly today?"
  ];

  const [randomPrompt, setRandomPrompt] = useState("");

  useEffect(() => {
    setRandomPrompt(
      prompts[Math.floor(Math.random() * prompts.length)]
    );

    // Load previous entries
    const stored =
      JSON.parse(localStorage.getItem("mindmend_journal")) || [];

    setSavedEntries(stored);
  }, []);

  const getMoodFromText = (content) => {
    const lower = content.toLowerCase();

    if (
      lower.includes("sad") ||
      lower.includes("cry") ||
      lower.includes("hurt")
    ) {
      return "Low";
    }

    if (
      lower.includes("stress") ||
      lower.includes("anxious") ||
      lower.includes("worried")
    ) {
      return "Stressed";
    }

    if (
      lower.includes("happy") ||
      lower.includes("good") ||
      lower.includes("peace")
    ) {
      return "Positive";
    }

    return "Neutral";
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setSaveMessage("Please write something first.");
      return;
    }

    setIsSaving(true);

    const entry = {
      id: Date.now(),
      text,
      mood: getMoodFromText(text),
      created_at: new Date().toISOString(),
      wordCount: text.trim().split(/\s+/).length,
      characterCount: text.length
    };

    try {
      // SAVE LOCALLY
      const updatedEntries = [entry, ...savedEntries];

      localStorage.setItem(
        "mindmend_journal",
        JSON.stringify(updatedEntries)
      );

      setSavedEntries(updatedEntries);

      // OPTIONAL BACKEND SAVE
      try {
        await fetch("http://127.0.0.1:5000/save-journal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(entry)
        });
      } catch (backendError) {
        console.log("Backend not connected yet");
      }

      setSaveMessage("Journal entry saved successfully.");
      setText("");
    } catch (error) {
      setSaveMessage("Something went wrong.");
    }

    setIsSaving(false);

    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  return (
    <div className="card premium-journal-card">

      {/* HEADER */}
      <div className="journal-header">

        <div>
          <h3>Journal your thoughts</h3>

          <p className="journal-sub">
            A private space to reflect, process, and understand yourself better.
          </p>
        </div>

        <div className="journal-badge">
          Private
        </div>

      </div>

      {/* TEXTAREA */}
      <div className="journal-input-wrapper">

        <textarea
          placeholder={randomPrompt}
          value={text}
          maxLength={1200}
          onChange={(e) => setText(e.target.value)}
          className="premium-journal-input"
        />

      </div>

      {/* FOOTER */}
      <div className="journal-footer">

        <div className="journal-stats">

          <span>{text.length} characters</span>

          <span>
            {text.trim()
              ? text.trim().split(/\s+/).length
              : 0}{" "}
            words
          </span>

        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="journal-save-btn"
        >
          {isSaving ? "Saving..." : "Save Entry"}
        </button>

      </div>

      {/* SAVE MESSAGE */}
      {saveMessage && (
        <div className="journal-message">
          {saveMessage}
        </div>
      )}

      {/* RECENT ENTRIES */}
      {savedEntries.length > 0 && (
        <div className="journal-history">

          <div className="history-top">
            <h4>Recent Reflections</h4>

            <span>{savedEntries.length} saved</span>
          </div>

          <div className="history-list">

            {savedEntries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="history-item">

                <div className="history-item-top">

                  <span className={`mood-tag ${entry.mood.toLowerCase()}`}>
                    {entry.mood}
                  </span>

                  <span className="history-date">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>

                </div>

                <p>
                  {entry.text.length > 120
                    ? entry.text.substring(0, 120) + "..."
                    : entry.text}
                </p>

              </div>
            ))}

          </div>

        </div>
      )}
    </div>
  );
}

export default Journal;