import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/AuthService";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaDatabase } from "react-icons/fa";
import toast from "react-hot-toast";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({
        email,
        password,
      });

      const token = response.access_token;
      if (!token) {
        throw new Error("Token not received");
      }

      login(token);
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Dynamic 3D ambient background blur elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="card-3d-wrapper">
        <form className="login-form" onSubmit={handleLogin} autoComplete="off">
          {/* Header Icon */}
          <div className="brand-badge">
            <FaDatabase className="brand-icon" />
          </div>

          <h1>AI SQL Analyst</h1>
          <p className="subtitle">Login to your account to continue</p>

          {/* Email Field */}
          <div className="input-group"  autoComplete ="off">
            <FaEnvelope className="field-icon" />
            <input
              type="email"
              name="user_email"
              autoComplete="off"
              placeholder="Enter Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="input-group password-box" autoComplete= "off">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="user_password"
              autoComplete="new-password"
              placeholder="Enter Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password-wrapper">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-text">
                <span className="spinner"></span> Logging In...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {/* Footer Link */}
          <p className="register-link">
            Don't have an account?{" "}
            <Link to="/register" className="highlight-link">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;