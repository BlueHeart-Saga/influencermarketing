import React, { useState } from "react";
import "../../style/FeedbackWidget.css";

const BrandFeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleWidget = () => setIsOpen(!isOpen);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      userType: "brand",
      type: activeTab,
      feedback,
      email,
    });

    setSubmitted(true);
    setFeedback("");

    setTimeout(() => {
      setSubmitted(false);
      if (activeTab !== "feedback") setActiveTab("feedback");
    }, 2000);
  };

  return (
    <div className="feedback-container">
      {/* Floating Feedback Button */}
      <button className="feedback-toggle-btn" onClick={toggleWidget}>
        <i className="fas fa-bullhorn"></i>
        <span>Brand Feedback</span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="feedback-overlay" onClick={() => setIsOpen(false)}>
          <div className="feedback-modal">
            <div className="feedback-header">
              <h3>Brand Feedback</h3>
              <p>Help us improve your brand’s experience</p>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="feedback-tabs">
              <button
                className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`}
                onClick={() => setActiveTab("feedback")}
              >
                <i className="fas fa-comment-dots"></i>
                Feedback
              </button>
              <button
                className={`tab-btn ${activeTab === "ask" ? "active" : ""}`}
                onClick={() => setActiveTab("ask")}
              >
                <i className="fas fa-question-circle"></i>
                Ask Question
              </button>
              <button
                className={`tab-btn ${activeTab === "suggest" ? "active" : ""}`}
                onClick={() => setActiveTab("suggest")}
              >
                <i className="fas fa-lightbulb"></i>
                Suggestions
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="feedback-form">
              {submitted ? (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <p>Thank you for your {activeTab}, Brand!</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="feedback">
                      {activeTab === "feedback" &&
                        "Your feedback about your brand experience"}
                      {activeTab === "ask" &&
                        "Any questions or issues as a brand?"}
                      {activeTab === "suggest" &&
                        "Suggestions to improve brand features"}
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email (optional)</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email if you'd like a response"
                    />
                  </div>

                  <button type="submit" className="submit-btn">
                    Submit {activeTab}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandFeedbackWidget;
