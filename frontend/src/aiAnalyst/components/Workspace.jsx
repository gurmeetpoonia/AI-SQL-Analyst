import WorkspaceHeader from "./WorkspaceHeader";
import ChatArea from "../../aiAnalyst/components/ChatArea";
import WorkspaceInput from "./WorkspaceInput";
import "../styles/workspace.css";

function Workspace({
  datasets,
  activeDataset,
  setActiveDataset,
  messages,
  onSend,
  onUploadSuccess,
  aiLoading
}) {
  return (
    <div className="workspace">
      {/* Clean Header with Details & Columns */}
      <WorkspaceHeader
        dataset={activeDataset}
        columns={activeDataset?.columns || []}
      />

      {/* DatasetTabs / List has been removed from here */}

      <ChatArea
        messages={messages[activeDataset?.table_name] || []}
        aiLoading={aiLoading}
        activeDataset={activeDataset}
        onSend={onSend}
      />

      <WorkspaceInput
        onSend={onSend}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
}

export default Workspace;