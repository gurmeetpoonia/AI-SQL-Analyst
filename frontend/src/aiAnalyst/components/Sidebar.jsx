import {
  FaDatabase,
  FaChartBar,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaFileCsv,
  FaFileExcel,
  FaRobot,
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
  FaTrash,
  FaLock,
  FaEdit,
  FaChevronRight
} from "react-icons/fa";


import { useEffect, useState, useRef } from "react";
import { getDashboardStats } from "../services/DashboardService";
import { getUploadedFiles, deleteDataset } from "../services/uploadService";

import { getCurrentUser } from "../../auth/services/AuthService";
import { forgotPassword } from "../../auth/services/passwordService";

import {
    getDatasetIcon,
    getDisplayFileName
} from "../../shared/utils/datasetHelpers";

import {
    handleResetPassword,
    handleLogout,
    getUserInitials
} from "../../shared/utils/profileHelpers";
import { handleDeleteDataset } from "../../shared/utils/deleteDatasetHelpers"; 
import { loadCurrentUser } from "../../shared/utils/userHelpers";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import "../styles/sidebar.css";

function Sidebar({ refreshKey, activeDataset, setActiveDataset, allQueries, viewMode, setViewMode, onCloseMobile }) {
  const [stats, setStats] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showUploads, setShowUploads] = useState(true);
  const [showQueries, setShowQueries] = useState(true);
  const [user, setUser] = useState(null);

  const profileRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const isEditorPage = location.pathname.startsWith("/dashboard/editor");
  const onResetPassword = () =>
    handleResetPassword({
        user,
        forgotPassword,
        navigate,
        setMenuOpen,
        setPasswordLoading
    }); 

  useEffect(() => {
    loadDashboard();
    loadUser();
  }, [refreshKey]);

  useEffect(() => {
    if (!activeDataset) {
      setRecentQueries([]);
      return;
    }

    const filteredQueries = allQueries.filter(
      (query) => query.table_name === activeDataset.table_name
    );

    setRecentQueries(filteredQueries);
  }, [activeDataset, allQueries]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (!event.target.closest('.file-menu-btn') && !event.target.closest('.file-menu')) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboard, files, profile] = await Promise.all([
        getDashboardStats(),
        getUploadedFiles(),
        getCurrentUser()
      ]);

      setStats(dashboard);
      setRecentUploads(files);
      setUser(profile);

    } catch (error) {
      console.error("Sidebar load error:", error);
    }
  };

    const loadUser = () =>
      loadCurrentUser({
          getCurrentUser,
          setUser
      });

  const handleDelete = (id) =>
    handleDeleteDataset({

        id,

        deleteDataset,
        getUploadedFiles,

        setDatasets: setRecentUploads,

        setDeleteLoading,
        setDeleteFile,

        onSuccess: (files) => {

            if (files.length === 0) {

                setActiveDataset(null);

            } else if (activeDataset?.id === id) {

                setActiveDataset(files[0]);

            }

            loadDashboard();

        }

    });



  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-box">
              <FaDatabase />
            </div>
          </div>
        </div>

        <div className="sidebar-content custom-scrollbar">
          <div className="workspace-section">
            <h3 className="section-title">
              <FaChartBar />
              <span>Workspace Overview</span>
            </h3>

            <div className="stats-list">
              <div className="sidebar-stat">
                <span>Uploaded Files</span>
                <strong>{stats?.total_files ?? 0}</strong>
              </div>

              <div className="sidebar-stat">
                <span>AI Queries</span>
                <strong>{stats?.total_queries ?? 0}</strong>
              </div>

              <div className="sidebar-stat">
                <span>Successful</span>
                <strong className="success">{stats?.successful_queries ?? 0}</strong>
              </div>

              <div className="sidebar-stat">
                <span>Failed</span>
                <strong className="failed">{stats?.failed_queries ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="activity-section">
                    <div
            className={`section-header-toggle ${
                showUploads ? "open" : "closed"
            }`}
            onClick={() => setShowUploads(!showUploads)}
          >
              <h3>
                <FaHistory />
                Recent Uploads
              </h3>
              <span className="toggle-icon">
                {showUploads ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </div>

            {showUploads && (
              <div className="activity-links">
                {recentUploads.map((file) => (
                  <div
                    key={file.id}
                    className={`activity-item ${activeDataset?.id === file.id ? "active-upload" : ""}`}
                    onClick={() => setActiveDataset(file)}
                  >
                    {getDatasetIcon(file.filename)}

                    <span
                        className="file-name-text"
                        title={getDisplayFileName(file.filename)}
                      >
                        {getDisplayFileName(file.filename)}
                      </span>

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
                          onClick={() => {
                            if (isEditorPage) {
                              navigate("/dashboard");
                            } else {
                              if (!activeDataset) {
                                toast.error("Please select a dataset first.");
                                return;
                              }
                              navigate(`/dashboard/editor/${activeDataset.id}`);
                            }
                            onCloseMobile?.();
                          }}
                        >
                          {isEditorPage ? (
                            <>
                              <FaRobot />
                              AI Analyst
                            </>
                          ) : (
                            <>
                              <FaEdit />
                              AI Edit
                            </>
                          )}
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
                ))}
              </div>
            )}

           <div
  
              className={`section-header-toggle ${
                  showQueries ? "open" : "closed"
              }`}
              onClick={() => setShowQueries(!showQueries)}
            >
              <h3>
                <FaRobot />
                Recent Queries
              </h3>
              <span className="toggle-icon">
                {showQueries ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </div>

            {showQueries && (
              <div className="activity-links">
                {recentQueries.length === 0 ? (
                  <p className="no-data">No queries yet</p>
                ) : (
                  recentQueries.slice(0, 5).map((query) => (
                    <div key={query.id} className="activity-item">
                      <FaRobot className="item-icon robot-icon" />
                      <span className="file-name-text" title={query.question}>
                        {query.question}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-footer" ref={profileRef}>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-user-info">
                <div className="avatar large">
                  {getUserInitials(user?.name)}
                </div>
                <div className="user-meta">
                  <h4>{user?.name }</h4>
                  <p>{user?.email }</p>
                </div>
              </div>

              <hr className="dropdown-divider" />

              <button className="dropdown-item" onClick={onResetPassword} disabled={passwordLoading}>
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
                className={"user-profile "}
                onClick={() => setMenuOpen(!menuOpen)}
            >
            <div className="avatar">{getUserInitials(user?.name)}</div>
            <div className="user-details">
              <h4>{user?.name }</h4>
            </div>
           
          </div>
        </div>

      </aside>

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
                <button className="cancel-btn" onClick={() => setDeleteFile(null)} disabled={deleteLoading}>
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
    </>
  );
}

export default Sidebar;