import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import "./Login.css";
import axios from "axios";

function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const [userCount, setUserCount] = useState(0);
  const navigate = useNavigate();
  const API_BASE = "https://job-portal-server-1-nt8w.onrender.com";

  const conditions = [
    { regex: /[A-Z]/, text: "One uppercase letter" },
    { regex: /[a-z]/, text: "One lowercase letter" },
    { regex: /\d/, text: "One number" },
    { regex: /[@$!%*?&]/, text: "One special character" },
    { regex: /^.{8}$/, text: "Exactly 8 characters" },
  ];

  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin@123";

  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${API_BASE}/user-count`);
      setUserCount(response.data.count);
    } catch (error) {
      console.log(error);
    }
  };

  const validateRegister = () => {
    setError("");

    if (!email || !name || !password || !confirmPassword) {
      setError("⚠️ All fields are required!");
      return;
    }

    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const userExists = registeredUsers.some((user) => user.email === email);
    if (userExists) {
      setError("🚫 Email is already registered. Please login.");
      return;
    }

    if (!email.includes("@")) {
      setError("🤷‍♂️ Invalid email format!");
      return;
    }

    if (!conditions.every(({ regex }) => regex.test(password))) {
      setError("Password must meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Send data to backend
    fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to register");
      })
      .then((data) => {
        alert("🙂 Registration Successful!");
        setEmail("");
        setPassword("");
        setName("");
        setConfirmPassword("");
        setIsLogin(true);
        localStorage.setItem("authenticatedUser", JSON.stringify({ name, email }));

        // Save the new user to localStorage
        registeredUsers.push({ name, email, password });
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      })
      .catch((err) => {
        setError("🚫 Registration failed. Try again later.");
        console.error(err);
      });
  };

  const validateLogin = async () => {
    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    if (!email || !password) {
      setError("✍️ Please enter email and password");
      return;
    }

    // Check for admin credentials first
    if (email === adminEmail && password === adminPassword) {
      alert("👑 Welcome, Admin!");
      setIsAdmin(true);
      localStorage.setItem("authenticatedUser", JSON.stringify({ name: "Admin", email: adminEmail }));
      localStorage.setItem("isAdmin", "true");

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
      return;
    }

    try {
      // Make an API request to the backend for login validation
      const response = await axios.post(`${API_BASE}/login`, { email, password });

      // If login successful, store user data and token in localStorage
      if (response.status === 200) {
        const user = response.data.user;
        alert("👍 Login Successful!");
        localStorage.setItem("authenticatedUser", JSON.stringify({ name: user.name, email: user.email }));
        localStorage.setItem("isAdmin", "false");

        setEmail("");
        setPassword("");

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setError("🤷‍♂️ No user available. Please create an account.");
        } else if (error.response.status === 400) {
          setError("❌ Email or password is incorrect");
        } else {
          setError("❌ Error occurred during login");
        }
      } else {
        setError("❌ Error occurred during login");
      }
    }
  };

  const handleForgotPassword = () => {
    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    let userIndex = registeredUsers.findIndex((user) => user.email === email);

    if (userIndex === -1) {
      setError("Email not found. Please register first.");
      return;
    }

    if (!conditions.every(({ regex }) => regex.test(newPassword))) {
      setError("New password must meet all requirements.");
      return;
    }

    registeredUsers[userIndex].password = newPassword;
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    alert("🙂Password reset successful! Please login with your new password.");
    setForgotPassword(false);
    setNewPassword("");
    setError("");
    setIsLogin(true);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
  };

  return (
    <div className="page-container">
      <h1 className="brand-title">
        ✨Career<span className="highlight">Crafter</span>
      </h1>
      <div className="auth-container">
        <div className={`form-box ${isLogin ? "login" : "register"}`}>
          <h2>{forgotPassword ? "Reset Password" : isLogin ? "Login" : "Register"}</h2>

          {!forgotPassword && (
            <input
              type="text"
              placeholder="📩Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {forgotPassword ? (
            <>
              <div className="password-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="🔑Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                />
                <i
                  className={`bi ${showNewPassword ? "bi-eye" : "bi-eye-slash"}`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                ></i>

                {showTooltip && (
                  <div className="tooltip">
                    {conditions.map(({ regex, text }, index) => (
                      <p key={index} className={regex.test(newPassword) ? "valid" : "invalid"}>
                        {regex.test(newPassword) ? "✔" : "✖"} {text}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <button onClick={handleForgotPassword}>Reset Password</button>
              <p style={{ color: "black" }} onClick={() => setForgotPassword(false)}>
                Back to <span style={{ color: "blue" }}>Login</span>
              </p>
            </>
          ) : (
            <>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="🔑Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => !isLogin && setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                />
                <i
                  className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>

                {!isLogin && showTooltip && (
                  <div className="tooltip">
                    {conditions.map(({ regex, text }, index) => (
                      <p key={index} className={regex.test(password) ? "valid" : "invalid"}>
                        {regex.test(password) ? "✔" : "✖"} {text}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <input
                    type="text"
                    placeholder="👤Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="password-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="🔑Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <i
                      className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"}`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    ></i>
                  </div>
                </>
              )}

              {error && <p style={{ color: "red" }}>{error}</p>}

              <button onClick={!isLogin ? validateRegister : validateLogin}>
                {isLogin ? "Login" : "Register"}
              </button>

              <p onClick={toggleForm}>
                {isLogin ? (
                  <>
                    Don't have an account? <span style={{ color: "blue" }}>Register</span>
                  </>
                ) : (
                  <>
                    Already have an account? <span style={{ color: "#C71585" }}>Login</span>
                  </>
                )}
              </p>

              {isLogin && (
                <p onClick={() => setForgotPassword(true)} style={{ color: "red" }}>
                  Forgot Password?
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
