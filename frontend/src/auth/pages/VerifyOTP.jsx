import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOTP, resendOTP } from "../services/AuthService";
import "../styles/Verify_otp.css"; // CSS file link

function VerifyOTP() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("pending_email");
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

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOTP({
        email,
        otp: otp.join(""),
      });
      toast.success(response.message);
      localStorage.removeItem("pending_email");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "OTP Verification Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoadingResend(true);
      const response = await resendOTP(email);
      toast.success(response.message);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to resend OTP"
      );
    } finally {
      setLoadingResend(false);
    }
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      otp[index] === "" &&
      e.target.previousSibling
    ) {
      e.target.previousSibling.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Invalid OTP");
      return;
    }

    const otpArray = pastedData.split("");
    setOtp(otpArray);
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verify OTP</h2>
        <p>
          Enter the OTP sent to
          <br />
          <strong>{email || "your email"}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div className="otp-container">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="resend-section">
          {!canResend ? (
            <p>
              Resend OTP in <strong>{timer}s</strong>
            </p>
          ) : (
            <button
              type="button"
              className="resend-btn"
              onClick={handleResendOTP}
              disabled={loadingResend}
            >
              {loadingResend ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <p className="back-link">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyOTP;