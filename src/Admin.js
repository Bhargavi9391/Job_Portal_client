import { useState, useEffect } from "react";
import { saveJobsToDB, getJobsFromDB } from "./utils/indexedDB";

import "./Admin.css";

export default function Admin() {
  const [jobData, setJobData] = useState({
    position: "",
    company: "",
    location: "",
    workType: "",
    skills: [],
    education: "",
    description: "",
    expectedYear: "",
    vacancies: "",
    salary: ""
  });

  const [submittedData, setSubmittedData] = useState(() => {
    return JSON.parse(localStorage.getItem("submittedJobs")) || [];
  });

  useEffect(() => {
    getJobsFromDB().then((data) => {
      setSubmittedData(data);
    });
  }, []);

  useEffect(() => {
    if (submittedData.length > 0) {
      saveJobsToDB([...submittedData]);
    }
  }, [submittedData]);

  useEffect(() => {
    localStorage.setItem("submittedJobs", JSON.stringify(submittedData));
  }, [submittedData]);

  const [editingIndex, setEditingIndex] = useState(null);

  const jobDescriptions = {
    "Software Engineer": "Designs, develops, and optimizes software applications. Requires strong programming skills...",
    "Frontend Developer": "Builds responsive, dynamic, and user-friendly interfaces using modern frontend technologies...",
    // ... your existing descriptions ...
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setJobData((prevData) => ({
      ...prevData,
      [name]: value,
      description: name === "position" ? jobDescriptions[value] || "" : prevData.description,
    }));
  };

  const handleSkillsChange = (e) => {
    const selectedSkill = e.target.value;
    if (selectedSkill && !jobData.skills.includes(selectedSkill)) {
      setJobData((prevData) => ({
        ...prevData,
        skills: [...prevData.skills, selectedSkill],
      }));
    }
  };

  // New async function to POST job data to backend
  const postJobToBackend = async (job) => {
    try {
      const response = await fetch("https://job-portal-server-u7bj.onrender.com/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        throw new Error("Failed to post job");
      }

      return true; // success
    } catch (error) {
      console.error("Error posting job to backend:", error);
      alert("Error posting job to backend");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobData.position || !jobData.company) {
      alert("Please fill in required fields.");
      return;
    }

    let updatedData = [...submittedData];

    if (editingIndex !== null) {
      updatedData[editingIndex] = { ...jobData };
    } else {
      updatedData.push(jobData);
    }

    setSubmittedData(updatedData);
    setEditingIndex(null);

    // Reset form fields
    setJobData({
      position: "",
      company: "",
      location: "",
      workType: "",
      skills: [],
      education: "",
      expectedYear: "",
      description: "",
      vacancies: "",
      salary: "",
    });

    // Post job to backend server
    const postSuccess = await postJobToBackend(jobData);
    if (postSuccess) {
      alert("Job posted successfully to backend!");
    }
  };

  const handleDelete = (index) => {
    const updatedJobs = submittedData.filter((_, i) => i !== index);
    setSubmittedData(updatedJobs);

    let homeJobs = JSON.parse(localStorage.getItem("homePostedJobs")) || [];
    homeJobs = homeJobs.filter(
      (job) =>
        job.position !== submittedData[index].position ||
        job.company !== submittedData[index].company
    );
    localStorage.setItem("homePostedJobs", JSON.stringify(homeJobs));

    localStorage.setItem("submittedJobs", JSON.stringify(updatedJobs));
  };

  const handleEdit = (index) => {
    setJobData({ ...submittedData[index] });
    setEditingIndex(index);
  };

  const handlePostJob = (job) => {
    if (!job.position || !job.company || !job.location) {
      alert("Job must have a title, company, and location.");
      return;
    }

    let homePostedJobs = JSON.parse(localStorage.getItem("homePostedJobs")) || [];

    const jobWithTimestamp = { ...job, postedTime: Date.now() };

    homePostedJobs.push(jobWithTimestamp);

    localStorage.setItem("homePostedJobs", JSON.stringify(homePostedJobs));

    alert(`Job Posted Successfully! Total Jobs: ${homePostedJobs.length}`);
  };

  return (
    <div className="admin-container">
      <h2 className="form-title">Job Details Form</h2>
      <form onSubmit={handleSubmit} className="job-form">
        {/* Your form fields here, unchanged */}

        {/* Position */}
        <div className="form-group">
          <label className="form-label">Position:</label>
          <select
            name="position"
            value={jobData.position}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select Position</option>
            {Object.keys(jobDescriptions).map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div className="form-group">
          <label className="form-label">Company:</label>
          <select
            name="company"
            value={jobData.company}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select Company</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            {/* Add more companies as needed */}
          </select>
        </div>

        {/* ... rest of your form fields (location, workType, skills, education, salary, description, vacancies, expectedYear) */}

        <button type="submit" className="submit-btn">
          {editingIndex !== null ? "Update Job" : "Submit Job"}
        </button>
      </form>

      {/* Display submitted jobs */}
      <div className="submitted-section">
        {submittedData.length > 0 ? (
          submittedData.map((job, index) => (
            <div key={index} className="job-card">
              <h3>
                {job.position} at {job.company}
              </h3>
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <p>
                <strong>Work Type:</strong> {job.workType}
              </p>
              <p>
                <strong>Skills:</strong> {job.skills.join(", ")}
              </p>
              <p>
                <strong>Education:</strong> {job.education}
              </p>
              <p>
                <strong>Description:</strong> {job.description}
              </p>
              <p>
                <strong>Vacancies:</strong> {job.vacancies}
              </p>
              <p>
                <strong>Salary:</strong> {job.salary}
              </p>
              <p>
                <strong>Expected Year of Joining:</strong> {job.expectedYear}
              </p>
              <div className="button-container">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePostJob(job)}
                  className="post-btn"
                >
                  Post
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
}
