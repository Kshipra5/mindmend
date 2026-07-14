import React, { useState } from "react";
import "./templates/signup.css";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signupData = {
      name: e.target[0].value,
      contact: e.target[1].value,
      age: e.target[2].value,
      email: e.target[3].value,
      password: e.target[4].value,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Signup Success:", data);

        // ✅ Save user locally
        localStorage.setItem("email", signupData.email);
        localStorage.setItem("name", signupData.name);

        alert("Account created successfully");

        navigate("/welcome");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">

        <div className="signup-visual">
          <div className="signup-overlay">
            <h1>You’re not alone</h1>
            <p>
              Creating an account helps you track your emotional journey in a
              safe and private space.
            </p>
            <p className="soft-line">
              Take this step gently — we’re here with you.
            </p>
          </div>
        </div>

        <div className="signup-card">
          <h2>Create your account</h2>
          <p className="form-subtext">
            A few details to get started — that’s all.
          </p>

          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" required />
            <input type="text" placeholder="Contact Number" required />
            <input type="number" placeholder="Age" required />
            <input type="email" placeholder="Email Address" required />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                required
              />
              <span
                className="show-pass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <button type="submit">Sign Up</button>
          </form>

          <p className="login-text">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;