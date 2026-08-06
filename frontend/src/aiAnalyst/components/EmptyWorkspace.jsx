import { FaDatabase, FaRobot, FaChartLine, FaFileCsv } from "react-icons/fa";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadCSV } from "../services/uploadService";
import "../styles/emptyWorkspace.css";
import {
    validateDatasetFile,
    ACCEPTED_DATASET_FILES
} from "../../shared/utils/fileHelpers";

import { handleDatasetUpload } from "../../shared/utils/uploadHelpers";
import { forgotPassword } from "../../auth/services/passwordService";

function EmptyWorkspace({ onUploadSuccess }) {

  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);

   const onFileChange = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    await handleDatasetUpload({
        file,
        setLoading,
        onSuccess: onUploadSuccess
    });

    event.target.value = "";
};

  return (
    <div className="empty-workspace">

      

      {/* Center Content */}
      <div className="workspace-center">

        <div className="workspace-logo">
          <FaDatabase />
        </div>

        <h1>AI SQL Analyst</h1>

        <p className="workspace-subtitle">
          Talk to your data using natural language.
          Upload a CSV or Excel dataset and start exploring insights with AI.
        </p>

        <button
    className="upload-btn"
    onClick={() => inputRef.current.click()}
>
          <FaFileCsv />
          {loading ? "Uploading..." : "Upload Your First Dataset"}
        </button>
        <input
              ref={inputRef}
              type="file"
               accept={ACCEPTED_DATASET_FILES}
              hidden
              onChange={onFileChange}
          />
        <div className="feature-list">

          <div className="feature-card">
            <FaRobot />
            <span>Natural Language Queries</span>
          </div>

          <div className="feature-card">
            <FaDatabase />
            <span>SQL Generation</span>
          </div>

          <div className="feature-card">
            <FaChartLine />
            <span>Instant Insights</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default EmptyWorkspace;
