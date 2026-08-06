import { FaFileCsv } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";

/* ===========================
   File Extensions
=========================== */

export const getFileExtension = (filename = "") => {
    return filename.split(".").pop().toLowerCase();
};

export const isCSVFile = (filename = "") =>
    getFileExtension(filename) === "csv";

export const isExcelFile = (filename = "") => {
    const ext = getFileExtension(filename);
    return ext === "xlsx" || ext === "xls";
};

/* ===========================
   Validation
=========================== */

export const validateDatasetFile = (file) => {
    if (!file) {
        return {
            valid: false,
            message: "Please select a file."
        };
    }

    const ext = getFileExtension(file.name);

    if (!["csv", "xlsx", "xls"].includes(ext)) {
        return {
            valid: false,
            message: "Only CSV and Excel files are allowed."
        };
    }

    return {
        valid: true
    };
};



/* ===========================
   Accept Attribute
=========================== */

export const ACCEPTED_DATASET_FILES =
    ".csv,.xlsx,.xls";