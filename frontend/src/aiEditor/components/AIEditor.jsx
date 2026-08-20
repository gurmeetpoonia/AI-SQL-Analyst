import { useState } from "react";
import { FaWandMagicSparkles, FaEye, FaSpinner, FaLightbulb } from "react-icons/fa6";
import "../styles/AIEditor.css";

export default function AIEditorBox({
    prompt,
    setPrompt,
    onGenerate,
    onPreview,
    loading,
    lastGeneratedPrompt,
    planExecuted
}) {

    // Quick Prompt Suggestions
    const suggestions = [
        "Remove duplicate rows",
        "Fill missing values with median",
        "Drop empty columns",
        "Convert string text to upper case"
    ];

    const handleSuggestionClick = (text) => {
        setPrompt(text);
    };

    const sameQueryBlocked =
        prompt.trim() &&
        prompt.trim() === lastGeneratedPrompt.trim() &&
        !planExecuted;

    const handleGenerate = () => {

        if (sameQueryBlocked) {
            return;
        }

        onGenerate();
    };
    

    return (
        <div className="ai-editor-card">
            {/* Header Section */}
            <div className="ai-editor-header">
                <div className="ai-title-wrapper">
                    <FaWandMagicSparkles className="ai-magic-icon" />
                    <h3>AI Dataset Assistant</h3>
                </div>
                <p className="ai-subtitle">
                    Describe what you want to modify in simple words.
                </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="ai-suggestions-list">
                <span className="suggestion-label"><FaLightbulb /> Try:</span>
                {suggestions.map((text, idx) => (
                    <button
                        type="button"
                        key={idx}
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(text)}
                    >
                        {text}
                    </button>
                ))}
            </div>

            {/* Input Box */}
            <div className="ai-input-wrapper">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!loading && prompt.trim()) {
                                onGenerate();
                            }
                        }
                    }}        
                    placeholder="e.g. Delete duplicate rows..."
                    rows={3}
                    className="ai-textarea"
                />
            </div>

            {/* Action Buttons */}
            <div className="ai-editor-actions">
                <button
                    type="button"
                    className="generate-btn"
                    onClick={onGenerate}
                    disabled={loading || !prompt.trim() ||
                        sameQueryBlocked
                    }
                >
                    {loading ? (
                        <>
                            <FaSpinner className="spin-icon" /> Generating Plan...
                        </>
                        ) : sameQueryBlocked ? (
                    <>
                        <FaWandMagicSparkles />
                        Execute Plan First
                    </>
                    ) : (
                        <>
                            <FaWandMagicSparkles /> Generate Plan
                        </>
                    )}
                </button>

  
            </div>
        </div>
    );
}