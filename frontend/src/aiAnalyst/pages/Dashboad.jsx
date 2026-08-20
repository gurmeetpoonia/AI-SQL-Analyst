import DashboardLayout from "../../shared/layouts/DashboardLayout";
import EmptyWorkspace from "../components/EmptyWorkspace";
import Workspace from "../components/Workspace";
import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/DashboardService";
import { askAI } from "../services/aiService";
import { getUploadedFiles} from "../services/uploadService";
import { getRecentHistory } from "../services/historyService";

import toast from "react-hot-toast";

import "../styles/dashboard.css";


function Dashboard() {
  const [stats, setStats] = useState({
    uploaded_files: 0,
    total_queries: 0,
    successful_queries: 0,
    failed_queries: 0
  });

// workspace | editor
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState([]);

  const [activeDataset, setActiveDataset] = useState(null);
 const [refreshKey, setRefreshKey] = useState(0);
  const [messages, setMessages] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const [allQueries, setAllQueries] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);   // 👈 naya state

 

  useEffect(() => {

    loadDashboard();

}, []);




  const loadDashboard = async () => {

    try {

       

        const [statsData, files] = await Promise.all([
            getDashboardStats(),
            getUploadedFiles()
        ]);


        setStats(statsData);
        setDatasets(files);

        if (files.length > 0) {

            setActiveDataset((prev) => {
                // agar pehle se koi dataset selected hai aur wo list mein maujood hai, usi ko rakho
                const stillExists = files.find(f => f.table_name === prev?.table_name);
                return stillExists || files[0];
            });

        } else {

            setActiveDataset(null);

        }
        await loadHistory();

    } catch (error) {

        console.log(error);

        toast.error("Failed to load dashboard.");

    } finally {
        setLoading(false);
        setInitialLoad(false);

    }

};
const loadHistory = async () => {

    try {

        const history = await getRecentHistory();
        setAllQueries(history);
        const groupedMessages = {};

        history
            .slice()
            .reverse()

            .forEach((item) => {

                if (!groupedMessages[item.table_name]) {

                    groupedMessages[item.table_name] = [];

                }

                groupedMessages[item.table_name].push({

                    question: item.question,

                    sql: item.sql,

                    rows: item.rows

                });

            });

            setMessages(groupedMessages);


        }

    catch (error) {

        console.log(error);

        toast.error("Failed to load history.");

    }

}; 

  

const refreshDashboard = async () => {

    await loadDashboard();
setRefreshKey(prev => prev + 1);

};
 const handleGenerate = async (question) => {

    if (!activeDataset) {

        toast.error("Please upload a dataset first.");

        return;

    }

    setAiLoading(true);

    try {
      setAiLoading(true);

       const data = await askAI(

    question,

    activeDataset.table_name

);

        const newMessage = {

            question,

            sql: data.data.sql,

            rows: data.data.rows

        };

        setMessages((prev) => ({

            ...prev,

            [activeDataset.table_name]: [

                ...(prev[activeDataset.table_name] || []),

                newMessage

            ]

        }));
        await refreshDashboard();

        toast.success("Query generated successfully!");

    }

    catch (error) {

        toast.error(

            error.response?.data?.detail ||

            "Failed to generate SQL query."

        );

    } finally{
      setAiLoading(false);
    }

};
 
 return (
  <DashboardLayout refreshKey={refreshKey}
  activeDataset={activeDataset}
  setActiveDataset={setActiveDataset}
  allQueries={allQueries}
 
  >

    {
      initialLoad ? (
        // pehli baar load hote waqt kuch bhi flash nahi hoga
        <div className="dashboard-skeleton">
          <div className="loader-pulse"></div>
        </div>
      ) : !activeDataset ? (

        <EmptyWorkspace
            onUploadSuccess={refreshDashboard}
        />

    ) : (

        <Workspace
            datasets={datasets}
            activeDataset={activeDataset}
            setActiveDataset={setActiveDataset}
            messages={messages}
            onSend={handleGenerate}
            onUploadSuccess={refreshDashboard}
            aiLoading={aiLoading}
        />

    )
}

  </DashboardLayout>
);
}

export default Dashboard;