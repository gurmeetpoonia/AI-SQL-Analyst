import api from "../../shared/services/api";

export const getUploadedFiles = async () => {
    const response = await api.get("/upload/files");

    return response.data.data;
};

export const uploadCSV = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/upload/csv",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    

    return response.data;
};


export const deleteDataset = async (id) => {

    const response = await api.delete(`/upload/${id}`);

    return response.data;

};