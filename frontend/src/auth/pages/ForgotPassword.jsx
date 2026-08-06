import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { forgotPassword } from "../services/passwordService";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const data = await forgotPassword(email);

      toast.success(data.message);

      navigate("/verify-reset-otp", {
        state: {
          email,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {/* 3D ambient background blur elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="forgot-card">
        {/* Header Icon Badge */}
        <div className="brand-badge">
          <FaKey className="brand-icon" />
        </div>

        <h1>Forgot Password</h1>
        <p className="subtitle">
          Enter your registered email to receive an OTP code.
        </p>

        <form onSubmit={handleSubmit} className="forgot-form" autoComplete="off">
          {/* Email Input Field */}
          <div className="input-group">
            <FaEnvelope className="field-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {/* Navigation Links */}
          <p className="footer-link">
            Remembered your password?
            <Link to="/login" className="highlight-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;