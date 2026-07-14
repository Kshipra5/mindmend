import React, { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./templates/dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const severityColors = {
  Low: "#22c55e",
  Mild: "#eab308",
  Moderate: "#f97316",
  High: "#ef4444",
  Critical: "#dc2626",
};

function Dashboard() {
  const [data, setData] = useState(null);
  const dashboardRef = useRef(null);
  const email = localStorage.getItem("email");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/dashboard/${email}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.log(err));
  }, [email]);

  const downloadPDF = async () => {
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: "#f8fafc",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, width, height);
    pdf.save("MentalHealthReport.pdf");
  };

  const shareDashboard = async () => {
    const text = `
Mental Health Dashboard

Prediction: ${data.latestAssessment?.prediction}
Severity: ${data.latestAssessment?.severity}%
Confidence: ${data.latestAssessment?.confidence}%
`;

    try {
      await navigator.share({ title: "Mental Health Dashboard", text });
    } catch {
      navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard");
    }
  };

  const lineData = useMemo(() => {
    const assessments = data?.assessments?.slice().reverse() ?? [];

    return {
      labels: assessments.map((_, index) => `Assessment ${index + 1}`),
      datasets: [
        {
          label: "Severity",
          data: assessments.map((item) => item.severity),
          borderColor: "#14b8a6",
          backgroundColor: "rgba(20, 184, 166, 0.16)",
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: "#0ea5e9",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
        },
      ],
    };
  }, [data?.assessments]);

  const pieData = useMemo(() => {
    const counts = {
      Low: 0,
      Mild: 0,
      Moderate: 0,
      High: 0,
      Critical: 0,
    };

    data?.assessments?.forEach((item) => {
      if (counts[item.prediction] !== undefined) {
        counts[item.prediction] += 1;
      }
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: Object.keys(counts).map((key) => severityColors[key]),
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [data?.assessments]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxWidth: 12,
          color: "#334155",
          font: { family: "Inter, system-ui, sans-serif" },
        },
      },
    },
  };

  if (!data) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-card">
          <div className="loading-ring" />
          <h3>Loading Dashboard...</h3>
        </div>
      </div>
    );
  }

  const stats = [
    ["Total Assessments", data.stats?.totalAssessments],
    ["Wellness Score", `${data.stats?.wellnessScore}%`],
    ["SOS Count", data.stats?.sosCount],
    ["Average Severity", `${data.stats?.averageSeverity}%`],
  ];

  return (
    <div className="dashboard-page" ref={dashboardRef}>
      <div className="dashboard-shell container-fluid">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">Mental Wellness Dashboard</span>
            <h1>Welcome {data.user?.name}</h1>
            <p>Track assessments, journals, chats, and wellness trends in one place.</p>
          </div>

          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={downloadPDF}>
              Download PDF
            </button>
            <button className="btn btn-success" onClick={shareDashboard}>
              Share
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {stats.map(([label, value]) => (
            <div className="col-lg-3 col-md-6" key={label}>
              <div className="card stats-card">
                <h5>{label}</h5>
                <h2>{value}</h2>
              </div>
            </div>
          ))}
        </div>

        <section className="card latest-assessment mb-4">
          <div className="latest-assessment-content">
            <div>
              <span className="section-label">Latest Assessment</span>
              <h2>{data.latestAssessment?.prediction}</h2>
              <p>
                Severity: <strong>{data.latestAssessment?.severity}%</strong>
              </p>
              <p>
                Confidence: <strong>{data.latestAssessment?.confidence}%</strong>
              </p>
            </div>

            <div className="severity-meter">
              <span>{data.latestAssessment?.severity}%</span>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${data.latestAssessment?.severity}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="row g-4">
          <div className="col-lg-8">
            <section className="card chart-card">
              <h4>Severity Trend</h4>
              <div className="chart-wrapper">
                <Line data={lineData} options={chartOptions} />
              </div>
            </section>
          </div>

          <div className="col-lg-4">
            <section className="card chart-card">
              <h4>Prediction Distribution</h4>
              <div className="chart-small">
                <Doughnut data={pieData} options={chartOptions} />
              </div>
            </section>
          </div>
        </div>

        <section className="card dashboard-section mt-4">
          <h3>Assessment History</h3>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Prediction</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.assessments.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`risk-pill ${item.prediction?.toLowerCase()}-risk`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td>{item.severity}%</td>
                    <td>{item.confidence || "-"}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card dashboard-section mt-4">
          <h3>Recent Journals</h3>
          {data.journals?.length === 0 ? (
            <p>No journals found.</p>
          ) : (
            data.journals.map((item) => (
              <article className="journal-item" key={item._id}>
                <p>{item.text}</p>
                <small>Mood: {item.mood}</small>
              </article>
            ))
          )}
        </section>

        <section className="card dashboard-section mt-4">
          <h3>Recent Chats</h3>
          {data.chats?.map((chat) => (
            <article className="chat-item" key={chat._id}>
              <p>
                <strong>You:</strong> {chat.message}
              </p>
              <p>
                <strong>Bot:</strong> {chat.reply}
              </p>
              <small>Risk: {chat.risk_level}</small>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
