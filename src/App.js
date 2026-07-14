import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Questionnaire from "./components/Questionnaire";
import Result from "./components/Result";
import Welcome from "./components/Welcome";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";


function App() {
  return (
    <Router>
      <Routes>

        {/* MAIN ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* CORE FLOW */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/result" element={<Result />} />
        {/* FALLBACK ROUTE (FIXED) */}
        <Route path="*" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;