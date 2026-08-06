import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { resetPassword } from "../services/passwordService";
import "../styles/ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

 const {
    
    resetEmail,
    resetToken,
    clearPasswordReset
} = useAuth();

  useEffect(() => {
  if (!resetEmail || !resetToken) {
    navigate("/login", { replace: true });
  }
}, [resetEmail,resetToken, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await resetPassword(
    resetEmail,
    password,
    resetToken
);

  clearPasswordReset();
      toast.success(data.message || "Password updated  successfully!");


      navigate("/login",{
        replace:true
      });
   
    } catch (error) {

      toast.error(
    error.response?.data?.detail?.[0]?.msg ||
    "Password reset failed."
);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      {/* 3D ambient background blur elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="reset-card">
        {/* Header Badge */}
        <div className="brand-badge">
          <FaLock className="brand-icon" />
        </div>

        <h1>Reset Password</h1>
        <p className="subtitle">
          Set up a strong new password for your account.
        </p>

        <form onSubmit={handleResetPassword} className="reset-form">
          {/* New Password Field */}
          <div className="input-group">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className="input-group">
            <FaLock className="field-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

          {/* Navigation Link */}
          <p className="footer-link">
            Back to
            <Link to="/login" className="highlight-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;