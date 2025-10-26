import React, { useState } from "react";
import "./SupportPage.css";

const announcements = [
    { message: "Platform update scheduled for Oct 12, 10AM IST.", timestamp: "2025-10-08" }
];

const faqs = [
    {

        question: "How do I register?",
        answer: "Click the 'Sign Up' button on the top right and follow the instructions."
    },
    {

        question: "How do I upload my resume?",
        answer: "Go to the Resume page, select your PDF file, and upload. Make sure your file is in PDF format for successful uploading."
    },
    {

        question: "What is the support email?",
        answer: "You can contact us at <a href='mailto:support@yourplatform.com'>support@yourplatform.com</a>."
    },
    {
        question: "How does TalentTrack match jobs to my skills?",
        answer: "TalentTrack automatically sorts job listings based on your verified skills, so you see the most relevant opportunities first."
    },
    {
        question: "How can I verify my skills?",
        answer: "You can add skills on your skills page and verify them by uploading certificates or completing platform skill assessments."
    },
    {
        question: "Why aren't some jobs showing up for me?",
        answer: "If you haven’t verified certain skills, jobs requiring those won’t appear for you. Add and verify more skills to see additional job matches."
    },
    {
        question: "Who can view my resume and profile?",
        answer: "Recruiters viewing jobs matched to your verified skills can also view your resume and profile details."
    },
    {
        question: "What should I do if I forget my login details?",
        answer: "Use the 'Forgot Password' link on the login page to reset your password via email."
    },
    {
        question: "Is my data safe on TalentTrack?",
        answer: "Your information is securely stored and shown only to approved recruiters according to your profile preferences."
    },
    {
        question: "I need more help or want to give feedback—what do I do?",
        answer: "Use the support email on this help page for additional help or suggestions."
    }
    // Add more FAQs as needed
];

function AnnouncementBar({ items }) {
    return (
        <div className="announcement-bar">
            {items.map((item, idx) => (
                <span key={idx}>{item.message} <small>{item.timestamp}</small></span>
            ))}
        </div>
    );
}

function SupportExpectation() {
    return (
        <div className="support-expectation">
            <h4>Support Response Expectations</h4>
            <p>Our team replies within 24 hours during business days (Mon–Fri, 9AM–6PM IST).</p>
        </div>
    );
}

function FAQItem({ faq, open, onClick }) {
    return (
        <div className="faq-item">
            <button className="faq-question" onClick={onClick}>
                {faq.question}
                <span className="faq-icon">{open ? "−" : "+"}</span>
            </button>
            {open && <div className="faq-answer">{faq.answer}</div>}
        </div>
    );
}


function FAQSection({ faqs }) {
    const [search, setSearch] = useState("");
    const [openIdx, setOpenIdx] = useState(null);

    const filteredFaqs = faqs.filter(
        faq =>
            faq.question.toLowerCase().includes(search.toLowerCase()) ||
            faq.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="faq-section">
            <input
                type="text"
                placeholder="Search FAQ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="faq-search"
            />
            {filteredFaqs.map((faq, idx) => (
                <FAQItem
                    key={idx}
                    faq={faq}
                    open={openIdx === idx}
                    onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                />
            ))}
        </div>
    );
}

function ContactUs() {
    return (
        <div className="contact-us contact-us-footer">
            <h4>Didn't find your answer?</h4>
            <p>
                Contact us at <a href="mailto:support@yourplatform.com">support@yourplatform.com</a>
            </p>
        </div>
    );
}

export default function SupportPage() {
    return (
        <div className="support-page">
            <AnnouncementBar items={announcements} />
            <SupportExpectation />
            <FAQSection faqs={faqs} />
            <ContactUs />
        </div>
    );
}
