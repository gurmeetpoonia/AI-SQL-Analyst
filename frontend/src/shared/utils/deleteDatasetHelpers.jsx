import toast from "react-hot-toast";

export const handleDeleteDataset = async ({
    id,

    deleteDataset,
    getUploadedFiles,

    setDatasets,
    setDeleteLoading,
    setDeleteFile,

    // Optional
    datasetId,
    navigate,

    onSuccess
}) => {

    try {

        setDeleteLoading?.(true);

        await deleteDataset(id);

        toast.success("Dataset deleted.");

        setDeleteFile?.(null);

        const files = await getUploadedFiles();

        setDatasets?.(files);

        // Custom callback (Sidebar ke liye)
        onSuccess?.(files);

        // EditorSidebar navigation
        if (
            datasetId !== undefined &&
            navigate &&
            String(datasetId) === String(id)
        ) {

            if (files.length > 0)
                navigate(`/dashboard/editor/${files[0].id}`);
            else
                navigate("/dashboard");

        }

    } catch (error) {

        toast.error(
            error.response?.data?.detail ||
            "Delete failed."
        );

    } finally {

        setDeleteLoading?.(false);

    }

};