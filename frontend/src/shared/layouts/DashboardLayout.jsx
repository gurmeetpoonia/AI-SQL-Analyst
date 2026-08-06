import {useEffect, useState, createContext } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../aiAnalyst/components/Sidebar";
import EditorSidebar from "../../aiEditor/components/EditorSidebar";

import { getUploadedFiles } from "../../aiAnalyst/services/uploadService";
import "../styles/layout.css";

// Context taaki DatasetHeader (ya koi bhi nested component) sidebar toggle kar sake
export const MobileSidebarContext = createContext({
  toggleMobileSidebar: () => {},
  isMobileOpen: false,
});

function DashboardLayout({ children, refreshKey, activeDataset, setActiveDataset,allQueries }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const [datasets, setDatasets] = useState([]);
  // AI Editor page pe alag sidebar dikhani hai
  const isEditorPage = location.pathname.startsWith("/dashboard/editor");

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };
  useEffect(() => {
    loadDatasets();
}, [refreshKey]);

const loadDatasets = async () => {
    try {
        const files = await getUploadedFiles();
        setDatasets(files);
    } catch (err) {
        console.log(err);
    }
};
const showSidebar = datasets.length > 0;

  return (
    <MobileSidebarContext.Provider value={{ toggleMobileSidebar, isMobileOpen }}>
      <div className="dashboard-layout">
        {/* Dark Overlay jab mobile sidebar open ho */}
        {isMobileOpen && (
          <div className="sidebar-overlay" onClick={closeMobileSidebar} />
        )}

        {/* Sidebar - route ke hisaab se decide hota hai */}
{showSidebar && (
    <div className={`sidebar-container ${isMobileOpen ? "open" : ""}`}>
        {isEditorPage ? (
            <EditorSidebar
                refreshKey={refreshKey}
                activeDataset={activeDataset}
                setActiveDataset={setActiveDataset}
                onCloseMobile={closeMobileSidebar}
            />
        ) : (<div className={`dashboard-main ${showSidebar ? "" : "full-width"}`}>
            <Sidebar
                refreshKey={refreshKey}
                activeDataset={activeDataset}
                setActiveDataset={setActiveDataset}
                allQueries={allQueries}
                onCloseMobile={closeMobileSidebar}
            />
            </div>
        )}
    </div>
)}

        {/* Main Content Area */}
        <div className="dashboard-main">
          <main className="dashboard-content">{children}</main>
        </div>
      </div>
    </MobileSidebarContext.Provider>
  );
}

export default DashboardLayout;