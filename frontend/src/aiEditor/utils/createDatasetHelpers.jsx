import toast from "react-hot-toast";

export const handleCreateBlankDataset = async ({

    newFileName,
    newColumns,

    createBlankDataset,

    loadDataset,

    navigate,

    setCreating,
    setShowCreateModal,
    setNewFileName,
    setNewColumns

}) => {

    if (!newFileName.trim()) {
        toast.error("Please enter a dataset name.");
        return;
    }

    const validColumns = newColumns.filter(
        column => column.name.trim()
    );

    if (validColumns.length === 0) {
        toast.error("Add at least one column.");
        return;
    }

    try {

        setCreating(true);

        const response = await createBlankDataset({

            file_name: newFileName.trim(),
            columns: validColumns

        });

        toast.success("New dataset created");

        setShowCreateModal(false);

        setNewFileName("");

        setNewColumns([
            {
                name: "",
                type: "TEXT"
            }
        ]);

        await loadDataset();

        if (response?.id) {

            navigate(
                `/dashboard/editor/${response.id}`
            );

        }

        return response;

    } catch (error) {

        console.error(error);

        toast.error(

            error.response?.data?.detail ||

            "Failed to create dataset."

        );

        return null;

    } finally {

        setCreating(false);

    }

};