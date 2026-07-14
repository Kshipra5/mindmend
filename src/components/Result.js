import React, { useEffect, useState, useRef } from "react";

import "./templates/result.css";

import {
  UserRound,
  Brain,
  Globe,
  LayoutDashboard,
  RotateCcw
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Breathing from "../components/Breathing";
import EmotionSelector from "../components/EmotionSelector";
import Journal from "../components/Journal";
import SOS from "../components/SOS";
import FloatingChatBot from "../components/FloatingChatBot";

function Result() {

  const navigate = useNavigate();

  const [severity, setSeverity] = useState(0);
  const [confidence, setConfidence] = useState(0);

  const [loading, setLoading] = useState(true);
  const [sosTriggered, setSosTriggered] = useState(false);

  const hasSavedRef = useRef(false);

  const [userLocation, setUserLocation] = useState(null);
  const [city, setCity] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // ===========================
  // CHECK VALID DATA
  // ===========================
  const hasData = severity > 0 || confidence > 0;

  // ===========================
  // SUPPORT MESSAGE
  // ===========================
  const getMessage = (level) => {

    if (!level) {
      return "Your emotional wellness summary will appear here after completing the assessment.";
    }

    if (level <= 25) {
      return "Your emotional state appears calm and balanced with healthy stress levels.";
    }

    if (level <= 50) {
      return "Mild emotional strain has been detected. Small wellness practices may help restore balance.";
    }

    if (level <= 75) {
      return "You may be experiencing ongoing emotional pressure affecting focus, energy, or wellbeing.";
    }

    return "Elevated emotional distress indicators detected. Support and self-care are strongly recommended.";
  };

  // ===========================
  // INSIGHT
  // ===========================
  const getInsight = (level) => {

    if (!level) {
      return "Complete the assessment to unlock personalized emotional insights and wellbeing patterns.";
    }

    if (level <= 25) {
      return "Your current emotional patterns suggest stability, resilience, and balanced wellbeing.";
    }

    if (level <= 50) {
      return "Some emotional fatigue patterns may be developing due to stress or mental overload.";
    }

    if (level <= 75) {
      return "Consistent emotional strain may be impacting motivation, concentration, or emotional clarity.";
    }

    return "Strong emotional stress patterns are visible. Additional emotional support could be beneficial.";
  };

  // ===========================
  // RECOMMENDATION
  // ===========================
  const getRecommendation = (level) => {

    if (!level) {
      return "Personalized wellness recommendations will be generated after your assessment.";
    }

    if (level <= 25) {
      return "Maintain healthy habits such as quality sleep, movement, hydration, and social balance.";
    }

    if (level <= 50) {
      return "Daily mindfulness, breathing exercises, and journaling may help reduce emotional fatigue.";
    }

    if (level <= 75) {
      return "Consider slowing down, reducing mental overload, and speaking with someone you trust.";
    }

    return "Professional guidance or emotional support may help you navigate this difficult phase.";
  };

  // ===========================
  // CONFIDENCE LABEL
  // ===========================
  const getConfidenceLabel = (value) => {

    if (value >= 85) return "Very Strong";
    if (value >= 70) return "Strong";
    if (value >= 50) return "Moderate";
    if (value >= 35) return "Limited";

    return "Low";
  };

  // ===========================
  // RISK LABEL
  // ===========================
  const getRiskLabel = (level) => {

    if (level <= 25) return "Low";
    if (level <= 50) return "Mild";
    if (level <= 75) return "Moderate";

    return "High";
  };

  // ===========================
  // FETCH RESULT
  // ===========================
  useEffect(() => {

    const savedAnswers =
      JSON.parse(localStorage.getItem("answers")) || [];

    const email = localStorage.getItem("email");

    if (savedAnswers.length === 0) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answers: savedAnswers,
        email,
        timestamp: Date.now()
      })
    })
      .then((res) => res.json())
      .then((data) => {

        setSeverity(data.severity || 0);
        setConfidence(data.confidence || 0);
        setSosTriggered(data.sos_triggered || false);

        localStorage.removeItem("answers");
        localStorage.removeItem("selectedEmotions");
        localStorage.removeItem("questionnaire_progress");
      })
      .catch(() => {
        console.log("Error fetching assessment");
      })
      .finally(() => setLoading(false));

  }, []);

  // ===========================
  // SAVE HISTORY
  // ===========================
  useEffect(() => {

    if (loading || hasSavedRef.current) return;

    hasSavedRef.current = true;

    const history =
      JSON.parse(localStorage.getItem("mindmend_assessments")) || [];

    const assessment = {
      id: Date.now(),
      severity,
      confidence,
      created_at: new Date().toISOString(),
      sosTriggered
    };

    localStorage.setItem(
      "mindmend_assessments",
      JSON.stringify([assessment, ...history])
    );

    fetch("http://127.0.0.1:5000/save-assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(assessment)
    }).catch(() => {});

  }, [severity, confidence, sosTriggered, loading]);

  // ===========================
  // LOCATION ACCESS
  // ===========================
  const handleLocationAccess = () => {

    if (!navigator.geolocation) return;

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setUserLocation({ lat, lng });

      try {

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await res.json();

        setCity(
          data.address.city ||
          data.address.town ||
          data.address.state ||
          "your area"
        );

      } catch {}

      setLocationLoading(false);

    });
  };

  // ===========================
  // LOADING
  // ===========================
  if (loading) {

    return (
      <div className="result-page">

        <div className="container">

          <div className="loading">
            Analyzing your emotional state...
          </div>

        </div>

      </div>
    );
  }

  return (

    <div className="result-page">

      <div className="container">

        <h2>Your Emotional Assessment</h2>

        <p className="sub-text">

          {hasData
            ? "Here is your personalized emotional wellbeing summary."
            : "Complete your assessment to unlock your emotional wellness insights."}

        </p>

        {/* STATUS BOX */}
        <div className="status-box">

          <div className="prediction-text">
            {severity > 0
              ? `${getRiskLabel(severity)} Emotional Impact`
              : "Assessment Awaiting"}
          </div>

          <div className="support-text">
            {getMessage(severity)}
          </div>

          {/* INSIGHT */}
          <div className="insight-box">

            <h4>Emotional Insight</h4>

            <p>{getInsight(severity)}</p>

          </div>

          {/* RECOMMENDATION */}
          <div className="recommendation-box">

            <h4>Recommended Focus</h4>

            <p>{getRecommendation(severity)}</p>

          </div>

          {/* CONFIDENCE */}
          <div className="confidence-box">

            <div className="confidence-item">

              <span>Assessment Reliability</span>

              <strong>
                {confidence > 0
                  ? getConfidenceLabel(confidence)
                  : "Pending"}
              </strong>

            </div>

            <div className="confidence-item">

              <span>Emotional Level</span>

              <strong>
                {severity > 0
                  ? getRiskLabel(severity)
                  : "Awaiting Assessment"}
              </strong>

            </div>

          </div>

          {/* PROGRESS */}
          <div className="progress-wrapper">

            <div className="progress-header">

              <span>Wellbeing Score</span>

              <span>
                {severity > 0
                  ? `${severity}%`
                  : "--"}
              </span>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{ width: `${severity || 0}%` }}
              />

            </div>

          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="result-actions">

          <button
            className="dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >

            <span className="btn-left">

              <LayoutDashboard size={18} />

              Dashboard

            </span>

          </button>

          <button
            className="retest-btn"
            onClick={() => navigate("/questionnaire")}
          >

            <span className="btn-left">

              <RotateCcw size={18} />

              Retake Assessment

            </span>

          </button>

        </div>

        {/* FEATURES */}
        <Breathing />
        <EmotionSelector />
        <Journal />

        {/* THERAPIST SECTION */}
        <div className="card therapist-card">

          <h3>Professional Support</h3>

          <p className="support-text">
            Explore personalized support options designed to help you feel emotionally supported and mentally balanced.
          </p>

          {city && (
            <p className="location-text">
              Showing support options near {city}
            </p>
          )}

          <div className="therapist-options">

            {/* THERAPIST */}
            <button
              onClick={() => {

                if (userLocation) {

                  window.open(
                    `https://www.google.com/maps/search/mental+health+therapist+near+me/@${userLocation.lat},${userLocation.lng},14z`,
                    "_blank"
                  );

                } else {

                  handleLocationAccess();

                }

              }}
            >

              <span className="option-left">

                <span className="icon-box">
                  <UserRound size={18} />
                </span>

                Mental Health Therapist

              </span>

              <span className="option-tag">
                Talk Therapy
              </span>

            </button>

            {/* PSYCHIATRIST */}
            <button
              onClick={() => {

                if (userLocation) {

                  window.open(
                    `https://www.google.com/maps/search/psychiatrist+near+me/@${userLocation.lat},${userLocation.lng},14z`,
                    "_blank"
                  );

                } else {

                  handleLocationAccess();

                }

              }}
            >

              <span className="option-left">

                <span className="icon-box">
                  <Brain size={18} />
                </span>

                Psychiatrist

              </span>

              <span className="option-tag">
                Medical Support
              </span>

            </button>

            {/* ONLINE */}
            <button
              onClick={() => {

                window.open(
                  "https://www.google.com/search?q=online+mental+health+therapy+India",
                  "_blank"
                );

              }}
            >

              <span className="option-left">

                <span className="icon-box">
                  <Globe size={18} />
                </span>

                Online Consultation

              </span>

              <span className="option-tag">
                Remote Help
              </span>

            </button>

          </div>

          {!userLocation && (

            <button
              className="location-btn"
              onClick={handleLocationAccess}
            >

              {locationLoading
                ? "Accessing Location..."
                : "Enable Location for Nearby Support"}

            </button>

          )}

        </div>

        {/* SOS */}
        {sosTriggered && <SOS />}

        {/* CHATBOT */}
        <FloatingChatBot severity={severity} />

        {/* ALERT */}
        {sosTriggered && (

          <div className="sos-alert">
            Support suggestions activated based on emotional indicators.
          </div>

        )}

      </div>

    </div>
  );
}

export default Result;