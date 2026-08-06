import { useState } from "react";
import { FaCode, FaCopy, FaCheck } from "react-icons/fa";
import "../styles/sqlPreview.css";

function CopySQLButton({ sql }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={`action-pill-btn ${copied ? "success" : ""}`} onClick={handleCopy}>
      {copied ? <FaCheck /> : <FaCopy />}
      <span>{copied ? "Copied!" : "Copy SQL"}</span>
    </button>
  );
}

function SQLPreview({ sql }) {
  if (!sql) return null;

  return (
    <div className="sql-box">
      <div className="sql-header">
        <div className="sql-title">
          <div className="code-icon-badge">
            <FaCode />
          </div>
          <h2>Generated SQL</h2>
        </div>
        <CopySQLButton sql={sql} />
      </div>

      <div className="code-container">
        <div className="terminal-dots">
          <span className="dot red-dot"></span>
          <span className="dot yellow-dot"></span>
          <span className="dot green-dot"></span>
        </div>
        <pre>
          <code>{sql}</code>
        </pre>
      </div>
    </div>
  );
}

export default SQLPreview;