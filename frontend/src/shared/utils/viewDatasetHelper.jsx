import toast from "react-hot-toast";

export const handleViewDataset = async ({
    file,
    getDataset,
    setViewLoading,
    setViewFile,
    setViewRows
}) => {

    try {

        setViewLoading(true);

        setViewFile(file);

        const res = await getDataset(file.id);

        setViewRows(
            res.rows ??
            res.data ??
            []
        );

    } catch (error) {

        console.error(error);

        toast.error("Failed to load dataset preview.");

    } finally {

        setViewLoading(false);

    }

};