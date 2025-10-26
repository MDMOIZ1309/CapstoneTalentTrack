import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const RESEND_OTP_TIME = 300;

    const [form, setForm] = useState({ email: '', password: '', otp: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [popupMsg, setPopupMsg] = useState("");
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const access = localStorage.getItem("access");
        if (access) {
            navigate('/home', { replace: true });
        } else {
            setAuthChecked(true);
        }
    }, [navigate]);

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
                email: validateEmail(value) ? '' : 'Invalid email format.'
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
            alert('Failed to send OTP. Please try again.');
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
            alert('OTP verification failed. Please try again.');
        } finally {
            setOtpVerifying(false);
        }
    };

    const login = async () => {
        if (errors.email) {
            alert('Please fix errors before submitting.');
            return;
        }
        if (!otpVerified) {
            alert('Please verify OTP before logging in.');
            return;
        }
        if (!form.password) {
            alert('Please enter your password.');
            return;
        }
        try {
            const res = await axios.post('http://localhost:8000/login/', { email: form.email, password: form.password });
            if (res.data.success) {
                localStorage.setItem("access", res.data.access);
                localStorage.setItem("refresh", res.data.refresh);
                localStorage.setItem("full_name", res.data.full_name);
                localStorage.setItem("email", res.data.email);
                window.dispatchEvent(new Event("storage"));
                setPopupMsg("Logged in successfully!");
                setTimeout(() => {
                    setPopupMsg("");
                    navigate('/home', { replace: true });
                }, 1200);
            } else {
                alert(res.data.message || 'Login failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Login failed. Please try again.');
        }
    };

    if (!authChecked || popupMsg) {
        return (
            <div className="login-page-bg">
                {popupMsg && <div className="login-popup">{popupMsg}</div>}
            </div>
        );
    }

    return (
        <div className="login-page-bg">
            <div className="login-wrapper">
                <div className="login-image-container">
                    <img src="/logsrc.png" alt="Login Illustration" className="login-image" />
                </div>
                <div className="login-container">
                    <h2 className="login-title">Login</h2>
                    <div className="login-form">
                        <input
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="error-msg">{errors.email}</p>}

                        <button
                            onClick={sendOTP}
                            disabled={!validateEmail(form.email) || resendTimer > 0}
                            style={{
                                marginBottom: '1.2rem',
                                backgroundColor: resendTimer > 0 ? '#a1a1aa' : '#1f2937',
                                color: '#fff',
                                cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
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
                                    style={{ marginBottom: '1.25rem' }}
                                />
                                <button
                                    onClick={verifyOTP}
                                    disabled={!form.otp}
                                    style={{ marginBottom: '1.5rem', backgroundColor: '#1f2937', color: '#fff' }}
                                >
                                    {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </>
                        )}

                        {otpVerified && (
                            <>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <button onClick={login} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                    <p
                        className="forgot-password"
                        onClick={() => navigate('/reset-password')}
                    >
                        Forgot Password?
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
