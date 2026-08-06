import toast from "react-hot-toast";

export const getVersionTitle = (version) => {
    const summary = version.ai_summary?.trim();

    if (!summary) {
        return `Version ${version.version}`;
    }

    const words = summary.split(/\s+/);
    const short = words.slice(0, 6).join(" ");

    return words.length > 6 ? `${short}…` : short;
};

// =========================
// Load Version History
// =========================
export const handleLoadVersions = async ({
    datasetId,
    getVersions,
    setVersions,
    setLoading,
    setShowVersions,
    setShowMenu
}) => {

    try {

        setLoading?.(true);

        const data = await getVersions(datasetId);

        setVersions(data || []);

        setShowVersions?.(true);

        setShowMenu?.(false);

    } catch (error) {

        console.error(error);

        toast.error("Failed to load versions.");

    } finally {

        setLoading?.(false);

    }

};



// =========================
// Restore Version
// =========================
export const handleRestoreVersion = async ({
    versionId,
    restoreVersion,
    loadVersionHistory,
    onSuccess
}) => {

    if (!window.confirm("Restore this version?"))
        return;

    try {

        await restoreVersion(versionId);

        toast.success("Version restored.");

        if (loadVersionHistory)
            await loadVersionHistory();

        if (onSuccess)
            await onSuccess();

    } catch (error) {

        console.error(error);

        toast.error("Restore failed.");

    }

};



// =========================
// Undo AI Edit
// =========================
export const handleUndoDataset = async ({
    tableName,
    undoEdit,
    onRefresh,
    setLoading,
    setUndoing,
    setUndoStatus,
    setShowMenu
}) => {

    try {

        setLoading?.(true);

        setUndoing?.(true);

        setShowMenu?.(false);

        setUndoStatus?.("Restoring previous backup...");

        await undoEdit(tableName);

        setUndoStatus?.("Refreshing dataset...");

        await onRefresh?.();

        setUndoStatus?.("Done");

        setTimeout(() => {

            setUndoing?.(false);

            setUndoStatus?.("");

        }, 900);

    } catch (error) {

        console.error(error);

        toast.error("Undo failed.");

        setUndoing?.(false);

        setUndoStatus?.("");

    } finally {

        setLoading?.(false);

    }

};

export const handleRenameVersion = async ({
    version,
    renameValue,
    renameVersion,
    setVersions,
    setRenamingVersionId
}) => {

    const trimmed = renameValue.trim();

    setRenamingVersionId(null);

    if (!trimmed || trimmed === (version.custom_name || "")) {
        return;
    }

    try {

        await renameVersion(version.id, trimmed);

        setVersions((prev) =>
            prev.map((v) =>
                v.id === version.id
                    ? {
                          ...v,
                          custom_name: trimmed
                      }
                    : v
            )
        );

        

    } catch (err) {

        console.error(err);

        toast.error(
            err.response?.data?.detail ||
            "Rename failed."
        );

    }

};

export const handleDeleteVersion = async ({
    versionId,
    deleteVersion,
    setVersions
}) => {

    if (
        !window.confirm(
            "Delete this version? This cannot be undone."
        )
    ) {
        return;
    }

    try {

        await deleteVersion(versionId);

        setVersions((prev) =>
            prev.filter((v) => v.id !== versionId)
        );

        toast.success("Version deleted");

    } catch (err) {

        console.error(err);

        toast.error(
            err.response?.data?.detail ||
            "Delete failed."
        );

    }

};