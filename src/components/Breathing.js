import React, { useEffect, useRef, useState } from "react";

function Breathing() {

  const [text, setText] = useState("Ready to relax");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // =================================================
  // BREATHING STEPS
  // =================================================

  const steps = [
    {
      text: "Inhale Slowly",
      phase: "in",
      duration: 4000
    },

    {
      text: "Hold Gently",
      phase: "hold",
      duration: 2000
    },

    {
      text: "Exhale Softly",
      phase: "out",
      duration: 4000
    }
  ];

  // =================================================
  // START SESSION
  // =================================================

  const start = () => {

    if (running) return;

    setRunning(true);
    setSeconds(0);

    // session timer
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    let i = 0;

    const loop = () => {

      const step = steps[i];

      setText(step.text);
      setPhase(step.phase);

      timerRef.current = setTimeout(() => {

        i = (i + 1) % steps.length;
        loop();

      }, step.duration);

    };

    loop();
  };

  // =================================================
  // STOP SESSION
  // =================================================

  const stop = () => {

    setRunning(false);

    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);

    setText("Ready to relax");
    setPhase("idle");
    setSeconds(0);
  };

  // =================================================
  // CLEANUP
  // =================================================

  useEffect(() => {

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };

  }, []);

  // =================================================
  // FORMAT TIMER
  // =================================================

  const formatTime = (time) => {

    const mins = Math.floor(time / 60);
    const secs = time % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // =================================================
  // UI
  // =================================================

  return (

    <div className="breathing-widget">

      {/* TITLE */}
      <h3 className="breathing-title">
        Guided Breathing
      </h3>

      {/* SUBTEXT */}
      <p className="breathing-sub">
        Slow down your thoughts and relax your body
        with this calming breathing exercise.
      </p>

      {/* BREATHING VISUAL */}
      <div className="breathing-area">

        {/* animated rings */}
        <div className="breathing-ring ring1"></div>
        <div className="breathing-ring ring2"></div>
        <div className="breathing-ring ring3"></div>

        {/* main circle */}
        <div className={`breathing-circle ${phase}`}>

          <div className="breathing-inner-text">

            {phase === "in"
              ? "Inhale"

              : phase === "hold"
              ? "Hold"

              : phase === "out"
              ? "Exhale"

              : "Relax"}

          </div>

        </div>

      </div>

      {/* PHASE TEXT */}
      <div className="breathing-text">
        {text}
      </div>

      {/* TIMER */}
      <div className="breathing-timer">

        {running
          ? `Session Time • ${formatTime(seconds)}`
          : "4 • 2 • 4 calming rhythm"}

      </div>

      {/* BUTTONS */}
      <div className="breathing-controls">

        <button
          className={`breathing-btn ${running ? "stop" : ""}`}
          onClick={running ? stop : start}
        >

          {running
            ? "Stop Session"
            : "Start Session"}

        </button>

      </div>

    </div>
  );
}

export default Breathing;