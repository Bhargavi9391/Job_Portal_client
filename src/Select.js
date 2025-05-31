import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrashAlt } from "react-icons/fa";
import './Select.css';


export default function Select() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);

  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem("applications")) || [];
    const storedAdminJobs = JSON.parse(localStorage.getItem("homePostedJobs")) || [];

    setApplications(storedApplications);
    setAdminJobs(storedAdminJobs);
  }, []);

  useEffect(() => {
  
    localStorage.setItem("hasViewedResults", "true");
  }, []);
  


  const getResultMessage = (application) => {
    const matchedJob = adminJobs.find(job =>
      job.position === application.jobTitle &&
      job.company === application.company
    );

    if (!matchedJob) return { message: "❌ Job not found", reasons: [], suggestions: [] };

    const reasons = [];
    const suggestions = [];

    if (Number(application.cgpa) < Number(matchedJob.cgpa)) {
      reasons.push(`Your CGPA of ${application.cgpa} is below the required CGPA of ${matchedJob.cgpa}.`);
      suggestions.push("Consider improving your CGPA through additional courses.");
    }

    const requiredYear = matchedJob.graduationYear || matchedJob.expectedYear || "Not Provided";
    if (application.graduationYear !== requiredYear) {
      reasons.push(`Your graduation year (${application.graduationYear}) doesn't match the required year (${requiredYear}).`);
      suggestions.push("Apply to roles that match your timeline.");
    }

    const normalize = str => str.trim().toLowerCase();
    const applicationSkills = application.skills || [];
    const missingSkills = matchedJob.skills.filter(skill =>
      !applicationSkills.map(normalize).includes(normalize(skill))
    );

    if (missingSkills.length > 0) {
      reasons.push(`Missing required skills: ${missingSkills.join(", ")}`);
      suggestions.push("Learn these skills via platforms like Udemy, Coursera, etc.");
    }

    if (reasons.length === 0) {
      return {
        message: "✅ You are selected! 🎉",
        followUp: "Details will be shared soon. Check your email regularly!",
        reasons: [],
        suggestions: []
      };
    } else {
      return {
        message: "❌ Unfit for this job",
        followUp: "Don’t be discouraged. Improve and try again!",
        reasons,
        suggestions
      };
    }
  };

  const handleDelete = (index) => {
    const updatedApplications = applications.filter((_, i) => i !== index);
    setApplications(updatedApplications);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
  };

  return (
    <div className="select-container">
      <FaArrowLeft className="back-icon" onClick={() => navigate("/home")} />
      <h2>Selection Results</h2>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        applications.map((app, index) => {
          const result = getResultMessage(app);
          return (
            <div
              key={index}
              className={`result-card ${result.message.includes("selected") ? "selected" : "unfit"}`}
            >
              <h3>{app.firstName} {app.lastName}</h3>
              <p><strong>Applied for:</strong> {app.jobTitle} at {app.company}</p>
              <p><strong>CGPA:</strong> {app.cgpa || "Not Provided"}</p>
              <p><strong>Graduation Year:</strong> {app.graduationYear || "Not Provided"}</p>
              <p><strong>Status:</strong> {result.message}</p>
              {result.followUp && (
                <p className="follow-up">{result.followUp}</p>
              )}

              {result.reasons.length > 0 && (
                <>
                  <p><strong>Reasons:</strong></p>
                  <ul>
                    {result.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </>
              )}

              {result.suggestions.length > 0 && (
                <>
                  <p><strong>Suggestions:</strong></p>
                  <ul>
                    {result.suggestions.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}

              {result.message.includes("Unfit") && (
                <small>
                  <p><strong>Extra Tips:</strong></p>
                  <ul className="extra-tips">
                    <li>Join open-source projects for experience.</li>
                    <li>Tailor your resume to each job.</li>
                    <li>Try internships or freelance work.</li>
                  </ul>
                </small>
              )}

              <FaTrashAlt
                className="back-icon2"
                onClick={() => handleDelete(index)}
                aria-label="Delete Application"
              />
            </div>
          );
        })
      )}
    </div>
  );
}
