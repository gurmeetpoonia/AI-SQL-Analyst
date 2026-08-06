import { useState } from "react";
import { FaPaperPlane, FaMagic, FaSpinner } from "react-icons/fa";
import "../styles/aiQueryBox.css";

function AIQueryBox({ onGenerate }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;

    try {
      setLoading(true);
      await onGenerate(question);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-box">
      <div className="ai-box-header">
        <div className="ai-icon-badge">
          <FaMagic />
        </div>
        <div>
          <h2>Ask AI Analyst</h2>
          <p>Generate SQL queries using natural language</p>
        </div>
      </div>

      <div className="ai-input-wrapper">
        <input
          type="text"
          placeholder="e.g., Show top 5 highest sales products from last month..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !question.trim()}
          className="ai-submit-btn"
        >
          {loading ? (
            <>
              <FaSpinner className="spinner-icon" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="plane-icon" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AIQueryBox;