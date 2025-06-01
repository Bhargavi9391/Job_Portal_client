import { useState,useEffect } from "react";
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
    graduationYear: "",
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
    "Software Engineer": "Designs, develops, and optimizes software applications. Requires strong programming skills, problem-solving abilities, and knowledge of data structures, algorithms, and software development methodologies.",
    "Frontend Developer": "Builds responsive, dynamic, and user-friendly interfaces using modern frontend technologies like React, Angular, or Vue. Requires expertise in HTML, CSS, JavaScript, state management (Redux/Zustand), and UI/UX principles.",
    "Backend Developer": "Handles business logic, databases, and API development. Requires proficiency in server-side technologies like Node.js, Python, or Java, database management (SQL/NoSQL), authentication, and REST/GraphQL APIs.",
    "Full Stack Developer": "Combines frontend and backend development to create complete web applications. Requires expertise in MERN stack (MongoDB, Express.js, React.js, Node.js) or similar, DevOps basics, cloud deployment, and database management.",
    "DevOps Engineer": "Automates development, testing, and deployment pipelines. Requires knowledge of CI/CD tools (Jenkins, GitHub Actions), cloud platforms (AWS, Azure, GCP), Kubernetes, Docker, Linux, and scripting languages like Bash or Python.",
    "Data Scientist": "Processes and analyzes large datasets to extract meaningful insights. Requires proficiency in Python, R, SQL, machine learning algorithms, statistical analysis, data visualization, and tools like TensorFlow and Pandas.",
    "Machine Learning Engineer": "Builds, trains, and deploys machine learning models for automation and AI applications. Requires expertise in deep learning, natural language processing (NLP), computer vision, and ML frameworks like PyTorch or TensorFlow.",
    "Cyber Security Analyst": "Protects systems, networks, and data from security threats. Requires skills in ethical hacking, penetration testing, encryption, network security, SIEM tools, and cybersecurity frameworks like NIST and OWASP.",
    "Cloud Engineer": "Designs and manages cloud-based solutions for scalability and security. Requires expertise in AWS, Azure, or Google Cloud, containerization (Docker, Kubernetes), cloud networking, and infrastructure as code (Terraform).",
    "UI/UX Designer": "Creates visually appealing and user-friendly digital experiences. Requires skills in wireframing, prototyping, Figma, Adobe XD, usability testing, user research, accessibility, and responsive design principles."
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setJobData((prevData) => ({
      ...prevData,
      [name]: value,
      description: name === "position" ? jobDescriptions[value] || "" : prevData.description, // Auto-fill description
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
      expectedYear: "", 
      description: "",
      vacancies: "",
      salary: "",
    });
  };
  
  
  
  
  const handleDelete = (index) => {
    const updatedJobs = submittedData.filter((_, i) => i !== index);
    setSubmittedData(updatedJobs);
  

    let homeJobs = JSON.parse(localStorage.getItem("homePostedJobs")) || [];
    homeJobs = homeJobs.filter(job => job.position !== submittedData[index].position || job.company !== submittedData[index].company);
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
       
        <div className="form-group">
          <label className="form-label">Position:</label>
          <select name="position" value={jobData.position} onChange={handleChange} className="form-input" required>
            <option value="">Select Position</option>
            {Object.keys(jobDescriptions).map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Company:</label>
          <select name="company" value={jobData.company} onChange={handleChange} className="form-input" required>
            <option value="">Select Company</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Facebook">Facebook</option>
            <option value="Apple">Apple</option>
            <option value="Netflix">Netflix</option>
            <option value="Tesla">Tesla</option>
            <option value="IBM">IBM</option>
            <option value="Adobe">Adobe</option>
            <option value="Salesforce">Salesforce</option>
          </select>
        </div>

        <div className="form-group">
  <label className="form-label">Expected Year of Joining:</label>
  <select
    name="expectedYear"
    value={jobData.expectedYear}
    onChange={handleChange}
    className="form-input"
    required
  >
    <option value="">Select Year</option>
    {/* List of years from 2020 to 2028 */}
    {Array.from({ length: 9 }, (_, index) => 2020 + index).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>


      
        <div className="form-group">
          <label className="form-label">Work Type:</label>
          <select name="workType" value={jobData.workType} onChange={handleChange} className="form-input" required>
          <option value="">Select Work Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
          <option value="Fresher">Fresher</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Work from Office">Work from Office</option>
        </select>
        </div>

        <div className="form-group">
          <label className="form-label">Location:</label>
          <select name="location" value={jobData.location} onChange={handleChange} className="form-input" required>
            <option value="">Select Location</option>
            <option value="Delhi, Delhi">Delhi</option>
              <option value="Pune, Maharashtra">Pune</option>
              <option value="Kolkata, West Bengal">Kolkata</option>
              <option value="Chandigarh, Punjab">Chandigarh</option>
              <option value="Ahmedabad, Gujarat">Ahmedabad</option>
              <option value="Jaipur, Rajasthan">Jaipur</option>
              <option value="Indore, Madhya Pradesh">Indore</option>
              <option value="Coimbatore, Tamil Nadu">Coimbatore</option>
              <option value="Visakhapatnam, Andhra Pradesh">Visakhapatnam</option>
              <option value="Lucknow, Uttar Pradesh">Lucknow</option>
              <option value="Bhubaneswar, Odisha">Bhubaneswar</option>
              <option value="Thiruvananthapuram, Kerala">Thiruvananthapuram</option>
              <option value="Nagpur, Maharashtra">Nagpur</option>
              <option value="Mysore, Karnataka">Mysore</option>
              <option value="Surat, Gujarat">Surat</option>

          </select>
        </div>


       
        <div className="form-group">
          <label className="form-label">Skills:</label>
          <select name="skills" onChange={handleSkillsChange} className="form-input">
            <option value="">Select Skills</option>
            {["React.js", "Node.js", "MongoDB", "Express.js", "HTML", "CSS", "JavaScript", "Python", "Java", "C++"].map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <div className="selected-skills">
            {jobData.skills.map((skill, index) => (
              <span key={skill} className="skill-tag">
                {skill}{index < jobData.skills.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>


        </div>

        <div className="form-group">
          <label className="form-label">Education:</label>
          <select name="education" value={jobData.education} onChange={handleChange} className="form-input" required>
            <option value="">Select Education</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
          </select>
        </div>

        <div className="form-group">
        <label className="form-label">Salary:</label>
        <select name="salary" value={jobData.salary} onChange={handleChange} className="form-input" required>
          <option value="">Select salary</option>
          <option value="10,000-50,000">10,000 - 50,000</option>
          <option value="50,000-1,00,000">50,000 - 1,00,000</option>
          <option value="1,00,000-1,50,000">1,00,000 - 1,50,000</option>
          <option value="1,50,000-2,00,000">1,50,000 - 2,00,000</option>
          <option value="2,00,000-3,00,000">2,00,000 - 3,00,000</option>
          <option value="3,00,000-5,00,000">3,00,000 - 5,00,000</option>
          <option value="5,00,000+">5,00,000 and above</option>
        </select>
      </div>


     
        <div className="form-group">
          <label className="form-label">Description:</label>
          <textarea name="description" value={jobData.description} onChange={handleChange} className="form-input" required />
        </div>

      
        <div className="form-group">
          <label className="form-label">Vacancies:</label>
          <input type="number" name="vacancies" value={jobData.vacancies} onChange={handleChange} className="form-input" required />
        </div>
        <button type="submit" className="submit-btn">
            {editingIndex !== null ? "Update Job" : "Submit Job"}
          </button>

      </form>

      <div className="submitted-section">
          {submittedData.length > 0 ? (
            submittedData.map((job, index) => (
              <div key={index} className="job-card">
                <h3>{job.position} at {job.company}</h3>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Work Type:</strong> {job.workType}</p>
                <p><strong>Skills:</strong> {job.skills.join(", ")}</p>
                <p><strong>Education:</strong> {job.education}</p>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Vacancies:</strong> {job.vacancies}</p>
                <p><strong>Salary:</strong> {job.salary}</p>
                <p><strong>Expected Year of Joining:</strong> {job.expectedYear}</p>
                <div className="button-container">
                <button className="edit-button" onClick={() => handleEdit(index)}>Edit</button>
                <button className="delete-button" onClick={() => handleDelete(index)}>Delete</button>
                <button onClick={() => handlePostJob(job)} className="post-btn">Post</button>

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
