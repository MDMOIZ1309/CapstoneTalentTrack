import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaHome,
    FaFileAlt,
    FaClipboardCheck,
    FaLightbulb,
    FaBell,
    FaUserCircle,
    FaUserEdit,
    FaSignOutAlt,
    FaCog,
    FaQuestionCircle
} from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // State for user info
    const [user, setUser] = useState({
        full_name: "",
        email: "",
    });

    // Check if user is logged in by presence of JWT access token
    const isLoggedIn = !!localStorage.getItem("access");

    // Load user info from localStorage and update on storage events
    useEffect(() => {
        const updateUser = () => {
            const full_name = localStorage.getItem("full_name");
            const email = localStorage.getItem("email");
            setUser({
                full_name: full_name || "",
                email: email || "",
            });
        };

        updateUser();
        window.addEventListener("storage", updateUser);
        return () => {
            window.removeEventListener("storage", updateUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    if (!isLoggedIn) {
        // Return null or minimal layout if not logged in (no sidebar or topbar)
        return null;
    }

    return (
        <div className="layout">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div
                    className="logo"
                    onClick={() => navigate("/home")}
                >
                    <b>TalentTrack</b>
                </div>

                <ul className="sidebar-links">
                    <li>
                        <Link to="/home"><FaHome /> Home</Link>
                    </li>
                    <li>
                        <Link to="/resume"><FaFileAlt /> Resume</Link>
                    </li>
                    <li>
                        <Link to="/assessments"><FaClipboardCheck /> Assessments</Link>
                    </li>
                    <li>
                        <Link to="/skills"><FaLightbulb /> Skills</Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <div className="user-info">
                        <FaUserCircle size={38} style={{ marginBottom: "8px" }} />
                        <div>{user.full_name || "Guest"}</div>
                        <small>{user.email || "example@mail.com"}</small>
                    </div>
                    <Link to="/support" className="help-link">
                        <FaQuestionCircle /> Help
                    </Link>
                </div>
            </aside>

            {/* TOPBAR */}
            <header className="topbar">
                <div className="topbar-icons">
                    <div className="icon" onClick={() => navigate("/interview")}>
                        <FaClipboardCheck size={22} title="Interview Prep" />
                    </div>

                    <div className="icon">
                        <FaBell size={22} title="Notifications" />
                    </div>

                    <div className="icon" onClick={() => navigate("/settings")}>
                        <FaCog size={22} title="Settings" />
                    </div>

                    <div
                        className="profile-icon"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <FaUserCircle size={26} />
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <button onClick={() => navigate("/edit-profile")}>
                                    <FaUserEdit /> Edit Details
                                </button>
                                <button onClick={handleLogout}>
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Navbar;
