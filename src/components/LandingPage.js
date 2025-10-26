import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="landing-content">
                <h1 className="landing-title">Welcome to TalentTrack</h1>
                <p className="landing-subtitle">
                    Helping you Find Right Track for Your Career.
                </p>
                <div className="landing-buttons">
                    <button onClick={() => navigate("/register")} className="btn primary">
                        New User? Register
                    </button>
                    <button onClick={() => navigate("/login")} className="btn secondary">
                        Existing User? Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
