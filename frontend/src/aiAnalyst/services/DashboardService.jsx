import api from "../../shared/services/api";

export const getDashboardStats = async () => {

    const response = await api.get(
        "/dashboard/stats"
    );

    return response.data.data;  

};

export const getCurrentDataset = async () => {
    const res = await api.get("/dashboard/current-dataset");
    return res.data.data;
};