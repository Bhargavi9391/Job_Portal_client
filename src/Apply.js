import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Apply.css";

export default function Apply() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job || {};

  const initialSkills = [
    { name: "HTML", percentage: 0, color: "#ff6f61" },
    { name: "CSS", percentage: 0, color: "#1dd1a1" },
    { name: "JavaScript", percentage: 0, color: "#feca57" },
    { name: "React", percentage: 0, color: "#48dbfb" },
    { name: "Node.js", percentage: 0, color: "#ffa502" },
    { name: "Python", percentage: 0, color: "#5f27cd" },
    { name: "Java", percentage: 0, color: "#d63031" },
    { name: "C++", percentage: 0, color: "#576574" },
    { name: "SQL", percentage: 0, color: "#ff9ff3" },
    { name: "MySQL", percentage: 0, color: "#00d2d3" },
  ];

  const generateColor = (name) => {
    const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const requiredSkillNames = job.skills || [];

  const [skills, setSkills] = useState(
    requiredSkillNames.map((skillName) => {
      const existing = initialSkills.find((s) => s.name === skillName);
      return existing
        ? { ...existing }
        : { name: skillName, percentage: 0, color: generateColor(skillName) };
    })
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    graduationYear: "",
    cgpa: "",
    linkedin: "",
    location: "",
    resumeFileName: "",
    manualSkills: "",  // <-- Add manualSkills here
  });

  const handleClick = (index, event) => {
    const progressBarWidth = event.target.offsetWidth;
    const clickPosition = event.nativeEvent.offsetX;
    const newPercentage = Math.round((clickPosition / progressBarWidth) * 100);

    const updatedSkills = [...skills];
    updatedSkills[index].percentage = newPercentage;
    setSkills(updatedSkills);
  };

  if (!job.position || !job.company) {
    return (
      <div className="apply-container">
        <h2>Error: Job details are missing!</h2>
        <p>Please go back to the job listing and try again.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prevData) => ({ ...prevData, resumeFileName: file.name }));
    } else {
      alert("Please upload a valid PDF file for the resume.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedSkills = skills
      .filter((skill) => skill.percentage > 0)
      .map((skill) => ({
        name: skill.name,
        level: skill.percentage,
      }));

    // Process manual skills as an array (split by comma and trim)
    const manualSkillsArray = formData.manualSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newDetailedApplication = {
      jobTitle: job.position,
      company: job.company,
      firstName: formData.firstName,
      lastName: formData.lastName,
      graduationYear: formData.graduationYear,
      expectedYear: job.expectedYear || "",
      education: "M.Tech",
      requiredEducation: job.education || "",
      cgpa: formData.cgpa,
      linkedin: formData.linkedin,
      location: formData.location,
      resume: formData.resumeFileName,
      skills: selectedSkills,
      manualSkills: manualSkillsArray,
      requiredSkills: job.skills || [],
    };

    const simplifiedApplication = {
      jobId: job.id,
      position: job.position,
      company: job.company,
      appliedAt: new Date().toISOString(),
    };

    try {
      const existingApplications = JSON.parse(localStorage.getItem("applications")) || [];
      const updatedApplications = [...existingApplications, { ...newDetailedApplication, ...simplifiedApplication }];
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      localStorage.setItem("applicationCount", updatedApplications.length);
      localStorage.setItem("hasViewedResults", "false");

      alert("Application submitted successfully!");
      navigate("/submissions");
    } catch (err) {
      alert("Error saving your application. Storage limit might be exceeded.");
      console.error(err);
    }
  };

  return (
    <div className="apply-container">
      <h2>Apply for {job.position} at {job.company}</h2>
      <form className="apply-form" onSubmit={handleSubmit}>
        <label>First Name *</label>
        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

        <label>Last Name *</label>
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />

        <label>Graduation Year *</label>
        <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} required />

        <label>CGPA *</label>
        <input type="text" name="cgpa" value={formData.cgpa} onChange={handleChange} required />

        <label>LinkedIn Profile *</label>
        <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} required />

        <label>Upload Resume (PDF) *</label>
        <input type="file" accept=".pdf" onChange={handleFileChange} required />

        <label>Current Location *</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <div className="skill-section">
          <label>Set Your Skill Levels *</label>
          <div className="container">
            {skills.map((skill, index) => (
              <div key={skill.name} className="skill-row">
                <div className="skill-name">{skill.name}</div>
                <div className="progress-bar" onClick={(e) => handleClick(index, e)}>
                  <div
                    className="progress"
                    style={{
                      width: `${skill.percentage}%`,
                      backgroundColor: skill.color,
                    }}
                  />
                </div>
                <div className="percentage">
                  {skill.percentage === 0 ? "" : `${skill.percentage}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <label>Enter Your Skills Manually (comma-separated)</label>
        <input
          type="text"
          name="manualSkills"
          value={formData.manualSkills}
          onChange={handleChange}
          placeholder="e.g. HTML, CSS, JavaScript"
        />

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
}
