import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./templates/reset.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const getStrength = (pass) => {
    if (pass.length < 6) return "Weak";
    if (pass.match(/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/)) return "Strong";
    return "Medium";
  };

  const strength = getStrength(password);
  const match = password && confirm && password === confirm;

  const handleReset = async (e) => {
    e.preventDefault();

    if (!match) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Password updated successfully");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setMessage("Server error");
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">

        {/* LEFT */}
        <div className="reset-left">
          <div className="overlay">
            <h1>Start fresh</h1>
            <p>Reset your password and continue your journey calmly.</p>
            <p className="soft-line">You’re doing better than you think.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="reset-card">
          <h2>Reset Password</h2>
          <p className="subtext">Create a new secure password.</p>

          <form onSubmit={handleReset}>

            {/* PASSWORD */}
            <label>New Password</label>
            <div className="input-group">
              <input
                type={show ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle" onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"}
              </span>
            </div>

            <div className={`strength ${strength.toLowerCase()}`}>
              {password && `Strength: ${strength}`}
            </div>

            {/* CONFIRM */}
            <label>Confirm Password</label>
            <div className="input-group">
              <input
                type={show ? "text" : "password"}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <span className="toggle" onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"}
              </span>
            </div>

            {confirm && (
              <div className={match ? "match success" : "match error"}>
                {match ? "Passwords match" : "Passwords do not match"}
              </div>
            )}

            <button type="submit">Update Password</button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;