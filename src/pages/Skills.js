import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Skills.css";

function Skills() {
    const [skill, setSkill] = useState("");
    const [skills, setSkills] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [popupMsg, setPopupMsg] = useState(""); // For showing success message
    const navigate = useNavigate();
    const fileInputRefs = useRef({});

    const getAccessToken = () => localStorage.getItem("access");
    const getRefreshToken = () => localStorage.getItem("refresh");

    const getTokenConfig = () => {
        const token = getAccessToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const refreshAccessToken = async () => {
        const refresh = getRefreshToken();
        if (!refresh) {
            logoutUser();
            throw new Error("No refresh token, please login again.");
        }
        try {
            const res = await axios.post("http://localhost:8000/token/refresh/", { refresh });
            localStorage.setItem("access", res.data.access);
            return res.data.access;
        } catch (err) {
            logoutUser();
            throw err;
        }
    };

    const logoutUser = () => {
        localStorage.clear();
        navigate("/login");
    };

    const apiCallWithRefresh = async (axiosRequest) => {
        try {
            return await axiosRequest();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    const newToken = await refreshAccessToken();
                    return await axiosRequest(newToken);
                } catch (refreshError) {
                    throw refreshError;
                }
            } else {
                throw error;
            }
        }
    };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await apiCallWithRefresh((token) =>
                    axios.get("http://localhost:8000/skills/", {
                        headers: { Authorization: `Bearer ${token || getAccessToken()}` },
                    })
                );
                setSkills(response.data);
            } catch (err) {
                console.error("Error fetching skills:", err);
            }
        };
        fetchSkills();
    }, [navigate]);

    const handleAddSkill = async () => {
        const trimmedSkill = skill.trim();
        if (!trimmedSkill) return;
        try {
            const response = await apiCallWithRefresh((token) =>
                axios.post(
                    "http://localhost:8000/skills/add/",
                    { name: trimmedSkill },
                    { headers: { Authorization: `Bearer ${token || getAccessToken()}` } }
                )
            );
            setSkills([...skills, response.data]);
            setSkill("");
        } catch (err) {
            console.error("Error adding skill:", err);
            alert(err.response?.data?.error || "Skill could not be added");
        }
    };

    const handleRemoveSkill = async (id) => {
        try {
            await apiCallWithRefresh((token) =>
                axios.delete(`http://localhost:8000/skills/delete/${id}/`, {
                    headers: { Authorization: `Bearer ${token || getAccessToken()}` },
                })
            );
            setSkills(skills.filter((s) => s.id !== id));
            setUploadedFiles((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        } catch (err) {
            console.error("Error deleting skill:", err);
        }
    };

    const handleFileChange = async (e, skillId) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("verification_file", file);
        try {
            const baseConfig = {
                headers: { "Content-Type": "multipart/form-data" },
            };
            await apiCallWithRefresh((token) =>
                axios.post(
                    `http://localhost:8000/skills/upload/${skillId}/`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token || getAccessToken()}`,
                            ...baseConfig.headers,
                        },
                    }
                )
            );
            setUploadedFiles((prev) => ({ ...prev, [skillId]: file.name }));
            setPopupMsg("File successfully uploaded!");
            setTimeout(() => setPopupMsg(""), 2000); // Hide popup after 2 seconds
        } catch (err) {
            alert("File upload failed.");
            console.error(err);
        }
    };

    const handleUploadForSkill = (skillId) => {
        if (!fileInputRefs.current[skillId]) return;
        fileInputRefs.current[skillId].value = "";
        fileInputRefs.current[skillId].click();
    };

    const handleVerifySkill = () => {
        navigate("/assessments");
    };

    return (
        <div className="content">
            {/* Popup message */}
            {popupMsg && (
                <div
                    style={{
                        background: "#22c55e",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        textAlign: "center",
                        position: "fixed",
                        top: "100px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 9999,
                    }}
                >
                    {popupMsg}
                </div>
            )}

            <div className="skills-container">
                <h2 className="skills-title">My Skills</h2>
                <div className="input-section">
                    <input
                        type="text"
                        placeholder="Enter a skill (e.g., React, SQL)"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        className="skill-input"
                    />
                    <button onClick={handleAddSkill} className="save-btn">
                        Save
                    </button>
                </div>
                <div className="skills-list">
                    {skills.map((s) => (
                        <div key={s.id} className="skill-card">
                            <span className="skill-name">{s.name}</span>
                            <div className="skill-actions">
                                {/* Show "Upload File" and "Verify" buttons only if no file uploaded */}
                                {!uploadedFiles[s.id] && (
                                    <>
                                        <button
                                            onClick={() => handleUploadForSkill(s.id)}
                                            className="verify-btn"
                                        >
                                            Upload File
                                        </button>
                                        <input
                                            type="file"
                                            ref={(el) => (fileInputRefs.current[s.id] = el)}
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileChange(e, s.id)}
                                        />
                                        <button onClick={handleVerifySkill} className="verify-btn">
                                            Verify
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleRemoveSkill(s.id)}
                                    className="remove-btn"
                                >
                                    Remove
                                </button>
                            </div>
                            {/* Show uploaded file name */}
                            {uploadedFiles[s.id] && (
                                <div style={{ fontSize: "0.85em", color: "#555" }}>
                                    Uploaded: {uploadedFiles[s.id]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {skills.length === 0 && (
                    <p className="empty-msg">No skills added yet. Start by entering one above!</p>
                )}
            </div>
        </div>
    );
}

export default Skills;
