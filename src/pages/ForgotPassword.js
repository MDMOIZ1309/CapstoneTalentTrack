import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const RESEND_OTP_TIME = 300;
  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    passwordMatch: '',
    passwordLength: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => setResendTimer(timer => timer - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? '' : 'Invalid email format.',
      }));
    }
    if (name === 'newPassword' || name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        passwordLength:
          name === 'newPassword' && value.length < 6
            ? 'Password must be at least 6 characters.'
            : '',
        passwordMatch:
          name === 'confirmPassword' && value !== form.newPassword
            ? 'Passwords do not match.'
            : name === 'newPassword' && form.confirmPassword && value !== form.confirmPassword
              ? 'Passwords do not match.'
              : '',
      }));
    }
  };

  const sendOTP = async () => {
    if (!validateEmail(form.email)) {
      alert('Please enter a valid email first.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8000/send-otp-login/', { email: form.email });
      if (res.data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setResendTimer(RESEND_OTP_TIME);
        alert('OTP sent to your email.');
      } else {
        alert(res.data.message || 'Email not registered.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP.');
    }
  };

  const verifyOTP = async () => {
    if (form.otp.length !== 6) {
      alert('OTP must be 6 digits.');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await axios.post('http://localhost:8000/verify-otp/', { email: form.email, otp: form.otp });
      if (res.data.success) {
        setOtpVerified(true);
        alert('OTP verified successfully.');
      } else {
        alert('Invalid OTP.');
      }
    } catch (err) {
      console.error(err);
      alert('OTP verification failed.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const resetPassword = async () => {
    if (errors.email || errors.passwordMatch || errors.passwordLength) {
      alert('Please fix errors before submitting.');
      return;
    }
    try {
      const payload = {
        email: form.email,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      };
      const res = await axios.post('http://localhost:8000/reset-password/', payload);
      if (res.data.success) {
        alert('Password reset successfully! Redirecting to login...');
        navigate('/login');
      } else {
        alert(res.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reset password.');
    }
  };

  return (
    <div className="forgot-password-page-bg">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-image-container">
          <img
            src="/logsrc.png"
            alt="Forgot Password Illustration"
            className="forgot-password-image"
          />
        </div>
        <div className="forgot-password-container">
          <h2 className="forgot-password-title">Forgot Password</h2>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
          <div className="space-btn" />
          <button
            onClick={sendOTP}
            disabled={!validateEmail(form.email) || resendTimer > 0}
            className="action-button"
            style={{
              marginBottom: '1.2rem',
              backgroundColor: resendTimer > 0 ? '#a1a1aa' : '#1f2937',
              color: '#fff',
              cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {resendTimer > 0
              ? `Resend OTP in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
              : 'Send OTP'}
          </button>
          {otpSent && !otpVerified && (
            <>
              <input
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                className="input-field"
                style={{ marginBottom: '1.25rem' }}
              />
              <button
                onClick={verifyOTP}
                className="action-button verify-btn"
                disabled={!form.otp}
                style={{ marginBottom: '1.5rem' }}
              >
                {otpVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}
          {otpVerified && (
            <>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                className="input-field"
              />
              {errors.passwordLength && <p className="error-msg">{errors.passwordLength}</p>}
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field"
              />
              {errors.passwordMatch && <p className="error-msg">{errors.passwordMatch}</p>}
              <button
                onClick={resetPassword}
                disabled={errors.passwordLength || errors.passwordMatch}
                className="action-button reset-btn"
              >
                Reset Password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
