import api from "../../shared/services/api";

export const askAI = async (question,tableName) => {

    const response = await api.post(

        "/ai/query",

        {

            question:question,
            table_name:tableName

        }

    );

    return response.data;

};