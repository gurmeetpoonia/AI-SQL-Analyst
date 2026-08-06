import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaFileCsv,FaFileExcel, FaCheckCircle, FaSpinner, FaTimes } from "react-icons/fa";
import "../styles/UploadZone.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    validateDatasetFile,
    ACCEPTED_DATASET_FILES
} from "../../shared/utils/fileHelpers";

import {
    getDatasetIcon,
    formatFileSize,
    getDisplayFileName
} from "../../styles/utils/datasetHelpers";

import { handleDatasetUpload } from "../../shared/utils/uploadHelpers";
function UploadZone({onUploadSuccess}) {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDataset, setCurrentDataset] = useState(null);
    const navigate = useNavigate();
  const handleChooseFile = () => {
    inputRef.current.click();
  };

  const validateAndSetFile = (file) => {
    const result = validateDatasetFile(file);

    if (!result.valid) {
        toast.error(result.message);
        return;
    }

    setSelectedFile(file);
    setUploadResult(null);
};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  /* Drag & Drop Event Handlers */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
  if (!selectedFile) {
    toast.error("Please select a dataset.");
    return;
  }

  await handleDatasetUpload({
    file: selectedFile,
    setLoading,
    inputRef,
    onSuccess: (data) => {
      setUploadResult(data);
      setSelectedFile(null);

      onUploadSuccess?.();

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    }
  });
};

  return (
    <div className="upload-container">
      {/* Drag & Drop Box */}
      <div
        className={`upload-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon-wrapper">
          <FaCloudUploadAlt className="upload-icon" />
        </div>

        <h2>Drag & Drop Dataset</h2>

        <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>

        <button className="choose-btn">
          Choose Dataset
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_DATASET_FILES}
          hidden
          onChange={handleFileChange}
        />
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="selected-file-card">
          <div className="file-info">
            <div className="csv-icon">
            {selectedFile?.name.toLowerCase().endsWith(".csv") ? (
              <FaFileCsv />
            ) : (
              <FaFileExcel />
            )}
          </div>
            <div className="file-details">
              <h3>{selectedFile.name}</h3>
              <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spin-icon" />
                  <span>Uploading...</span>
                </>
              ) : (
                "Upload Dataset"
              )}
            </button>

            {!loading && (
              <button className="remove-btn" onClick={handleRemoveFile}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Success Details Container */}
      {uploadResult && (
        <div className="upload-result-card">
          <div className="result-header">
            <FaCheckCircle className="success-icon" />
            <h3>Upload Successful</h3>
          </div>

          <div className="result-grid">
            <div className="result-item">
              <span className="label">Filename:</span>
              <span className="value">{uploadResult.filename}</span>
            </div>
            <div className="result-item">
            <span className="label">Filename:</span>

            <span className="value">
              {uploadResult.filename.toLowerCase().endsWith(".csv") ? (
                <FaFileCsv style={{ marginRight: 6 }} />
              ) : (
                <FaFileExcel style={{ marginRight: 6, color: "#22c55e" }} />
              )}

              {uploadResult.filename}
            </span>
          </div>
            <div className="supported-files">
              <FaFileCsv className="csv-icon" />
              <FaFileExcel className="excel-icon" />
            </div>
            <div className="result-item">
              <span className="label">Total Rows:</span>
              <span className="value badge">{uploadResult.rows}</span>
            </div>

            <div className="result-item">
              <span className="label">Table Name:</span>
              <span className="value highlight">{uploadResult.table_name}</span>
            </div>

            <div className="result-item full-width">
              <span className="label">Columns:</span>
              <div className="columns-tags">
                {uploadResult.columns?.map((col, index) => (
                  <span key={index} className="column-tag">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadZone;