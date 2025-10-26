import React, { useState, useEffect, useRef } from "react";
import "./Resume.css";

function Resume() {
    const [resumeUrl, setResumeUrl] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const token = localStorage.getItem("access"); // JWT token from login

    // Fetch resume URL when component mounts or token changes
    useEffect(() => {
        if (!token) return;

        fetch("http://localhost:8000/resume/get/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch resume");
                return res.json();
            })
            .then((data) => {
                if (data.resume_url) {
                    setResumeUrl(data.resume_url);
                } else {
                    setResumeUrl(null);
                }
            })
            .catch(() => setError("Failed to fetch resume."));
    }, [token]);

    // Upload resume (PDF only)
    const uploadResume = (file) => {
        setError("");
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

        // Important: DO NOT set 'Content-Type'; browser sets it automatically for FormData
        fetch("http://localhost:8000/resume/upload/", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })
            .then((res) => {
                if (!res.ok) throw new Error("Upload failed");
                return res.json();
            })
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else if (data.resume_url) {
                    setResumeUrl(data.resume_url);
                }
            })
            .catch(() => setError("Upload failed. Try again."));
    };

    // Delete resume
    const deleteResume = () => {
        fetch("http://localhost:8000/resume/delete/", {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (res.status === 204) {
                    setResumeUrl(null);
                } else {
                    setError("Delete failed.");
                }
            })
            .catch(() => setError("Delete failed."));
    };

    return (
        <center>
            <div className="resume-container">
                <h2>Upload Resume (PDF only)</h2>

                {/* Hidden input for file upload */}
                <input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => uploadResume(e.target.files[0])}
                />

                {/* Upload button: show only if no resume uploaded */}
                {!resumeUrl && (
                    <button onClick={() => fileInputRef.current.click()}>
                        Upload PDF
                    </button>
                )}


                {/* Error message */}
                {error && <p className="error-text">{error}</p>}

                {/* Resume actions */}
                {resumeUrl && (
                    <div className="resume-actions">
                        <a
                            href={resumeUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Download Resume
                        </a>
                        <button onClick={deleteResume}>Delete Resume</button>
                    </div>
                )}
            </div>
        </center>
    );
}

export default Resume;
