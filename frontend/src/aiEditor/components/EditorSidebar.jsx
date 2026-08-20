import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {FaDatabase,FaFileCsv,FaHistory,FaUpload,FaPlus,FaTimes, FaChevronDown, FaChevronUp,FaEllipsisV,FaEye, FaRobot,  FaTrash, FaLock, FaSignOutAlt, FaInfoCircle, FaPen, FaUndo, FaCheckCircle, FaTimesCircle, FaDownload,  FaChevronRight,FaChartLine } from "react-icons/fa";
import toast from "react-hot-toast";
import { getUploadedFiles, uploadCSV, deleteDataset } from "../../aiAnalyst/services/uploadService";
import { getCurrentUser } from "../../auth/services/AuthService";
import { forgotPassword } from "../../auth/services/passwordService";
import {
    validateDatasetFile,
    ACCEPTED_DATASET_FILES,
} from "../../shared/utils/fileHelpers";
import {
    getDatasetIcon,
    getDisplayFileName
} from "../../shared/utils/datasetHelpers";
import {
    getVersions,
    restoreVersion,
    createBlankDataset,
    getDataset,
    renameVersion,
    deleteVersion
} from "../services/datasetEditorService";
import {
    getVersionTitle,
    handleRestoreVersion,
    handleRenameVersion,
    handleDeleteVersion,
    handleLoadVersions
} from "../utils/versionHelpers";
import {
    handleResetPassword,
    handleLogout,
    getUserInitials
} from "../../shared/utils/profileHelpers";
import {handleViewDataset} from "../../shared/utils/viewDatasetHelper";
import { handleDeleteDataset } from "../../shared/utils/deleteDatasetHelpers";
import { loadCurrentUser } from "../../shared/utils/userHelpers";
import { handleDatasetUpload } from "../../shared/utils/uploadHelpers";

import { handleCreateBlankDataset } from "../utils/createDatasetHelpers";
import { handleDownloadCSV } from "../utils/downloadHelpers";


import DatasetTable from "./DatasetTable";

import "../styles/EditorSidebar.css";

function EditorSidebar({ activeDataset, onCloseMobile, setActiveDataset, refreshKey }) {
    const navigate = useNavigate();
    const { datasetId } = useParams();
    const fileInputRef = useRef(null);

    const [datasets, setDatasets] = useState([]);
    const [versions, setVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [showDatasets, setShowDatasets] = useState(true);
    const [showHistory, setShowHistory] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Per-dataset 3-dot menu
    const [openMenu, setOpenMenu] = useState(null);

    // View Dataset modal
    const [viewFile, setViewFile] = useState(null);
    const [viewRows, setViewRows] = useState([]);
    const [viewLoading, setViewLoading] = useState(false);

    // Delete confirmation modal
    const [deleteFile, setDeleteFile] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Create New Dataset modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [newColumns, setNewColumns] = useState([{ name: "", type: "TEXT" }]);
    const [creating, setCreating] = useState(false);

    // Download loading states (per-item, taaki menu me spinner dikha sakein)
    const [downloadingFileId, setDownloadingFileId] = useState(null);
    const [downloadingVersionId, setDownloadingVersionId] = useState(null);

    // Version 3-dot menu, rename, details modal
    const [openVersionMenu, setOpenVersionMenu] = useState(null);
    const [renamingVersionId, setRenamingVersionId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [detailsVersion, setDetailsVersion] = useState(null);

    // Bottom Profile
    const [user, setUser] = useState(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const profileRef = useRef(null);
    const onResetPassword = () =>
    handleResetPassword({
        user,
        forgotPassword,
        navigate,
        setMenuOpen: setProfileMenuOpen,
        setPasswordLoading
    });
  

   useEffect(() => {

    const initialize = async () => {
        await Promise.all([
            loadDataset(),
            loadUser()
        ]);
    };

    initialize();

}, [refreshKey]);
    useEffect(() => {
        if (datasetId) {
            loadVersionHistory();
        }
    }, [datasetId, refreshKey]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
            if (!event.target.closest(".file-menu-btn") && !event.target.closest(".file-menu")) {
                setOpenMenu(null);
            }
            if (!event.target.closest(".version-menu-btn") && !event.target.closest(".version-menu")) {
                setOpenVersionMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadDataset = async () => {
    try {

        const files = await getUploadedFiles();

        setDatasets(files || []);

        if (files?.length) {

            const current = files.find(
                f => String(f.id) === String(datasetId)
            );

            setActiveDataset(current || files[0]);
        }

    } catch (err) {
        console.error(err);
        setDatasets([]);
    }
};

    const loadUser = () =>
        loadCurrentUser({
            getCurrentUser,
            setUser
        });

    const loadVersionHistory = () =>
    handleLoadVersions({

        datasetId,

        getVersions,

        setVersions,

        setLoading: setLoadingVersions

    });


    // --------------------------------------------
    // Upload — tere existing uploadCSV service ka use
    // --------------------------------------------
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    await handleDatasetUpload({
        file,

        setLoading: setUploading,

        onSuccess: async (res) => {

            await loadDataset();

            setActiveDataset(res);

            if (res?.id) {
                navigate(`/dashboard/editor/${res.id}`);
            }

        }
    });

    e.target.value = "";
};
    // --------------------------------------------
    // Per-dataset 3-dot menu actions
    // --------------------------------------------
    const handleView = (file) => {

    setOpenMenu(null);

    handleViewDataset({

        file,

        getDataset,

        setViewLoading,

        setViewFile,

        setViewRows

    });

};

    const handleGoToAnalyst = (file) => {
        setOpenMenu(null);
        navigate("/dashboard", { state: { selectedFileId: file.id } });
        onCloseMobile?.();
    };

    const handleDownloadDataset = async (file) => {

    setOpenMenu(null);

    try {

        setDownloadingFileId(file.id);

        const res = await getDataset(file.id);

        handleDownloadCSV({

            rows: res.rows ?? res.data ?? [],

            filename: file.filename

        });

    } finally {

        setDownloadingFileId(null);

    }

};

    const handleDelete = (id) =>

        handleDeleteDataset({

            id,

            datasetId,

            deleteDataset,

            getUploadedFiles,

            setDatasets,

            setDeleteLoading,

            setDeleteFile,

            navigate

        });

    
    const handleDownloadVersion = (version) => {

    setOpenVersionMenu(null);

    try {

        setDownloadingVersionId(version.id);

        const rows =
            typeof version.snapshot_json === "string"
                ? JSON.parse(version.snapshot_json)
                : version.snapshot_json ?? [];

        handleDownloadCSV({

            rows,

            filename:
                version.custom_name?.trim() ||
                `version_${version.version}`

        });

    } finally {

        setDownloadingVersionId(null);

    }

};

    // --------------------------------------------
    // Create New Blank Dataset
    // --------------------------------------------
    const addColumnRow = () => {
        setNewColumns([...newColumns, { name: "", type: "TEXT" }]);
    };

    const removeColumnRow = (index) => {
        setNewColumns(newColumns.filter((_, i) => i !== index));
    };

    const updateColumn = (index, field, value) => {
        const updated = [...newColumns];
        updated[index][field] = value;
        setNewColumns(updated);
    };

    const handleCreateDataset = () =>

    handleCreateBlankDataset({

        newFileName,
        newColumns,

        createBlankDataset,

        loadDataset,

        navigate,

        setCreating,
        setShowCreateModal,
        setNewFileName,
        setNewColumns

    });


    const handleSwitchDataset = (id) => {
    navigate(`/dashboard/editor/${id}`);
    onCloseMobile?.();
};

    return (
        <>
            <aside className="editor-sidebar">
                {/* Hidden file input for direct file explorer interaction */}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                     accept={ACCEPTED_DATASET_FILES}
                    onChange={handleUpload}
                />

                {/* Header: Logo Icon shifted to top left corner */}
                <div className="editor-sidebar-header">
                    <div className="editor-logo-box">
                        <FaDatabase />
                    </div>
                </div>

                <div className="editor-sidebar-content custom-scrollbar">
                    {/* Dataset Switcher Section */}
                    <div className="editor-section">
                        <div
                        className={`editor-section-toggle ${showDatasets ? "open" : "closed"}`}
                        onClick={() => setShowDatasets(!showDatasets)}
                    >
                        <h3>
                            <FaDatabase />
                            Datasets
                        </h3>

                        <span className="toggle-icon">
                            {showDatasets ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                    </div>

                        {showDatasets && (
                            <>
                                <div className="editor-action-buttons">
                                    <button
                                        className="editor-action-btn"
                                        onClick={handleUploadClick}
                                        disabled={uploading}
                                        title="Upload File"
                                    >
                                        <FaUpload />
                                        <span>{uploading ? "Uploading..." : "Upload"}</span>
                                    </button>
                                    <button
                                        className="editor-action-btn"
                                        onClick={() => setShowCreateModal(true)}
                                        title="Create New Dataset"
                                    >
                                        <FaPlus />
                                        <span>New</span>
                                    </button>
                                </div>

                                <div className="editor-dataset-list">
                                    {datasets.length === 0 ? (
                                        <p className="no-data">No datasets yet</p>
                                    ) : (
                                        datasets.map((file) => (
                                            <div
                                                key={file.id}
                                                className={`editor-dataset-item ${
                                                    String(file.id) === String(datasetId) ? "active" : ""
                                                }`}
                                                onClick={() => handleSwitchDataset(file.id)}
                                            >
                                                {getDatasetIcon(file.filename)}
                                                <span
                                                    className="file-name-text"
                                                    title={file.filename}
                                                >
                                                    {getDisplayFileName(file.filename)}
                                                </span>

                                                {/* 3-dot menu */}
                                                <button
                                                    className="file-menu-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenu(openMenu === file.id ? null : file.id);
                                                    }}
                                                >
                                                    <FaEllipsisV />
                                                </button>

                                                {openMenu === file.id && (
                                                    <div
                                                        className="file-menu"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            className="file-menu-action"
                                                            onClick={() => handleView(file)}
                                                        >
                                                            <FaEye />
                                                            <span>View Dataset</span>
                                                        </button>
                                                        <button
                                                            className="file-menu-action"
                                                            onClick={() => handleGoToAnalyst(file)}
                                                        >
                                                            <FaChartLine />
                                                            <span>AI Analyst</span>
                                                        </button>
                                                        {/* NAYA: Download option */}
                                                        <button
                                                            className="file-menu-action"
                                                            onClick={() => handleDownloadDataset(file)}
                                                            disabled={downloadingFileId === file.id}
                                                        >
                                                            <FaDownload />
                                                            <span>
                                                                {downloadingFileId === file.id
                                                                    ? "Downloading..."
                                                                    : "Download CSV"}
                                                            </span>
                                                        </button>
                                                        <button
                                                            className="file-menu-action delete"
                                                            onClick={() => {
                                                                setDeleteFile(file);
                                                                setOpenMenu(null);
                                                            }}
                                                        >
                                                            <FaTrash />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Version History Section */}
                    <div className="editor-section">
                        <div
                        className={`editor-section-toggle ${showHistory ? "open" : "closed"}`}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <h3>
                            <FaHistory />
                            History
                        </h3>

                        <span className="toggle-icon">
                            {showHistory ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                    </div>

                        {showHistory && (
                            <div className="editor-history-list">
                                {loadingVersions ? (
                                    <p className="no-data">Loading...</p>
                                ) : versions.length === 0 ? (
                                    <p className="no-data">No version history yet</p>
                                ) : (
                                    versions.map((version) => {
                                        const displayTitle =
                                            version.custom_name?.trim() || getVersionTitle(version);

                                        return (
                                            <div key={version.id} className="editor-version-item">
                                                {renamingVersionId === version.id ? (
                                                    <input
                                                        autoFocus
                                                        className="version-rename-input"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                           if (e.key === "Enter") {
                                                                handleRenameVersion({
                                                                    version,
                                                                    renameValue,
                                                                    setRenamingVersionId,
                                                                    renameVersion,
                                                                    setVersions,
                                                                });
                                                            }
                                                            if (e.key === "Escape") setRenamingVersionId(null);
                                                        }}
                                                        
                                                    />
                                                ) : (
                                                    <div className="version-info">
                                                        <span className="version-label">
                                                            {displayTitle}
                                                        </span>
                                                        <span className="version-time">
                                                            {version.created_at}
                                                        </span>
                                                    </div>
                                                )}

                                                <button
                                                    className={`version-menu-btn ${openVersionMenu === version.id ? "active" : ""}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenVersionMenu(
                                                            openVersionMenu === version.id ? null : version.id
                                                        );
                                                    }}
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openVersionMenu === version.id && (
                                                    <div
                                                        className="version-menu"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            className="version-menu-action"
                                                            onClick={() => {
                                                                setDetailsVersion(version);
                                                                setOpenVersionMenu(null);
                                                            }}
                                                        >
                                                            <FaInfoCircle />
                                                            <span>Details</span>
                                                        </button>
                                                        <button
                                                            className="version-menu-action"
                                                            onClick={() => {
                                                                setRenamingVersionId(version.id);
                                                                setRenameValue(displayTitle);
                                                                setOpenVersionMenu(null);
                                                            }}
                                                        >
                                                            <FaPen />
                                                            <span>Rename</span>
                                                        </button>
                                                        {/* NAYA: Is version ka download */}
                                                        <button
                                                            className="version-menu-action"
                                                            onClick={() => handleDownloadVersion(version)}
                                                            disabled={downloadingVersionId === version.id}
                                                        >
                                                            <FaDownload />
                                                            <span>
                                                                {downloadingVersionId === version.id
                                                                    ? "Downloading..."
                                                                    : "Download CSV"}
                                                            </span>
                                                        </button>
                                                        <button
                                                            className="version-menu-action"
                                                            onClick={() => {
                                                                  handleRestoreVersion({
                                                                        versionId: version.id,
                                                                        restoreVersion,
                                                                        loadVersionHistory
                                                                    })
                                                                setOpenVersionMenu(null);
                                                            }}
                                                        >
                                                            <FaUndo />
                                                            <span>Restore</span>
                                                        </button>
                                                        <button
                                                            className="version-menu-action delete"
                                                            onClick={() => {
                                                                handleDeleteVersion({
                                                                                versionId: version.id,
                                                                                deleteVersion,
                                                                                setVersions
                                                                            });
                                                                setOpenVersionMenu(null);
                                                            }}
                                                        >
                                                            <FaTrash />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom-fixed Profile Section — AI Analyst sidebar jaisa hi */}
                <div className="editor-sidebar-footer" ref={profileRef}>
                    {profileMenuOpen && (
                        <div className="user-dropdown">
                            <div className="dropdown-user-info">
                                <div className="avatar large">
                                    {getUserInitials(user?.name)}
                                </div>
                                <div className="user-meta">
                                    <h4>{user?.name || "Gurmeet Punia"}</h4>
                                    <p>{user?.email || "user@example.com"}</p>
                                </div>
                            </div>

                            <hr className="dropdown-divider" />

                            <button
                                className="dropdown-item"
                                onClick={onResetPassword}
                                disabled={passwordLoading}
                            >
                                <FaLock />
                                {passwordLoading ? "Sending OTP..." : "Change Password"}
                            </button>

                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}

                    <div
                        className="user-profile"
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    >
                        <div className="avatar">{getUserInitials(user?.name)}</div>
                        <div className="user-details">
                            <h4>{user?.name  }</h4>
                        </div>
                       
                    </div>
                </div>
            </aside>

            {/* View Dataset Modal */}
            {viewFile &&
                createPortal(
                    <div className="modal-backdrop">
                        <div className="table-modal-card">
                            <div className="modal-top">
                                <h3>Dataset Preview - {viewFile.filename}</h3>
                                <button
                                    onClick={() => {
                                        setViewFile(null);
                                        setViewRows([]);
                                    }}
                                    className="close-btn"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body-table">
                                <DatasetTable data={viewRows} loading={viewLoading} />
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {/* Delete Confirmation Modal */}
            {deleteFile &&
                createPortal(
                    <div className="modal-overlay">
                        <div className="delete-modal">
                            <h3>Delete Dataset</h3>
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>"{deleteFile.filename}"</strong>?
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setDeleteFile(null)}
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(deleteFile.id)}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {/* Create New Dataset Modal */}
            {showCreateModal &&
                createPortal(
                    <div className="modal-backdrop">
                        <div className="create-dataset-card">
                            <div className="modal-top">
                                <h3>Create New Dataset</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="close-btn"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <label className="field-label">Dataset Name</label>
                            <input
                                type="text"
                                className="field-input"
                                placeholder="e.g. Customer Data"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                            />

                            <label className="field-label">Columns</label>
                            <div className="columns-builder">
                                {newColumns.map((col, idx) => (
                                    <div key={idx} className="column-row">
                                        <input
                                            type="text"
                                            className="field-input"
                                            placeholder="Column name"
                                            value={col.name}
                                            onChange={(e) =>
                                                updateColumn(idx, "name", e.target.value)
                                            }
                                        />
                                        <select
                                            className="field-select"
                                            value={col.type}
                                            onChange={(e) =>
                                                updateColumn(idx, "type", e.target.value)
                                            }
                                        >
                                            <option  value="TEXT">Text</option>
                                            <option value="INTEGER">Number</option>
                                            <option value="REAL">Decimal</option>
                                            <option value="BOOLEAN">Yes/No</option>
                                            <option value="DATE">Date</option>
                                        </select>
                                        {newColumns.length > 1 && (
                                            <button
                                                className="remove-column-btn"
                                                onClick={() => removeColumnRow(idx)}
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="add-column-btn" onClick={addColumnRow}>
                                <FaPlus /> Add Column
                            </button>

                            <div className="modal-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="create-btn"
                                    onClick={handleCreateDataset}
                                    disabled={creating}
                                >
                                    {creating ? "Creating..." : "Create Dataset"}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            {/* Version Details Modal */}
            {detailsVersion &&
                createPortal(
                    <div className="modal-backdrop">
                        <div className="version-details-card">
                            <div className="modal-top">
                                <h3>Version Details</h3>
                                <button
                                    onClick={() => setDetailsVersion(null)}
                                    className="close-btn"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="details-grid">
                                <div className="details-row">
                                    <span className="details-label">Version</span>
                                    <span className="details-value">
                                        {detailsVersion.custom_name?.trim() ||
                                            `Version ${detailsVersion.version}`}
                                    </span>
                                </div>

                                <div className="details-row">
                                    <span className="details-label">Created</span>
                                    <span className="details-value">
                                        {detailsVersion.created_at}
                                    </span>
                                </div>

                                <div className="details-row">
                                    <span className="details-label">Created By</span>
                                    <span className="details-value">AI Dataset Assistant</span>
                                </div>

                                <div className="details-row">
                                    <span className="details-label">Dataset</span>
                                    <span className="details-value">
                                        {datasets.find(
                                            (d) => String(d.id) === String(datasetId)
                                        )?.filename || "—"}
                                    </span>
                                </div>
                            </div>

                            {detailsVersion.edit_prompt && (
                                <div className="details-section">
                                    <h4>AI Prompt</h4>
                                    <p className="details-text">{detailsVersion.edit_prompt}</p>
                                </div>
                            )}

                            {detailsVersion.ai_summary && (
                                <div className="details-section">
                                    <h4>AI Summary</h4>
                                    <ul className="details-bullets">
                                        {detailsVersion.ai_summary
                                            .split(/[.•\n]+/)
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                            .map((point, i) => (
                                                <li key={i}>{point}</li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            <div className="details-section">
                                <h4>Execution</h4>
                                <div className="details-row">
                                    <span className="details-value success">
                                        <FaCheckCircle /> Success
                                    </span>
                                </div>
                            </div>

                            <div className="details-grid">
                                <div className="details-row">
                                    <span className="details-label">Rows Changed</span>
                                    <span className="details-value">
                                        {detailsVersion.rows_changed ?? "N/A"}
                                    </span>
                                </div>
                                <div className="details-row">
                                    <span className="details-label">Columns Affected</span>
                                    <span className="details-value">
                                        {detailsVersion.columns_affected ?? "N/A"}
                                    </span>
                                </div>
                                <div className="details-row">
                                    <span className="details-label">Execution Time</span>
                                    <span className="details-value">
                                        {detailsVersion.execution_time
                                            ? `${detailsVersion.execution_time} sec`
                                            : "N/A"}
                                    </span>
                                </div>
                                <div className="details-row">
                                    <span className="details-label">Backup ID</span>
                                    <span className="details-value">
                                        {detailsVersion.backup_id || `v_${String(detailsVersion.id).padStart(4, "0")}`}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setDetailsVersion(null)}
                                >
                                    Close
                                </button>
                                <button
                                    className="create-btn"
                                    onClick={async () => {
                                        await handleRestoreVersion({
                                            versionId: detailsVersion.id,
                                            restoreVersion,
                                            loadVersionHistory
                                        });

                                        setDetailsVersion(null);
                                    }}
                                >
                                    Restore Version
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default EditorSidebar;