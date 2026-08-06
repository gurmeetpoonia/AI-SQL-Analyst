import { FaFileCsv } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import {
    getFileExtension,
    isExcelFile
} from "./fileHelpers";


/* ========================================
   Display Name
======================================== */

export const getDisplayFileName = (filename = "") => {
    return filename.replace(/\.(csv|xlsx|xls)$/i, "");
};

/* ========================================
   File Icon
======================================== */



export const getDatasetIcon = (filename = "") => {

    if (isExcelFile(filename)) {
        return <FaFileExcel className="item-icon excel-icon" />;
    }

    return <FaFileCsv className="item-icon csv-icon" />;
};
/* ========================================
   File Size
======================================== */

export const formatFileSize = (bytes = 0) => {

    if (bytes < 1024)
        return `${bytes} B`;

    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* ========================================
   Upload Date
======================================== */

export const formatUploadDate = (date) => {

    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

};

/* ========================================
   File Type
======================================== */

export const getDatasetType = (filename="") => {
    const ext = getFileExtension(filename);

    if (ext === "csv") return "CSV";
    if (ext === "xlsx" || ext === "xls") return "Excel";

    return "Dataset";
};