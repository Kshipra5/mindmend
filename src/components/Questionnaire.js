import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./templates/questionnaire.css";

function Questionnaire() {

  const navigate = useNavigate();

  // ===========================
  // QUESTION BANK
  // ===========================
  const questionBank = [

    {
      id: "stress_level",
      question: "I am finding it difficult to manage stress lately.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "anxiety_level",
      question: "I feel excessive worry, fear, or anxiety.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "sleep_issue",
      question: "My sleep or appetite patterns have changed noticeably.",
      options: [
        "No change",
        "Slight change",
        "Moderate change",
        "Severe change",
        "Extreme change"
      ]
    },

    {
      id: "social_withdrawal",
      question: "I have withdrawn from social interactions.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "hopelessness",
      question: "I feel hopeless about things in my life.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "motivation_loss",
      question: "I struggle to stay motivated during the day.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "emotional_exhaustion",
      question: "I feel emotionally exhausted or drained.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "overthinking",
      question: "I overthink situations or conversations frequently.",
      options: [
        "Not at all",
        "Rarely",
        "Sometimes",
        "Often",
        "Always"
      ]
    },

    {
      id: "appetite_change",
      question: "My eating habits have changed recently.",
      options: [
        "No change",
        "Slight change",
        "Moderate change",
        "Severe change",
        "Extreme change"
      ]
    },

    {
      id: "self_harm_thoughts",
      question: "I have experienced thoughts of self-harm or giving up.",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very Often"
      ]
    }
  ];

  // ===========================
  // RANDOMIZE QUESTIONS
  // ===========================
  function getRandomQuestions(arr, num) {

    const shuffled =
      [...arr].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, num);
  }

  const [questions] = useState(() =>
    getRandomQuestions(questionBank, 10)
  );

  const [index, setIndex] = useState(0);

  const [answers, setAnswers] =
    useState(Array(10).fill(null));

  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);

  const [animate, setAnimate] = useState(false);

  // ===========================
  // HANDLE ANSWER
  // ===========================
  const handleAnswer = async (value, optionText) => {

    if (loading || selected !== null) return;

    setSelected(value);

    const newAnswers = [...answers];

    newAnswers[index] = optionText;

    setAnswers(newAnswers);

    setAnimate(false);

    setTimeout(async () => {

      setAnimate(true);

      setTimeout(async () => {

        // NEXT QUESTION
        if (index + 1 < questions.length) {

          setIndex((prev) => prev + 1);

          setSelected(null);

          setAnimate(false);

        }

        // FINAL SUBMIT
        else {

          try {

            setLoading(true);

            const email =
              localStorage.getItem("email");

            // SAVE LOCALLY
            localStorage.setItem(
              "answers",
              JSON.stringify(newAnswers)
            );

            localStorage.setItem(
              "questions",
              JSON.stringify(questions)
            );

            // SEND TO BACKEND
            const response = await fetch(
              "http://localhost:5000/predict",
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json"
                },

                body: JSON.stringify({
                  answers: newAnswers,
                  questions,
                  email
                })
              }
            );

            const data = await response.json();

            navigate("/result", {
              state: data
            });

          } catch (error) {

            console.log(error);

            alert("Server error");

          } finally {

            setLoading(false);
          }
        }

      }, 250);

    }, 200);
  };

  // ===========================
  // LOADING
  // ===========================
  if (!questions || questions.length === 0) {

    return <div>Loading...</div>;
  }

  // ===========================
  // MAIN UI
  // ===========================
  return (

    <div className="questionnaire-page">

      <div className="card">

        {/* PROGRESS */}
        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width:
                `${((index + 1) / questions.length) * 100}%`
            }}
          />

        </div>

        <p className="progress-text">
          Step {index + 1} of {questions.length}
        </p>

        {/* QUESTION CONTENT */}
        <div
          className={`content question-wrapper ${
            animate ? "fade-out" : "fade-in"
          }`}
        >

          <div className="statement">
            {questions[index].question}
          </div>

          <div className="reassurance">
            There are no right or wrong answers —
            respond based on how you've genuinely felt recently.
          </div>

          {/* OPTIONS */}
          <div className="options">

            {questions[index].options.map(
              (text, value) => (

                <button
                  key={value}
                  className={
                    selected === value
                      ? "selected"
                      : ""
                  }

                  onClick={() =>
                    handleAnswer(value, text)
                  }

                  disabled={
                    loading || selected !== null
                  }
                >

                  {text}

                </button>
              )
            )}

          </div>

        </div>

        {/* LOADING */}
        {loading && (

          <div className="loading-text">
            Analyzing emotional wellness indicators...
          </div>

        )}

      </div>

    </div>
  );
}

export default Questionnaire;