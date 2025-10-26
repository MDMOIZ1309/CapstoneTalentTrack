import React from "react";
import "./Assessment.css";
import { Link } from 'react-router-dom';


const assessments = [
    {
        name: "Get certified in React",
        url: "https://www.hackerrank.com/skills-verification/react_basic"
    },
    {
        name: "Get Certified in Python",
        url: "https://www.hackerrank.com/skills-verification/python_basic"
    },
    {
        name: "Get Certified in Java",
        url: "https://www.hackerrank.com/skills-verification/java_basic"
    },
    {
        name: "Get Certified in C#",
        url: "https://www.hackerrank.com/skills-verification/c_sharp_basic"
    },
    {
        name: "Get Certified in SQL (Basic)",
        url: "https://www.hackerrank.com/skills-verification/sql_basic"
    },
    {
        name: "Get Certified in Angular",
        url: "https://www.hackerrank.com/skills-verification/angular_intermediate"
    },
    {
        name: "Get Certified in Front End Developement (React) ",
        url: "https://www.hackerrank.com/skills-verification/frontend_developer_react"
    },
    {
        name: "Get Certified in CSS ",
        url: "https://www.hackerrank.com/skills-verification/css"
    },
    {
        name: "Get Certified in JavaScript (Basic)",
        url: "https://www.hackerrank.com/skills-verification/javascript_basic"
    },
    {
        name: "Get Certified in NodeJs (Basic)",
        url: "https://www.hackerrank.com/skills-verification/nodejs_basic"
    },
    {
        name: "Get Certified in NodeJs (Intermediate)",
        url: "https://www.hackerrank.com/skills-verification/nodejs_intermediate"
    },
    {
        name: "Get Certified in Problem Solving",
        url: "https://www.hackerrank.com/skills-verification/problem_solving_intermediate"
    },
    {
        name: "Get Certified in Rest API ",
        url: "https://www.hackerrank.com/skills-verification/rest_api_intermediate"
    },
    {
        name: "Get Certified in SQL (Advanced)",
        url: "https://www.hackerrank.com/skills-verification/sql_advanced"
    },
    {
        name: "Get Certified in Go Lang (Basic)",
        url: "https://www.hackerrank.com/skills-verification/golang_basic"
    },
    {
        name: "Get Certified in Go Lang (Intermediate)",
        url: "https://www.hackerrank.com/skills-verification/golang_intermediate"
    }

    // Add more certifications as desired
];

function AssessmentsPage() {
    return (
        <div className="assessments-page-bg">
            <div className="assessments-container">
                <h2 className="assessments-title">Available Assessments</h2>
                <ul className="assessments-list">
                    {assessments.map((assessment, idx) => (
                        <li className="assessment-item" key={assessment.name}>
                            <span className="assessment-name">{assessment.name}</span>
                            <a
                                className="attempt-btn"
                                href={assessment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Attempt
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="assessments-footer-img">
                    <h4> Coudn't find your intrested Skills ? </h4>
                    <p>
                        Reach out to our{' '}
                        <Link to="/support" className="help-link">
                            Help Center
                        </Link>{' '}
                        for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AssessmentsPage;
