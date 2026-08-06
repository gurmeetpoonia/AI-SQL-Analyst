import api from "../../shared/services/api";

export const getRecentHistory = async () => {

    const response = await api.get(
        "/history/recent"
    );
      
    return response.data.data;

};