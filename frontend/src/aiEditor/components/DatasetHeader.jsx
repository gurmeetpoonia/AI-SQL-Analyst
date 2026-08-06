import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUndo,
    FaHistory,
    FaTimes,
    FaEye,
    FaEllipsisV,
    FaBars,
    FaEdit, FaRobot,
    FaDownload
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
    undoEdit,
    getVersions,
    restoreVersion
} from "../services/datasetEditorService";
import { handleDeleteDataset } from "../../shared/utils/deleteDatasetHelpers";
import DatasetTable from "./DatasetTable";
import { MobileSidebarContext } from "../../shared/layouts/DashboardLayout";
import { downloadRowsAsCSV } from "../../shared/utils/downloadHelpers";
import { handleDownloadCSV } from "../utils/downloadHelpers";
import {
    handleLoadVersions,
    handleRestoreVersion,
    handleUndoDataset
} from "../utils/versionHelpers";
import "../styles/DatasetHeader.css";


function DatasetHeader({
    uploadedFile,
    tableName,
    tableData,
    loadingData,
    onRefresh
}) {
    const navigate = useNavigate();
    const mobileSidebar = useContext(MobileSidebarContext);

    const toggleMobileSidebar =
        mobileSidebar?.toggleMobileSidebar || (() => {});
        
    const [loading, setLoading] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [versions, setVersions] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [undoing, setUndoing] = useState(false);
    const [undoStatus, setUndoStatus] = useState("");

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUndo = () =>
    handleUndoDataset({

        tableName,

        undoEdit,

        onRefresh,

        setLoading,

        setUndoing,

        setUndoStatus,

        setShowMenu

    });
    const loadVersions = () =>
    handleLoadVersions({

        datasetId: uploadedFile?.id,

        getVersions,

        setVersions,

        setLoading,

        setShowVersions,

        setShowMenu

    });

   const handleRestore = (versionId) =>
    handleRestoreVersion({

        versionId,

        restoreVersion,

        onSuccess: async () => {

            setShowVersions(false);

            await onRefresh?.();

        }

    });

    const handleGoToAnalyst = (file) => {
        navigate("/dashboard", { state: { selectedFileId: file.id } });
    };

    const handleDownloadDataset = () => {

    setShowMenu(false);

    handleDownloadCSV({

        rows:
            tableData ||
            uploadedFile?.data ||
            uploadedFile?.rows ||
            [],

        filename:
            uploadedFile?.filename ||
            uploadedFile?.file_name ||
            `dataset_${uploadedFile?.id || "export"}`

    });

};

    if (!uploadedFile) {
        return <div className="dataset-header-skeleton">Loading dataset...</div>;
    }

    return (
        <>
            <header className="dataset-header-minimal">
                <div className="dataset-header-left">
                    
                    <button
                        type="button"
                        className="mobile-hamburger-btn header-icon-btn tooltip-container"
                        onClick={toggleMobileSidebar}
                        aria-label="Open sidebar"
                        title="Open sidebar"
                        data-tooltip="Open Sidebar"
                    >
                        <FaBars aria-hidden="true" />
                    </button>

                    <div className="title-wrapper">
                        <span className="dataset-title-minimal">AI Dataset Studio</span>
                    </div>
                </div>

                {/* Gemini style Right Corner Actions (Icon Only Buttons) */}
                <div className="dataset-header-right-actions">
                    {/* Icon-Only AI Analyst / New Action Button */}
                    <button
                        className="header-icon-btn tooltip-container"
                        onClick={handleGoToAnalyst}
                        data-tooltip="AI Analyst"
                        aria-label="AI Analyst"
                    >
                        <FaEdit />
                    </button>

                    {/* Single Icon-Only Menu Button */}
                    <div className="dataset-header-menu-wrapper" ref={menuRef}>
                        <button
                            className={`header-icon-btn tooltip-container ${showMenu ? "menu-active" : ""}`}
                            onClick={() => setShowMenu((prev) => !prev)}
                            disabled={loading}
                            data-tooltip="More options"
                            aria-label="More options"
                        >
                            <FaEllipsisV />
                        </button>

                        {showMenu && (
                            <div className="dropdown-menu">
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setShowTableModal(true);
                                        setShowMenu(false);
                                    }}
                                >
                                    <FaEye /> <span>View Dataset</span>
                                </button>
                                {/* NAYA: Download option */}
                                <button
                                    className="dropdown-item"
                                    onClick={handleDownloadDataset}
                                    disabled={loading}
                                >
                                    <FaDownload /> <span>Download CSV</span>
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={handleUndo}
                                    disabled={loading}
                                >
                                    <FaUndo /> <span>Undo</span>
                                </button>
                                {undoing && (
                                    <div className="undo-progress">
                                        <div className="undo-spinner" />
                                        <span>{undoStatus}</span>
                                    </div>
                                )}
                                <button
                                    className="dropdown-item"
                                    onClick={loadVersions}
                                    disabled={loading}
                                >
                                    <FaHistory /> <span>History</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* View Dataset Modal */}
            {showTableModal && (
                <div className="modal-backdrop">
                    <div className="table-modal-card">
                        <div className="modal-top">
                            <h3>Dataset Preview - AI Dataset Studio</h3>
                            <button onClick={() => setShowTableModal(false)} className="close-btn">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body-table">
                            <DatasetTable
                                data={tableData || uploadedFile?.data || uploadedFile?.rows || []}
                                loading={loadingData}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Version History Modal */}
            {showVersions && (
                <div className="modal-backdrop">
                    <div className="version-card">
                        <div className="modal-top">
                            <h3>Version History</h3>
                            <button onClick={() => setShowVersions(false)} className="close-btn">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="version-list">
                            {versions.length === 0 ? (
                                <p className="no-versions">No version history recorded yet.</p>
                            ) : (
                                versions.map((version) => (
                                    <div key={version.id} className="version-item">
                                        <div className="version-meta">
                                            <h4>Version {version.version}</h4>
                                            <span className="time">{version.created_at}</span>
                                            {version.ai_summary && (
                                                <p className="summary">{version.ai_summary}</p>
                                            )}
                                        </div>
                                        <button
                                            className="restore-btn"
                                            onClick={() => handleRestore(version.id)}
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DatasetHeader;