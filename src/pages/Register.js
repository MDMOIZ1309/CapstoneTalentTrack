import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const RESEND_OTP_TIME = 300; // 5 minutes

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    school10: "",
    percent10: "",
    college12: "",
    percent12: "",
    passoutYear: "",
    currentPercent: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => setResendTimer((timer) => timer - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "otp" && otpVerified) setOtpVerified(false);
  };

  const sendOtp = async () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      alert("Enter a valid email first.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/send-otp-registration/",
        { email: form.email }
      );
      if (res.data.success) {
        alert("OTP sent to your email!");
        setOtpSent(true);
        setOtpVerified(false);
        setResendTimer(RESEND_OTP_TIME);
      } else {
        alert(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP.");
    }
  };

  const verifyOtp = async () => {
    if (!form.email || !form.otp) {
      alert("Email and OTP required for verification.");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await axios.post("http://localhost:8000/verify-otp/", {
        email: form.email,
        otp: form.otp,
      });
      if (res.data.success) {
        alert("OTP verified successfully.");
        setOtpVerified(true);
      } else {
        alert(res.data.message || "Invalid OTP.");
        setOtpVerified(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP.");
      setOtpVerified(false);
    } finally {
      setOtpVerifying(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      alert("Please verify OTP first.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/register/", form);
      if (res.data.success) {
        alert("Registered Successfully!");
        navigate("/login");
      } else if (res.data.message === "User already exists.") {
        alert("User already exists. Please login.");
        navigate("/login");
      } else {
        alert(res.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="register-page-center-bg">
      <div className="register-centered-card">
        <div className="register-image-container">
          <img
            src="/regsrc.png"
            alt="Registration Illustration"
            className="register-image"
          />
        </div>
        <div className="register-form-panel">
          <h2 className="register-title">Register</h2>
          <form className="register-form-scrollable" onSubmit={register}>
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            {/* Show Send/Resend OTP button only if OTP not verified */}
            {!otpVerified && (
              <div className="button-container">
                <button
                  type="button"
                  className="action-button"
                  disabled={resendTimer > 0}
                  onClick={sendOtp}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60)
                      .toString()
                      .padStart(2, "0")}`
                    : "Send OTP"}
                </button>
              </div>
            )}

            {otpSent && (
              <>
                <div className="form-group">
                  <label className="input-label">Enter OTP</label>
                  <input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    disabled={otpVerified}
                    placeholder="Enter OTP sent to your email"
                  />
                </div>
                <div className="button-container">
                  <button
                    type="button"
                    className="action-button"
                    onClick={verifyOtp}
                    disabled={otpVerified || otpVerifying || !form.otp}
                  >
                    {otpVerifying
                      ? "Verifying..."
                      : otpVerified
                        ? "Verified"
                        : "Verify OTP"}
                  </button>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="input-label">Mobile Number</label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
              />
            </div>
            <div className="form-group">
              <label className="input-label">10th School Name</label>
              <input
                name="school10"
                value={form.school10}
                onChange={handleChange}
                placeholder="Enter your 10th school name"
              />
            </div>
            <div className="form-group">
              <label className="input-label">10th Percentage</label>
              <input
                type="number"
                name="percent10"
                value={form.percent10}
                onChange={handleChange}
                placeholder="0 - 100"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Intermediate/Diploma College Name</label>
              <input
                name="college12"
                value={form.college12}
                onChange={handleChange}
                placeholder="Enter your college name"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Intermediate/Diploma Percentage</label>
              <input
                type="number"
                name="percent12"
                value={form.percent12}
                onChange={handleChange}
                placeholder="0 - 100"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Year of Passout (Ongoing Degree)</label>
              <select
                name="passoutYear"
                value={form.passoutYear}
                onChange={handleChange}
                className="custom-dropdown"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Current Percentage</label>
              <input
                type="number"
                name="currentPercent"
                value={form.currentPercent}
                onChange={handleChange}
                placeholder="0 - 100"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
              />
            </div>
            <div className="button-container">
              <button
                className="action-button"
                type="submit"
                disabled={!otpVerified}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
