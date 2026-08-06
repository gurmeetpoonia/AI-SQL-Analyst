import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaRobot } from 'react-icons/fa';
import { PiMagicWandFill } from "react-icons/pi";
import { MobileSidebarContext } from '../../shared/layouts/DashboardLayout';
import '../styles/workspaceHeader.css';

function WorkspaceHeader({ dataset }) {
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useContext(MobileSidebarContext);

  if (!dataset) return null;

  const handleAiEditClick = () => {
    if (!dataset?.id) return;
    navigate(`/dashboard/editor/${dataset.id}`);
  };

  return (
    <div className="workspace-header-container">
      <div className="header-main-bar">

        {/* Left Side: Mobile Hamburger + Static "AI Analyst" Title */}
        <div className="header-left">
          <button
            className="mobile-hamburger-btn"
            onClick={toggleMobileSidebar}
            title="Open Sidebar"
          >
            <FaBars />
          </button>

          <span className="dataset-title-static">AI Analyst</span>
        </div>

        {/* Right Side: AI Edit icon button — editor page pe le jaata hai */}
        <button
          className="ai-edit-btn"
          onClick={handleAiEditClick}
          title="AI Edit"
        >
         < PiMagicWandFill size={20}/>
        </button>

      </div>
    </div>
  );
}

export default WorkspaceHeader;