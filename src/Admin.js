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
  }, []);

  useEffect(() => {
    localStorage.setItem("submittedJobs", JSON.stringify(submittedData));
  }, [submittedData]);

  const [editingIndex, setEditingIndex] = useState(null);

  const jobDescriptions = {
    "Software Engineer": "Designs, develops, and optimizes software applications...",
    "Frontend Developer": "Builds responsive, dynamic, and user-friendly interfaces...",
    // ... other roles (keep your full descriptions)
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

  const postToHome = (job) => {
    const jobWithTimestamp = { ...job, postedTime: Date.now() };
    const existing = JSON.parse(localStorage.getItem("homePostedJobs")) || [];
    const updated = [...existing, jobWithTimestamp];
    localStorage.setItem("homePostedJobs", JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
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
      postToHome(jobData); // ⬅ Post to user side
    }

    setSubmittedData(updatedData);
    setEditingIndex(null);
    setJobData({
      position: "",
      company: "",
      location: "",
      workType: "",
      skills: [],
      education: "",
      description: "",
      expectedYear: "",
      vacancies: "",
      salary: "",
    });
  };

  const handleDelete = (index) => {
    const updated = submittedData.filter((_, i) => i !== index);
    setSubmittedData(updated);

    let homeJobs = JSON.parse(localStorage.getItem("homePostedJobs")) || [];
    homeJobs = homeJobs.filter(job =>
      job.position !== submittedData[index].position || job.company !== submittedData[index].company
    );
    localStorage.setItem("homePostedJobs", JSON.stringify(homeJobs));
    localStorage.setItem("submittedJobs", JSON.stringify(updated));
  };

  const handleEdit = (index) => {
    setJobData({ ...submittedData[index] });
    setEditingIndex(index);
  };

  const handlePostJob = (job) => {
    postToHome(job);
    alert("Job posted to users.");
  };

  return (
    <div className="admin-container">
      {/* Your full JSX content remains unchanged */}
      {/* You can reuse the same form, select options, job card layout, etc. */}
    </div>
  );
}
