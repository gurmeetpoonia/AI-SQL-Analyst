import toast from "react-hot-toast";
import { uploadCSV } from "../../aiAnalyst/services/uploadService";
import { validateDatasetFile } from "./fileHelpers";

export const handleDatasetUpload = async ({
    file,
    setLoading,
    onSuccess
}) => {

    const result = validateDatasetFile(file);

    if (!result.valid) {
        toast.error(result.message);
        return false;
    }

    try {

        setLoading?.(true);

        const response = await uploadCSV(file);

        toast.success(
            response.message || "Dataset uploaded successfully!"
        );

        onSuccess?.(response);

        return response;

    } catch (error) {

        toast.error(
            error.response?.data?.detail || "Upload failed."
        );

        return null;

    } finally {

        setLoading?.(false);

    }
};