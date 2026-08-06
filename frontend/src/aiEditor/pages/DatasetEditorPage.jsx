import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import DatasetHeader from "../components/DatasetHeader";
import DatasetTable from "../components/DatasetTable";
import AIEditorBox from "../components/AIEditor";
import PreviewPanel from "../components/PreviewPanel";
import ExecuteBar from "../components/ExecuteBar";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import {
    generatePlan,
    previewPlan,
    executePlan,
    undoEdit,
    getVersions,
    restoreVersion,
    getDataset
} from "../services/datasetEditorService";

import "../styles/datasetEditor.css";

export default function DatasetEditorPage({ onBack}) {

   

   const [rows, setRows] = useState([]);
    const [datasetInfo, setDatasetInfo] = useState(null);

    const [prompt, setPrompt] = useState("");

    const [plan, setPlan] = useState(null);

    const [previewData, setPreviewData] = useState(null);

    const [versions, setVersions] = useState([]);

    const [loading, setLoading] = useState(false);
;
    const [executing, setExecuting] = useState(false);

    
    // Naya: refreshKey — jab bhi execute/undo/restore ho, isko badhao
    // taaki EditorSidebar ka version history aur stats auto-refresh ho jayein
    const [refreshKey, setRefreshKey] = useState(0);
      const { datasetId } = useParams();
    const navigate = useNavigate();

    
    //------------------------------------------
    // Load Dataset
    //------------------------------------------

   const loadDataset = async () => {
    if (!datasetId) return;

    try {
        setLoading(true);

        const res = await getDataset(datasetId);
        setDatasetInfo(res);
        setRows(res.rows || []);

    } catch (err) {
        console.log(err);
        toast.error("Failed to load dataset");
    } finally {
        setLoading(false);
    }
};
    //------------------------------------------
    // Load Versions
    //------------------------------------------

    const loadVersions = async () => {

    if (!datasetInfo) return;

    try {

        const data = await getVersions(datasetInfo.id);

        setVersions(data);

    } catch (err) {

        console.log(err);

    }

};

    //------------------------------------------
    // Generate AI Plan
    //------------------------------------------

    const handleGeneratePlan = async () => {
    if (!prompt.trim()) {
        toast.error("Please enter your request.");
        return;
    }

    const tableNameToSubmit = datasetInfo?.table_name || datasetInfo?.tableName;

    if (!tableNameToSubmit) {
        toast.error("Dataset table name is missing. Please wait for dataset to load.");
        return;
    }

    try {
        setLoading(true);
        setPreviewData(null);

        const planRes = await generatePlan({
            table_name: tableNameToSubmit,
            question: prompt
        });

        setPlan(planRes);
        toast.success("AI Plan Generated");

        // Auto preview turant call karo
        const previewRes = await previewPlan(planRes);
        setPreviewData(previewRes);

    } catch (err) {
        console.error("Error Details:", err.response?.data);
        toast.error(err.response?.data?.detail?.[0]?.msg || err.message || "Failed to generate plan.");
    } finally {
        setLoading(false);
    }
};

    //------------------------------------------
    // Preview
    //------------------------------------------

    const handlePreview = async () => {

        if (!plan) {

            toast.error("Generate plan first.");

            return;

        }

        try {

            const res = await previewPlan(plan);

            setPreviewData(res); 
            

            
        }

        catch (err) {

            console.log(err);

            toast.error("Preview failed.");

        }

    };

    //------------------------------------------
    // Execute
    //------------------------------------------

    const handleExecute = async () => {

        if (!plan) return;

        try {

            setExecuting(true);

            await executePlan(plan, prompt);

            toast.success("Dataset Updated");

            setPlan(null);

            setPreviewData(null); 

            setPrompt("");

            loadDataset();

            loadVersions();
             setRefreshKey((prev) => prev + 1);

        }

        catch (err) {

            console.log(err);

            toast.error("Execution failed");

        }

        finally {

            setExecuting(false);

        }

    };

    //------------------------------------------
    // Undo
    //------------------------------------------

    const handleUndo = async () => {

        try {

            await undoEdit(datasetInfo.table_name);

            toast.success("Undo Successful");

            loadDataset();

            loadVersions();
             setRefreshKey((prev) => prev + 1);

        }

        catch (err) {

            console.log(err);

            toast.error("Undo Failed");

        }

    };

    //------------------------------------------
    // Restore Version
    //------------------------------------------

    const handleRestoreVersion = async (versionId) => {

        try {

            await restoreVersion(versionId);

            toast.success("Version Restored");

            loadDataset();

            loadVersions();

               setRefreshKey((prev) => prev + 1);

        }

        catch (err) {

            console.log(err);

            toast.error("Restore Failed");

        }

    };

    //------------------------------------------

    useEffect(() => {

    loadDataset();

}, [datasetId]);
useEffect(() => {

    if (datasetInfo) {

        loadVersions();

    }

}, [datasetInfo]);
    //------------------------------------------

    return (
    <DashboardLayout
        activeDataset={datasetInfo}
        setActiveDataset={() => {}}
         refreshKey={refreshKey}
    >

        <div className="dataset-editor-heading">
            <DatasetHeader
                uploadedFile={datasetInfo}
                tableName={datasetInfo?.table_name}
                onRefresh={loadDataset}
                data ={rows}
                loadingData={loading}
                
            />
        </div>
        <div className="dataset-editor-page">


           
            <AIEditorBox
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGeneratePlan}
                loading={loading}
            />
           {previewData && (
    <>
        <PreviewPanel results={previewData?.results} />

        <ExecuteBar
            plan={plan}
            executing={executing}
            onExecute={handleExecute}
        />
    </>
)}

        </div>
    </DashboardLayout>
);

}