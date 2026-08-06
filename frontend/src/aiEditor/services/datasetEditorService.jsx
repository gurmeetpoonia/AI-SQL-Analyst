import api from "../../shared/services/api";

export const generatePlan = async (payload) => {
    const res = await api.post("/editor/edit-plan", payload);
    return res.data;
};

export const previewPlan = async (plan) => {
    const res = await api.post("/editor/preview-edit", {plan});
    return res.data;
};

export const executePlan = async (plan, question) => {
    const res = await api.post("/editor/execute-edit", { plan, question });
    return res.data;
};

export const undoEdit = async (table_name) => {
    const res = await api.post("/editor/undo", {
        table_name
    });

    return res.data;
};

export const restoreVersion = async (version_id) => {
    const res = await api.post("/editor/restore-version", {
        version_id
    });

    return res.data;
};

export const getVersions = async (uploaded_file_id) => {
    const res = await api.get(
        `/editor/versions/${uploaded_file_id}`
    );

    return res.data;
};


export const getDataset = async (datasetId) => {

    const res = await api.get(
        `/upload/file/${datasetId}`
    );

    return res.data;
};

// -------------------------------------------------------
// Naya: Blank dataset create karna (bina CSV upload kiye)
// payload shape: { file_name: string, columns: [{name, type}] }
// -------------------------------------------------------
export const createBlankDataset = async (payload) => {
    const res = await api.post("/upload/create-blank", payload);
    return res.data;
};

// -------------------------------------------------------
// Naya: Version rename karna
// -------------------------------------------------------
export const renameVersion = async (versionId, customName) => {
    const res = await api.patch(`/editor/rename-version/${versionId}`, {
        custom_name: customName
    });
    return res.data;
};
 
// -------------------------------------------------------
// Naya: Version delete karna
// -------------------------------------------------------
export const deleteVersion = async (versionId) => {
    const res = await api.delete(`/editor/versions/${versionId}`);
    return res.data;
};
 