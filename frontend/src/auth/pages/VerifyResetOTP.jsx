import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { verifyResetOTP, resendResetOTP } from "../services/passwordService";
import "../styles/VerifyResetOTP.css";

function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  

const {
  resetEmail
} = useAuth();

const email =
  location.state?.email ||
  resetEmail ||
  "";

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const { allowPasswordReset } = useAuth();
  useEffect(() => {
    if (!email) {
        navigate("/login", {
            replace: true
        });
    }
}, [email, navigate]);
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto focus next box
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const data = await verifyResetOTP(email, otpValue);

      toast.success(data.message);
      allowPasswordReset( email,
    data.reset_token);

      navigate("/reset-password");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoadingResend(true);
      const data = await resendResetOTP(email);
      toast.success(data.message);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to resend OTP."
      );
    } finally {
      setLoadingResend(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Invalid OTP. Must be 6 digits.");
      return;
    }

    const otpArray = pastedData.split("");
    setOtp(otpArray);
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="verify-reset-container">
      {/* Ambient background glow elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="verify-reset-card">
        {/* Header Badge */}
        <div className="brand-badge">
          <FaShieldAlt className="brand-icon" />
        </div>

        <h1>Verify OTP</h1>
        <p className="subtitle">Enter the 6-digit verification code sent to</p>
        <p className="target-email">{email || "your registered email"}</p>

        <form onSubmit={handleVerifyOTP} className="verify-reset-form">
          {/* 6 Digit Individual Input Boxes */}
          <div className="otp-box-group">
            {otp.map((data, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="otp-field"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend Timer Section */}
          <div className="timer-container">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loadingResend}
                className="resend-btn"
              >
                {loadingResend ? "Sending..." : "Resend OTP"}
              </button>
            ) : (
              <p className="timer-text">
                Resend OTP in <span>{timer}s</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyResetOTP;