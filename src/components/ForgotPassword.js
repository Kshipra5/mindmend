import React, { useState } from "react";
import "./templates/forgot.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);

        if (data.reset_link) {
          setLink(data.reset_link);
        }
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">

        {/* LEFT SIDE */}
        <div className="forgot-left">
          <div className="forgot-overlay">
            <h1>Forgot Password?</h1>
            <p>
              Don’t worry — it happens. Enter your email and we’ll help you reset your password.
            </p>
            <p className="soft-line">
              You’re still in control of your journey.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="forgot-card">
          <h2>Reset your password</h2>
          <p className="subtext">
            Enter your email to receive a reset link.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Link</button>
          </form>

          {message && <p className="message">{message}</p>}

          {/* SHOW RESET LINK (for local testing) */}
          {link && (
            <a className="reset-link" href={link}>
              Click here to reset password
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;