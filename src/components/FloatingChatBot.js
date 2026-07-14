import React, { useState, useRef, useEffect } from "react";
import "./templates/chatbot.css";

function FloatingChatBot({ severity, prediction }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi, I’m here for you." }
  ]);
  const [loading, setLoading] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const chatEndRef = useRef(null);

  const email = localStorage.getItem("email") || "guest";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (severity >= 75) {
      setShowSOS(true);
    }
  }, [severity]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;

    setMessages(prev => [...prev, { type: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsg,
          email: email
        })
      });

      const data = await res.json();

      const botReply =
        data?.reply && typeof data.reply === "string"
          ? data.reply
          : "I’m here with you. Tell me a little more.";

      setMessages(prev => [
        ...prev,
        { type: "bot", text: botReply }
      ]);

      if (data?.sos === true || data?.risk_level === "Critical") {
        setShowSOS(true);
      }

    } catch {
      setMessages(prev => [
        ...prev,
        { type: "bot", text: "Connection issue. Please try again." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbot-container">

      {/* FLOAT BUTTON */}
      <div
        className="chatbot-bubble"
        onClick={() => setOpen(!open)}
      >
        💬
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div className="chatbot-window">

          {/* HEADER */}
          <div className="chatbot-header">
            <span>AI Therapist</span>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          {/* ✅ DISCLAMER (NEW) */}
          <div className="chatbot-disclaimer">
            A gentle AI companion — not a licensed therapist.
          </div>

          {/* BODY */}
          <div className="chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.type}`}>
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="msg bot">Typing...</div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
              placeholder="Type how you feel..."
            />

            <button onClick={sendMessage}>
              Send
            </button>
          </div>

        </div>
      )}

      {/* SOS */}
      {showSOS && (
        <div className="sos-popup">
          <h3>We are here for you</h3>
          <p>Please consider reaching out:</p>

          <p><b>Emergency:</b> 112</p>
          <p><b>Tele-MANAS:</b> 14416</p>
          <p><b>Umang:</b> 14425</p>
          <p><b>India Helpline:</b> 1800-599-0019</p>

          <button onClick={() => setShowSOS(false)}>
            Close
          </button>
        </div>
      )}

    </div>
  );
}

export default FloatingChatBot;