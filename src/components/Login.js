import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./templates/login.css";

function Login() {
  const navigate = useNavigate();

  //  track email
  const [email, setEmail] = useState("");

  //  ALERT STATE
  const [alert, setAlert] = useState(null);

  //  ALERT FUNCTION
  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email: e.target[0].value,
      password: e.target[1].value,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("name", data.name);

        showAlert("Login successful", "success");

        setTimeout(() => {
          navigate("/welcome");
        }, 1000);
      } else {
        showAlert(data.error || "Invalid credentials", "error");
      }
    } catch (error) {
      showAlert("Server error. Make sure backend is running.", "error");
    }
  };

  // handle forgot click
  const handleForgotClick = () => {
    if (!email) {
      showAlert("Please enter your email first", "info");
      return;
    }

    navigate("/forgot-password", { state: { email } });
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/*  ALERT UI */}
        {alert && (
          <div className={`alert-box ${alert.type}`}>
            <span>{alert.msg}</span>
            <button onClick={() => setAlert(null)}>×</button>
          </div>
        )}

        <div className="login-visual">
          <div className="overlay">
            <h1>Welcome back</h1>
            <p>
              This is your personal space to pause,
              breathe, and gently understand what’s
              going on inside.
            </p>
            <p className="soft-line">
              No judgment. No pressure. Just care.
            </p>
          </div>
        </div>

        <div className="login-card">
          <h2>Login to Mind Mend</h2>
          <p className="form-subtext">
            Let’s continue where you left off.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>

            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input type="password" placeholder="••••••••" required />

            <div className="forgot-row">
              <span className="forgot-link" onClick={handleForgotClick}>
                Forgot your password?
              </span>
            </div>

            <button type="submit">Login</button>
          </form>

          <p className="signup-text">
            New here? <Link to="/signup">Create a gentle start</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;