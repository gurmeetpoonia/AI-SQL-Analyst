import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../services/AuthService";
import { validatePassword } from "../utils/passwordStrength";
import { FaUser, FaEnvelope, FaLock, FaDatabase, FaExclamationTriangle } from "react-icons/fa";
import "../styles/Register.css";

function Register() {
  const [name, setName] = useState(""); // Added name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Errors state
  const [nameError, setNameError] = useState(false); // Full Name error state
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  // Handle Full Name Input Change
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (nameError) setNameError(false); // Remove red border when user types
  };

  // Blur event listener on password input
  const handlePasswordBlur = () => {
    if (!password.trim()) {
      setPasswordError("");
      return;
    }
    const error = validatePassword(password);
    setPasswordError(error);
  };

  // Clear error while typing new characters
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Full Name Empty Check
    if (!name.trim()) {
      setNameError(true);
      toast.error("Please enter your full name");
      return;
    }

    // 2. Password Check
    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      toast.error("Please fix password requirements");
      return;
    }

    // 3. Confirm Password Check
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name,
        email,
        password,
      });
      toast.success(response?.message || "Registration successful! Verification email sent.");

      localStorage.setItem("pending_email", email);
      navigate("/verify-otp");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background 3D effects */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="card-3d-wrapper">
        <form className="auth-form" onSubmit={handleRegister} autoComplete="off">
          <div className="brand-badge">
            <FaDatabase className="brand-icon" />
          </div>

          <h1>AI SQL Analyst</h1>
          <p className="subtitle">Create your account to get started</p>

          {/* Full Name Field */}
          <div className={`input-group ${nameError ? "has-error" : ""}`}>
            <FaUser className="field-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={name}
              onChange={handleNameChange}
            />
          </div>

          {/* Email Field */}
          <div className="input-group">
            <FaEnvelope className="field-icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className={`input-group ${passwordError ? "has-error" : ""}`}>
            <FaLock className="field-icon" />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Enter Password"
              value={password}
              required
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
            />
          </div>

          {/* Single-line Password Warning Alert Box */}
          {passwordError && (
            <div className="password-warning-line">
              <FaExclamationTriangle className="warning-icon" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="input-group">
            <FaLock className="field-icon" />
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-text">
                <span className="spinner"></span> Creating Account...
              </span>
            ) : (
              "Register"
            )}
          </button>

          {/* Footer Link */}
          <p className="footer-link">
            Already have an account?{" "}
            <Link to="/login" className="highlight-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;