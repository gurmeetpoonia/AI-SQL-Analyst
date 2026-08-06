import { useRef, useState } from "react";
import { FaPlus, FaPaperPlane, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { uploadCSV } from "../services/uploadService";
import {
    validateDatasetFile,
    ACCEPTED_DATASET_FILES
} from "../../shared/utils/fileHelpers";

import { handleDatasetUpload } from "../../shared/utils/uploadHelpers";
import "../styles/WorkspaceInput.css";

function WorkspaceInput({ onSend, loading, onUploadSuccess }) {
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const onFileChange = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    await handleDatasetUpload({
        file,
        setLoading: setUploading,
        onSuccess: onUploadSuccess
    });

    event.target.value = "";
};

  // Send Message Handler
  const handleSend = async () => {
    if (!question.trim() || loading) return;

    const currentText = question.trim();
    setQuestion(""); // Quick clear for snappy feel

    try {
      await onSend(currentText);
    } catch (error) {
      console.error("Error sending message:", error);
      setQuestion(currentText); // Restore on error
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInputEmpty = !question.trim();

  return (
    <div className="workspace-input-container">
      <div className={`workspace-input ${!isInputEmpty ? "has-text" : ""}`}>
        
        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_DATASET_FILES}
          hidden
          onChange={onFileChange}
        />

        {/* Upload Button */}
        <button
          type="button"
          className="upload-icon-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || loading}
          title="Upload  dataset"
        >
          {uploading ? <FaSpinner className="spinner-icon" /> : <FaPlus />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Ask anything about your dataset..."
          value={question}
          disabled={loading}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Send Button */}
        <button
          type="button"
          className={`send-btn ${!isInputEmpty && !loading ? "active" : ""}`}
          onClick={handleSend}
          disabled={isInputEmpty || loading}
          title="Send message"
        >
          {loading ? (
            <FaSpinner className="spinner-icon" />
          ) : (
            <FaPaperPlane className="send-icon" />
          )}
        </button>

      </div>
    </div>
  );
}

export default WorkspaceInput;