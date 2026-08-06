import { useEffect, useRef, useMemo } from "react";
import SQLPreview from "./SQLPreview";
import QueryResultTable from "./QueryResultTable";
import { RiBrainLine, RiUser3Line, RiSparkling2Fill, RiCodeBoxLine } from "react-icons/ri";
import "../styles/chatArea.css";

function ChatArea({ messages, aiLoading, activeDataset, onSend }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  // Dynamic Prompt Suggestions based on actual Columns
  const dynamicSuggestions = useMemo(() => {
    if (!activeDataset || !activeDataset.columns || activeDataset.columns.length === 0) {
      return [
        "Show top 10 rows from dataset",
        "Count total records",
        "Show summary statistics",
        "Get all distinct categories"
      ];
    }

    const cols = activeDataset.columns.map(c => (typeof c === 'object' ? c.name : c).toLowerCase());
    const suggestions = [];

    // Find numerical or relevant columns for smart prompts
    const numCol = cols.find(c => c.includes('amount') || c.includes('salary') || c.includes('price') || c.includes('cost') || c.includes('age') || c.includes('total'));
    const catCol = cols.find(c => c.includes('status') || c.includes('gender') || c.includes('country') || c.includes('category') || c.includes('type') || c.includes('churn'));
    const nameCol = cols.find(c => c.includes('name') || c.includes('customer') || c.includes('user') || c.includes('id'));

    if (nameCol) suggestions.push(`Show top 10 ${nameCol} records`);
    else suggestions.push(`Show first 10 rows`);

    if (numCol) suggestions.push(`Find average ${numCol}`);
    else suggestions.push(`Count total rows in table`);

    if (catCol) suggestions.push(`Group records by ${catCol}`);
    else suggestions.push(`Show column data types`);

    if (numCol && catCol) suggestions.push(`Highest ${numCol} by ${catCol}`);
    else suggestions.push(`Show maximum value of ${cols[0] || 'data'}`);

    return suggestions.slice(0, 4);
  }, [activeDataset]);

  // Empty State View
  if (!messages || messages.length === 0) {
    return (
      <div className="chat-area">
        <div className="chat-empty">
          <div className="chat-logo-glow">
            <RiBrainLine className="ai-main-icon" />
          </div>
          <h2>Welcome to AI SQL Analyst</h2>
          <p>Ask questions in natural language or pick a smart query based on your dataset.</p>
          
          {/* Dynamic Prompts List */}
          <div className="example-list">
            {dynamicSuggestions.map((prompt, index) => (
              <button 
                className="example-item" 
                disabled={aiLoading}
                key={index}
                 onClick={() => {
    if (aiLoading) return;
    onSend(prompt);
  }}
              >
                <RiSparkling2Fill className="sparkle-icon" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {messages.map((message, index) => (
        <div className="chat-message" key={index}>
          {/* User Question */}
          <div className="user-chat">
            <div className="chat-avatar user-avatar">
              <RiUser3Line />
            </div>
            <div className="chat-bubble user-bubble">
              {message.question}
            </div>
          </div>

          {/* AI Response */}
          <div className="ai-chat">
            <div className="chat-avatar ai-avatar">
              <RiBrainLine />
            </div>
            <div className="chat-response">
              <SQLPreview sql={message.sql} />
              <QueryResultTable rows={message.rows} />
            </div>
          </div>
        </div>
      ))}

      {/* Thinking State */}
      {aiLoading && (
        <div className="ai-thinking">
          <div className="chat-avatar ai-avatar pulsing">
            <RiBrainLine />
          </div>
          <div className="thinking-bubble">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} style={{ float: "left", clear: "both" }} />
    </div>
  );
}

export default ChatArea;