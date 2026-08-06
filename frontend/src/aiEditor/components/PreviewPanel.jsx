import React from "react";
import "../styles/PreviewPanel.css";

export default function PreviewPanel({ results }) {
    if (!results || results.length === 0) {
        return (
            <div className="preview-panel empty">
                <h3>Preview</h3>
                <p className="no-data">No preview data available. Click "Preview" after generating a plan.</p>
            </div>
        );
    }

    return (
        <div className="preview-panel">
            <h3>Preview Results</h3>

            {results.map((result, idx) => {
                const preview = result.preview || [];
                const columns = preview.length > 0 ? Object.keys(preview[0]) : [];

                return (
                    <div key={idx} className="preview-step-block">
                        <div className="preview-header">
                            <span className="step-summary">
                                {result.step?.impact_summary || `Step ${idx + 1}`}
                            </span>
                            <span className="row-badge">{preview.length} Rows</span>
                        </div>

                        {preview.length === 0 ? (
                            <p className="no-data">No matching rows for this step.</p>
                        ) : (
                            <div className="preview-table-container">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            {columns.map((col, i) => <th key={i}>{col}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {columns.map((col, colIndex) => (
                                                    <td key={colIndex}>
                                                        {row[col] !== null && row[col] !== undefined
                                                            ? String(row[col])
                                                            : <span className="null-text">null</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}